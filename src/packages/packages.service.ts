import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between, FindOptionsWhere } from 'typeorm';
import { Package, PackageStatus } from './entities/package.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private packagesRepository: Repository<Package>,
  ) {}

  async create(createPackageDto: CreatePackageDto) {
    const newPackage = this.packagesRepository.create(createPackageDto);
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

  findMyPackages(userId: string) {
    return this.packagesRepository.find({
      where: { recipientId: userId },
      order: { createdAt: 'DESC' },
      relations: ['recipient'],
    });
  }

  async findOne(id: string) {
    const pkg = await this.packagesRepository.findOne({
      where: { id },
      relations: ['recipient'],
    });
    if (!pkg) throw new NotFoundException('Paczka nie znaleziona');
    return pkg;
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

  async markAsDelivered(id: string) {
    const pkg = await this.findOne(id);
    pkg.status = PackageStatus.DELIVERED;
    return this.packagesRepository.save(pkg);
  }

  async reportProblem(id: string, description: string) {
    const pkg = await this.findOne(id);
    pkg.status = PackageStatus.PROBLEM;
    console.log(`Zgłoszono problem dla paczki ${id}: ${description}`);
    return this.packagesRepository.save(pkg);
  }

  async getAdminStats() {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const packagesThisMonth = await this.packagesRepository.count({
      where: {
        createdAt: Between(firstDay, lastDay),
      },
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
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
    });

    return { toDeliver, receivedToday };
  }
}
