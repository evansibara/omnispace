import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class QueryProjectsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 9;

  @IsOptional()
  search?: string;

  @IsOptional()
  @IsIn(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ALL'])
  status?: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ALL';

  @IsOptional()
  @IsUUID()
  teamMemberId?: string;
}
