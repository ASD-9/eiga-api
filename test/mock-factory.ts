import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Avatar } from 'src/avatars/entities/avatar.entity';
import { Profil } from 'src/profils/entities/profil.entity';
import { CreateProfilDto } from 'src/profils/dto/create-profil.dto';
import { Job } from 'src/jobs/entities/job.entity';
import { Nationality } from 'src/nationalities/entities/nationality.entity';
import { Artist } from 'src/artists/entities/artist.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Saga } from 'src/sagas/entities/saga.entity';
import { CreateArtistDto } from 'src/artists/dto/create-artist.dto';
import { Movie } from 'src/movies/entities/movie.entity';
import { CreateMovieDto } from 'src/movies/dto/create-movie.dto';

export class MockFactory {
  static createMockRole(override: Partial<Role> = {}): Role {
    return {
      id: 1,
      name: 'admin',
      ...override,
    };
  }

  static createMockUser(override: Partial<User> = {}): User {
    return {
      id: 1,
      username: 'Username',
      password: 'hashedPassword',
      role: this.createMockRole(),
      ...override,
    };
  }

  static createMockCreateUserDto(
    override: Partial<CreateUserDto> = {},
  ): CreateUserDto {
    return {
      username: 'Username',
      password: 'Password1234!',
      role_id: 1,
      ...override,
    };
  }

  static createMockAvatar(override: Partial<Avatar> = {}): Avatar {
    return {
      id: 1,
      name: 'Avatar 1',
      image_name: 'avatar1.png',
      ...override,
    };
  }

  static createMockProfil(override: Partial<Profil> = {}): Profil {
    return {
      id: 1,
      name: 'Profil 1',
      user: this.createMockUser(),
      avatar: this.createMockAvatar(),
      ...override,
    };
  }

  static createMockCreateProfilDto(
    override: Partial<CreateProfilDto> = {},
  ): CreateProfilDto {
    return {
      name: 'Profil 1',
      user_id: 1,
      avatar_id: 1,
      ...override,
    };
  }

  static createMockJob(override: Partial<Job> = {}): Job {
    return {
      id: 1,
      name: 'Job 1',
      ...override,
    };
  }

  static createMockNationality(
    override: Partial<Nationality> = {},
  ): Nationality {
    return {
      id: 1,
      name: 'Nationality 1',
      ...override,
    };
  }

  static createMockArtist(override: Partial<Artist> = {}): Artist {
    return {
      id: 1,
      name: 'Artist 1',
      image_name: 'artist1.jpg',
      bio: 'Artist 1 bio',
      birthday: new Date('1990-01-01'),
      jobs: [this.createMockJob()],
      nationalities: [this.createMockNationality()],
      ...override,
    };
  }

  static createMockCreateArtistDto(
    override: Partial<CreateArtistDto> = {},
  ): CreateArtistDto {
    return {
      name: 'Artist 1',
      bio: 'Artist 1 bio',
      birthday: new Date('1990-01-01'),
      jobs_ids: [1],
      nationalities_ids: [1],
      ...override,
    };
  }

  static createMockCreateArtistFormData(override = {}) {
    return {
      name: 'Artist 1',
      bio: 'Artist 1 bio',
      birthday: '1990-01-01',
      jobs_ids: 1,
      nationalities_ids: 1,
      ...override,
    };
  }

  static createMockCategory(override: Partial<Category> = {}): Category {
    return {
      id: 1,
      name: 'Category 1',
      ...override,
    };
  }

  static createMockSaga(override: Partial<Saga> = {}): Saga {
    return {
      id: 1,
      name: 'Saga 1',
      ...override,
    };
  }

  static createMockMovie(override: Partial<Movie> = {}): Movie {
    return {
      id: 1,
      title: 'Movie 1',
      synopsis: 'Movie 1 synopsis',
      image_name: 'movie1.jpg',
      duration: 120,
      trailer_url: 'https://example.com/trailer1',
      release_date: new Date('2014-01-01'),
      video_name: 'video1.mp4',
      saga: this.createMockSaga(),
      categories: [this.createMockCategory()],
      nationalities: [this.createMockNationality()],
      profils: [],
      ...override,
    };
  }

  static createMockCreateMovieDto(
    override: Partial<CreateMovieDto> = {},
  ): CreateMovieDto {
    return {
      title: 'Movie 1',
      synopsis: 'Movie 1 synopsis',
      duration: 120,
      trailer_url: 'https://example.com/trailer1',
      release_date: new Date('2014-01-01'),
      saga_id: 1,
      categories_ids: [1],
      nationalities_ids: [1],
      ...override,
    };
  }

  static createMockCreateMovieFormData(override = {}) {
    return {
      title: 'Movie 1',
      synopsis: 'Movie 1 synopsis',
      duration: 120,
      trailer_url: 'https://example.com/trailer1',
      release_date: '2014-01-01',
      saga_id: 1,
      categories_ids: 1,
      nationalities_ids: 1,
      ...override,
    };
  }
}
