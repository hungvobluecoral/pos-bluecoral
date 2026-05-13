# Story 2.2: Tạo staff và gán role theo tenant/branch

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a system admin,
I want to create staff accounts and assign roles at tenant or branch scope,
so that the right people can operate in the right business context.

## Acceptance Criteria

1. **Given** system admin đang quản lý một tenant hợp lệ  
   **When** admin tạo mới hoặc cập nhật staff account  
   **Then** hệ thống cho phép gán role theo tenant hoặc branch scope một cách rõ ràng và không cho tạo assignment mơ hồ.
2. **Given** admin sắp lưu một thay đổi staff/role nhạy cảm  
   **When** admin đi tới bước xác nhận  
   **Then** màn hình hoặc flow hiển thị summary rõ về tenant, branch, role và phạm vi ảnh hưởng trước khi lưu.
3. **Given** role assignment có thể sai hoặc vượt quyền  
   **When** admin tạo assignment xung đột, trùng lặp hoặc vượt scope  
   **Then** hệ thống chặn thao tác với error rõ ràng và guardrails nhất quán.
4. **Given** staff/role vừa được lưu  
   **When** auth/authz cần dùng lại dữ liệu này  
   **Then** dữ liệu staff/role tồn tại theo contract nhất quán và sẵn sàng cho auth/authz sử dụng ngay.
5. **Given** role/staff management là sensitive operation  
   **When** có thay đổi staff hoặc role  
   **Then** audit log phải lưu actor, scope và thay đổi chính.

## Tasks / Subtasks

- [ ] Thiết kế data/contracts cho staff + role assignment theo tenant/branch scope (AC: 1, 3, 4, 5)
  - [ ] Tạo hoặc mở rộng `apps/api/src/modules/staff/*` với DTOs, services, repositories và validators rõ cho tenant-scope vs branch-scope assignments.
  - [ ] Đưa shared contracts cần thiết vào `libs/contracts/src/staff/*`.
  - [ ] Nếu dùng Prisma, thêm composite uniqueness và indexes theo `tenantId` và `branchId` phù hợp.
- [ ] Xây admin staff management flow có summary rõ trước khi lưu (AC: 1, 2, 3)
  - [ ] Tạo `apps/web/src/features/staff/*` với form tạo/cập nhật staff, role picker theo scope và summary panel trước save.
  - [ ] Hiển thị rõ tenant, branch, role, phạm vi ảnh hưởng và warning nếu assignment có rủi ro.
- [ ] Enforce assignment guardrails tại service + API layer (AC: 1, 3, 4)
  - [ ] Chặn assignment mơ hồ, trùng lặp, conflict hoặc vượt scope admin hiện tại.
  - [ ] Đảm bảo dữ liệu sau lưu được auth module dùng lại ngay mà không cần transform “mập mờ”.
- [ ] Audit role/staff changes (AC: 5)
  - [ ] Ghi audit log cho create, update, deactivate, reset role assignment cùng actor, scope và diff chính.
  - [ ] Structured logs phải hỗ trợ truy vết nhanh khi xảy ra branch mismatch hoặc wrong assignment.
- [ ] Viết tests cho CRUD + policy boundaries (AC: 1, 2, 3, 4, 5)
  - [ ] Unit/integration tests cho valid assignment, conflict, duplicate, out-of-scope và summary payload.
  - [ ] UI tests cho review summary và disabled hoặc blocked states.

## Dev Notes

### Story Foundation

- Story này hiện thực hóa FR7-FR8 và là nguồn dữ liệu cho Story 2.1/2.3. Sai contract tại đây sẽ làm auth đúng token nhưng sai quyền. [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2: Tạo staff và gán role theo tenant/branch]
- PRD yêu cầu summary rõ về tenant, branch, role và phạm vi ảnh hưởng trước khi lưu; đừng coi staff CRUD như form CRUD phẳng. [Source: _bmad-output/planning-artifacts/prd.md#Access Control & Staff Management]

### Current Repository State

- Repo hiện chưa có module staff/auth concretely checked in; target paths bên dưới theo architecture cần được materialize nếu workspace chưa tồn tại.

### Technical Requirements

- RBAC phải theo tenant và branch scope, không chỉ role chung. [Source: _bmad-output/planning-artifacts/prd.md#Security]
- Tenant/branch scope phải xuất hiện rõ trong schema, indexes, query filters và audit records. [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- Error codes cho validation, conflict, out-of-scope phải ổn định và map về API wrapper chuẩn. [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns] [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]

### Architecture Compliance

- Backend module ownership nằm ở `apps/api/src/modules/staff/*`; auth module chỉ consume contract hoặc service, không sở hữu staff persistence thay. [Source: _bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping] [Source: _bmad-output/planning-artifacts/architecture.md#Service Boundaries]
- UI flow quản trị staff phải ở `apps/web/src/features/staff/*`; summary/guardrails không nên nằm rải rác trong generic components. [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]

### File Structure Requirements

- Primary targets:
  - `apps/api/src/modules/staff/*`
  - `apps/api/src/modules/auth/*`
  - `apps/api/src/modules/audit/*`
  - `apps/api/src/common/guards/*`
  - `apps/web/src/features/staff/*`
  - `apps/web/src/components/guards/*`
  - `libs/contracts/src/staff/*`

### Previous Story Intelligence

- Story 2.1 đã yêu cầu auth/session là single scope source of truth; staff assignments ở story này phải được thiết kế sao cho auth module consume trực tiếp, không cần mapping ngầm giữa nhiều shape dữ liệu. [Source: _bmad-output/implementation-artifacts/2-1-dang-nhap-voi-session-gan-tenant-branch-scope.md]

### Latest Technical Information

- Với Prisma/PostgreSQL multi-tenant, best practice hiện tại là bắt buộc `tenantId` và `branchId` trên models liên quan, enforce scope qua repository/service abstraction hoặc Prisma middleware có kiểm soát, và không trông chờ dev “nhớ” thêm filters bằng tay ở mọi query. [Source: https://www.prisma.io/docs/orm/prisma-client/middleware] [Source: https://www.prisma.io/blog/safer-prisma-multi-tenancy-middleware-pg-bouncer-azPel6gk8VO8]

### Testing Requirements

- Phải có tests chứng minh admin không thể tạo assignment ngoài scope, trùng lặp hoặc mơ hồ.
- Sau save, auth module phải đọc được role/scope mới ngay trong integration test.
- Audit test phải xác nhận actor, scope và diff chính xuất hiện trong audit record.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 2.2: Tạo staff và gán role theo tenant/branch`
- `_bmad-output/planning-artifacts/prd.md#Access Control & Staff Management`
- `_bmad-output/planning-artifacts/prd.md#Security`
- `_bmad-output/planning-artifacts/architecture.md#Data Architecture`
- `_bmad-output/planning-artifacts/architecture.md#Format Patterns`
- `_bmad-output/planning-artifacts/architecture.md#Process Patterns`
- `_bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping`
- `_bmad-output/planning-artifacts/architecture.md#Service Boundaries`
- `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`
- `https://www.prisma.io/docs/orm/prisma-client/middleware`
- `https://www.prisma.io/blog/safer-prisma-multi-tenancy-middleware-pg-bouncer-azPel6gk8VO8`
- `_bmad-output/implementation-artifacts/2-1-dang-nhap-voi-session-gan-tenant-branch-scope.md`

## Dev Agent Record

### Agent Model Used

GPT-5.4 (model ID: gpt-5.4)

### Debug Log References

- Story creation workflow synthesis from sprint status, staff and RBAC requirements, auth story dependencies, and multi-tenant Prisma guidance.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Staff assignment data shape must be immediately consumable by auth/authz and audit flows.

### File List

- `_bmad-output/implementation-artifacts/2-2-tao-staff-va-gan-role-theo-tenant-branch.md`
- `apps/api/src/modules/staff/*`
- `apps/web/src/features/staff/*`
- `apps/api/src/modules/audit/*`
- `libs/contracts/src/staff/*`

