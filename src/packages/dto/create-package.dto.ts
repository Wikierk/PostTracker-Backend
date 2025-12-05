import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePackageDto {
  @ApiProperty({
    description: 'Numer listu przewozowego lub zeskanowany kod',
    example: 'DHL-12345-XYZ',
  })
  @IsString()
  @IsNotEmpty()
  trackingNumber: string;

  @ApiProperty({
    description: 'Nazwa nadawcy (np. Amazon, Zalando)',
    example: 'Amazon',
  })
  @IsString()
  @IsNotEmpty()
  sender: string;

  @ApiProperty({
    description: 'UUID pracownika, do którego adresowana jest paczka',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID()
  @IsNotEmpty()
  recipientId: string;

  @ApiProperty({
    description: 'Miejsce, w którym paczka czeka na odbiór',
    example: 'Recepcja Główna (Budynek A)',
  })
  @IsString()
  @IsNotEmpty()
  pickupPoint: string;

  @ApiProperty({
    description: 'Link do zdjęcia paczki (opcjonalne)',
    required: false,
    example: 'https://storage.example.com/photos/paczka1.jpg',
  })
  @IsOptional()
  @IsString()
  photoUrl?: string;
}
