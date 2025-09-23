import { ArrayNotEmpty, IsArray, IsNumber, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ProductItemDto {
  @IsString()
  article: string;

  @IsArray()
  @IsString({ each: true })
  aliases: [string];

  @IsNumber()
  @IsPositive()
  price: number;
}

export class CreateProductDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProductItemDto)
  products: ProductItemDto[];
}