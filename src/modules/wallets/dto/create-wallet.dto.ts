import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateWalletDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;
}