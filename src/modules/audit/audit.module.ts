import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionAudit } from './entities/transaction-audit.entity';
import { TransactionAuditSubscriber } from './subscribers/transaction-audit.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionAudit])],
  providers: [TransactionAuditSubscriber],
  exports: [TypeOrmModule],
})
export class AuditModule {}
