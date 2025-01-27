import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({example: 'John Doe'})
  @IsString()
  name: string;

  @ApiProperty({example: 'john@email.com'})
  @IsEmail()
  email: string;

  @ApiProperty({example: 'password'})
  @IsString()
  @MinLength(8)
  password: string;
}
