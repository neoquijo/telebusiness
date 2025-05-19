import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { LeadService } from './lead.service';
import { AuthGuard } from 'src/auth/user.guard';
import { CurrentUser } from 'src/auth/user.decorator';
import { User } from 'src/users/models/user.schema';

@UseGuards(AuthGuard)
@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) { }

  @Get('/')
  async getLeads(@CurrentUser() user: User) {
    return await this.leadService.getLeadsForUser(user._id);
  }

  @Get('/:id')
  async getLead(@Param('id') id: string) {
    return await this.leadService.getLeadById(id);
  }
}
