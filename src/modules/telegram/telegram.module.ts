import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { DbModule } from '../db/db.module';
import { redisClientFactory } from '../../shared/factories/redis.factory';

@Module({
  imports: [DbModule],
  providers: [TelegramService, redisClientFactory],
})
export class TelegramModule {}
