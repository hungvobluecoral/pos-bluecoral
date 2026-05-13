import { SelectBranchRequest } from '@pos-bluecoral/contracts';
import { ApiProperty } from '@nestjs/swagger';

export class SelectBranchRequestDto implements SelectBranchRequest {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  sessionToken!: string;

  @ApiProperty({ example: 'a1b2c3d4-...' })
  branchId!: string;
}

export interface SelectBranchValidationIssue {
  field: keyof SelectBranchRequest;
  message: string;
}

export function validateSelectBranchRequest(payload: SelectBranchRequest): SelectBranchValidationIssue[] {
  const issues: SelectBranchValidationIssue[] = [];
  if (!payload.sessionToken?.trim()) {
    issues.push({ field: 'sessionToken', message: 'sessionToken là bắt buộc.' });
  }
  if (!payload.branchId?.trim()) {
    issues.push({ field: 'branchId', message: 'branchId là bắt buộc.' });
  }
  return issues;
}
