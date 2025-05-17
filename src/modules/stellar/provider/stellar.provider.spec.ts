import { Test, TestingModule } from '@nestjs/testing';
import { StellarProvider } from './stellar.provider';
import { DeriveSecret } from '@/shared/utils/derive-secret.utils';
import { PASSPHRASE } from '@/shared/constants/constants';

describe('Stellar', () => {
  let provider: StellarProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StellarProvider, DeriveSecret],
    }).compile();

    provider = module.get<StellarProvider>(StellarProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('Keypair', () => {
    it('should create keypair capable of sigining transactions', () => {
      const result = provider.createKeypair();
      console.log(result);
      expect(result).toBeDefined();
    });

    it.only('should derive keypair from passphrase', async () => {
      const result = await provider.deriveKeypairFromPassphrase(PASSPHRASE);
      console.log(result);
      expect(result).toBeDefined();
    });
  });
});
