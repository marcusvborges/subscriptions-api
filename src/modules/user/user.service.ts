import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
    const hashPassword = await this.hasService.hash(createUserDto.password)

    const user = await this.userRepository.create({
      ...createUserDto,
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

    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    })
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', {
        email: email.trim().toLowerCase()
      })
      .getOne();
  }
}
