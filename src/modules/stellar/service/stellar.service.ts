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
import { Memo, TransactionBuilder } from '@stellar/stellar-sdk';
import { PUBLIC_KEY, SECRET_KEY } from '@/shared/constants/constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SharedEvents } from '@/shared/events/events';
import { CreateTxDto } from '@/shared/dto/events.dto';
import { TStatus } from '@/modules/transactions/interface/transactions.interface';

@Injectable()
export class StellarService {
  constructor(
    private readonly stellarProvider: StellarProvider,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
      const baseFee = await this.stellarProvider.fetchBaseFee(network);
      const tx = new TransactionBuilder(sourceAccount, {
        fee: String(baseFee),
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

      const baseFee = await this.stellarProvider.fetchBaseFee(network);

      const tx = new TransactionBuilder(account, {
        fee: String(baseFee),
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

      const date = new Date();
      const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

      console.log(`Transaction submitted exactly at => ${time}`);
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

      console.log(`Transaction hash => ${hash}`);
      const status: TStatus = hash ? 'SUCCESS' : 'FAILED';
      this.eventEmitter.emit(
        SharedEvents.CREATE_TX,
        new CreateTxDto(amount, destinationAddress, status, time, hash),
      );
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

  async claimAndTransfer(args: ITransfer) {
    const { destinationAddress, secretKey, passphrase, amount, network } = args;
    try {
      if (network === 'TESTNET') {
        console.log(`No balance Id. Executing regular transfer`);
        return await this.transfer(args);
      }

      const keyPair = secretKey
        ? this.stellarProvider.deriveKeypairFromSecret(secretKey)
        : await this.stellarProvider.deriveKeypairFromPassphrase(passphrase!);

      const account = await this.stellarProvider.loadAccount({
        network,
        publicKey: keyPair.publicKey(),
      });

      const baseFee = await this.stellarProvider.fetchBaseFee(network);
      const record = await this.stellarProvider
        .fetchClaimableBalances({
          publicKey: keyPair.publicKey(),
          network,
        })
        .then((res) => res.map((rec) => rec.id));

      const balanceId = record[0];

      if (!balanceId) {
        console.log(`No balance Id. Executing regular transfer`);
        return await this.transfer(args);
      }

      const tx = new TransactionBuilder(account, {
        fee: String(baseFee),
        networkPassphrase: this.determinePassphrase(network),
      })
        .addOperation(this.stellarProvider.provideClaimableBalanceOp(balanceId))
        .addOperation(
          this.stellarProvider.providePaymentOp({
            amount,
            destinationAddress,
            sourceAddress: keyPair.publicKey(),
          }),
        )
        .setTimeout(30)
        .build();

      tx.sign(keyPair);

      const date = new Date();
      const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

      console.log(`Transaction submitted exactly at => ${time}`);
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

      console.log(`Transaction hash => ${hash}`);
      const status: TStatus = hash ? 'SUCCESS' : 'FAILED';
      this.eventEmitter.emit(
        SharedEvents.CREATE_TX,
        new CreateTxDto(amount, destinationAddress, status, time, hash),
      );
      return {
        status: HttpStatus.OK,
        hash,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        StellarErrorMessages.ERROR_CLAIMING_ASSET,
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  }
}
