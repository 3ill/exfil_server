import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transactions } from '../schema/transactions.schema';
import { Model } from 'mongoose';
import { CreateTxDto } from '@/shared/dto/events.dto';
import { TxErrorMessage, TxSuccessMessage } from '../data/transactions.data';

@Injectable()
export class TransactionsProvider {
  constructor(
    @InjectModel(Transactions.name)
    private readonly transactionsModel: Model<Transactions>,
  ) {}

  async createTxs(args: CreateTxDto) {
    const { amount, destinationAddress, status, timestamp, hash } = args;
    try {
      const result = await this.transactionsModel.create({
        amount,
        destinationAddress,
        status,
        hash,
        timestamp,
      });

      return {
        status: HttpStatus.OK,
        message: TxSuccessMessage.TX_CREATED,
        data: result._id,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        TxErrorMessage.ERROR_CREATING_TX,
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error.message,
        },
      );
    }
  }

  async fetchTxs() {
    try {
      return await this.transactionsModel.find();
    } catch (error) {
      console.error(error);
      throw new HttpException(
        TxErrorMessage.ERROR_FETCHING_TXS,
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error.message,
        },
      );
    }
  }
}
