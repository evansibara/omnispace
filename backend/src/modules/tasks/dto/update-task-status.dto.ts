import { IsEnum, IsInt, Min } from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus, { message: 'status must be one of TODO, IN_PROGRESS, IN_REVIEW, DONE' })
  status!: TaskStatus;

  @IsInt({ message: 'position must be an integer' })
  @Min(0, { message: 'position must be 0 or greater' })
  position!: number;
}
