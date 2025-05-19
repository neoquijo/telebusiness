import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { MessageFilter, messageFilterSchema } from './models/message-filter.schema';
import { MessageFilterService } from './message-filter.service';
import { FiltersController } from './filter.controller';
import { AIModule } from 'src/artificial-intelligence/artificial-intelligence.module';


@Module({
  controllers: [FiltersController],
  providers: [
    MessageFilterService
  ],
  imports: [
    AuthModule,
    AIModule,
    MongooseModule.forFeature([
      { name: MessageFilter.name, schema: messageFilterSchema }
    ])
  ],
  exports: [MessageFilterService]
})
export class FiltersModule { }
