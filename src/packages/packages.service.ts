import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between, FindOptionsWhere } from 'typeorm';
import { Package, PackageStatus } from './entities/package.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { DeliverPackageDto } from './dto/deliver-package.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private packagesRepository: Repository<Package>,
  ) {}

  private generatePickupCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async create(createPackageDto: CreatePackageDto) {
    const pickupCode = this.generatePickupCode();
    const newPackage = this.packagesRepository.create({
      ...createPackageDto,
      pickupCode,
    });
    return this.packagesRepository.save(newPackage);
  }

  async findAll(userId?: string, search?: string) {
    let whereClause: FindOptionsWhere<Package> | FindOptionsWhere<Package>[] =
      {};

    if (userId) {
      whereClause = { recipientId: userId };
      if (search) {
        whereClause = [
          { recipientId: userId, sender: ILike(`%${search}%`) },
          { recipientId: userId, trackingNumber: ILike(`%${search}%`) },
        ];
      }
    } else if (search) {
      whereClause = [
        { sender: ILike(`%${search}%`) },
        { trackingNumber: ILike(`%${search}%`) },
      ];
    }

    return this.packagesRepository.find({
      where: whereClause,
      relations: ['recipient'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const pkg = await this.packagesRepository.findOne({
      where: { id },
      relations: ['recipient', 'issuedBy'],
    });
    if (!pkg) throw new NotFoundException('Paczka nie znaleziona');
    return pkg;
  }

  findMyPackages(userId: string) {
    return this.findAll(userId);
  }

  async update(id: string, updatePackageDto: UpdatePackageDto) {
    const pkg = await this.findOne(id);
    Object.assign(pkg, updatePackageDto);
    return this.packagesRepository.save(pkg);
  }

  async remove(id: string) {
    const pkg = await this.findOne(id);
    return this.packagesRepository.remove(pkg);
  }

  async markAsDelivered(
    id: string,
    deliverDto: DeliverPackageDto,
    receptionistId: string,
  ) {
    const pkg = await this.findOne(id);

    if (pkg.status === PackageStatus.DELIVERED) {
      throw new BadRequestException('Paczka została już odebrana');
    }

    if (pkg.pickupCode !== deliverDto.pickupCode) {
      throw new BadRequestException('Nieprawidłowy kod odbioru!');
    }

    pkg.status = PackageStatus.DELIVERED;
    pkg.issuedById = receptionistId;

    return this.packagesRepository.save(pkg);
  }

  async reportProblem(id: string, description: string) {
    const pkg = await this.findOne(id);
    pkg.status = PackageStatus.PROBLEM;
    pkg.problemDescription = description;
    return this.packagesRepository.save(pkg);
  }

  async findProblems(receptionistId?: string) {
    const where: FindOptionsWhere<Package> = {
      status: PackageStatus.PROBLEM,
    };

    if (receptionistId) {
      where.issuedById = receptionistId;
    }

    return this.packagesRepository.find({
      where: where,
      relations: ['recipient', 'issuedBy'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getAdminStats() {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const packagesThisMonth = await this.packagesRepository.count({
      where: { createdAt: Between(firstDay, lastDay) },
    });
    return { packagesThisMonth };
  }

  async getReceptionistStats() {
    const toDeliver = await this.packagesRepository.count({
      where: { status: PackageStatus.REGISTERED },
    });
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const receivedToday = await this.packagesRepository.count({
      where: { createdAt: Between(startOfDay, endOfDay) },
    });
    return { toDeliver, receivedToday };
  }
}
