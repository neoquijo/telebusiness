import { Module } from '@nestjs/common';
import { ArtificialIntelligenceService } from './artificial-intelligence.service';
import { ConfigModule } from '@nestjs/config';
import { DeepseekAIProvider } from './providers/deepseek-ai.provider';


@Module({
  imports: [
    ConfigModule
  ],
  providers: [
    DeepseekAIProvider,
    {
      provide: ArtificialIntelligenceService,
      useFactory: (deepseekProvider: DeepseekAIProvider) => {
        return new ArtificialIntelligenceService(deepseekProvider);
      },
      inject: [DeepseekAIProvider]
    }
  ],
  exports: [ArtificialIntelligenceService]
})
export class AIModule { }
