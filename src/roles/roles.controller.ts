import { Controller, Get } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RoleResponseDto } from './dto/role-response.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll(): Promise<RoleResponseDto[]> {
    return this.rolesService.findAll();
  }
}
