import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType } from '../../shared/types/transaction-type.enum';
import { WalletsService } from '../wallets/wallets.service';
import { Wallet } from '../wallets/entities/wallet.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private walletsService: WalletsService,
    private dataSource: DataSource,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sourceWallet = await this.walletsService.findOne(createTransactionDto.sourceWalletId, userId);

      if (!sourceWallet) {
        throw new NotFoundException('Source wallet not found');
      }

      if (sourceWallet.userId !== userId) {
        throw new BadRequestException('You can only create transactions for your own wallets');
      }

      let targetWallet: Wallet | null = null;
      if (createTransactionDto.type === TransactionType.TRANSFER) {
        if (!createTransactionDto.targetWalletId) {
          throw new BadRequestException('Target wallet is required for transfers');
        }

        if (createTransactionDto.sourceWalletId === createTransactionDto.targetWalletId) {
          throw new BadRequestException('Source wallet and target wallet cannot be the same');
        }

        targetWallet = await this.walletsService.findOne(createTransactionDto.targetWalletId, userId);
        
        if (!targetWallet) {
          throw new NotFoundException('Target wallet not found');
        }

        if (targetWallet.userId !== userId) {
          throw new BadRequestException('You can only transfer to your own wallets');
        }
      }

      const transaction = this.transactionsRepository.create({
        ...createTransactionDto,
        userId,
      });

      switch (createTransactionDto.type) {
        case TransactionType.INCOME:
          await this.walletsService.increaseBalance(queryRunner, {
            walletId: sourceWallet.id,
            amount: createTransactionDto.amount
          });
          break;

        case TransactionType.EXPENSE:
          await this.walletsService.decreaseBalance(queryRunner, {
            walletId: sourceWallet.id,
            amount: createTransactionDto.amount
          });
          break;

        case TransactionType.TRANSFER:
          await this.walletsService.decreaseBalance(queryRunner, {
            walletId: sourceWallet.id,
            amount: createTransactionDto.amount
          });
          if (!targetWallet) {
            throw new BadRequestException('Target wallet is required for transfers');
          }
          await this.walletsService.increaseBalance(queryRunner, {
            walletId: targetWallet.id,
            amount: createTransactionDto.amount
          });
          break;
      }

      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return transaction;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancel(id: string, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = await this.findOne(id, userId);
        
      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      if (transaction.userId !== userId) {
        throw new BadRequestException('You can only cancel your own transactions');
      }

      if (transaction.cancelled) {
        throw new BadRequestException('Transaction already cancelled');
      }

      switch (transaction.type) {
        case TransactionType.INCOME:
          await this.walletsService.decreaseBalance(queryRunner, {
            walletId: transaction.sourceWallet.id,
            amount: transaction.amount
          });
          break;

        case TransactionType.EXPENSE:
          await this.walletsService.increaseBalance(queryRunner, {
            walletId: transaction.sourceWallet.id,
            amount: transaction.amount
          });
          break;

        case TransactionType.TRANSFER:
          await this.walletsService.increaseBalance(queryRunner, {
            walletId: transaction.sourceWallet.id,
            amount: transaction.amount
          });

          await this.walletsService.decreaseBalance(queryRunner, {
            walletId: transaction.targetWallet.id,
            amount: transaction.amount
          });
          break;
      }

      transaction.cancelled = true;
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return transaction;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId: string) {
    return this.transactionsRepository.find({
      where: { userId },
      relations: ['sourceWallet', 'targetWallet'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, userId },
      relations: ['sourceWallet', 'targetWallet'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }
}