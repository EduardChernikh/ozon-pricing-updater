import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class CreateProductDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  articles: [string];
}


// import { Type } from 'class-transformer';
// import { IsArray, ArrayNotEmpty, IsString, ValidateNested } from 'class-validator';
//
// class ProductItemDto {
//   @IsString()
//   article: string;
//
//   @IsString()
//   sku: string;
// }
//
// export class CreateProductDto {
//   @IsArray()
//   @ArrayNotEmpty()
//   @ValidateNested({ each: true })
//   @Type(() => ProductItemDto)
//   articles: ProductItemDto[];
// }