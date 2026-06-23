import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty({ message: 'title is required' })
  title!: string;

  @IsOptional()
  description?: string;

  @IsUUID(undefined, { message: 'clientId must be a valid id' })
  clientId!: string;

  @IsDateString({}, { message: 'targetDeadline must be a valid ISO 8601 date' })
  targetDeadline!: string;
}
