# Story 3.2: Gán product cho branch và xem catalog đúng scope

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a branch operator,
I want to assign approved products to my branch and see only the catalog for my scope,
so that my branch sells the correct assortment without cross-branch confusion.

## Acceptance Criteria

1. **Given** tenant đã có product hợp lệ  
   **When** người dùng được phân quyền gán product vào branch hoặc mở màn hình catalog theo branch  
   **Then** hệ thống cho phép gán product theo đúng tenant/branch scope và hiển thị chỉ các product khả dụng cho branch đó.
2. **Given** product assignment có nguy cơ sai scope  
   **When** người dùng cố gán product sang branch hoặc tenant ngoài phạm vi  
   **Then** hệ thống chặn thao tác ngoài phạm vi.
3. **Given** branch-scoped catalog vẫn phải kế thừa product data tenant-level  
   **When** module khác dùng lại dữ liệu catalog  
   **Then** branch catalog view vẫn liên kết nhất quán với tenant-level product data.
4. **Given** catalog screen là flow scope-aware  
   **When** người dùng mở hoặc lọc màn catalog  
   **Then** scope header hoặc filter hiển thị rõ tenant và branch hiện tại.

## Tasks / Subtasks

- [ ] Thiết kế branch-product assignment model và API (AC: 1, 2, 3)
  - [ ] Tạo hoặc mở rộng `apps/api/src/modules/products/*` và `apps/api/src/modules/branches/*` cho branch catalog assignment.
  - [ ] Giữ tenant-level product là canonical source; branch chỉ lưu relationship/availability data cần thiết.
  - [ ] Chặn cross-tenant hoặc cross-branch assignment ngay ở service layer.
- [ ] Xây branch catalog UI với scope header rõ ràng (AC: 1, 4)
  - [ ] Tạo hoặc mở rộng `apps/web/src/features/products/*` và route branch products page.
  - [ ] Hiển thị tenant, branch, filters hiện tại và chỉ render product được phép.
- [ ] Bảo toàn reuse của tenant product data (AC: 3)
  - [ ] Không duplicate toàn bộ product record cho branch nếu không cần.
  - [ ] Contract trả về phải phân biệt rõ tenant product core data và branch-specific assignment state.
- [ ] Audit assignment changes (AC: 2, 3)
  - [ ] Ghi assignment create, update, deactivate với actor và scope.
- [ ] Viết tests cho branch-scoped catalog behavior (AC: 1, 2, 3, 4)
  - [ ] Tests cho valid assignment, blocked assignment, branch catalog filtering và scope header persistence.

## Dev Notes

### Story Foundation

- Story này nối tenant catalog (3.1) với branch readiness; nó là cầu nối trước khi inventory và order flow dùng product trong branch context. [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2: Gán product cho branch và xem catalog đúng scope]

### Current Repository State

- Repo snapshot chưa có products/branches modules thực tế; nếu workspace đã được materialize, dev agent phải đọc toàn bộ update targets thực tế trước khi chỉnh sửa.

### Technical Requirements

- Scope header hoặc filter phải hiển thị tenant và branch hiện tại trên màn catalog liên quan. [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2: Gán product cho branch và xem catalog đúng scope]
- Product data phải giữ nhất quán giữa tenant-level source và branch-scoped usage. [Source: _bmad-output/planning-artifacts/prd.md#Product & Catalog Management]
- Scope context phải được render trước và sau mutation để người dùng không mất ngữ cảnh. [Source: _bmad-output/planning-artifacts/architecture.md#Integration Points]

### Architecture Compliance

- Feature mapping đã chốt: products + branches modules trên backend; products feature trên web. [Source: _bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping]
- Query enforcement phải ở service/repository abstraction, không để UI filter trở thành guardrail duy nhất. [Source: _bmad-output/planning-artifacts/architecture.md#API Boundaries]

### File Structure Requirements

- Primary targets:
  - `apps/api/src/modules/products/*`
  - `apps/api/src/modules/branches/*`
  - `apps/api/src/modules/audit/*`
  - `apps/web/src/features/products/*`
  - `apps/web/src/app/tenants/[tenantId]/branches/[branchId]/products/page.tsx`
  - `libs/contracts/src/products/*`

### Previous Story Intelligence

- Story 3.1 đã chốt tenant-level product là source of truth; Story 3.2 phải mở rộng bằng assignment/availability layer, không clone product model theo branch. [Source: _bmad-output/implementation-artifacts/3-1-quan-ly-tenant-product-catalog-nen.md]

### Testing Requirements

- Phải có regression test chứng minh không thể assign product sang branch hoặc tenant ngoài phạm vi.
- Contract test phải giữ liên kết rõ giữa tenant product core data và branch assignment state.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 3.2: Gán product cho branch và xem catalog đúng scope`
- `_bmad-output/planning-artifacts/prd.md#Product & Catalog Management`
- `_bmad-output/planning-artifacts/architecture.md#API Boundaries`
- `_bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping`
- `_bmad-output/planning-artifacts/architecture.md#Integration Points`
- `_bmad-output/implementation-artifacts/3-1-quan-ly-tenant-product-catalog-nen.md`

## Dev Agent Record

### Agent Model Used

GPT-5.4 (model ID: gpt-5.4)

### Debug Log References

- Story creation workflow synthesis from catalog requirements, branch scoping rules, and prior tenant catalog context.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Branch catalog should extend tenant catalog via scoped assignment, not by duplicating core product data.

### File List

- `_bmad-output/implementation-artifacts/3-2-gan-product-cho-branch-va-xem-catalog-dung-scope.md`
- `apps/api/src/modules/products/*`
- `apps/api/src/modules/branches/*`
- `apps/web/src/features/products/*`
- `libs/contracts/src/products/*`

