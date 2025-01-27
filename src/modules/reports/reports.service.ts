import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import {
  GetBalanceReportDto,
  BalanceReportResponse,
  TransactionCategory,
} from './dto/get-balance-report.dto';
import { GetStatementDto, StatementResponse } from './dto/get-statement.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  async getBalanceReport(
    userId: string,
    dto: GetBalanceReportDto,
  ): Promise<BalanceReportResponse> {
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date(0);
    const endDate = dto.endDate ? new Date(dto.endDate) : new Date();

    const wallets = await this.walletRepository.find({
      where: { userId },
    });

    const walletIds = wallets.map(wallet => wallet.id);

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('transaction.sourceWalletId IN (:...walletIds)', { walletIds });

    if (dto.category) {
      queryBuilder.andWhere('transaction.category = :category', {
        category: dto.category,
      });
    }

    const transactions = await queryBuilder.getMany();

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryBreakdown: Record<TransactionCategory, number> = {} as Record<
      TransactionCategory,
      number
    >;

    transactions.forEach(transaction => {
      const amount = Number(transaction.amount);

      if (transaction.type === 'INCOME') {
        totalIncome = Number((totalIncome + amount).toFixed(2));
      } else if (transaction.type === 'EXPENSE') {
        totalExpenses = Number((totalExpenses + amount).toFixed(2));
      }

      if (transaction.category) {
        const currentAmount = categoryBreakdown[transaction.category] || 0;
        const transactionAmount =
          transaction.type === 'EXPENSE' ? -amount : amount;
        categoryBreakdown[transaction.category] = Number(
          (currentAmount + transactionAmount).toFixed(2),
        );
      }
    });

    const totalBalance = wallets.reduce((sum, wallet) => {
      const walletBalance = Number(wallet.balance);
      return Number((sum + walletBalance).toFixed(2));
    }, 0);

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      periodStart: startDate,
      periodEnd: endDate,
      categoryBreakdown:
        Object.keys(categoryBreakdown).length > 0
          ? categoryBreakdown
          : undefined,
    };
  }

  async getStatement(
    userId: string,
    dto: GetStatementDto,
  ): Promise<StatementResponse> {
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date(0);
    const endDate = dto.endDate ? new Date(dto.endDate) : new Date();

    let wallets: Wallet[];
    if (dto.walletId) {
      const wallet = await this.walletRepository.findOne({
        where: { id: dto.walletId, userId },
      });
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }
      wallets = [wallet];
    } else {
      wallets = await this.walletRepository.find({
        where: { userId },
      });
    }

    const walletIds = wallets.map(w => w.id);

    const openingBalanceTransactions = await this.transactionRepository.find({
      where: {
        createdAt: LessThan(startDate),
        sourceWalletId: dto.walletId ? dto.walletId : In(walletIds),
      },
    });

    let openingBalance = 0;
    openingBalanceTransactions.forEach(transaction => {
      if (transaction.type === 'INCOME') {
        openingBalance = Number(
          (openingBalance + Number(transaction.amount)).toFixed(2),
        );
      } else if (transaction.type === 'EXPENSE') {
        openingBalance = Number(
          (openingBalance - Number(transaction.amount)).toFixed(2),
        );
      } else if (transaction.type === 'TRANSFER') {
        if (walletIds.includes(transaction.sourceWalletId)) {
          openingBalance = Number(
            (openingBalance - Number(transaction.amount)).toFixed(2),
          );
        }
        if (walletIds.includes(transaction.targetWalletId)) {
          openingBalance = Number(
            (openingBalance + Number(transaction.amount)).toFixed(2),
          );
        }
      }
    });

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (dto.walletId) {
      queryBuilder.andWhere(
        '(transaction.sourceWalletId = :walletId OR transaction.targetWalletId = :walletId)',
        { walletId: dto.walletId },
      );
    } else {
      queryBuilder.andWhere(
        '(transaction.sourceWalletId IN (:...walletIds) OR transaction.targetWalletId IN (:...walletIds))',
        { walletIds },
      );
    }

    if (dto.category) {
      queryBuilder.andWhere('transaction.category = :category', {
        category: dto.category,
      });
    }

    queryBuilder.orderBy('transaction.createdAt', 'ASC');

    const transactions = await queryBuilder.getMany();

    let totalIncome = 0;
    let totalExpenses = 0;
    let runningBalance = openingBalance;

    const processedTransactions = transactions.map(transaction => {
      const amount = Number(transaction.amount);

      if (transaction.type === 'INCOME') {
        totalIncome = Number((totalIncome + amount).toFixed(2));
        runningBalance = Number((runningBalance + amount).toFixed(2));
      } else if (transaction.type === 'EXPENSE') {
        totalExpenses = Number((totalExpenses + amount).toFixed(2));
        runningBalance = Number((runningBalance - amount).toFixed(2));
      } else if (transaction.type === 'TRANSFER') {
        if (walletIds.includes(transaction.sourceWalletId)) {
          runningBalance = Number((runningBalance - amount).toFixed(2));
        }
        if (walletIds.includes(transaction.targetWalletId)) {
          runningBalance = Number((runningBalance + amount).toFixed(2));
        }
      }

      return transaction;
    });

    return {
      periodStart: startDate,
      periodEnd: endDate,
      walletId: dto.walletId,
      openingBalance,
      closingBalance: runningBalance,
      totalIncome,
      totalExpenses,
      transactions: processedTransactions as any,
    };
  }
}
