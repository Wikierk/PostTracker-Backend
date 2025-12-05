import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportProblemDto {
  @ApiProperty({
    description: 'Opis zgłaszanego problemu',
    example: 'Paczka jest uszkodzona i otwarta',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
