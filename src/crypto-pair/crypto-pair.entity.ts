import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Index(['baseCurrency', 'quoteCurrency'], { unique: true })
export class CryptoPair {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  baseCurrency: string;

  @Column()
  quoteCurrency: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: 10 })
  updateInterval: number;

  @CreateDateColumn()
  createdAt: Date;
}
