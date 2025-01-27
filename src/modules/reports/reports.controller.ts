import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../../shared/types/role.enum';
import { ReportsService } from './reports.service';
import { GetBalanceReportDto, BalanceReportResponse } from './dto/get-balance-report.dto';
import { GetStatementDto, StatementResponse } from './dto/get-statement.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('balance')
  @Roles(Role.USER, Role.ADMIN)
  async getBalanceReport(
    @Query() dto: GetBalanceReportDto,
    @Request() { user: { id: userId } },
  ): Promise<BalanceReportResponse> {
    return this.reportsService.getBalanceReport(userId, dto);
  }

  @Get('statement')
  @Roles(Role.USER, Role.ADMIN)
  async getStatement(
    @Request() { user: { id: userId } },
    @Query() dto: GetStatementDto,
  ): Promise<StatementResponse> {
    return this.reportsService.getStatement(userId, dto);
  }
}