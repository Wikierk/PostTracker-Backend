import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Package } from '../../packages/entities/package.entity';

export enum UserRole {
  ADMIN = 'admin', // Zarządza systemem
  RECEPTIONIST = 'receptionist', // Skanuje i wydaje
  EMPLOYEE = 'employee', // Odbiera
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @OneToMany(() => Package, (pkg) => pkg.recipient)
  packages: Package[];
}
