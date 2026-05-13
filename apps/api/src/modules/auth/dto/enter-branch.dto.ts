import { EnterBranchRequest } from '@pos-bluecoral/contracts';
import { ApiProperty } from '@nestjs/swagger';

export class EnterBranchRequestDto implements EnterBranchRequest {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  branchId!: string;
}

export function validateEnterBranchRequest(payload: EnterBranchRequest): Array<{ field: keyof EnterBranchRequest; message: string }> {
  if (!payload.branchId?.trim()) {
    return [{ field: 'branchId', message: 'branchId là bắt buộc.' }];
  }
  return [];
}
