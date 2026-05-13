# Story 2.3: Enforce quyền và quản lý staff theo branch cho store manager

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a store manager,
I want to manage branch staff and perform only permitted actions within my branch,
so that branch operations stay secure without depending on central admin for every change.

## Acceptance Criteria

1. **Given** store manager đã đăng nhập với branch scope hợp lệ  
   **When** manager xem danh sách staff hoặc thực hiện thao tác quản trị được cấp quyền  
   **Then** hệ thống chỉ hiển thị staff và action nằm trong branch manager phụ trách.
2. **Given** role policy đã được định nghĩa  
   **When** manager cập nhật thuộc tính hoặc thao tác staff  
   **Then** manager chỉ làm được những hành động được phép mà không vượt role policy.
3. **Given** đây là flow quản trị nhạy cảm  
   **When** manager cố thao tác ngoài scope hoặc ngoài policy  
   **Then** guardrails phải rõ, lỗi gọn rõ và không cho truy cập ngoài scope.
4. **Given** UI, API và query layer cùng tham gia enforce scope  
   **When** manager làm việc hằng ngày  
   **Then** các lớp này phải đồng nhất để không xảy ra tình huống thấy dữ liệu đúng scope nhưng thao tác sai scope hoặc ngược lại.

## Tasks / Subtasks

- [ ] Enforce branch-scoped visibility và action matrix cho manager (AC: 1, 2, 3, 4)
  - [ ] Tạo query filters hoặc repository methods chỉ trả staff thuộc branch manager phụ trách.
  - [ ] Định nghĩa rõ action matrix nào manager được phép làm trên staff.
  - [ ] Đồng bộ policy checks giữa controller guards, service rules và UI action states.
- [ ] Xây staff management surfaces cho store manager (AC: 1, 2, 3)
  - [ ] Tạo hoặc mở rộng `apps/web/src/features/staff/*` để render branch-scoped list, detail và action states.
  - [ ] Dùng `apps/web/src/components/guards/*` hoặc tương đương để ẩn hoặc disable action không hợp lệ nhưng vẫn giữ backend là source of truth.
- [ ] Chuẩn hóa error/recovery semantics cho out-of-scope attempts (AC: 3, 4)
  - [ ] Dùng error codes ổn định cho `forbidden`, `scope-mismatch`, `policy-blocked`.
  - [ ] UI phải chỉ rõ vì sao bị chặn và quay về scope hợp lệ như thế nào.
- [ ] Audit các thay đổi staff do manager thực hiện (AC: 2, 3)
  - [ ] Ghi lại actor, branch scope, target staff và loại thao tác.
- [ ] Viết tests chứng minh alignment giữa query, API và UI (AC: 1, 2, 3, 4)
  - [ ] Tests cho visible data set, action enablement, forbidden updates và out-of-scope access.
  - [ ] Regression test chống tình huống “UI chặn nhưng API cho qua” hoặc ngược lại.

## Dev Notes

### Story Foundation

- Story này biến RBAC/scope thành trải nghiệm vận hành hàng ngày cho store manager; đây là guardrail nền cho inventory, orders và payments ở branch-level. [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3: Enforce quyền và quản lý staff theo branch cho store manager]
- Journey 3 của PRD và UX nhấn mạnh manager phải luôn thấy đúng dữ liệu branch mình và bị chặn rõ ràng nếu ra ngoài scope. [Source: _bmad-output/planning-artifacts/prd.md#Journey 3 - Store Manager: nhìn đúng dữ liệu trong đúng branch mà không bị lẫn] [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Journey 3 — Store manager xem đúng dữ liệu của branch mình]

### Current Repository State

- Repo snapshot chưa có actual staff/auth implementation surfaces; target paths bên dưới cần được đọc và giữ nguyên patterns nếu chúng đã được materialize sau này.

### Technical Requirements

- Security boundary phải được enforce xuyên UI route guards, API guards, service layer và data-access layer. [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- Query filters, API guards và UI states phải đồng nhất; đây là acceptance criterion trực tiếp chứ không phải nice-to-have. [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3: Enforce quyền và quản lý staff theo branch cho store manager]
- Error messages user-facing phải ngắn, rõ, không lộ chi tiết kỹ thuật nội bộ. [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns]

### Architecture Compliance

- AuthZ source of truth nằm ở backend guards/services; frontend guards chỉ tối ưu UX và không thể là enforcement duy nhất. [Source: _bmad-output/planning-artifacts/architecture.md#API Boundaries]
- Feature ownership: `apps/api/src/modules/staff`, `apps/api/src/modules/auth`, `apps/web/src/features/staff`, `apps/web/src/features/auth`. [Source: _bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping]
- Scope header hoặc filter phải giữ branch context bền vững trên các màn quản trị branch. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Journey Patterns]

### File Structure Requirements

- Primary targets:
  - `apps/api/src/modules/staff/*`
  - `apps/api/src/modules/auth/*`
  - `apps/api/src/common/guards/*`
  - `apps/web/src/features/staff/*`
  - `apps/web/src/components/guards/*`
  - `apps/web/src/app/tenants/[tenantId]/branches/[branchId]/staff/page.tsx`

### Previous Story Intelligence

- Story 2.2 đã chuẩn hóa staff/role contracts; Story 2.3 phải consume đúng shape đó thay vì tạo manager-specific branch role model mới. [Source: _bmad-output/implementation-artifacts/2-2-tao-staff-va-gan-role-theo-tenant-branch.md]
- Story 2.1 đã chốt auth session là single scope source of truth; manager UI không được tự lưu branch scope độc lập ngoài session hoặc route context. [Source: _bmad-output/implementation-artifacts/2-1-dang-nhap-voi-session-gan-tenant-branch-scope.md]

### Latest Technical Information

- Với multi-tenant Prisma/PostgreSQL, current best practice là expose scoped repositories hoặc services thay vì cho modules cầm Prisma client “thô”, để query enforcement không phụ thuộc trí nhớ của dev. [Source: https://www.prisma.io/docs/orm/prisma-client/middleware] [Source: https://www.prisma.io/blog/safer-prisma-multi-tenancy-middleware-pg-bouncer-azPel6gk8VO8]

### Testing Requirements

- Test matrix phải bao phủ manager xem đúng branch data, manager bị chặn khi đụng staff ngoài branch, policy-blocked actions và alignment giữa UI, API, query layer.
- Cần ít nhất một regression test từ Journey 3: branch header hoặc filter đúng nhưng thao tác ngoài scope vẫn bị chặn rõ ràng.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 2.3: Enforce quyền và quản lý staff theo branch cho store manager`
- `_bmad-output/planning-artifacts/prd.md#Access Control & Staff Management`
- `_bmad-output/planning-artifacts/prd.md#Journey 3 - Store Manager: nhìn đúng dữ liệu trong đúng branch mà không bị lẫn`
- `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`
- `_bmad-output/planning-artifacts/architecture.md#Process Patterns`
- `_bmad-output/planning-artifacts/architecture.md#API Boundaries`
- `_bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Journey 3 — Store manager xem đúng dữ liệu của branch mình`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Journey Patterns`
- `https://www.prisma.io/docs/orm/prisma-client/middleware`
- `https://www.prisma.io/blog/safer-prisma-multi-tenancy-middleware-pg-bouncer-azPel6gk8VO8`
- `_bmad-output/implementation-artifacts/2-1-dang-nhap-voi-session-gan-tenant-branch-scope.md`
- `_bmad-output/implementation-artifacts/2-2-tao-staff-va-gan-role-theo-tenant-branch.md`

## Dev Agent Record

### Agent Model Used

GPT-5.4 (model ID: gpt-5.4)

### Debug Log References

- Story creation workflow synthesis from sprint status, staff and RBAC requirements, Journey 3 UX rules, and scoped repository guidance.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Query layer, API layer and UI layer must be tested as one policy surface, not three independent implementations.

### File List

- `_bmad-output/implementation-artifacts/2-3-enforce-quyen-va-quan-ly-staff-theo-branch-cho-store-manager.md`
- `apps/api/src/modules/staff/*`
- `apps/api/src/common/guards/*`
- `apps/web/src/features/staff/*`
- `apps/web/src/components/guards/*`
