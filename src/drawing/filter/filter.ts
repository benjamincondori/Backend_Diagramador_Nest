import { IsString, IsOptional } from 'class-validator';
export class FilterDrawing {
  @IsOptional()
  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  search: string;
}
