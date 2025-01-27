import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({example: 'John Doe'})
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({example: 'john@email.com'})
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({example: 'password'})
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
