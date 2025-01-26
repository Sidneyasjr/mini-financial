import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../../shared/types/role.enum';
import { ParseUUIDWithoutFormatPipe } from 'src/shared/pipes/parse-uuid.pipe';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @Roles(Role.USER)
  create(@Body() createWalletDto: CreateWalletDto, @Request() req) {
    return this.walletsService.create(createWalletDto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.walletsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDWithoutFormatPipe) id: string, @Request() req) {
    return this.walletsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @Roles(Role.USER)
  update(
    @Param('id', ParseUUIDWithoutFormatPipe) id: string,
    @Body() updateWalletDto: UpdateWalletDto,
    @Request() req,
  ) {
    return this.walletsService.update(id, updateWalletDto, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.USER)
  remove(@Param('id', ParseUUIDWithoutFormatPipe) id: string, @Request() req) {
    return this.walletsService.remove(id, req.user.id);
  }
}