import { Test, TestingModule } from '@nestjs/testing';
import { StellarService } from './stellar.service';
import { StellarProvider } from '../provider/stellar.provider';
import { PASSPHRASE, PUBLIC_KEY } from '@/shared/constants/constants';
import { DeriveSecret } from '@/shared/utils/derive-secret.utils';

describe('StellarService', () => {
  let service: StellarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StellarService, StellarProvider, DeriveSecret],
    }).compile();

    service = module.get<StellarService>(StellarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('balances', () => {
    it.only('should return balances', async () => {
      const balances = await service.checkBalance({
        network: 'TESTNET',
        publicKey: PUBLIC_KEY,
      });

      console.log(balances);
      expect(balances).toBeDefined();
    });
  });

  describe('Create Account', () => {
    it('should successfully create a pi account and fund it', async () => {
      const result = await service.createAccount({
        network: 'TESTNET',
        sourceAddress: PUBLIC_KEY,
        startingBalance: '10',
      });

      console.log(result.data);
      expect(typeof result.data).toBe('object');
    }, 50000);
  });

  describe('Transfer', () => {
    it('should successfully transfer Pi from a given account using passphrase', async () => {
      const result = await service.transfer({
        passphrase: PASSPHRASE,
        destinationAddress: PUBLIC_KEY,
        amount: '5',
        network: 'TESTNET',
      });

      console.log(result);
      expect(result).toBeDefined();
    }, 50000);
  });
});
