import { IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum TransactionCategory {
  FOOD = 'FOOD',
  LEISURE = 'LEISURE',
  TRANSPORT = 'TRANSPORT',
  HEALTH = 'HEALTH',
  EDUCATION = 'EDUCATION',
  OTHER = 'OTHER',
}

export class GetBalanceReportDto {
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsEnum(TransactionCategory)
  category?: TransactionCategory;
}

export class BalanceReportResponse {
  totalBalance: number;

  totalIncome: number;

  totalExpenses: number;

  periodStart: Date;

  periodEnd: Date;

  categoryBreakdown?: Record<TransactionCategory, number>;
}
