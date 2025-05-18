import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TStatus } from '../interface/transactions.interface';

@Schema()
export class Transactions {
  @Prop({ required: true, sparse: true })
  amount: string;

  @Prop({ required: true })
  destinationAddress: string;

  @Prop({ required: false })
  hash: string;

  @Prop({ required: true })
  status: TStatus;

  @Prop({ required: true })
  timestamp: string;
}

export const TransactionsSchema = SchemaFactory.createForClass(Transactions);
