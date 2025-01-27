import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { Public } from 'src/shared/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() RegisterDto: RegisterDto) {
    const user = await this.usersService.create(RegisterDto);
    return this.authService.login({
      email: user.email,
      password: RegisterDto.password,
    });
  }

  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
