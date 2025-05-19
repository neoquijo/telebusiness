import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsModule } from './accounts/accounts.module';
import { ChatsModule } from './chats/chats.module';
import { ConfigsModule } from './configs/configs.module';
import { MessagesModule } from './messages/messages.module';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import { FiltersModule } from './filters/filters.module';
import { TaskRunnerModule } from './task-runner/task-runner.module';
import { ParserModule } from './parser/parser.module';
import { DeepseekModule } from './deepseek/deepseek.module';
import { LeadsModule } from './leads/leads.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    AuthModule,
    MongooseModule.forRoot('mongodb+srv://admin:admin@cluster0.lnoto.mongodb.net/telegram?retryWrites=true&w=majority&appName=Cluster0'),
    AccountsModule,
    ChatsModule,
    ConfigsModule,
    MessagesModule,
    TasksModule,
    FiltersModule,
    TaskRunnerModule,
    ParserModule,
    DeepseekModule,
    LeadsModule,
    // TaskManagerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
