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
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CreatePackageDto } from './dto/create-package.dto';
import { ReportProblemDto } from './dto/report-problem.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { DeliverPackageDto } from './dto/deliver-package.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('packages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @ApiOperation({ summary: 'Pobierz statystyki dla Recepcjonisty' })
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @Get('stats/receptionist')
  getReceptionistStats() {
    return this.packagesService.getReceptionistStats();
  }

  @ApiOperation({ summary: 'Pobierz statystyki paczek dla Admina' })
  @Roles(UserRole.ADMIN)
  @Get('stats/admin-packages')
  getAdminPackageStats() {
    return this.packagesService.getAdminStats();
  }

  @ApiOperation({ summary: 'Pobierz listę zgłoszonych problemów' })
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @Get('problems')
  findProblems(@Request() req: any) {
    const user = req.user;

    if (user.role === UserRole.ADMIN) {
      return this.packagesService.findProblems();
    }

    return this.packagesService.findProblems(user.userId);
  }

  @ApiOperation({
    summary: 'Rejestracja nowej przesyłki ze zdjęciem (Recepcjonista)',
  })
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        trackingNumber: { type: 'string' },
        sender: { type: 'string' },
        recipientId: { type: 'string', format: 'uuid' },
        pickupPoint: { type: 'string' },
        photo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  @Post()
  create(
    @Body() createPackageDto: CreatePackageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      createPackageDto.photoUrl = `uploads/${file.filename}`;
    }
    return this.packagesService.create(createPackageDto);
  }

  @ApiOperation({ summary: 'Pobranie listy przesyłek' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  findAll(@Query('userId') userId?: string, @Query('search') search?: string) {
    return this.packagesService.findAll(userId, search);
  }

  @ApiOperation({ summary: 'Pobranie szczegółów' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.findOne(id);
  }

  @ApiOperation({ summary: 'Edycja danych' })
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePackageDto: UpdatePackageDto,
  ) {
    return this.packagesService.update(id, updatePackageDto);
  }

  @ApiOperation({ summary: 'Usunięcie przesyłki' })
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.remove(id);
  }

  @ApiOperation({ summary: 'Wydanie przesyłki (wymaga kodu odbioru)' })
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @Put(':id/deliver')
  markAsDelivered(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() deliverDto: DeliverPackageDto,
    @Request() req: any,
  ) {
    const receptionistId = req.user.userId;
    return this.packagesService.markAsDelivered(id, deliverDto, receptionistId);
  }

  @ApiOperation({ summary: 'Zgłoszenie problemu' })
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @Put(':id/problem')
  reportProblem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() problemDto: ReportProblemDto,
  ) {
    return this.packagesService.reportProblem(id, problemDto.description);
  }
}
