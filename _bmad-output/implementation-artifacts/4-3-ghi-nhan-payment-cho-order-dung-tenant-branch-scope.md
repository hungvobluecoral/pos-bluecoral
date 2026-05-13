# Story 4.3: Ghi nhận payment cho order đúng tenant/branch scope

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a cashier,
I want to capture payment against a valid branch order,
so that the transaction is completed accurately and traceably.

## Acceptance Criteria

1. **Given** một order hợp lệ đang ở branch mà cashier được phép thao tác  
   **When** cashier ghi nhận payment cho order đó  
   **Then** payment được gắn đúng với order, tenant và branch liên quan.
2. **Given** payment provider chưa chốt cứng ở phase này  
   **When** payment flow được thiết kế  
   **Then** contract hoặc provider abstraction phải đủ rõ để vẫn provider-agnostic.
3. **Given** payment là thao tác tài chính nhạy cảm  
   **When** cashier cố áp payment cho order ngoài scope, order không hợp lệ hoặc trạng thái không cho phép  
   **Then** hệ thống phải chặn rõ ràng.
4. **Given** payment cần phục vụ reconciliation và điều tra sự cố  
   **When** payment action hoặc lỗi xảy ra  
   **Then** audit log phải ghi lại payment action và lỗi liên quan.

## Tasks / Subtasks

- [ ] Thiết kế payment contract và provider abstraction (AC: 1, 2, 3, 4)
  - [ ] Tạo hoặc mở rộng `apps/api/src/modules/payments/*` và `libs/contracts/src/payments/*`.
  - [ ] Giữ payment module provider-agnostic bằng adapter hoặc abstraction rõ ràng.
  - [ ] Gắn payment với order, tenantId, branchId, actorId và status hợp lệ.
- [ ] Enforce payment eligibility và scope validation (AC: 1, 3)
  - [ ] Xác nhận order đang thuộc branch hợp lệ, trạng thái cho phép và chưa bị cross-scope mismatch.
  - [ ] Trả stable error codes cho invalid-order-state, scope-mismatch, forbidden-payment.
- [ ] Xây payment UI hoặc capture flow cho cashier (AC: 1, 2, 3)
  - [ ] Tạo `apps/web/src/features/payments/*` hoặc integration surfaces từ orders feature.
  - [ ] Hiển thị order context, branch context và payment status rõ trong flow.
- [ ] Audit payment actions và failures (AC: 4)
  - [ ] Ghi payment success, decline, reject, blocked attempt với metadata đủ cho reconciliation.
- [ ] Viết tests cho scoped payment behavior (AC: 1, 2, 3, 4)
  - [ ] Tests cho valid payment capture, invalid scope, invalid state và provider abstraction contract.

## Dev Notes

### Story Foundation

- Story này hoàn tất phần payment của MVP checkout flow nhưng vẫn phải giữ đường mở cho provider cụ thể được quyết định sau. [Source: _bmad-output/planning-artifacts/epics.md#Story 4.3: Ghi nhận payment cho order đúng tenant/branch scope]

### Technical Requirements

- Payment flow phải provider-agnostic ở phase hiện tại. [Source: _bmad-output/planning-artifacts/epics.md#Story 4.3: Ghi nhận payment cho order đúng tenant/branch scope]
- Payment gắn đúng với order và scope vận hành liên quan. [Source: _bmad-output/planning-artifacts/prd.md#Inventory & Payment Management]
- Sensitive operations như payment recording cần audit logging rõ. [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]

### Architecture Compliance

- Feature mapping đã chốt: `apps/api/src/modules/payments`, `apps/web/src/features/payments`, đồng thời order module vẫn là source of truth cho order eligibility. [Source: _bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping]
- Payment provider tương lai phải đi qua payment module hoặc adapter tương ứng; không gọi trực tiếp từ module khác. [Source: _bmad-output/planning-artifacts/architecture.md#External Integrations]

### File Structure Requirements

- Primary targets:
  - `apps/api/src/modules/payments/*`
  - `apps/api/src/modules/orders/*`
  - `apps/api/src/modules/audit/*`
  - `apps/web/src/features/payments/*`
  - `libs/contracts/src/payments/*`

### Previous Story Intelligence

- Story 4.2 đã chốt order lifecycle và scoped visibility; Story 4.3 phải consume lifecycle state đó thay vì tự suy diễn eligibility bên ngoài order module. [Source: _bmad-output/implementation-artifacts/4-2-giu-order-lifecycle-va-man-xem-order-trong-dung-scope.md]

### Testing Requirements

- Bắt buộc test payment bị chặn với order ngoài scope hoặc trạng thái không hợp lệ.
- Provider abstraction contract test phải đủ mạnh để sau này thay provider mà không đổi business flow.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 4.3: Ghi nhận payment cho order đúng tenant/branch scope`
- `_bmad-output/planning-artifacts/prd.md#Inventory & Payment Management`
- `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`
- `_bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping`
- `_bmad-output/planning-artifacts/architecture.md#External Integrations`
- `_bmad-output/implementation-artifacts/4-2-giu-order-lifecycle-va-man-xem-order-trong-dung-scope.md`

## Dev Agent Record

### Agent Model Used

GPT-5.4 (model ID: gpt-5.4)

### Debug Log References

- Story creation workflow synthesis from payment requirements, provider-agnostic architecture constraints, and prior order lifecycle context.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Payment module must remain provider-agnostic while still enforcing strict order and scope correctness.

### File List

- `_bmad-output/implementation-artifacts/4-3-ghi-nhan-payment-cho-order-dung-tenant-branch-scope.md`
- `apps/api/src/modules/payments/*`
- `apps/api/src/modules/orders/*`
- `apps/web/src/features/payments/*`
- `libs/contracts/src/payments/*`

