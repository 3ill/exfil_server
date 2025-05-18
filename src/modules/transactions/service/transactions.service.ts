import { Injectable } from '@nestjs/common';
import { TransactionsProvider } from '../provider/transactions.provider';

import { CreateTxDto } from '@/shared/dto/events.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { SharedEvents } from '@/shared/events/events';

@Injectable()
export class TransactionsService {
  constructor(private readonly txProvider: TransactionsProvider) {}

  @OnEvent(SharedEvents.CREATE_TX)
  async createTx(args: CreateTxDto) {
    return await this.txProvider.createTxs(args);
  }

  async fetchTxs() {
    return await this.txProvider.fetchTxs();
  }
}
