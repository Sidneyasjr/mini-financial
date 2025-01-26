import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CancelTransactionDto } from './dto/cancel-transaction.dto';
import { TransactionType } from '../../shared/types/transaction-type.enum';
import { WalletsService } from '../wallets/wallets.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private walletsService: WalletsService,
    private dataSource: DataSource,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sourceWallet = await this.walletsService.findOne(createTransactionDto.sourceWalletId, user.id);
      
      if (sourceWallet.userId !== user.id) {
        throw new BadRequestException('You can only create transactions for your own wallets');
      }

      let targetWallet: any;
      if (createTransactionDto.type === TransactionType.TRANSFER) {
        if (!createTransactionDto.targetWalletId) {
          throw new BadRequestException('Target wallet is required for transfers');
        }
        targetWallet = await this.walletsService.findOne(createTransactionDto.targetWalletId, user.id);
        
        if (targetWallet.userId !== user.id) {
          throw new BadRequestException('You can only transfer to your own wallets');
        }
      }

      if (createTransactionDto.type !== TransactionType.INCOME) {
        if (sourceWallet.balance < createTransactionDto.amount) {
          throw new BadRequestException('Insufficient funds');
        }
      }

      switch (createTransactionDto.type) {
        case TransactionType.INCOME:
          sourceWallet.balance += createTransactionDto.amount;
          break;
        case TransactionType.EXPENSE:
          sourceWallet.balance -= createTransactionDto.amount;
          break;
        case TransactionType.TRANSFER:
          sourceWallet.balance -= createTransactionDto.amount;
          targetWallet.balance += createTransactionDto.amount;
          break;
      }

      const transaction = this.transactionsRepository.create({
        ...createTransactionDto,
        user,
      });

      await queryRunner.manager.save(sourceWallet);
      if (targetWallet) {
        await queryRunner.manager.save(targetWallet);
      }
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      
      return transaction;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancel(id: string, cancelTransactionDto: CancelTransactionDto, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = await this.transactionsRepository.findOne({
        where: { id },
        relations: ['sourceWallet', 'targetWallet'],
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      if (transaction.userId !== user.id) {
        throw new BadRequestException('You can only cancel your own transactions');
      }

      if (transaction.cancelled) {
        throw new BadRequestException('Transaction already cancelled');
      }

      switch (transaction.type) {
        case TransactionType.INCOME:
          transaction.sourceWallet.balance -= transaction.amount;
          break;
        case TransactionType.EXPENSE:
          transaction.sourceWallet.balance += transaction.amount;
          break;
        case TransactionType.TRANSFER:
          transaction.sourceWallet.balance += transaction.amount;
          transaction.targetWallet.balance -= transaction.amount;
          break;
      }

      transaction.cancelled = true;

      await queryRunner.manager.save(transaction.sourceWallet);
      if (transaction.targetWallet) {
        await queryRunner.manager.save(transaction.targetWallet);
      }
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      
      return transaction;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
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