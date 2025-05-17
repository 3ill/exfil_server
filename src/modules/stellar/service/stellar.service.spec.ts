import { Test, TestingModule } from '@nestjs/testing';
import { StellarService } from './stellar.service';
import { StellarProvider } from '../provider/stellar.provider';
import { PUBLIC_KEY } from '@/shared/constants/constants';

describe('StellarService', () => {
  let service: StellarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StellarService, StellarProvider],
    }).compile();

    service = module.get<StellarService>(StellarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('balances', () => {
    it('should return balances', async () => {
      const balances = await service.checkBalance({
        network: 'TESTNET',
        publicKey: PUBLIC_KEY,
      });

      console.log(balances);
      expect(balances).toBeDefined();
    });
  });

  describe('Create Account', () => {
    it.only('should successfully create a pi account and fund it', async () => {
      const result = await service.createAccount({
        network: 'TESTNET',
        sourceAddress: PUBLIC_KEY,
        startingBalance: '10',
      });

      console.log(result.data);
      expect(typeof result.data).toBe('object');
    }, 50000);
  });
});
