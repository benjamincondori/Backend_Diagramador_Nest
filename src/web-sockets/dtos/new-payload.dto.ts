import { IsString } from "class-validator";

export class NewPayloadDto {
  
  @IsString()
  id: string;
  
  @IsString()
  data: string;
  
}

