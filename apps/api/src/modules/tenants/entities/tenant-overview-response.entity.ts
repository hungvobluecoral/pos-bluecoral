import { ApiProperty } from '@nestjs/swagger';
import {
  TENANT_READINESS_STATUSES,
  type TenantReadinessStatus,
} from '@pos-bluecoral/contracts';

export class TenantOverviewBranchSummaryEntity {
  @ApiProperty()
  branchId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty({ enum: TENANT_READINESS_STATUSES })
  readinessStatus!: TenantReadinessStatus;
}

export class TenantOverviewItemEntity {
  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ type: TenantOverviewBranchSummaryEntity, nullable: true })
  defaultBranch!: TenantOverviewBranchSummaryEntity | null;
}

export class TenantOverviewResultEntity {
  @ApiProperty()
  totalTenants!: number;

  @ApiProperty({ type: [TenantOverviewItemEntity] })
  items!: TenantOverviewItemEntity[];
}
