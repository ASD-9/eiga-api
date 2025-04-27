import { Exclude } from 'class-transformer';
import { Job } from '../../jobs/entities/job.entity';
import { Nationality } from '../../nationalities/entities/nationality.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Artists')
export class Artist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  image_name: string;

  @Column()
  bio: string;

  @Column()
  birthday: Date;

  @ManyToMany(() => Job, { eager: true })
  @JoinTable({
    name: 'Artist_job',
    joinColumn: { name: 'artist_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'job_id', referencedColumnName: 'id' },
  })
  jobs: Job[];

  @ManyToMany(() => Nationality, { eager: true })
  @JoinTable({
    name: 'Artist_nationality',
    joinColumn: { name: 'artist_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'nationality_id', referencedColumnName: 'id' },
  })
  nationalities: Nationality[];

  @Exclude()
  jobs_ids: number[];

  @Exclude()
  nationalities_ids: number[];
}
