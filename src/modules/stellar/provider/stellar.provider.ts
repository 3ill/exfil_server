import { MAINNET_URL, TESTNET_URL } from '@/shared/constants/constants';
import { Injectable } from '@nestjs/common';
import { Asset, Horizon, Keypair, Operation } from '@stellar/stellar-sdk';
import {
  ICreateAccount,
  IFetchClaimableBalance,
  ILoadAccount,
  IProvidePaymentOp,
  ISubmitTX,
  TNetwork,
} from '../interface/stellar.interface';
import { DeriveSecret } from '@/shared/utils/derive-secret.utils';

@Injectable()
export class StellarProvider {
  constructor(private readonly utils: DeriveSecret) {}

  initServer(network: TNetwork) {
    switch (network) {
      case 'TESTNET':
        return new Horizon.Server(TESTNET_URL);
      case 'MAINNET':
        return new Horizon.Server(MAINNET_URL);
    }
  }

  async loadAccount(args: ILoadAccount) {
    const server = this.initServer(args.network);
    const account = await server.loadAccount(args.publicKey);

    return account;
  }

  async fetchBaseFee(network: TNetwork) {
    const server = this.initServer(network);
    const baseFee = await server.fetchBaseFee();
    return baseFee;
  }

  createKeypair() {
    const keypair = Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();
    const canSign = keypair.canSign();

    return {
      publicKey,
      secretKey,
      canSign,
    };
  }

  provideCreateAccountOperation(args: ICreateAccount) {
    const { startingBalance, sourceAddress, destinationAddress } = args;

    return Operation.createAccount({
      startingBalance,
      source: sourceAddress,
      destination: destinationAddress,
    });
  }

  providePaymentOp(
    args: Omit<IProvidePaymentOp, 'network' | 'startingBalance'>,
  ) {
    const { sourceAddress, destinationAddress, amount } = args;

    return Operation.payment({
      source: sourceAddress,
      destination: destinationAddress,
      asset: Asset.native(),
      amount,
    });
  }

  async fetchClaimableBalances(args: IFetchClaimableBalance) {
    const server = this.initServer(args.network);

    const claimableBalances = server
      .claimableBalances()
      .claimant(args.publicKey)
      .call();

    const records = (await claimableBalances).records;

    return records;
  }

  provideClaimableBalanceOp(balanceId: string) {
    return Operation.claimClaimableBalance({
      balanceId,
    });
  }

  async submitTx(args: ISubmitTX) {
    try {
      const server = this.initServer(args.network);
      const result = await server.submitTransaction(args.tx);
      return result.hash;
    } catch (error) {
      console.error(error);

      if (error.response && error.response.data) {
        console.log('Error response from Horizon:', error.response.data);

        if (error.response.data.extras) {
          console.log(
            'Extras object:',
            JSON.stringify(error.response.data.extras, null, 2),
          );
        }
      } else {
        console.error('Unknown error submitting transaction:', error);
      }
    }
  }

  deriveKeypairFromSecret(secretKey: string) {
    return Keypair.fromSecret(secretKey);
  }

  async deriveKeypairFromPassphrase(passphrase: string) {
    return await this.utils.derivePiSecretFromMnemonic(passphrase);
  }
}
