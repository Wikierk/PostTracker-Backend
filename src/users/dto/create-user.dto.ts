import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    example: 'jan.kowalski@firma.pl',
    description: 'Adres email (unikalny)',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Jan Kowalski',
    description: 'Imię i nazwisko pracownika',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    example: 'tajnehaslo123',
    description: 'Hasło do konta (min. 6 znaków)',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.EMPLOYEE,
    description: 'Rola w systemie: admin, receptionist, employee',
  })
  @IsEnum(UserRole)
  role: UserRole;
}
