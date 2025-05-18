export type TStatus = 'SUCCESS' | 'FAILED';

export interface ICreateTx {
  amount: string;
  destinationAddress: string;
  hash?: string;
  status: TStatus;
  timestamp: string;
}
