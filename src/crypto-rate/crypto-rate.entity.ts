import { CryptoPair } from '../crypto-pair/crypto-pair.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class CryptoRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  pairId: number;

  @ManyToOne(() => CryptoPair, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'pairId', referencedColumnName: 'id' }])
  pair: CryptoPair;

  @Column('decimal', { precision: 32, scale: 8 })
  rate: number;

  @CreateDateColumn()
  timestamp: Date;
}
