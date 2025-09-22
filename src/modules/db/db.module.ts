import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { ProductSchema } from './product.schema';
import { ProductRepository } from './product.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: 'products', schema: ProductSchema},
    ], 'mainDb'),
  ],
  providers: [
    ProductRepository,
  ],
  exports: [
    MongooseModule,
    ProductRepository,
  ],
})
export class DbModule {}
