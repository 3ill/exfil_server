import { Module } from '@nestjs/common';
import { AutomationProvider } from './provider/automation.provider';
import { AutomationService } from './service/automation.service';
import { StellarModule } from '../stellar/stellar.module';
import { BullModule } from '@nestjs/bull';
import { AutomationProcessor } from './processor/automation.processor';

@Module({
  imports: [
    StellarModule,
    BullModule.registerQueue({
      name: 'transfer',
    }),
  ],
  providers: [AutomationService, AutomationProvider, AutomationProcessor],
})
export class AutomationModule {}
