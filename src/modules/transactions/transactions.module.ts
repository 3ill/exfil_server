import { Module } from '@nestjs/common';
import { TransactionsService } from './service/transactions.service';
import { TransactionsProvider } from './provider/transactions.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { Transactions, TransactionsSchema } from './schema/transactions.schema';
import { TransactionsController } from './controller/transactions.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transactions.name, schema: TransactionsSchema },
    ]),
  ],
  providers: [TransactionsService, TransactionsProvider],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
