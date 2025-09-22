import { Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create.dto';
import * as productRepository from "../db/product.repository";
import { GetProductsPricesDto } from './dto/get-prices.dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(productRepository.ProductRepository)
    private readonly productsRepo: productRepository.ProductRepositoryType,
  ) {
  }

  async updateProducts(dto: CreateProductDto) {
    let bulkOps: any[] = [];
    dto.articles.forEach(item => {
      bulkOps.push({
        updateOne: {
          filter: { article: item.article },
          update: {
            $setOnInsert: { price: 0 },
            $set: {aliases: item.aliases },
          },
          upsert: true
        },
      });
    });

    await this.productsRepo.bulkWrite(bulkOps);
  }

  async getProductsPrices(dto: GetProductsPricesDto) {
    let products: any = await this.productsRepo.find({article: {$in: dto.articles}});
    const articlePriceMap = new Map<string, number>();
    products.forEach((product: any) => {
      articlePriceMap.set(product.article, product.price);
    });

    return dto.articles.map(article => {
      return {
        article,
        price: articlePriceMap.get(article) ?? 0
      };
    });
  }
}
