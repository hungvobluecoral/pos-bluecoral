# Story 5.2: Tạo promotion theo scope và áp dụng vào order đủ điều kiện

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an authorized operator,
I want to define promotions and apply them only to eligible scoped orders,
so that discounts remain controlled and consistent across tenant and branch operations.

## Acceptance Criteria

1. **Given** tenant đã bật phase promotion capability  
   **When** người dùng được phân quyền tạo promotion hoặc áp promotion vào order  
   **Then** promotion được cấu hình theo tenant scope và có rule áp dụng rõ cho branch hoặc ngữ cảnh được phép.
2. **Given** order cần đủ điều kiện trước khi áp promotion  
   **When** người dùng áp promotion  
   **Then** hệ thống chỉ áp promotion cho order đủ điều kiện trong đúng tenant và branch context.
3. **Given** rule promotion có thể xung đột hoặc ngoài scope  
   **When** người dùng tạo hoặc áp rule không hợp lệ  
   **Then** hệ thống chặn với thông điệp rõ ràng và audit trail phù hợp.
4. **Given** đây là capability growth-phase  
   **When** implementation được thêm vào  
   **Then** hệ thống vẫn giữ đúng extension path post-MVP và không kéo promotion vào foundation stories của MVP.

## Tasks / Subtasks

- [ ] Thiết kế promotion model, rule engine seam và contracts theo tenant scope (AC: 1, 2, 3, 4)
  - [ ] Tạo hoặc mở rộng `apps/api/src/modules/promotions/*` và `libs/contracts/src/promotions/*`.
  - [ ] Xác định rõ rule shape, eligibility inputs và branch-scoped applicability.
  - [ ] Không hardcode rule engine vào order module.
- [ ] Xây flows tạo promotion và apply promotion vào order (AC: 1, 2, 3)
  - [ ] Tạo `apps/web/src/features/promotions/*` và integration surfaces với orders.
  - [ ] Chỉ cho apply khi order cùng tenant và branch, đồng thời đủ điều kiện business rule.
- [ ] Chuẩn hóa error và audit semantics (AC: 2, 3)
  - [ ] Trả stable error codes cho rule-conflict, ineligible-order, scope-mismatch.
  - [ ] Ghi audit trail cho create, update, apply, reject promotion actions.
- [ ] Viết tests cho scoped promotion behavior (AC: 1, 2, 3, 4)
  - [ ] Tests cho valid rule, conflicting rule, out-of-scope apply và eligible-order apply.

## Dev Notes

### Story Foundation

- Promotion là capability growth-phase và phải nối vào order flow đã có mà không phá contract foundations của MVP. [Source: _bmad-output/planning-artifacts/epics.md#Story 5.2: Tạo promotion theo scope và áp dụng vào order đủ điều kiện] [Source: _bmad-output/planning-artifacts/prd.md#Customer & Promotion Capabilities]

### Technical Requirements

- Promotion được cấu hình theo tenant scope và có rule áp dụng rõ cho branch hoặc ngữ cảnh được phép. [Source: _bmad-output/planning-artifacts/epics.md#Story 5.2: Tạo promotion theo scope và áp dụng vào order đủ điều kiện]
- Hệ thống chỉ áp promotion cho order đủ điều kiện trong đúng tenant và branch context. [Source: _bmad-output/planning-artifacts/epics.md#Story 5.2: Tạo promotion theo scope và áp dụng vào order đủ điều kiện]

### Architecture Compliance

- Customer và Promotion không nằm trong implementation tree ban đầu; thêm vào theo cùng module-first/feature-first pattern, không phá boundaries hiện có. [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns] [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- Payment hoặc order module không nên sở hữu promotion rule definitions; chỉ consume promotion results hoặc eligibility decisions qua service boundary rõ ràng.

### File Structure Requirements

- Primary targets:
  - `apps/api/src/modules/promotions/*`
  - `apps/api/src/modules/orders/*`
  - `apps/api/src/modules/audit/*`
  - `apps/web/src/features/promotions/*`
  - `libs/contracts/src/promotions/*`

### Previous Story Intelligence

- Story 5.1 đã chốt customer là extension seam post-MVP; promotion ở story này phải đi cùng triết lý extension seam tương tự, không retrofit lại foundations. [Source: _bmad-output/implementation-artifacts/5-1-quan-ly-customer-trong-tenant-scope-va-gan-vao-order.md]

### Testing Requirements

- Bắt buộc test promotion không áp được cho order ngoài scope hoặc không đủ điều kiện.
- Bắt buộc test audit trail tồn tại cho create hoặc apply promotion decisions.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 5.2: Tạo promotion theo scope và áp dụng vào order đủ điều kiện`
- `_bmad-output/planning-artifacts/prd.md#Customer & Promotion Capabilities`
- `_bmad-output/planning-artifacts/architecture.md#Structure Patterns`
- `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`
- `_bmad-output/implementation-artifacts/5-1-quan-ly-customer-trong-tenant-scope-va-gan-vao-order.md`

## Dev Agent Record

### Agent Model Used

GPT-5.4 (model ID: gpt-5.4)

### Debug Log References

- Story creation workflow synthesis from promotion capability requirements, order-scope constraints, and post-MVP extension boundaries.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Promotion logic must remain a scoped extension seam rather than a retrofit into MVP foundation modules.

### File List

- `_bmad-output/implementation-artifacts/5-2-tao-promotion-theo-scope-va-ap-dung-vao-order-du-dieu-kien.md`
- `apps/api/src/modules/promotions/*`
- `apps/web/src/features/promotions/*`
- `libs/contracts/src/promotions/*`

