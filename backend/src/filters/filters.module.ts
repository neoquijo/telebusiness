import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { MessageFilter, messageFilterSchema } from './models/message-filter.schema';
import { MessageFilterService } from './message-filter.service';

@Module({
  providers: [
    MessageFilterService
  ],
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: MessageFilter.name, schema: messageFilterSchema }
    ])
  ]
})
export class FiltersModule { }
