import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('transaction_audit')
export class TransactionAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  transactionId: string;

  @Column()
  userId: string;

  @Column()
  action: string;

  @Column('jsonb', { nullable: true })
  oldValue: any;

  @Column('jsonb', { nullable: true })
  newValue: any;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  userIp: string;

  @Column({ nullable: true })
  userAgent: string;
}
