import { Module } from '@nestjs/common';
import { StellarProvider } from './provider/stellar.provider';
import { StellarService } from './service/stellar.service';
import { DeriveSecret } from '@/shared/utils/derive-secret.utils';

@Module({
  providers: [StellarService, StellarProvider, DeriveSecret],
  exports: [StellarService, StellarProvider],
})
export class StellarModule {}
