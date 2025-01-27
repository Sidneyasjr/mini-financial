import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { TransactionType } from 'src/shared/types/transaction-type.enum';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'source_wallet_id' })
  sourceWallet: Wallet;

  @Column({ name: 'source_wallet_id' })
  sourceWalletId: string;

  @ManyToOne(() => Wallet, { nullable: true })
  @JoinColumn({ name: 'target_wallet_id' })
  targetWallet: Wallet;

  @Column({ name: 'target_wallet_id', nullable: true })
  targetWalletId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ default: false })
  cancelled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
