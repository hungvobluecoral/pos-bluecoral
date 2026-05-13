import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ScopeGuard } from '../../common/guards/scope.guard';
import { AllowSuperAdmin, RequireJwtTypes } from '../../common/decorators/require-scope.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AccessTokenClaims } from '@pos-bluecoral/contracts';
import { RegistrationsService } from './registrations.service';
import {
  normalizeSubmitRegistration,
  parseStatusFilter,
  validateRejectRegistration,
  validateSubmitRegistration,
} from './dto/registration.dto';
import {
  ApproveRegistrationResponse,
  ListRegistrationsResponse,
  RejectRegistrationRequest,
  RejectRegistrationResponse,
  SubmitRegistrationRequest,
  SubmitRegistrationResponse,
} from '@pos-bluecoral/contracts';

const SA_GUARDS = [JwtAuthGuard, ScopeGuard];

@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly service: RegistrationsService) {}

  /** Public: anyone can submit a registration request */
  @Post()
  async submit(@Body() body: SubmitRegistrationRequest): Promise<SubmitRegistrationResponse> {
    const issues = validateSubmitRegistration(body);
    if (issues.length) throw new BadRequestException({ code: 'validation-error', issues });
    return this.service.submit(normalizeSubmitRegistration(body));
  }

  /** SA only: list all registrations, optionally filtered by status */
  @Get()
  @UseGuards(...SA_GUARDS)
  @AllowSuperAdmin()
  @RequireJwtTypes('super_admin')
  async list(@Query('status') status?: string): Promise<ListRegistrationsResponse> {
    return this.service.list(parseStatusFilter(status));
  }

  /** SA only: approve a pending registration */
  @Post(':id/approve')
  @UseGuards(...SA_GUARDS)
  @AllowSuperAdmin()
  @RequireJwtTypes('super_admin')
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: AccessTokenClaims,
  ): Promise<ApproveRegistrationResponse> {
    const actorId = user.userId;
    return this.service.approve(id, actorId);
  }

  /** SA only: reject a pending registration */
  @Post(':id/reject')
  @UseGuards(...SA_GUARDS)
  @AllowSuperAdmin()
  @RequireJwtTypes('super_admin')
  async reject(
    @Param('id') id: string,
    @Body() body: RejectRegistrationRequest,
    @CurrentUser() user: AccessTokenClaims,
  ): Promise<RejectRegistrationResponse> {
    const issues = validateRejectRegistration(body);
    if (issues.length) throw new BadRequestException({ code: 'validation-error', issues });
    const actorId = user.userId;
    return this.service.reject(id, actorId, body.reviewNote.trim());
  }
}
