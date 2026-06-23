import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class UpdateProjectDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus, { message: 'status must be a valid project status' })
  status?: ProjectStatus;

  @IsOptional()
  @IsDateString({}, { message: 'targetDeadline must be a valid ISO 8601 date' })
  targetDeadline?: string;
}
