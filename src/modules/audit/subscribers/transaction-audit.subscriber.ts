import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  DataSource,
  Repository,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { TransactionAudit } from '../entities/transaction-audit.entity';

@Injectable()
@EventSubscriber()
export class TransactionAuditSubscriber
  implements EntitySubscriberInterface<Transaction>
{
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(TransactionAudit)
    private auditRepository: Repository<TransactionAudit>,
    private readonly cls: ClsService,
  ) {
    console.log('TransactionAuditSubscriber initialized');
    dataSource.subscribers.push(this); 
  }

  listenTo() {
    return Transaction;
  }

  async afterInsert(event: InsertEvent<Transaction>) {
    await this.createAuditLog('CREATE', null, event.entity);
  }

  async afterUpdate(event: UpdateEvent<Transaction>) {
    await this.createAuditLog('UPDATE', event.databaseEntity, event.entity);
  }

  async beforeRemove(event: RemoveEvent<Transaction>) {
    await this.createAuditLog('DELETE', event.databaseEntity, null);
  }

  private async createAuditLog(action: string, oldValue: any, newValue: any) {
    const user = this.cls.get('user');
    const req = this.cls.get('request');

    const audit = new TransactionAudit();
    audit.transactionId = newValue?.id || oldValue?.id;
    audit.userId = user?.id;
    audit.action = action;
    audit.oldValue = oldValue;
    audit.newValue = newValue;
    audit.userIp = req?.ip;
    audit.userAgent = req?.headers['user-agent'];

    await this.auditRepository.save(audit);
  }
}
