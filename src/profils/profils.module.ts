import { Module } from '@nestjs/common';
import { ProfilsService } from './profils.service';
import { ProfilsController } from './profils.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profil } from './entities/profil.entity';
import { AvatarsModule } from '../avatars/avatars.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Profil]), AvatarsModule, UsersModule],
  controllers: [ProfilsController],
  providers: [ProfilsService],
})
export class ProfilsModule {}
