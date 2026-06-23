import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { TaskPriority } from '@prisma/client';

export class CreateTaskDto {
  @IsNotEmpty({ message: 'title is required' })
  title!: string;

  @IsOptional()
  description?: string;

  @IsEnum(TaskPriority, { message: 'priority must be one of LOW, MEDIUM, HIGH' })
  priority!: TaskPriority;

  @IsOptional()
  @IsUUID(undefined, { message: 'assigneeId must be a valid id' })
  assigneeId?: string | null;

  @IsOptional()
  @IsDateString({}, { message: 'dueDate must be a valid ISO 8601 date' })
  dueDate?: string | null;
}
