import { Test, TestingModule } from '@nestjs/testing';
import { ExternalApiService } from './external-api.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoRate } from '../crypto-rate/crypto-rate.entity';
import { CryptoPair } from '../crypto-pair/crypto-pair.entity';
import { Logger } from '@nestjs/common';

describe('ExternalApiService', () => {
  let service: ExternalApiService;
  let schedulerRegistry: SchedulerRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalApiService,
        {
          provide: SchedulerRegistry,
          useValue: {
            doesExist: jest.fn(),
            addCronJob: jest.fn(),
            getCronJob: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CryptoRate),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(CryptoPair),
          useClass: Repository,
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExternalApiService>(ExternalApiService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
  });

  it('should create a new job when it does not exist', () => {
    const pair = new CryptoPair();
    pair.baseCurrency = 'BTC';
    pair.quoteCurrency = 'USD';
    pair.updateInterval = 10;

    jest.spyOn(schedulerRegistry, 'doesExist').mockReturnValue(false);
    jest
      .spyOn(schedulerRegistry, 'addCronJob')
      .mockImplementationOnce(() => {});

    service.schedule(pair);

    expect(schedulerRegistry.doesExist).toHaveBeenCalledWith(
      'cron',
      'fetch-rate-BTCUSD',
    );
    expect(schedulerRegistry.addCronJob).toHaveBeenCalled();
  });

  it('should skip job creation when it already exists', () => {
    const pair = new CryptoPair();
    pair.baseCurrency = 'BTC';
    pair.quoteCurrency = 'USD';
    pair.updateInterval = 10;

    jest.spyOn(schedulerRegistry, 'doesExist').mockReturnValue(true);

    service.schedule(pair);

    expect(schedulerRegistry.doesExist).toHaveBeenCalledWith(
      'cron',
      'fetch-rate-BTCUSD',
    );

    expect(schedulerRegistry.addCronJob).toHaveBeenCalledTimes(0);
  });

  it('should reschedule a job', () => {
    const pair = new CryptoPair();
    pair.baseCurrency = 'BTC';
    pair.quoteCurrency = 'USD';
    pair.updateInterval = 10;

    jest.spyOn(schedulerRegistry, 'getCronJob').mockReturnValue(null);
    service.reschedule(pair);

    expect(schedulerRegistry.getCronJob).toHaveBeenCalledWith(
      'fetch-rate-BTCUSD',
    );
    expect(schedulerRegistry.addCronJob).toHaveBeenCalled();
  });
});
