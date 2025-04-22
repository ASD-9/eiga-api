import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
