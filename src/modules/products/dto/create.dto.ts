import { ArrayNotEmpty, IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ProductItemDto {
  @IsString()
  article: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  aliases: [string];
}

export class CreateProductDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductItemDto)
  products: ProductItemDto[];
}