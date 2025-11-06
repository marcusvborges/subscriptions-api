import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IHashService } from './interfaces/hash.interface';

@Injectable()
export class HashService implements IHashService {
  private readonly saltRounds = 10;

  hash(data: string): Promise<string> {
    return bcrypt.hash(data, this.saltRounds);
  }

  compare(data: string, hash: string): Promise<boolean> {
    return bcrypt.compare(data, hash);
  }
}
