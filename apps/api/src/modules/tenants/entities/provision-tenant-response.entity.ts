import { ApiProperty } from '@nestjs/swagger';

export class ProvisionedTenantSummaryEntity {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}

export class ProvisionedBranchSummaryEntity {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  code!: string;
}

export class ProvisionTenantResultEntity {
  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  branchId!: string;

  @ApiProperty({ type: ProvisionedTenantSummaryEntity })
  tenant!: ProvisionedTenantSummaryEntity;

  @ApiProperty({ type: ProvisionedBranchSummaryEntity })
  branch!: ProvisionedBranchSummaryEntity;
}
