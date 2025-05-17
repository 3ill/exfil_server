import { ITransfer } from '@/modules/stellar/interface/stellar.interface';
import { StellarService } from '@/modules/stellar/service/stellar.service';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('transer')
export class AutomationProcessor {
  constructor(private readonly stellarService: StellarService) {}

  @Process('init-transfer')
  async handleInitTransfer(job: Job<ITransfer>) {
    let retryCount = 0;
    const result = await this.stellarService.transfer(job.data);
    if (!result.hash) {
      retryCount++;
      console.log(`Transfer didn't go through! retry count ${retryCount}`);
    } else if (result.hash) {
      console.log(`Transaction successfull`);
    }
  }
}
