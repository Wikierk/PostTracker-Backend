import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package, PackageStatus } from './entities/package.entity';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private packagesRepository: Repository<Package>,
  ) {}

  async create(createPackageDto: any) {
    const newPackage = this.packagesRepository.create(createPackageDto);
    return this.packagesRepository.save(newPackage);
  }

  findAll() {
    return this.packagesRepository.find({ relations: ['recipient'] });
  }

  findMyPackages(userId: string) {
    return this.packagesRepository.find({
      where: { recipientId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: string) {
    return this.packagesRepository.findOne({
      where: { id },
      relations: ['recipient'],
    });
  }

  async markAsDelivered(id: string) {
    const pkg = await this.packagesRepository.findOneBy({ id });
    if (!pkg) throw new NotFoundException('Paczka nie znaleziona');

    pkg.status = PackageStatus.DELIVERED;
    return this.packagesRepository.save(pkg);
  }

  async reportProblem(id: string, description: string) {
    const pkg = await this.packagesRepository.findOneBy({ id });
    if (!pkg) throw new NotFoundException('Paczka nie znaleziona');

    pkg.status = PackageStatus.PROBLEM;
    return this.packagesRepository.save(pkg);
  }
}
