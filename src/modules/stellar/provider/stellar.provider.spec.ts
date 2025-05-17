import { Test, TestingModule } from '@nestjs/testing';
import { StellarProvider } from './stellar.provider';

describe('Stellar', () => {
  let provider: StellarProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StellarProvider],
    }).compile();

    provider = module.get<StellarProvider>(StellarProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('Keypair', () => {
    it.only('should create keypair capable of sigining transactions', () => {
      const result = provider.createKeypair();
      console.log(result);
      expect(result).toBeDefined();
    });
  });
});
