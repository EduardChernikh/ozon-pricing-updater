import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class GetProductsPricesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  articles: [string];
}