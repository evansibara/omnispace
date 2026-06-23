import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/jwt-payload.interface';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

// No @Roles() restriction here: both internal staff and CLIENT users may
// call these. Per-resource ownership for CLIENT callers is enforced inside
// CommentsService.assertCanAccessProject — role membership alone isn't enough.

@Controller('projects/:id/comments')
export class ProjectCommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser, @Param('id') projectId: string) {
    const data = await this.commentsService.findAllForProject(user, projectId);
    return { message: 'Comments retrieved', data };
  }
}

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCommentDto) {
    const data = await this.commentsService.create(user, dto);
    return { message: 'Comment created', data };
  }
}
