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

@ApiTags('packages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @ApiOperation({ summary: 'Rejestracja nowej przesyłki (Recepcjonista)' })
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @Post()
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.packagesService.create(createPackageDto);
  }

  @ApiOperation({ summary: 'Pobranie listy przesyłek' })
  @ApiQuery({ name: 'userId', required: false })
  @Get()
  findAll(@Query('userId') userId?: string) {
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

  @ApiOperation({ summary: 'Edycja danych przesyłki (Tylko Admin)' })
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePackageDto: UpdatePackageDto,
  ) {
    return this.packagesService.update(id, updatePackageDto);
  }

  @ApiOperation({ summary: 'Usunięcie przesyłki (Tylko Admin)' })
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.remove(id);
  }

  @ApiOperation({ summary: 'Oznaczenie jako odebranej (Recepcjonista)' })
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @Put(':id/deliver')
  markAsDelivered(@Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.markAsDelivered(id);
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
