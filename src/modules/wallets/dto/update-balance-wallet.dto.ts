import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class UpdateWalletBalanceDto {
  @IsUUID()
  @IsNotEmpty()
  walletId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}