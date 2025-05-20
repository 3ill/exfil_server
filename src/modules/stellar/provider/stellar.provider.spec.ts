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

    it('should derive keypair from passphrase', async () => {
      const result = await provider.deriveKeypairFromPassphrase(PASSPHRASE);
      console.log(result);
      expect(result).toBeDefined();
    });
  });

  describe('Base Fee', () => {
    it('should return base fee on pi', async () => {
      const fee = await provider.fetchBaseFee('TESTNET');
      console.log(fee);
      expect(fee).toBeDefined();
    });
  });

  describe('Claimable balances', () => {
    it.only('should return claimable balance', async () => {
      const record = await provider
        .fetchClaimableBalances({
          network: 'MAINNET',
          publicKey: '',
        })
        .then((res) => res.map((rec) => rec.id));

      const id = record[0];
      console.log(id);

      expect(record).toBeDefined();
    });
  });
});
