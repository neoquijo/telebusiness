import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskFactory } from './task.factory';
import { AuthGuard } from 'src/auth/user.guard';
import { Task, TaskStatus, TaskType } from './models/task.schema';
import { CurrentUser } from 'src/auth/user.decorator';
import { User } from 'src/users/models/user.schema';


@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly taskFactory: TaskFactory,
  ) { }

  @Post()
  async create(
    @Body() createTaskDto: {
      name: string;
      type: TaskType;
      accountIds: string[];
      config: Record<string, any>;
    },
    @CurrentUser() user: User,
  ): Promise<Task> {
    const task = await this.taskFactory.createTask({
      name: createTaskDto.name,
      type: createTaskDto.type,
      accountIds: createTaskDto.accountIds,
      userId: user.id,
      config: createTaskDto.config,
    });

    return task;
  }

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query('type') type?: TaskType,
    @Query('status') status?: TaskStatus,
  ): Promise<Task[]> {
    return this.tasksService.findAll({
      user: user.id,
      type,
      status,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Task> {
    return this.tasksService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: Partial<Task>,
  ): Promise<Task> {
    const { status, accounts, user, ...safeFields } = updateTaskDto;

    return this.tasksService.update(id, safeFields);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    try {
      await this.taskFactory.stopTask(id);
    } catch (e) {
      // Ignore errors if task is not running
    }

    const success = await this.tasksService.delete(id);
    return { success };
  }

  @Post(':id/start')
  async startTask(@Param('id') id: string): Promise<Task> {
    return this.taskFactory.startTask(id);
  }

  @Post(':id/stop')
  async stopTask(@Param('id') id: string): Promise<Task> {
    return this.taskFactory.stopTask(id);
  }

  @Post(':id/pause')
  async pauseTask(@Param('id') id: string): Promise<Task> {
    return this.taskFactory.pauseTask(id);
  }

  @Post(':id/resume')
  async resumeTask(@Param('id') id: string): Promise<Task> {
    return this.taskFactory.resumeTask(id);
  }
}