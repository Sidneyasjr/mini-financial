import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { dataSourceOptions } from './config/data-source';
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { APP_GUARD } from "@nestjs/core";
import { RolesGuard } from "./shared/guards/roles.guard";
import { WalletsModule } from "./modules/wallets/wallets.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    UsersModule,
    WalletsModule,
  ],
  providers: [
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
export class AppModule {}
