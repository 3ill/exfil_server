import { TNetwork } from '@/modules/stellar/interface/stellar.interface';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

class TransferDto {
  @IsOptional()
  @IsString()
  secretKey?: string;

  @IsOptional()
  @IsString()
  passphrase?: string;

  @IsNotEmpty()
  @IsString()
  destinationAddress: string;

  @IsNotEmpty()
  @IsString()
  amount: string;

  @IsNotEmpty()
  @IsString()
  network: TNetwork;
}

class TimestampDto {
  @IsNotEmpty()
  @IsNumber()
  unlockTimestamp: number;
}

export class ExecuteTransferDto {
  data: TransferDto;
  timestamp: TimestampDto;
}
