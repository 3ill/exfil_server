import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transactions } from '../schema/transactions.schema';
import { Model } from 'mongoose';

@Injectable()
export class TransactionsProvider {
  constructor(
    @InjectModel(Transactions.name)
    private readonly transactionsModel: Model<Transactions>,
  ) {}

  async createTransaction() {}
}
