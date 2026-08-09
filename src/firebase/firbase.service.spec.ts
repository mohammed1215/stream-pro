import { Test, TestingModule } from '@nestjs/testing';
import { FirbaseService } from './firbase.service';

describe('FirbaseService', () => {
  let service: FirbaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FirbaseService],
    }).compile();

    service = module.get<FirbaseService>(FirbaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
