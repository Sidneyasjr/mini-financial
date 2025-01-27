import { IsOptional, IsDateString, IsEnum, IsString } from 'class-validator';
import { TransactionCategory } from './get-balance-report.dto';

export class GetStatementDto {
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsString()
  walletId?: string;

  @IsOptional()
  @IsEnum(TransactionCategory)
  category?: TransactionCategory;
}

export class StatementTransactionResponse {
  id: number;

  type: string;

  amount: number;

  category?: TransactionCategory;

  description?: string;

  sourceWalletId: string;

  targetWalletId?: string;

  createdAt: Date;

  updatedAt: Date;
}

export class StatementResponse {
  periodStart: Date;

  periodEnd: Date;

  walletId?: string;

  openingBalance: number;

  closingBalance: number;

  totalIncome: number;

  totalExpenses: number;

  transactions: StatementTransactionResponse[];
}
