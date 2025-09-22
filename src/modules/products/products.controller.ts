import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreateProductDto } from './dto/create.dto';
import { ProductsService } from './products.service';
import { GetProductsPricesDto } from './dto/get-prices.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @HttpCode(200)
  @Post()
  async create(@Body() dto: CreateProductDto) {
    return await this.productsService.createProduct(dto);
  }


  @Post('/prices')
  async getProductsPrices(@Body() dto: GetProductsPricesDto) {
    return await this.productsService.getProductsPrices(dto);
  }
}
