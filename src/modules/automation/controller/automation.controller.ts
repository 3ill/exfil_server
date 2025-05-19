import { Body, Controller, Post } from '@nestjs/common';
import { AutomationService } from '../service/automation.service';
import { ExecuteTransferDto } from '../dto/automation.dto';

@Controller('automation')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post('executeTransfer')
  async executeTransfer(@Body() ctx: ExecuteTransferDto) {
    console.log(`Executing transfer`);
    console.log(ctx);
    return await this.automationService.executeTransfer({
      data: ctx.data,
      unlockTimestamp: ctx.timestamp.unlockTimestamp,
    });
  }
}
