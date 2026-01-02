import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeliverPackageDto {
  @ApiProperty({
    description: 'Kod odbioru podany przez pracownika',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  pickupCode: string;
}
