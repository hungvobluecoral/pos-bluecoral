# Story 5.1: Quản lý customer trong tenant scope và gắn vào order

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an authorized operator,
I want to create and maintain customer records within my tenant and attach them to orders,
so that repeat customers can be served consistently without cross-tenant leakage.

## Acceptance Criteria

1. **Given** tenant đã bật phase mở rộng customer capability  
   **When** người dùng được phân quyền tạo, cập nhật customer hoặc gắn customer vào order  
   **Then** customer records chỉ tồn tại trong tenant scope hợp lệ và không thể bị truy cập chéo tenant.
2. **Given** order vẫn là flow branch-scoped  
   **When** customer được gắn vào order  
   **Then** hệ thống chỉ cho phép gắn customer vào order cùng tenant và branch context hợp lệ.
3. **Given** customer là capability growth-phase  
   **When** contract và module được thêm vào  
   **Then** chúng phải là extension seam, không phá vỡ các module MVP hiện có.
4. **Given** có mismatch scope hoặc liên kết không hợp lệ  
   **When** thao tác thất bại  
   **Then** hệ thống trả về error code ổn định.

## Tasks / Subtasks

- [ ] Thiết kế customer model như extension seam post-MVP (AC: 1, 2, 3, 4)
  - [ ] Tạo hoặc mở rộng `apps/api/src/modules/customers/*` và `libs/contracts/src/customers/*`.
  - [ ] Yêu cầu `tenantId` rõ ràng trên customer model và contracts.
  - [ ] Không refactor lại nền MVP chỉ để accommodate customer.
- [ ] Xây tenant-scoped customer CRUD và attach-to-order flow (AC: 1, 2, 4)
  - [ ] Tạo `apps/web/src/features/customers/*` và integration surfaces với order flow.
  - [ ] Chỉ cho attach customer vào order cùng tenant và branch context hợp lệ.
- [ ] Chuẩn hóa error semantics cho invalid linking (AC: 2, 4)
  - [ ] Trả stable error codes cho customer-scope-mismatch và invalid-order-customer-link.
- [ ] Viết tests cho tenant isolation và attach behavior (AC: 1, 2, 3, 4)
  - [ ] Tests cho cross-tenant blocking, valid same-scope linking và non-breaking integration với order module.

## Dev Notes

### Story Foundation

- Story này là capability growth-phase, không thuộc foundation MVP; cách thêm vào phải giữ đúng extension path post-MVP đã chốt. [Source: _bmad-output/planning-artifacts/epics.md#Story 5.1: Quản lý customer trong tenant scope và gắn vào order] [Source: _bmad-output/planning-artifacts/prd.md#Customer & Promotion Capabilities]

### Technical Requirements

- Customer records chỉ tồn tại trong tenant scope hợp lệ và không thể truy cập chéo tenant. [Source: _bmad-output/planning-artifacts/epics.md#Story 5.1: Quản lý customer trong tenant scope và gắn vào order]
- Contract customer phải là extension seam, không phá vỡ các module MVP hiện có. [Source: _bmad-output/planning-artifacts/epics.md#Story 5.1: Quản lý customer trong tenant scope và gắn vào order]

### Architecture Compliance

- Architecture hiện không có customer tree trong implementation tree ban đầu; thêm module theo cùng pattern module-first và feature-first, không tạo ngoại lệ kiến trúc. [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries] [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]

### File Structure Requirements

- Primary targets:
  - `apps/api/src/modules/customers/*`
  - `apps/web/src/features/customers/*`
  - `apps/api/src/modules/orders/*`
  - `libs/contracts/src/customers/*`

### Previous Story Intelligence

- Story 4.3 đã hoàn tất payment scope correctness trên top of order lifecycle; customer integration ở story này không được phá order contract hoặc order eligibility rules đã có. [Source: _bmad-output/implementation-artifacts/4-3-ghi-nhan-payment-cho-order-dung-tenant-branch-scope.md]

### Testing Requirements

- Bắt buộc test cross-tenant access bị chặn.
- Bắt buộc test same-tenant, same-branch order mới được attach customer hợp lệ.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 5.1: Quản lý customer trong tenant scope và gắn vào order`
- `_bmad-output/planning-artifacts/prd.md#Customer & Promotion Capabilities`
- `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`
- `_bmad-output/planning-artifacts/architecture.md#Structure Patterns`
- `_bmad-output/implementation-artifacts/4-3-ghi-nhan-payment-cho-order-dung-tenant-branch-scope.md`

## Dev Agent Record

### Agent Model Used

GPT-5.4 (model ID: gpt-5.4)

### Debug Log References

- Story creation workflow synthesis from customer capability requirements, post-MVP extension constraints, and existing order-flow guardrails.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Customer capability must plug into the existing scope model without reworking MVP foundations.

### File List

- `_bmad-output/implementation-artifacts/5-1-quan-ly-customer-trong-tenant-scope-va-gan-vao-order.md`
- `apps/api/src/modules/customers/*`
- `apps/web/src/features/customers/*`
- `libs/contracts/src/customers/*`

