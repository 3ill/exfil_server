import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './shared/config/config';
import { AutomationModule } from './modules/automation/automation.module';
import { StellarModule } from './modules/stellar/stellar.module';
import { DeriveSecret } from './shared/utils/derive-secret.utils';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsModule } from './modules/transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('db.uri'),
        dbName: configService.get('db.name'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          username: configService.get('redis.username'),
          password: configService.get('redis.password'),
        },
      }),
    }),
    AutomationModule,
    StellarModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, DeriveSecret],
})
export class AppModule {}
