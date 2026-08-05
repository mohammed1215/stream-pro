import { Test, TestingModule } from '@nestjs/testing';
import { WatchlaterService } from './watchlater.service';

describe('WatchlaterService', () => {
  let service: WatchlaterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WatchlaterService],
    }).compile();

    service = module.get<WatchlaterService>(WatchlaterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
