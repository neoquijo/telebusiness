import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, chatSchema } from './models/chat.schema';
import { ChatCollection, chatCollectionSchema } from './models/ChatCollection.schema';
import { ChatCollectionsService } from './chatCollections.service';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { AccountsModule } from 'src/accounts/accounts.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [
    ChatCollectionsService,
    ChatsService,
  ],
  imports: [
    AuthModule,
    AccountsModule,
    MongooseModule.forFeature([
      { name: Chat.name, schema: chatSchema },
      { name: ChatCollection.name, schema: chatCollectionSchema }
    ])
  ],
  controllers: [
    ChatsController
  ],
  exports: [
    ChatCollectionsService,
    ChatsService
  ]
})
export class ChatsModule {
}
