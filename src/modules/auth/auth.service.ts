import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { HashService } from '../hash/hash.service';
import { RegisterDto } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { ResponseUserDto } from '../user/dto/response-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly hashService: HashService
  ) {}

  async login(loginDto: LoginDto) {
    const standardizedEmail = loginDto.email.trim().toLowerCase();

    const user = await this.validateUserCredentials(
      standardizedEmail,
      loginDto.password
    );

    const {
      accessToken,
      refreshToken,
      refreshExpires,
    } = await this.generatetokens(user);

    const hashRefresh = await this.hashService.hash(refreshToken);

    const refresEntity = this.refreshTokenRepository.create({
      token: hashRefresh,
      expiresAt: refreshExpires,
      revoked: false,
      user,
    });

    await this.refreshTokenRepository.save(refresEntity);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const standardizedEmail = registerDto.email.trim().toLowerCase();

    const existingUser = await this.userService.findByEmail(standardizedEmail)
    if (existingUser){
      throw new UnauthorizedException('Email already registered.')
    }

    return await this.userService.create({
      ...registerDto,
      email: standardizedEmail,
    })
  }

	async logout(userId: string) {
		await this.refreshTokenRepository.createQueryBuilder()
      .update()
      .set({ revoked: true })
      .where('userId = :userId', { userId })
      .andWhere('revoked = :revoked', { revoked: false })
      .execute();

		return { message: 'User logged out of all devices' }
	}

  private async validateUserCredentials(
    email: string,
    password: string,
  ): Promise<User> {
    const user = await this.userService.findByEmailWithPassword(email);
    if (!user || !(await this.hashService.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async refreshToken(token: string) {
    if (!token) throw new UnauthorizedException(
			'No refresh token provided'
		);
    try{
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findOne(payload.sub);

      if (!user) throw new UnauthorizedException(
				'Invalid refresh token'
			);

      const refreshEntity = await this.refreshTokenRepository.find({
        where: { user: {  id: user.id  }, revoked: false },
      });

      const validToken = await this.findValidToken(
				token,
				refreshEntity
			);

			if (!validToken) throw new UnauthorizedException('Invalid token');
			
			validToken.revoked = true;
			await this.refreshTokenRepository.save(validToken);

			const { accessToken, refreshToken: newToken, refreshExpires } = 
				await this.generatetokens(user);

			const hasToken = await this.hashService.hash(newToken);
			
			await this.refreshTokenRepository.save(
				this.refreshTokenRepository.create({
					token: hasToken,
					expiresAt: refreshExpires,
					revoked: false,
					user,
				}),
			);

			return {
				accessToken,
				refreshToken: newToken,
				refreshExpires,
			};
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  private async findValidToken(
    recivedToken: string,
    storedToken: RefreshToken[]
	): Promise<RefreshToken | null> {
	  for (const stored of storedToken) {
			const isMatch = await this.hashService.compare(recivedToken, stored.token);
			if (isMatch && stored.expiresAt > new Date()) {
				return stored;
			}
		}
		return null;
  }

  private async generatetokens(user: ResponseUserDto) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + 7);

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken, refreshExpires };
  }
}
