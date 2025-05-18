import { ITransfer } from '@/modules/stellar/interface/stellar.interface';

export interface IHandleQueue {
  data: ITransfer;
  delay: number;
}

export interface IScheduleTransfer {
  unlockTimestamp: string;
  data: ITransfer;
}
