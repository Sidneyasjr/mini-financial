import { IsNotEmpty, IsString } from 'class-validator';

export class CancelTransactionDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}