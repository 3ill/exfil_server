import { Controller, Get } from '@nestjs/common';
import { TransactionsService } from '../service/transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly txService: TransactionsService) {}

  @Get('fetchTx')
  async fetchTxs() {
    return await this.txService.fetchTxs();
  }
}
