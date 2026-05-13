# Story 3.3: Theo dõi inventory và cập nhật tồn kho theo đúng scope

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a branch operator,
I want to view and adjust inventory within my branch with order-related context,
so that stock remains accurate for selling and reconciliation.

## Acceptance Criteria

1. **Given** branch đã có product khả dụng  
   **When** người dùng được phân quyền xem inventory hoặc ghi nhận điều chỉnh tồn kho  
   **Then** hệ thống chỉ hiển thị inventory trong tenant/branch context hợp lệ của người dùng.
2. **Given** inventory adjustment ảnh hưởng vận hành trực tiếp  
   **When** người dùng ghi adjustment  
   **Then** mỗi adjustment phải ghi rõ nguồn gốc hoặc lý do đủ để liên kết với order hoặc giao dịch liên quan khi cần.
3. **Given** inventory là dữ liệu branch-critical  
   **When** người dùng cố thao tác sai branch hoặc sai tenant  
   **Then** hệ thống chặn thao tác gây sai scope.
4. **Given** inventory view có thể ở trạng thái loading, empty hoặc error  
   **When** UI render các trạng thái đó  
   **Then** context vẫn rõ và recovery phải nhanh.

## Tasks / Subtasks

- [ ] Thiết kế inventory model, movement log và scope enforcement (AC: 1, 2, 3)
  - [ ] Tạo hoặc mở rộng `apps/api/src/modules/inventory/*` và `libs/contracts/src/inventory/*`.
  - [ ] Yêu cầu inventory records gắn rõ `tenantId`, `branchId`, `productId`.
  - [ ] Ghi reason/source reference cho adjustment để phục vụ reconciliation.
- [ ] Xây inventory views và adjustment flows theo branch scope (AC: 1, 4)
  - [ ] Tạo `apps/web/src/features/inventory/*` và route inventory branch page.
  - [ ] Giữ scope header/filter rõ trên list, detail và adjustment UI.
  - [ ] Loading, empty, error states phải giúp người dùng quay lại hành động đúng thay vì mất context.
- [ ] Bổ sung audit hoặc movement trail cho adjustments (AC: 2, 3)
  - [ ] Ghi actor, scope, product, delta, reason, related order hoặc transaction reference.
- [ ] Viết tests cho inventory correctness (AC: 1, 2, 3, 4)
  - [ ] Tests cho visibility đúng branch, blocked cross-scope adjustments và required adjustment reason.
  - [ ] UI tests cho recovery states của loading, empty, error.

## Dev Notes

### Story Foundation

- Story này nối catalog branch-ready với order/payment readiness; inventory phải đúng scope trước khi order flow có thể đáng tin. [Source: _bmad-output/planning-artifacts/epics.md#Story 3.3: Theo dõi inventory và cập nhật tồn kho theo đúng scope]

### Technical Requirements

- Inventory updates phải giữ đúng scope của order hoặc giao dịch liên quan. [Source: _bmad-output/planning-artifacts/prd.md#Inventory & Payment Management]
- Error states và recovery cần ngắn, cụ thể và vẫn giữ context rõ. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Additional Patterns]
- Sensitive operations như inventory adjustment cần audit logging rõ. [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]

### Architecture Compliance

- Feature mapping đã chốt: `apps/api/src/modules/inventory` và `apps/web/src/features/inventory`. [Source: _bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping]
- Server state qua TanStack Query; UI state cục bộ có thể dùng feature-local store nếu cần, nhưng không duplicate scope source of truth. [Source: _bmad-output/planning-artifacts/architecture.md#Communication Patterns]

### File Structure Requirements

- Primary targets:
  - `apps/api/src/modules/inventory/*`
  - `apps/api/src/modules/audit/*`
  - `apps/web/src/features/inventory/*`
  - `apps/web/src/app/tenants/[tenantId]/branches/[branchId]/inventory/page.tsx`
  - `libs/contracts/src/inventory/*`

### Previous Story Intelligence

- Story 3.2 đã chốt branch catalog là scoped assignment over tenant product data; inventory ở story này phải bám branch catalog ấy thay vì tạo product scope song song. [Source: _bmad-output/implementation-artifacts/3-2-gan-product-cho-branch-va-xem-catalog-dung-scope.md]

### Testing Requirements

- Bắt buộc test adjustment reason hoặc source reference là required.
- Bắt buộc test inventory screen ở loading, empty, error vẫn giữ tenant/branch context.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 3.3: Theo dõi inventory và cập nhật tồn kho theo đúng scope`
- `_bmad-output/planning-artifacts/prd.md#Inventory & Payment Management`
- `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`
- `_bmad-output/planning-artifacts/architecture.md#Communication Patterns`
- `_bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Additional Patterns`
- `_bmad-output/implementation-artifacts/3-2-gan-product-cho-branch-va-xem-catalog-dung-scope.md`

## Dev Agent Record

### Agent Model Used

GPT-5.4 (model ID: gpt-5.4)

### Debug Log References

- Story creation workflow synthesis from inventory requirements, branch scope rules, and recovery-state UX guidance.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Inventory adjustments must remain traceable enough for later payment and reconciliation workflows.

### File List

- `_bmad-output/implementation-artifacts/3-3-theo-doi-inventory-va-cap-nhat-ton-kho-theo-dung-scope.md`
- `apps/api/src/modules/inventory/*`
- `apps/web/src/features/inventory/*`
- `libs/contracts/src/inventory/*`

