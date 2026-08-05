import { Test, TestingModule } from '@nestjs/testing';
import { WatchlaterController } from './watchlater.controller';
import { WatchlaterService } from './watchlater.service';

describe('WatchlaterController', () => {
  let controller: WatchlaterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchlaterController],
      providers: [WatchlaterService],
    }).compile();

    controller = module.get<WatchlaterController>(WatchlaterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
