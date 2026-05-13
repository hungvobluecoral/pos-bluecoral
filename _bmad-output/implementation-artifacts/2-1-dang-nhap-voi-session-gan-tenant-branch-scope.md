# Story 2.1: Đăng nhập với session gắn tenant/branch scope

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a staff member,
I want to sign in with a session that knows my tenant and branch permissions,
so that I can enter only the workspaces I am allowed to operate.

## Acceptance Criteria

1. **Given** một tài khoản staff hợp lệ đã được kích hoạt  
   **When** staff đăng nhập vào hệ thống  
   **Then** hệ thống cấp access JWT ngắn hạn và refresh token rotation có chứa claims cần thiết cho tenant/branch scope và role được gán.
2. **Given** staff đã có session hợp lệ  
   **When** staff truy cập route/workspace hoặc gọi API  
   **Then** route/API guards chỉ cho phép action nằm trong scope được cấp.
3. **Given** token hết hạn, bị thu hồi hoặc scope không còn hợp lệ  
   **When** staff tiếp tục dùng token cũ  
   **Then** hệ thống trả về auth/authz error code ổn định và không để lộ chi tiết nội bộ.
4. **Given** auth flow là sensitive operation  
   **When** có đăng nhập, refresh token hoặc truy cập bị từ chối  
   **Then** audit log phải ghi lại sự kiện nhạy cảm liên quan tới scope.

## Tasks / Subtasks

- [x] Xây auth/session model theo short-lived access JWT + refresh token rotation (AC: 1, 3, 4)
  - [x] Tạo hoặc mở rộng `apps/api/src/modules/auth/*` cho login, refresh, logout/revoke flow.
  - [x] Đặt refresh token dưới persistence/support store có thể revoke, không xem refresh JWT như stateless source of truth.
  - [x] Hash refresh token trước khi lưu và phát hiện token reuse/replay.
- [x] Chuẩn hóa claims và scope propagation (AC: 1, 2, 3)
  - [x] Claims tối thiểu phải thể hiện `staffId`, `tenantId`, `branchId` hoặc scope set tương đương, `role`, `sessionId` hoặc `tokenVersion`.
  - [x] Guards/decorators/backend context phải dùng claims này làm source of truth cho authorization.
  - [x] Scope mismatch phải có error code rõ và không bị fallback âm thầm sang scope khác.
- [x] Kết nối auth với web session/workspace entry (AC: 1, 2, 3)
  - [x] Tạo `apps/web/src/features/auth/*` và `apps/web/src/lib/auth/*` cho sign-in, refresh, session bootstrap và redirect vào workspace đúng scope.
  - [x] Không cache scope trong nhiều store mơ hồ; một session/source of truth duy nhất phải điều phối workspace access.
- [x] Bổ sung audit và observability cho auth events (AC: 4)
  - [x] Ghi audit log cho login success/failure, refresh success/failure, revoke và denied access.
  - [x] Structured logs phải có request correlation, actor/session metadata và scope metadata.
- [x] Viết test cho happy path + threat path (AC: 1, 2, 3, 4)
  - [x] Unit/service tests cho login, refresh rotation, revoke và token reuse detection.
  - [x] Guard tests cho route/API access trong và ngoài scope.
  - [x] Web tests cho sign-in/session bootstrap/error handling.

## Dev Notes

### Story Foundation

- Story này mở Epic 2 và là tiền đề cho staff CRUD, RBAC branch governance, product/order/inventory/payment access ở các epic sau. Nếu auth scope sai, mọi story sau đều rủi ro. [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1: Đăng nhập với session gắn tenant/branch scope]
- FR9-FR11 yêu cầu enforcement ở cả route, API, service và data access layer; auth story này không được dừng ở “login thành công”. [Source: _bmad-output/planning-artifacts/prd.md#Access Control & Staff Management] [Source: _bmad-output/planning-artifacts/prd.md#Security]

### Current Repository State

- Repo snapshot chưa có source app/materialized workspace. Các file/module dưới đây là intended implementation surfaces theo architecture.
- Nếu Story 1.x chưa được implement thật trong workspace hiện tại, dev agent phải dựng đúng structure rồi mới cắm auth flow.

### Technical Requirements

- Authentication model đã chốt: access JWT ngắn hạn + refresh token rotation. [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- Authorization model đã chốt: RBAC theo tenant/branch scope; branch là security boundary độc lập. [Source: _bmad-output/planning-artifacts/architecture.md#Decision Priority Analysis]
- API errors cho auth/authz/scope mismatch phải ổn định theo wrapper chuẩn `{ error: { code, message, details?, requestId? } }`. [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]

### Architecture Compliance

- AuthN/AuthZ được enforce ở `apps/api/src/common/guards`, decorators và auth module; frontend không tự quyết scope. [Source: _bmad-output/planning-artifacts/architecture.md#API Boundaries]
- `apps/web` chỉ truy cập backend qua `lib/api-client` và feature auth layer; không gọi API trực tiếp từ arbitrary components. [Source: _bmad-output/planning-artifacts/architecture.md#Architectural Boundaries]
- Query keys và session source of truth phải rõ; không duplicate scope context qua nhiều stores. [Source: _bmad-output/planning-artifacts/architecture.md#Communication Patterns]

### Library / Framework Requirements

- NestJS auth flow nên theo current best practice: refresh token rotation, revocation, hash refresh tokens server-side, detect token reuse/replay, và lưu session metadata như device, user-agent, IP khi cần. [Source: https://docs.nestjs.com/security/authentication] [Source: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html] [Source: https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation]
- Với web client, refresh token nên đi qua `HttpOnly`, `Secure`, `SameSite` cookie nếu kiến trúc session web cho phép; access token nên ngắn hạn và không lưu kiểu localStorage dài hạn. [Source: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html]

### File Structure Requirements

- Primary targets:
  - `apps/api/src/modules/auth/*`
  - `apps/api/src/common/guards/*`
  - `apps/api/src/common/decorators/*`
  - `apps/api/src/common/errors/*`
  - `apps/api/src/modules/audit/*`
  - `apps/web/src/features/auth/*`
  - `apps/web/src/lib/auth/*`
  - `libs/auth/src/*`
  - `libs/contracts/src/auth/*`

### Latest Technical Information

- Refresh token rotation best practice hiện tại là invalidate token cũ mỗi lần refresh, hash refresh tokens trong store phía server, và xem reuse của token cũ là dấu hiệu compromise để revoke session tương ứng hoặc toàn bộ token của actor. [Source: https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation] [Source: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html]
- Access token nên thật ngắn hạn, còn refresh token phải có đường revoke server-side rõ ràng; đừng coi JWT tự đủ cho immediate revocation. [Source: https://docs.nestjs.com/security/authentication]

### Testing Requirements

- Test matrix phải bao phủ login success, login denied, refresh success, refresh replay/reuse, revoked session, expired token, branch mismatch và role mismatch.
- Bắt buộc regression test chứng minh route/API guards cùng chặn ngoài scope theo cùng error semantics.
- Audit assertions phải xác nhận sự kiện auth nhạy cảm có actor + scope metadata.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 2.1: Đăng nhập với session gắn tenant/branch scope`
- `_bmad-output/planning-artifacts/prd.md#Access Control & Staff Management`
- `_bmad-output/planning-artifacts/prd.md#Journey 4 - Staff/Cashier: thao tác trong đúng branch mà không nhầm phạm vi`
- `_bmad-output/planning-artifacts/prd.md#Security`
- `_bmad-output/planning-artifacts/architecture.md#Decision Priority Analysis`
- `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`
- `_bmad-output/planning-artifacts/architecture.md#Format Patterns`
- `_bmad-output/planning-artifacts/architecture.md#API Boundaries`
- `_bmad-output/planning-artifacts/architecture.md#Communication Patterns`
- `https://docs.nestjs.com/security/authentication`
- `https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html`
- `https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation`

## Dev Agent Record

### Agent Model Used

GPT-5.4 (model ID: gpt-5.4)

### Debug Log References

- Story creation workflow synthesis from sprint status, architecture auth rules, and current JWT refresh-token best practices.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Auth implementation must become the single scope source of truth for later staff, catalog, order and payment flows.
- **Implementation Complete (2026-05-13):**
  - Installed: `@nestjs/jwt`, `bcryptjs`, `cookie-parser`; added `Staff`, `RefreshToken` models + `StaffRole` enum via Prisma migration `20260513085729_add_staff_and_refresh_tokens`.
  - `AuthService`: login with bcryptjs password verify, JWT access token (15min), refresh token rotation (7d), replay/reuse detection (revoke all on hash mismatch), logout revoke.
  - `AuthController`: POST /api/auth/login, /refresh, /logout; refresh token → HttpOnly cookie, session_id → cookie.
  - `JwtAuthGuard` + `ScopeGuard` with role hierarchy (owner > manager > cashier > viewer); `@CurrentUser` + `@RequireRoles` decorators; `assertTenantScope()` / `assertBranchScope()` helpers.
  - `AuditService.recordAuthEvent()` added; `AuditLogRepository` generalized to `AuditLogEntry`.
  - Contracts: `libs/contracts/src/auth/index.ts` — `AccessTokenClaims`, `LoginRequest/Response`, `RefreshResponse`, `AuthErrorCode`.
  - Web: `loginAction` / `logoutAction` server actions, `SignInForm` component, `/sign-in` page, sessionStorage-backed session store.
  - Tests: 22 API tests (AuthService + Guards), 11 web tests (SignInForm + session) — all 46 project tests pass.
  - Polyfilled `FormData` in `test-setup.ts` for React 19 + JSDOM 26 compatibility.

### File List

- `apps/api/prisma/schema.prisma` (modified — Staff, RefreshToken, StaffRole)
- `apps/api/prisma/migrations/20260513085729_add_staff_and_refresh_tokens/migration.sql`
- `apps/api/src/main.ts` (modified — cookie-parser middleware)
- `apps/api/src/app/app.module.ts` (modified — AuthModule import)
- `apps/api/src/modules/auth/auth.module.ts`
- `apps/api/src/modules/auth/auth.service.ts`
- `apps/api/src/modules/auth/auth.controller.ts`
- `apps/api/src/modules/auth/dto/login.dto.ts`
- `apps/api/src/modules/auth/repositories/staff.repository.ts`
- `apps/api/src/modules/auth/repositories/refresh-token.repository.ts`
- `apps/api/src/modules/auth/auth.service.spec.ts`
- `apps/api/src/common/guards/jwt-auth.guard.ts`
- `apps/api/src/common/guards/scope.guard.ts`
- `apps/api/src/common/guards/guards.spec.ts`
- `apps/api/src/common/decorators/current-user.decorator.ts`
- `apps/api/src/common/decorators/require-roles.decorator.ts`
- `apps/api/src/common/errors/auth-errors.ts`
- `apps/api/src/modules/audit/audit.service.ts` (modified — recordAuthEvent)
- `apps/api/src/modules/audit/repositories/audit-log.repository.ts` (modified — generic AuditLogEntry)
- `libs/contracts/src/auth/index.ts`
- `libs/contracts/src/index.ts` (modified — export auth)
- `apps/web/src/features/auth/api/auth.ts`
- `apps/web/src/features/auth/actions/auth-actions.ts`
- `apps/web/src/features/auth/components/sign-in-form.tsx`
- `apps/web/src/features/auth/components/sign-in-form.spec.tsx`
- `apps/web/src/app/(auth)/sign-in/page.tsx`
- `apps/web/src/lib/auth/session.ts`
- `apps/web/src/lib/auth/index.ts`
- `apps/web/src/lib/auth/session.spec.ts`
- `apps/web/src/test-setup.ts` (modified — FormData polyfill)

## Change Log

| Date | Change |
|------|--------|
| 2026-05-13 | Initial implementation: JWT auth + refresh token rotation, guards, decorators, web sign-in, audit, tests (46 passing) |

