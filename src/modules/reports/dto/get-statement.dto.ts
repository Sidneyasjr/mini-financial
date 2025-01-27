import { IsOptional, IsDateString, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetStatementDto {
  @ApiProperty({
    required: false,
    type: 'string',
    format: 'date',
    example: '2021-10-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty({
    required: false,
    type: 'string',
    format: 'date',
    example: '2021-10-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiProperty({
    required: false,
    example: '00000000-0000-0000-0000-000000000000',
  })
  @IsOptional()
  @IsString()
  walletId?: string;

  @ApiProperty({
    required: false,
    example: 'FOOD',
  })
  @IsOptional()
  category?: string;
}

export class StatementTransactionResponse {
  id: number;

  type: string;

  amount: number;

  category?: string;

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
