import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Pobierz liczbę pracowników (Admin)' })
  @Roles(UserRole.ADMIN)
  @Get('stats/count')
  countEmployees() {
    return this.usersService.countEmployees();
  }

  @ApiOperation({ summary: 'Tworzenie nowego użytkownika (Admin)' })
  @ApiResponse({ status: 201, description: 'Użytkownik został utworzony.' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Pobranie listy wszystkich pracowników (Admin)' })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Pobranie szczegółów pracownika' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @ApiOperation({ summary: 'Usunięcie pracownika (Admin)' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
