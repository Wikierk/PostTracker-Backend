import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  ParseUUIDPipe,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreatePackageDto } from './dto/create-package.dto';
import { ReportProblemDto } from './dto/report-problem.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { DeliverPackageDto } from './dto/deliver-package.dto';

@ApiTags('packages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @ApiOperation({
    summary:
      'Pobierz statystyki dla Recepcjonisty (Do wydania / Przyjęte dziś)',
  })
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @Get('stats/receptionist')
  getReceptionistStats() {
    return this.packagesService.getReceptionistStats();
  }

  @ApiOperation({
    summary: 'Pobierz statystyki paczek dla Admina (Ilość w miesiącu)',
  })
  @Roles(UserRole.ADMIN)
  @Get('stats/admin-packages')
  getAdminPackageStats() {
    return this.packagesService.getAdminStats();
  }

  @ApiOperation({ summary: 'Rejestracja nowej przesyłki (Recepcjonista)' })
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @Post()
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.packagesService.create(createPackageDto);
  }

  @ApiOperation({
    summary: 'Pobranie listy przesyłek z opcjonalnym wyszukiwaniem',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filtruj po ID pracownika',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Szukaj po nadawcy lub numerze śledzenia',
  })
  @Get()
  findAll(@Query('userId') userId?: string, @Query('search') search?: string) {
    if (userId) {
      return this.packagesService.findMyPackages(userId);
    }
    return this.packagesService.findAll();
  }

  @ApiOperation({ summary: 'Pobranie szczegółów przesyłki' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.findOne(id);
  }

  @ApiOperation({ summary: 'Edycja danych przesyłki (Tylko Recepcjonista)' })
  @Roles(UserRole.RECEPTIONIST)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePackageDto: UpdatePackageDto,
  ) {
    return this.packagesService.update(id, updatePackageDto);
  }

  @ApiOperation({ summary: 'Usunięcie przesyłki (Tylko Recepcjonista)' })
  @Roles(UserRole.RECEPTIONIST)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.remove(id);
  }

  @ApiOperation({
    summary: 'Wydanie przesyłki po weryfikacji kodu (Recepcjonista)',
  })
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @Put(':id/deliver')
  markAsDelivered(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() deliverDto: DeliverPackageDto,
  ) {
    return this.packagesService.markAsDelivered(id, deliverDto);
  }

  @ApiOperation({ summary: 'Zgłoszenie problemu (Pracownik)' })
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @Put(':id/problem')
  reportProblem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() problemDto: ReportProblemDto,
  ) {
    return this.packagesService.reportProblem(id, problemDto.description);
  }
}
