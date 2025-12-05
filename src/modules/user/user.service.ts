import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import type { IHashService } from '../hash/interfaces/hash.interface';
import { ResponseUserDto } from './dto/response-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('HashService')
    private readonly hasService: IHashService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    const standardizedEmail = createUserDto.email.trim().toLowerCase();

    const existingUser = await this.findByEmail(standardizedEmail)
    if (existingUser) {
      throw new ConflictException('Email already registered.')
    }

    const hashPassword = await this.hasService.hash(createUserDto.password)

    const user = this.userRepository.create({
      ...createUserDto,
      email: standardizedEmail,
      password: hashPassword,
    });

    const savedUser = await this.userRepository.save(user);

    return savedUser;
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: string): Promise<ResponseUserDto> {
    const user = await this.userRepository.findOne({
      where: { id }
    });

    if(!user) throw new NotFoundException('User not found')

    const { password, ...result } = user;
    
    return result;
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    })
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', {
        email: email.trim().toLowerCase()
      })
      .getOne();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (updateUserDto.email && user.email !== updateUserDto.email) {
      const standardizedEmail = updateUserDto.email.trim().toLowerCase();

      const existingUser = await this.findByEmail(standardizedEmail)
      if (existingUser) {
        throw new ConflictException('Email already registered.')
      }

      user.email = standardizedEmail;
    }

    if (updateUserDto.fullName) {
      user.fullName = updateUserDto.fullName;
    }

    const savedUser = await this.userRepository.save(user);

    const { password, ...result } = savedUser;
    return result;
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.userRepository.softRemove(user);
    return { message: 'User deactivated' };
  }
}
