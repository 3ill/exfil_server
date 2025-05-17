import { StellarService } from '@/modules/stellar/service/stellar.service';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { IHandleQueue } from '../interface/automation.interface';

@Injectable()
export class AutomationProvider {
  constructor(
    @InjectQueue('transfer') private transferQueue: Queue,
    private readonly stellarService: StellarService,
  ) {}

  async addToQueue(args: IHandleQueue) {
    return this.transferQueue.add('init-transfer', args.data, {
      delay: args.delay,
      attempts: 3,
      backoff: 500,
      removeOnComplete: true,
    });
  }

  async executeTransfer(args: Omit<IHandleQueue, 'delay'>) {
    return await this.stellarService.transfer(args.data);
  }
}
