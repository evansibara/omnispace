import { IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class CreateCommentDto {
  @IsUUID(undefined, { message: "projectId must be a valid id" })
  projectId!: string;

  @IsOptional()
  @IsUUID(undefined, { message: "taskId must be a valid id" })
  taskId?: string;

  @IsNotEmpty({ message: "body is required" })
  body!: string;
}
