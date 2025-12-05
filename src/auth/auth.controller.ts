import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Logowanie użytkownika i pobranie tokena JWT' })
  @ApiResponse({
    status: 200,
    description: 'Zwraca token JWT i dane użytkownika.',
  })
  @ApiResponse({ status: 401, description: 'Błędne dane logowania.' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
