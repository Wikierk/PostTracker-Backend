import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@firma.pl', description: 'Email użytkownika' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'haslo123', description: 'Hasło użytkownika' })
  @IsString()
  @IsNotEmpty()
  password: string;
}