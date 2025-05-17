import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { StellarProvider } from '../provider/stellar.provider';
import {
  PiNetworkPassphrase,
  StellarErrorMessages,
  StellarSuccessMessages,
} from '../data/stellar.data';
import {
  ICreateAccount,
  ILoadAccount,
  ITransfer,
  TNetwork,
} from '../interface/stellar.interface';
import { BASE_FEE, Memo, TransactionBuilder } from '@stellar/stellar-sdk';
import { PUBLIC_KEY, SECRET_KEY } from '@/shared/constants/constants';

@Injectable()
export class StellarService {
  constructor(private readonly stellarProvider: StellarProvider) {}

  private determinePassphrase(network: TNetwork) {
    switch (network) {
      case 'MAINNET':
        return PiNetworkPassphrase.MAINNET;
      case 'TESTNET':
        return PiNetworkPassphrase.TESTNET;
      default:
        throw new BadRequestException(
          StellarErrorMessages.ERROR_INVALID_NETWORK,
        );
    }
  }
  createKeypair() {
    try {
      const result = this.stellarProvider.createKeypair();
      if (!result) {
        throw new BadRequestException(
          StellarErrorMessages.ERROR_CREATING_KEYPAIR,
        );
      }

      return result;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        StellarErrorMessages.ERROR_CREATING_KEYPAIR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  }

  async checkBalance(args: ILoadAccount) {
    const account = await this.stellarProvider.loadAccount(args);
    return account.balances;
  }

  async createAccount(args: Omit<ICreateAccount, 'destinationAddress'>) {
    const { startingBalance, sourceAddress, network } = args;
    try {
      const keypairResult = this.createKeypair();
      const sourceAccount = await this.stellarProvider.loadAccount({
        network,
        publicKey: PUBLIC_KEY,
      });
      const tx = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.determinePassphrase(network),
      })
        .addOperation(
          this.stellarProvider.provideCreateAccountOperation({
            destinationAddress: keypairResult.publicKey,
            sourceAddress,
            startingBalance,
            network,
          }),
        )
        .setTimeout(30)
        .addMemo(Memo.text('create account tx'))
        .build();

      tx.sign(this.stellarProvider.deriveKeypairFromSecret(SECRET_KEY));
      const hash = await this.stellarProvider.submitTx({
        network,
        tx,
      });

      if (!hash) {
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: StellarErrorMessages.ERROR_CREATING_ACCOUNT,
        };
      }

      return {
        status: HttpStatus.OK,
        message: StellarSuccessMessages.SUCCESS_CREATING_ACCOUNT,
        data: {
          publicKey: keypairResult.publicKey,
          secretKey: keypairResult.secretKey,
        },
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        StellarErrorMessages.ERROR_CREATING_ACCOUNT,
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  }

  async transfer(args: ITransfer) {
    const { destinationAddress, secretKey, passphrase, amount, network } = args;
    try {
      const keyPair = secretKey
        ? this.stellarProvider.deriveKeypairFromSecret(secretKey)
        : await this.stellarProvider.deriveKeypairFromPassphrase(passphrase!);

      const account = await this.stellarProvider.loadAccount({
        network,
        publicKey: keyPair.publicKey(),
      });

      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.determinePassphrase(network),
      })
        .addOperation(
          this.stellarProvider.providePaymentOp({
            amount,
            destinationAddress,
            sourceAddress: keyPair.publicKey(),
          }),
        )
        .setTimeout(30)
        .addMemo(Memo.text('Payment initiated'))
        .build();

      tx.sign(keyPair);

      const hash = await this.stellarProvider.submitTx({
        network,
        tx,
      });

      if (!hash) {
        throw new HttpException(
          StellarErrorMessages.ERROR_SUBMITTING_TX,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        status: HttpStatus.OK,
        hash,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        StellarErrorMessages.ERROR_TRANSFERRING_ASSET,
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  }
}
