import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PickupPoint } from './entities/pickup-point.entity';
import { CreatePickupPointDto } from './dto/create-pickup-point.dto';
import { UpdatePickupPointDto } from './dto/update-pickup-point.dto';

@Injectable()
export class PickupPointsService {
  constructor(
    @InjectRepository(PickupPoint)
    private pickupPointsRepository: Repository<PickupPoint>,
  ) {}

  async create(createPickupPointDto: CreatePickupPointDto) {
    const point = this.pickupPointsRepository.create(createPickupPointDto);
    return this.pickupPointsRepository.save(point);
  }

  async findAll() {
    return this.pickupPointsRepository.find();
  }

  async findOne(id: string) {
    const point = await this.pickupPointsRepository.findOneBy({ id });
    if (!point) throw new NotFoundException('Punkt nie istnieje');
    return point;
  }

  async update(id: string, updateDto: UpdatePickupPointDto) {
    const point = await this.findOne(id);
    Object.assign(point, updateDto);
    return this.pickupPointsRepository.save(point);
  }

  async remove(id: string) {
    const point = await this.findOne(id);
    return this.pickupPointsRepository.remove(point);
  }

  async findNearest(lat: number, lon: number) {
    const allPoints = await this.pickupPointsRepository.find();
    let nearestPoint: PickupPoint | null = null;
    let minDistance = Infinity;

    for (const point of allPoints) {
      const distance = this.calculateDistance(
        lat,
        lon,
        point.latitude,
        point.longitude,
      );

      if (distance < minDistance && distance <= point.radius) {
        minDistance = distance;
        nearestPoint = point;
      }
    }

    if (nearestPoint) {
      return { found: true, point: nearestPoint, distance: minDistance };
    }

    return { found: false, message: 'Brak znanego punktu w pobliżu' };
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
