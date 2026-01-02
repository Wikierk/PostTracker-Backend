import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePickupPointDto {
  @ApiProperty({ example: 'Recepcja A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 52.2297 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 21.0122 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
