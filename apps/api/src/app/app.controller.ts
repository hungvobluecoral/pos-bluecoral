import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { successResponse } from '../common/http/api-response';
import { AppService } from './app.service';

@ApiTags('foundation')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Return onboarding foundation metadata for system admin setup',
  })
  @ApiOkResponse({
    description: 'Standardized success envelope for the onboarding foundation',
  })
  getData() {
    return successResponse(this.appService.getData(), {
      scope: 'system-admin',
    });
  }
}
