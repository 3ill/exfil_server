import { Module } from '@nestjs/common';
import { StellarProvider } from './provider/stellar.provider';
import { StellarService } from './service/stellar.service';

@Module({
  providers: [StellarService, StellarProvider],
})
export class StellarModule {}
