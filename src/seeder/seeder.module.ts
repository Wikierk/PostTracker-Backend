import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';

@Module({
  imports: [],
  controllers: [],
  providers: [SeederService],
})
export class SeederModule {}
