import { LoginRequest } from '@pos-bluecoral/contracts';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto implements LoginRequest {
  @ApiProperty({ example: 'cashier@branch.com' })
  email!: string;

  @ApiProperty({ example: 'secret' })
  password!: string;
}

export interface LoginValidationIssue {
  field: keyof LoginRequest;
  message: string;
}

export function validateLoginRequest(payload: LoginRequest): LoginValidationIssue[] {
  const issues: LoginValidationIssue[] = [];

  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  if (!email) {
    issues.push({ field: 'email', message: 'email là bắt buộc.' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    issues.push({ field: 'email', message: 'email không hợp lệ.' });
  }

  const password = typeof payload.password === 'string' ? payload.password : '';
  if (!password) {
    issues.push({ field: 'password', message: 'password là bắt buộc.' });
  }

  return issues;
}

export function normalizeLoginRequest(payload: LoginRequest): LoginRequest {
  return {
    email: typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '',
    password: typeof payload.password === 'string' ? payload.password : '',
  };
}
