import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWalletDto {
  @ApiProperty({example: 'My Wallet'})
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;
}
