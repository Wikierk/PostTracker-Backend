import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseFloatPipe,
} from '@nestjs/common';
import { PickupPointsService } from './pickup-points.service';
import { CreatePickupPointDto } from './dto/create-pickup-point.dto';
import { UpdatePickupPointDto } from './dto/update-pickup-point.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('pickup-points')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pickup-points')
export class PickupPointsController {
  constructor(private readonly pickupPointsService: PickupPointsService) {}

  @ApiOperation({
    summary: 'Znajdź najbliższy punkt odbioru na podstawie koordynatów',
  })
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiQuery({ name: 'lat', type: Number })
  @ApiQuery({ name: 'lon', type: Number })
  @Get('find-nearest')
  findNearest(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lon', ParseFloatPipe) lon: number,
  ) {
    return this.pickupPointsService.findNearest(lat, lon);
  }

  @ApiOperation({ summary: 'Dodaj nowy punkt odbioru (Admin)' })
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createPickupPointDto: CreatePickupPointDto) {
    return this.pickupPointsService.create(createPickupPointDto);
  }

  @ApiOperation({ summary: 'Pobierz listę wszystkich punktów' })
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @Get()
  findAll() {
    return this.pickupPointsService.findAll();
  }

  @ApiOperation({ summary: 'Edytuj punkt (Admin)' })
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePickupPointDto: UpdatePickupPointDto,
  ) {
    return this.pickupPointsService.update(id, updatePickupPointDto);
  }

  @ApiOperation({ summary: 'Usuń punkt (Admin)' })
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pickupPointsService.remove(id);
  }
}
