import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './roles/roles.module';
import { AvatarsModule } from './avatars/avatars.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT) ?? 3306,
      username: process.env.DB_USER ?? 'root',
      password: process.env.DB_PSWD ?? 'root',
      database: process.env.DB_NAME ?? 'eiga',
      autoLoadEntities: true,
      synchronize: false,
      extra: {
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      },
    }),
    RolesModule,
    AvatarsModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
