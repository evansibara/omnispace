import { Module } from "@nestjs/common";
import {
  ProjectCommentsController,
  CommentsController,
} from "./comments.controller";
import { CommentsService } from "./comments.service";
import { ProjectsModule } from "../projects/projects.module";

@Module({
  imports: [ProjectsModule],
  controllers: [ProjectCommentsController, CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
