import { Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';

@Module({
  providers: [InvitationService],
  exports: [InvitationService],
})
export class InvitationModule {}
