import { Memo, MemoType, Operation, Transaction } from '@stellar/stellar-sdk';

export type TNetwork = 'MAINNET' | 'TESTNET';

export interface ICreateAccount {
  startingBalance: string;
  sourceAddress: string;
  destinationAddress: string;
  network: TNetwork;
}

export interface ILoadAccount {
  publicKey: string;
  network: TNetwork;
}

export interface ISubmitTX {
  tx: Transaction<Memo<MemoType>, Operation[]>;
  network: TNetwork;
}

export interface IProvidePaymentOp extends ICreateAccount {
  amount: string;
}
