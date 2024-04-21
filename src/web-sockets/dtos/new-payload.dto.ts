import { IsNumber, IsString } from "class-validator";

export class NewPayloadDto {
  
  @IsNumber()
  id: number;
  
  @IsString()
  data: string;
  
}

