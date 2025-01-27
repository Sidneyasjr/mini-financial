import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { TransactionType } from '../../../shared/types/transaction-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Transaction type',
    example: TransactionType.INCOME,
    enum: TransactionType,
  })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @ApiProperty({
    description: 'Transaction amount',
    example: 100,
  })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Transaction category',
    example: 'Salary',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: 'Transaction description',
    example: 'Salary for the month of May',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Source wallet id',
    example: '00000000-0000-0000-0000-000000000000',
  })
  @IsUUID()
  @IsNotEmpty()
  sourceWalletId: string;

  @ApiProperty({
    description: 'Target wallet id',
    example: '00000000-0000-0000-0000-000000000000',
  })
  @IsUUID()
  @IsOptional()
  targetWalletId?: string;
}
