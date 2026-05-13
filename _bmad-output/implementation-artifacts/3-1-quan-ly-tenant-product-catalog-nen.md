# Story 3.1: Quản lý tenant product catalog nền

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an authorized catalog manager,
I want to create and maintain products within my tenant,
so that branches work from a governed catalog instead of ad-hoc item data.

## Acceptance Criteria

1. **Given** người dùng có quyền quản lý catalog trong một tenant hợp lệ  
   **When** họ tạo mới hoặc cập nhật product  
   **Then** hệ thống lưu product ở tenant scope với dữ liệu tối thiểu cần cho bán hàng và không tạo dữ liệu ngoài tenant hiện tại.
2. **Given** product cần được dùng lại bởi các module khác  
   **When** API hoặc UI trả dữ liệu  
   **Then** dữ liệu product phải theo contract chuẩn và hiển thị trong đúng tenant context.
3. **Given** dữ liệu product có thể trùng hoặc không hợp lệ  
   **When** người dùng cố lưu product sai  
   **Then** hệ thống chặn với error code ổn định.
4. **Given** catalog là dữ liệu nền nhiều module cùng dựa vào  
   **When** product thay đổi  
   **Then** audit log phải ghi lại thay đổi để truy vết.

## Tasks / Subtasks

- [ ] Thiết kế domain model và contract cho product ở tenant scope (AC: 1, 2, 3, 4)
  - [ ] Tạo hoặc mở rộng `apps/api/src/modules/products/*` và `libs/contracts/src/products/*`.
  - [ ] Yêu cầu `tenantId` rõ ràng trên model, unique constraints và indexes liên quan.
  - [ ] Chỉ giữ dữ liệu tối thiểu phục vụ bán hàng MVP; không kéo customer hoặc promotion fields vào model.
- [ ] Xây API và UI quản lý catalog tenant-level (AC: 1, 2, 3)
  - [ ] Tạo CRUD flows trong `apps/web/src/features/products/*`.
  - [ ] Giữ tenant context bền vững trên list, create, edit, detail surfaces.
  - [ ] Chuẩn hóa response và validation errors theo wrapper chuẩn.
- [ ] Enforce guardrails cho duplicate và out-of-tenant writes (AC: 1, 3)
  - [ ] Chặn duplicate hoặc invalid data với stable error codes.
  - [ ] Mọi queries/writes phải đi qua scoped repositories hoặc services.
- [ ] Audit product changes (AC: 4)
  - [ ] Ghi create, update, deactivate hoặc archive actions với actor và tenant scope.
- [ ] Viết tests cho scoped catalog behavior (AC: 1, 2, 3, 4)
  - [ ] Unit/integration tests cho tenant isolation, duplicate blocking và contract shape.
  - [ ] UI tests cho tenant-scoped catalog screens và error handling.

## Dev Notes

### Story Foundation

- Story này mở Epic 3 và là product source of truth cho branch catalog, inventory và order lines ở các story sau. [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1: Quản lý tenant product catalog nền]
- FR13 và FR16 yêu cầu product data nhất quán theo scope tenant/branch khi được module khác dùng lại; product model ở story này phải thiết kế như nền tảng reuse, không như CRUD cô lập. [Source: _bmad-output/planning-artifacts/prd.md#Product & Catalog Management]

### Current Repository State

- Repo snapshot chưa có actual products module; target paths bên dưới là intended architecture surfaces.

### Technical Requirements

- Product phải tenant-scoped ở schema, repository filters và audit records. [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- API contracts dùng camelCase; không leak raw ORM errors; dates là ISO-8601 UTC nếu có. [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- Cross-module reuse đi qua services hoặc shared contracts thay vì copy-paste DTOs. [Source: _bmad-output/planning-artifacts/architecture.md#Integration Points]

### Architecture Compliance

- Ownership nằm ở `apps/api/src/modules/products` và `apps/web/src/features/products`; đừng đặt product logic trong branch, order hoặc generic shared folders. [Source: _bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping]
- Chỉ phần thật sự shared mới vào `libs/contracts`; UI product management vẫn ở feature products. [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]

### File Structure Requirements

- Primary targets:
  - `apps/api/src/modules/products/*`
  - `apps/api/src/modules/audit/*`
  - `apps/web/src/features/products/*`
  - `apps/web/src/app/tenants/[tenantId]/branches/[branchId]/products/page.tsx`
  - `libs/contracts/src/products/*`

### Latest Technical Information

- Với Prisma/PostgreSQL multi-tenant, current best practice là required `tenantId` trên product model, composite uniqueness theo tenant scope và scoped repository/service abstractions hoặc Prisma middleware có kiểm soát. [Source: https://www.prisma.io/docs/orm/prisma-client/middleware] [Source: https://www.prisma.io/blog/safer-prisma-multi-tenancy-middleware-pg-bouncer-azPel6gk8VO8]

### Testing Requirements

- Test bắt buộc chứng minh không thể đọc hoặc ghi product ngoài tenant hiện tại.
- Product contract phải ổn định để story 3.2/3.3/4.x dùng tiếp mà không đổi shape tùy tiện.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 3.1: Quản lý tenant product catalog nền`
- `_bmad-output/planning-artifacts/prd.md#Product & Catalog Management`
- `_bmad-output/planning-artifacts/architecture.md#Data Architecture`
- `_bmad-output/planning-artifacts/architecture.md#Format Patterns`
- `_bmad-output/planning-artifacts/architecture.md#Structure Patterns`
- `_bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping`
- `_bmad-output/planning-artifacts/architecture.md#Integration Points`
- `https://www.prisma.io/docs/orm/prisma-client/middleware`
- `https://www.prisma.io/blog/safer-prisma-multi-tenancy-middleware-pg-bouncer-azPel6gk8VO8`

## Dev Agent Record

### Agent Model Used

GPT-5.4 (model ID: gpt-5.4)

### Debug Log References

- Story creation workflow synthesis from catalog requirements, architecture scope rules, and multi-tenant Prisma guidance.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Product data shape here becomes the reusable contract seam for branch catalog, inventory and order flows.

### File List

- `_bmad-output/implementation-artifacts/3-1-quan-ly-tenant-product-catalog-nen.md`
- `apps/api/src/modules/products/*`
- `apps/web/src/features/products/*`
- `libs/contracts/src/products/*`

