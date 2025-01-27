import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../../shared/types/role.enum';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @Roles(Role.USER)
  create(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
    return this.transactionsService.create(createTransactionDto, req.user.id);
  }

  @Post(':id/cancel')
  @Roles(Role.USER)
  cancel(@Param('id') id: string, @Request() req) {
    return this.transactionsService.cancel(id, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.transactionsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.transactionsService.findOne(id, req.user.id);
  }
}
