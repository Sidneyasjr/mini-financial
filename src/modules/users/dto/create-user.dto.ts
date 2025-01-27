import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '../../../shared/types/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({example: 'John Doe'})
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({example: 'john@email.com'})
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({example: 'password'})
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({example: 'user'})
  @IsEnum(Role)
  role?: Role;
}
