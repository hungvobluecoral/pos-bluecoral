import { SetupPasswordRequest } from '@pos-bluecoral/contracts';
import { ApiProperty } from '@nestjs/swagger';

export class SetupPasswordRequestDto implements SetupPasswordRequest {
  @ApiProperty({ example: 'a3f2e1d0...', description: 'Raw invite token received by email' })
  token!: string;

  @ApiProperty({ example: 'MyStr0ng!Pass', description: 'New password — minimum 8 characters' })
  password!: string;
}

export function validateSetupPasswordRequest(payload: SetupPasswordRequest): Array<{ field: keyof SetupPasswordRequest; message: string }> {
  const issues: Array<{ field: keyof SetupPasswordRequest; message: string }> = [];
  if (!payload.token?.trim()) {
    issues.push({ field: 'token', message: 'Token là bắt buộc.' });
  }
  if (!payload.password || payload.password.length < 8) {
    issues.push({ field: 'password', message: 'Mật khẩu phải có ít nhất 8 ký tự.' });
  }
  return issues;
}
