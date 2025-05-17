import { Test, TestingModule } from '@nestjs/testing';
import { AutomationProvider } from './automation.provider';

describe('Automation', () => {
  let provider: AutomationProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutomationProvider],
    }).compile();

    provider = module.get<AutomationProvider>(AutomationProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
