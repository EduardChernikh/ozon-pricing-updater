import { ArrayNotEmpty, IsArray, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ProductItemDto {
  @IsString()
  article: string;

  @IsArray()
  @IsString({ each: true })
  aliases: [string];

  @IsNumber()
  @IsOptional()
  price: number;

  @IsString()
  @IsOptional()
  category: string;
}

export class CreateProductDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProductItemDto)
  products: ProductItemDto[];
}