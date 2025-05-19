import { Injectable } from '@nestjs/common';
import { AIAnalysisResult, NormalizedMessage } from 'src/filters/models/telegram-message.dto';

export interface AIProvider {
  analyzeMessages(messages: NormalizedMessage[], matchGoal?: string): Promise<AIAnalysisResult[]>;
}

@Injectable()
export class ArtificialIntelligenceService {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  setProvider(provider: AIProvider) {
    this.provider = provider;
  }

  async analyzeMessages(messages: NormalizedMessage[], matchGoal?: string): Promise<AIAnalysisResult[]> {
    return this.provider.analyzeMessages(messages, matchGoal);
  }
}