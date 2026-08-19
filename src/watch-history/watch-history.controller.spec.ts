import { Test, TestingModule } from '@nestjs/testing';
import { WatchHistoryController } from './watch-history.controller';
import { WatchHistoryService } from './watch-history.service';

describe('WatchHistoryController', () => {
  let controller: WatchHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchHistoryController],
      providers: [WatchHistoryService],
    }).compile();

    controller = module.get<WatchHistoryController>(WatchHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
