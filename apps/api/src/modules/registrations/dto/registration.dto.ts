import { SubmitRegistrationRequest, RejectRegistrationRequest, RegistrationStatus } from '@pos-bluecoral/contracts';
import { ApiProperty } from '@nestjs/swagger';

// ─── Submit ──────────────────────────────────────────────────────────────────

export class SubmitRegistrationDto implements SubmitRegistrationRequest {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  name!: string;

  @ApiProperty({ example: 'owner@myshop.vn' })
  email!: string;

  @ApiProperty({ example: 'Cửa Hàng ABC' })
  businessName!: string;
}

export function validateSubmitRegistration(p: SubmitRegistrationRequest): Array<{ field: string; message: string }> {
  const issues: Array<{ field: string; message: string }> = [];
  if (!p.name?.trim()) issues.push({ field: 'name', message: 'Tên không được để trống.' });
  if (!p.email?.trim()) {
    issues.push({ field: 'email', message: 'Email không được để trống.' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim())) {
    issues.push({ field: 'email', message: 'Email không hợp lệ.' });
  }
  if (!p.businessName?.trim()) issues.push({ field: 'businessName', message: 'Tên doanh nghiệp không được để trống.' });
  return issues;
}

export function normalizeSubmitRegistration(p: SubmitRegistrationRequest): SubmitRegistrationRequest {
  return {
    name: p.name.trim(),
    email: p.email.trim().toLowerCase(),
    businessName: p.businessName.trim(),
  };
}

// ─── Reject ───────────────────────────────────────────────────────────────────

export class RejectRegistrationDto implements RejectRegistrationRequest {
  @ApiProperty({ example: 'Thông tin đăng ký không đầy đủ.' })
  reviewNote!: string;
}

export function validateRejectRegistration(p: RejectRegistrationRequest): Array<{ field: string; message: string }> {
  const issues: Array<{ field: string; message: string }> = [];
  if (!p.reviewNote?.trim()) issues.push({ field: 'reviewNote', message: 'Lý do từ chối không được để trống.' });
  return issues;
}

// ─── List query ───────────────────────────────────────────────────────────────

export function parseStatusFilter(raw?: string): RegistrationStatus | undefined {
  if (!raw) return undefined;
  const upper = raw.toUpperCase();
  if (upper === 'PENDING' || upper === 'APPROVED' || upper === 'REJECTED') {
    return upper as RegistrationStatus;
  }
  return undefined;
}
