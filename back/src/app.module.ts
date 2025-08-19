import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscoveryModule } from '@nestjs/core';
import { ApiVersionMiddleware } from './common/middleware/api-version.middleware';
import { IspResolverMiddleware } from './common/middleware/isp-resolver.middleware';
import { PublicRoutesHelper } from './common/helpers/public-routes.helper';

// Controllers & Services
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeedService } from './database/seed.service'; // ✅ Added this line

// Guards
import { TenantGuard } from './common/guards/tenant.guard';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// Configs
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { redisConfig } from './config/redis.config';
import { mpesaConfig } from './config/mpesa.config';
import { emailConfig } from './config/email.config';
import { tr069Config } from './config/tr069.config';
import { validationSchema } from './config/validation';

// Shared Modules
import { RedisModule } from './shared/redis/redis.module';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { IspsModule } from './modules/isps/isps.module';
import { Isp } from './modules/isps/entities/isp.entity';
import { PlansModule } from './modules/plans/plans.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { MikroTikModule } from './modules/mikrotik/mikrotik.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { AiModule } from './modules/ai/ai.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BackupModule } from './modules/backup/backup.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuditModule } from './modules/audit/audit.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { Tr069Module } from './modules/tr069/tr069.module';
import { WebsocketModule } from './modules/websocket/websocket.module';

// Side-effect Imports
import './common/constants';
import './common/decorators';
import './common/filters';
import './common/interceptors';
import './common/middleware';
import './common/pipes';
import './common/utils';

// Cron Jobs
import './jobs/payment-processing.job';
import './jobs/user-expiry.job';
import './jobs/session-cleanup.job';
import './jobs/backup.job';
import './jobs/analytics.job';

@Module({
  imports: [
    DiscoveryModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        redisConfig,
        mpesaConfig,
        emailConfig,
        tr069Config,
      ],
      validationSchema,
    }),
    
    // Import Isp entity for IspResolverMiddleware
    TypeOrmModule.forFeature([Isp]),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbName = configService.get<string>('database.database');
        console.log('🔌 Connecting to database:', dbName ?? 'undefined');

        return {
          type: 'postgres',
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: dbName,
          synchronize: false,
          logging: false,
          autoLoadEntities: true,
        };
      },
    }),

    // Shared Utilities
    RedisModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    IspsModule,
    PlansModule,
    PaymentsModule,
    VouchersModule,
    SessionsModule,
    MikroTikModule,
    MonitoringModule,
    AiModule,
    NotificationsModule,
    BackupModule,
    AnalyticsModule,
    AuditModule,
    MetricsModule,
    Tr069Module,
    WebsocketModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    
    // ✅ Registered SeedService
    SeedService,
    
    // Helper for public routes
    PublicRoutesHelper,

    // 🌍 Global Guards
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiVersionMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    
    // Apply ISP resolver middleware to all routes
    consumer
      .apply(IspResolverMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
