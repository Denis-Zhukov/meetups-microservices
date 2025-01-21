import { Test, TestingModule } from '@nestjs/testing';
import { MeetupController } from './meetup.controller';

describe('MeetupController', () => {
  let controller: MeetupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetupController],
    }).compile();

    controller = module.get<MeetupController>(MeetupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
