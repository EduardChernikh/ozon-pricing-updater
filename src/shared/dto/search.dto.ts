import {IsNumber, IsOptional} from "class-validator";
import {Transform} from "class-transformer";

export class PaginateDto {
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => {
        return Number(value);
    })
    page: number = 0;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => {
        return Number(value);
    })
    limit: number = 25;
}