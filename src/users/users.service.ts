import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(newUser);
  }

  async findAll() {
    return this.usersRepository.find({
      select: ['id', 'email', 'fullName', 'role'],
    });
  }

  async findOne(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  async findById(id: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('Użytkownik nie istnieje');
    const { password, ...result } = user;
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'password', 'role', 'fullName'],
    });
    if (!user) throw new NotFoundException('Użytkownik nie istnieje');

    if (updateUserDto.email !== undefined) user.email = updateUserDto.email;
    if (updateUserDto.fullName !== undefined)
      user.fullName = updateUserDto.fullName;
    if (updateUserDto.role !== undefined) user.role = updateUserDto.role;

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const saved = await this.usersRepository.save(user);
    const { password, ...result } = saved;
    return result;
  }

  async remove(id: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('Użytkownik nie istnieje');
    return this.usersRepository.remove(user);
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'fullName'],
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async countEmployees() {
    const count = await this.usersRepository.count({
      where: { role: UserRole.EMPLOYEE },
    });
    return { count };
  }
}
