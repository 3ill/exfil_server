import { StellarService } from '@/modules/stellar/service/stellar.service';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import {
  IHandleQueue,
  IScheduleTransfer,
} from '../interface/automation.interface';

@Injectable()
export class AutomationProvider {
  constructor(
    @InjectQueue('transfer') private transferQueue: Queue,
    private readonly stellarService: StellarService,
  ) {}

  async addToQueue(args: IHandleQueue) {
    return await this.transferQueue.add('init-transfer', args.data, {
      delay: args.delay,
      attempts: 3,
      backoff: 500,
      removeOnComplete: true,
    });
  }

  async executeTransfer(args: Omit<IHandleQueue, 'delay'>) {
    return await this.stellarService.transfer(args.data);
  }

  async scheduleTransfer(args: IScheduleTransfer) {
    const { unlockTimestamp, data } = args;
    const now = Date.now();
    const runAt = unlockTimestamp - 3000;
    const delay = runAt - now;

    try {
      if (delay <= 0) {
        console.log('🔔 Unlock time is now or passed — running immediately');
        return await this.executeTransfer({ data });
      } else {
        console.log(`⏳ Scheduling transfer job to run in ${delay}ms`);
        return await this.addToQueue({
          data,
          delay,
        });
      }
    } catch (error) {
      //eslint-disable-next-line
      throw new Error(error);
    }
  }
}
