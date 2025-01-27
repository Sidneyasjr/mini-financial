import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionAudit } from './entities/transaction-audit.entity';
import { TransactionAuditSubscriber } from './subscribers/transaction-audit.subscriber';
import { Transaction } from '../transactions/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionAudit, Transaction])],
  providers: [TransactionAuditSubscriber],
  exports: [TypeOrmModule],
})
export class AuditModule {}
