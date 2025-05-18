import { TNetwork } from '@/modules/stellar/interface/stellar.interface';

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
