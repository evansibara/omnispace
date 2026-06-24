import { Module } from "@nestjs/common";
import {
  ProjectTasksController,
  TaskStatusController,
} from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { ProjectsModule } from "../projects/projects.module";

@Module({
  imports: [ProjectsModule],
  controllers: [ProjectTasksController, TaskStatusController],
  providers: [TasksService],
})
export class TasksModule {}
