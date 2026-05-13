import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  getSchemaPath,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { successResponse } from '../../common/http/api-response';
import { ProvisionTenantRequestDto } from './dto/provision-tenant.dto';
import { ProvisionTenantResultEntity } from './entities/provision-tenant-response.entity';
import { TenantProvisioningService } from './tenant-provisioning.service';

type ScopedRequest = Request & { requestId?: string };

@ApiTags('tenants')
@ApiExtraModels(ProvisionTenantResultEntity)
@Controller('tenants')
export class TenantsController {
  constructor(
    private readonly tenantProvisioningService: TenantProvisioningService,
  ) {}

  @Post('provisioning')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Provision a tenant with its first branch and scoped foundation data',
  })
  @ApiBody({ type: ProvisionTenantRequestDto })
  @ApiCreatedResponse({
    description: 'Tenant provisioning completed successfully.',
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(ProvisionTenantResultEntity),
        },
        meta: {
          properties: {
            requestId: {
              type: 'string',
            },
            scope: {
              type: 'string',
            },
          },
          type: 'object',
        },
      },
      type: 'object',
    },
  })
  @ApiBadRequestResponse({
    description: 'Payload validation failed.',
    schema: {
      example: {
        error: {
          code: 'validation-failed',
          details: [{ field: 'tenantSlug', message: 'tenantSlug phải ở dạng kebab-case.' }],
          message: 'Payload provisioning tenant/branch không hợp lệ.',
          requestId: 'req-example',
        },
      },
    },
  })
  @ApiConflictResponse({
    description: 'Tenant, branch, or scope conflict prevented provisioning.',
    schema: {
      example: {
        error: {
          code: 'tenant-already-exists',
          message: 'tenantSlug đã tồn tại.',
          requestId: 'req-example',
        },
      },
    },
  })
  async provisionTenant(
    @Body() payload: ProvisionTenantRequestDto,
    @Req() request: ScopedRequest,
  ) {
    const result = await this.tenantProvisioningService.provision(payload, {
      requestId: request.requestId ?? 'unknown-request-id',
      scopedTenantId: request.header('x-tenant-id') ?? undefined,
    });

    return successResponse(result, {
      requestId: request.requestId,
      scope: 'system-admin',
    });
  }
}
