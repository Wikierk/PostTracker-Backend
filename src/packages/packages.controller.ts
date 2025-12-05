import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreatePackageDto } from './dto/create-package.dto';
import { ReportProblemDto } from './dto/report-problem.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('packages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @ApiOperation({ summary: 'Rejestracja nowej przesyłki (Recepcjonista)' })
  @Post()
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.packagesService.create(createPackageDto);
  }

  @ApiOperation({
    summary:
      'Pobranie listy wszystkich przesyłek lub przesyłek konkretnego użytkownika',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'ID pracownika, aby pobrać tylko jego paczki',
  })
  @Get()
  findAll(@Query('userId') userId?: string) {
    if (userId) {
      return this.packagesService.findMyPackages(userId);
    }
    return this.packagesService.findAll();
  }

  @ApiOperation({ summary: 'Pobranie szczegółów konkretnej przesyłki' })
  @ApiParam({ name: 'id', description: 'UUID przesyłki' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.findOne(id);
  }

  @ApiOperation({
    summary: 'Oznaczenie przesyłki jako odebranej (Recepcjonista)',
  })
  @Put(':id/deliver')
  markAsDelivered(@Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.markAsDelivered(id);
  }

  @ApiOperation({ summary: 'Zgłoszenie problemu z przesyłką (Pracownik)' })
  @Put(':id/problem')
  reportProblem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() problemDto: ReportProblemDto,
  ) {
    return this.packagesService.reportProblem(id, problemDto.description);
  }
}
