import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CryptoPairController } from './crypto-pair.controller';
import { CryptoPairService } from './crypto-pair.service';
import { CryptoPair } from './crypto-pair.entity';
import { applyConfig } from '../app.config';

describe('CryptoPairController', () => {
  let controller: CryptoPairController;
  let service: CryptoPairService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CryptoPairController],
      providers: [
        {
          provide: CryptoPairService,
          useValue: {
            getPairs: jest.fn(),
            createPair: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    const app = module.createNestApplication();

    applyConfig(app);

    controller = module.get<CryptoPairController>(CryptoPairController);
    service = module.get<CryptoPairService>(CryptoPairService);
  });

  describe('createPair', () => {
    it('should create a new pair', async () => {
      const request = {
        base: 'BTC',
        quote: 'USD',
        updateInterval: 5,
      };

      const pair: CryptoPair = {
        id: 1,
        baseCurrency: request.base,
        quoteCurrency: request.quote,
        updateInterval: request.updateInterval,
        isActive: false,
        createdAt: new Date(),
      };

      jest.spyOn(service, 'createPair').mockResolvedValue(pair);

      const result = await controller.createPair(request);

      expect(service.createPair).toHaveBeenCalledWith({
        baseCurrency: request.base,
        quoteCurrency: request.quote,
        updateInterval: request.updateInterval,
      });
      expect(result).toEqual({
        statusCode: 201,
        message: `Pair with id ${pair.id} was succesfully created`,
      });
    });

    it('should throw an error if the pair creation fails', async () => {
      const request = {
        base: 'BTC',
        quote: 'USD',
        updateInterval: 5,
      };

      jest.spyOn(service, 'createPair').mockRejectedValue(new Error('Failed'));

      await expect(controller.createPair(request)).rejects.toThrow('Failed');
    });
  });
});
