import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum PackageStatus {
  REGISTERED = 'registered',
  DELIVERED = 'delivered',
  PROBLEM = 'problem',
}

@Entity()
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  trackingNumber: string;

  @Column()
  sender: string;

  @Column()
  pickupPoint: string;

  @Column()
  pickupCode: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({
    type: 'enum',
    enum: PackageStatus,
    default: PackageStatus.REGISTERED,
  })
  status: PackageStatus;

  @ManyToOne(() => User, (user) => user.packages)
  recipient: User;

  @Column()
  recipientId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
