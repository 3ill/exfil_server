import { TNetwork } from '@/modules/stellar/interface/stellar.interface';
import { TStatus } from '@/modules/transactions/interface/transactions.interface';

export class TransferDto {
  constructor(
    readonly destinationAddress: string,
    readonly amount: string,
    readonly network: TNetwork,
    readonly delay: number,
    readonly passphrase?: string,
    readonly secretKey?: string,
  ) {}
}

export class CreateTxDto {
  constructor(
    readonly amount: string,
    readonly destinationAddress: string,
    readonly status: TStatus,
    readonly timestamp: string,
    readonly hash?: string,
  ) {}
}
