import { IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetBalanceReportDto {
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
    example: 'FOOD',
  })
  @IsOptional()
  category?: string;
}

export class BalanceReportResponse {
  totalBalance: number;

  totalIncome: number;

  totalExpenses: number;

  periodStart: Date;

  periodEnd: Date;

  categoryBreakdown?: Record<string, number>;
}
