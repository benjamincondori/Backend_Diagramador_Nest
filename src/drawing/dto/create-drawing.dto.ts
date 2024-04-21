import { IsDate, IsOptional, IsString } from "class-validator";

export class CreateDrawingDto {
    @IsString()
    name: string;
  
    @IsString()
    description: string;
  
    @IsOptional()
    @IsString()
    data: string;
  
    @IsOptional()
    @IsDate()
    createdAt: Date;
  
    @IsOptional()
    @IsDate()
    UpdatedAt: Date;
}
