import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob, CronTime } from 'cron';
import { lastValueFrom } from 'rxjs';
import { CryptoPair } from '../crypto-pair/crypto-pair.entity';
import { CryptoRate } from '../crypto-rate/crypto-rate.entity';
import { QueryFailedError, Repository } from 'typeorm';

import * as CircuitBreaker from 'opossum';
import { AxiosError } from 'axios';

const JOB_PREFIX = 'fetch-rate';
const BINANCE_API_URL = 'https://api.binance.com/api/v3/ticker/price';

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);
  private readonly circuitBreaker: CircuitBreaker;

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly httpService: HttpService,
    @InjectRepository(CryptoRate)
    private readonly rateRepository: Repository<CryptoRate>,
    @InjectRepository(CryptoPair)
    private readonly pairRepository: Repository<CryptoPair>,
  ) {
    this.circuitBreaker = new CircuitBreaker(this.fetchCryptoRate.bind(this), {
      timeout: 5000,
      errorThresholdPercentage: 50,
      resetTimeout: 300000,
    });

    this.circuitBreaker.on('open', () => {
      this.logger.warn('Circuit breaker opened');
      this.toggleCronJobs(false);
    });
    this.circuitBreaker.on('halfOpen', () => {
      this.logger.warn('Circuit breaker half-open');
      this.toggleCronJobs(true);
    });
    this.circuitBreaker.on('close', () => {
      this.logger.log('Circuit breaker closed');
    });
  }

  async onModuleInit() {
    await this.initializePairs();
  }

  private async initializePairs(): Promise<void> {
    const records = await this.pairRepository.findBy({
      isActive: true,
    });

    records.forEach((pair) => {
      this.startJob(pair);
    });
  }

  private toggleCronJobs(activate: boolean): void {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((job, jobName) => {
      if (!jobName.includes(`${JOB_PREFIX}`)) {
        return;
      }

      if (activate) {
        job.start();
        this.logger.log(`Started cron job: ${jobName}`);
      } else {
        job.stop();
        this.logger.log(`Stopped cron job: ${jobName}`);
      }
    });
  }

  async fetchCryptoRate(symbol: string): Promise<number> {
    return lastValueFrom(
      this.httpService.get<{ price: string }>(BINANCE_API_URL, {
        params: { symbol },
      }),
    ).then((response) => {
      const { price } = response.data;

      if (!price) {
        throw new HttpException(
          `Price not found for symbol: ${symbol}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return parseFloat(price);
    });
  }

  async validatePair(pair: CryptoPair): Promise<boolean> {
    const symbol = `${pair.baseCurrency}${pair.quoteCurrency}`;

    return lastValueFrom(
      this.httpService.get<{ price: string }>(BINANCE_API_URL, {
        params: { symbol },
      }),
    )
      .then((response) => {
        const { price } = response.data;

        if (!price) {
          throw new HttpException(
            `Price not found for symbol: ${symbol}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        return true;
      })
      .catch(() => {
        return false;
      });
  }

  startJob(pair: CryptoPair): void {
    const symbol = `${pair.baseCurrency}${pair.quoteCurrency}`;
    const jobName = `${JOB_PREFIX}-${symbol}`;

    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      const job = this.schedulerRegistry.getCronJob(jobName);
      job.start();

      this.logger.log(`Job ${jobName} already exists. Skipping creation.`);
      return;
    }

    const callback = async () => {
      this.circuitBreaker
        .fire(symbol)
        .then((rate: number) => {
          this.logger.log(`Fetched rate for ${symbol}: ${rate}`);

          this.rateRepository.save({
            pair: pair,
            rate: rate,
          });
        })
        .catch((error) => {
          if (error instanceof QueryFailedError) {
            this.logger.error(
              `Error occured while saving rate for ${symbol}: ${error.message}`,
            );
          }

          if (error.response) {
            this.logger.error(
              `API returns ${error.response.status} with following message: ${error.response.data}`,
            );
          } else if (error instanceof AxiosError) {
            this.logger.error(`No response from API`);
          } else {
            this.logger.error(`Unexpected error: ${error.message}`);
          }
        });
    };

    const job = new CronJob(`*/${pair.updateInterval} * * * *`, callback);
    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();

    this.logger.log(
      `Scheduled job for ${symbol} with interval of ${pair.updateInterval} minutes.`,
    );
  }

  changeInterval(pair: CryptoPair): void {
    const symbol = `${pair.baseCurrency}${pair.quoteCurrency}`;
    const jobName = `${JOB_PREFIX}-${symbol}`;
    const job = this.schedulerRegistry.getCronJob(jobName);

    if (job) {
      job.setTime(new CronTime(`*/${pair.updateInterval} * * * *`));
      job.start();
      this.logger.log(
        `Changed interval of job ${jobName} to every ${pair.updateInterval} minutes.`,
      );
    } else {
      this.logger.warn(`Job ${jobName} not found, creating it...`);
      this.startJob(pair);
    }
  }

  stopJob(pair: CryptoPair): void {
    const symbol = `${pair.baseCurrency}${pair.quoteCurrency}`;
    const jobName = `${JOB_PREFIX}-${symbol}`;
    const job = this.schedulerRegistry.getCronJob(jobName);

    if (!job) {
      return;
    }

    job.stop();
    this.logger.log(`Stopped job ${jobName}`);
  }
}
