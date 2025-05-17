import { MAINNET_URL, TESTNET_URL } from '@/shared/constants/constants';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Horizon, Keypair, Operation } from '@stellar/stellar-sdk';
import {
  ICreateAccount,
  ILoadAccount,
  ISubmitTX,
  TNetwork,
} from '../interface/stellar.interface';
import { StellarErrorMessages } from '../data/stellar.data';

@Injectable()
export class StellarProvider {
  constructor() {}

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

  async submitTx(args: ISubmitTX) {
    try {
      const server = this.initServer(args.network);
      const result = await server.submitTransaction(args.tx);
      return result.hash;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        StellarErrorMessages.ERROR_SUBMITTING_TX,
        //eslint-disable-next-line
        error,
      );
    }
  }
}
