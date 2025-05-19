import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ParserService } from './parser.service';
import { AuthGuard } from 'src/auth/user.guard';

@UseGuards(AuthGuard)
@Controller('parser')
export class ParserController {
  constructor(private readonly parserService: ParserService) { }

  @Get('/status')
  async getParsingStatus() {
    return await this.parserService.getParsingStatus();
  }

  @Post('/account/:id/enable')
  async enableParsingForAccount(@Param('id') id: string) {
    return await this.parserService.enableParsingForAccount(id);
  }

  @Post('/account/:id/disable')
  async disableParsingForAccount(@Param('id') id: string) {
    return await this.parserService.disableParsingForAccount(id);
  }

  @Post('/filter/:id/process')
  async triggerBatchProcessing(@Param('id') id: string) {
    return await this.parserService.triggerBatchProcessing(id);
  }
}
