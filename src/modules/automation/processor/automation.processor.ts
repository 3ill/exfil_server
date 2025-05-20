import { ITransfer } from '@/modules/stellar/interface/stellar.interface';
import { StellarService } from '@/modules/stellar/service/stellar.service';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('transfer')
export class AutomationProcessor {
  constructor(private readonly stellarService: StellarService) {}

  @Process('init-transfer')
  async handleInitTransfer(job: Job<ITransfer>) {
    console.log(`Executing processor`);

    let retryCount = 0;
    const date = new Date();
    const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    console.log(`Executing Transfer at exactly => ${time}`);

    const result = await this.stellarService.transfer(job.data);
    if (!result.hash) {
      retryCount++;
      console.log(`Transfer didn't go through! retry count ${retryCount}`);
    } else if (result.hash) {
      console.log(
        `Transaction successful! Retries: ${retryCount} ${result.hash}`,
      );
      return;
    }
  }
}
