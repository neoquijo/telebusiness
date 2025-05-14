import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksService } from './tasks.service';
import { TaskFactory } from './task.factory';
import { Task, TaskSchema } from './models/task.schema';
import { AccountsModule } from 'src/accounts/accounts.module';
import { TasksController } from './tasks.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    AccountsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, TaskFactory],
  exports: [TasksService, TaskFactory],
})
export class TasksModule { }