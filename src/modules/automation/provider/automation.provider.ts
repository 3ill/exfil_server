import { StellarService } from '@/modules/stellar/service/stellar.service';
import { InjectQueue } from '@nestjs/bull';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import {
  IHandleQueue,
  IScheduleTransfer,
} from '../interface/automation.interface';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SharedEvents } from '@/shared/events/events';
import { TransferDto } from '@/shared/dto/events.dto';
import { SuccessMessage, TIMER } from '../data/automation.data';

@Injectable()
export class AutomationProvider {
  constructor(
    @InjectQueue('transfer') private transferQueue: Queue,
    private readonly eventEmitter: EventEmitter2,
    private readonly stellarService: StellarService,
  ) {}

  private formatAndReturnUnlockTIme(unlockTimestamp: string) {
    const [hour, minute, second] = unlockTimestamp.split(':').map(Number);
    const nowDate = new Date();
    const unlockDate = new Date(
      nowDate.getFullYear(),
      nowDate.getMonth(),
      nowDate.getDate(),
      hour,
      minute,
      second,
    );

    return unlockDate.getTime();
  }

  @OnEvent(SharedEvents.TRANSFER_JOB)
  async addToQueue(args: TransferDto) {
    const {
      passphrase,
      destinationAddress,
      amount,
      network,
      secretKey,
      delay,
    } = args;
    const queueData: IHandleQueue = {
      data: {
        passphrase,
        amount,
        destinationAddress,
        network,
        secretKey,
      },
      delay,
    };
    return await this.transferQueue.add('init-transfer', queueData.data, {
      delay: queueData.delay,
      attempts: 3,
      backoff: 100,
      removeOnComplete: true,
    });
  }

  async executeTransfer(args: Omit<IHandleQueue, 'delay'>) {
    return await this.stellarService.transfer(args.data);
  }

  async scheduleTransfer(args: IScheduleTransfer) {
    const { unlockTimestamp, data } = args;
    const now = Date.now();

    const runAt =
      this.formatAndReturnUnlockTIme(unlockTimestamp) - TIMER['2_SECS'];

    const delay = runAt - now;
    console.log(
      `Time passed by user ${this.formatAndReturnUnlockTIme(unlockTimestamp)}, Time to run at ${runAt}, delay ${delay} `,
    );
    try {
      if (delay <= 0) {
        console.log('🔔 Unlock time is now or passed — running immediately');
        return await this.executeTransfer({ data });
      } else {
        const delayInSecs = Math.round(delay / 1000);
        console.log(
          `⏳ Scheduling transfer job to run in ${delay}ms => ${delayInSecs}Secs`,
        );
        this.eventEmitter.emit(
          SharedEvents.TRANSFER_JOB,
          new TransferDto(
            data.destinationAddress,
            data.amount,
            data.network,
            delay,
            data.passphrase,
            data.secretKey,
          ),
        );

        return {
          status: HttpStatus.OK,
          message: `${SuccessMessage.TRANSFER_INIT}, Pi will be moved in ${delayInSecs}Secs `,
        };
      }
    } catch (error) {
      //eslint-disable-next-line
      throw new Error(error);
    }
  }
}
