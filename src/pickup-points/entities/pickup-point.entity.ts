import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class PickupPoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'float' })
  latitude: number;

  @Column({ type: 'float' })
  longitude: number;

  @Column({ type: 'int', default: 100 })
  radius: number;
}
