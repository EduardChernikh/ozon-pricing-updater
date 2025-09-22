import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './_base.repository';
import {ProductDocument} from "./product.schema";

@Injectable()
export class ProductRepository extends BaseRepository<ProductDocument> {
  constructor(
    @InjectModel('products', 'mainDb') private docModel: Model<ProductDocument>,
  ) {
    super(docModel);
  }
}

export type ProductRepositoryType = ProductRepository & Model<ProductDocument>;