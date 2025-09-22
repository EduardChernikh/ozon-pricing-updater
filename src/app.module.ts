import { Module } from '@nestjs/common';
import { DbModule } from './modules/db/db.module';
import path from 'path';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './modules/products/products.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { redisClientFactory } from './shared/factories/redis.factory';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.join(process.cwd(), "environments/.env"),
      isGlobal: true
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || "", {connectionName: 'mainDb'}),
    DbModule,
    ProductsModule,
    TelegramModule,
  ],
  controllers: [],
  providers: [redisClientFactory],
})
export class AppModule {}
