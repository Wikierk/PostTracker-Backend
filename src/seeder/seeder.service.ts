import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    const result = await this.dataSource.query('SELECT COUNT(*) as count FROM "package"'); 
    const count = parseInt(result[0].count, 10);

    if (count === 0) {
      console.log('🌱 Pusta baza wykryta. Ładuję dane testowe z seed.sql...');
      try {
        const sqlPath = path.join(process.cwd(), 'seed.sql'); 
        const sql = fs.readFileSync(sqlPath, 'utf-8');
        
        await this.dataSource.query(sql); 
        console.log('✅ Pomyślnie załadowano dane testowe!');
      } catch (error) {
        console.error('❌ Błąd podczas ładowania seed.sql:', error);
      }
    } else {
      console.log('👍 Baza posiada już dane. Pomijam seedowanie.');
    }
  }
}