# Story 4.2: Giữ order lifecycle và màn xem order trong đúng scope

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a cashier or store manager,
I want order actions and order visibility to stay inside my branch scope,
so that checkout and supervision remain consistent and trustworthy.

## Acceptance Criteria

1. **Given** đã có order thuộc một branch hợp lệ  
   **When** cashier cập nhật order hoặc store manager xem danh sách hoặc chi tiết order  
   **Then** hệ thống chỉ cho phép xem và thao tác các order thuộc branch người dùng được cấp quyền.
2. **Given** store manager có quyền giám sát branch mình quản lý  
   **When** manager xem danh sách hoặc chi tiết order  
   **Then** manager chỉ nhìn thấy order của branch đó.
3. **Given** order trải qua nhiều trạng thái nghiệp vụ  
   **When** order được cập nhật  
   **Then** các trạng thái order chính vẫn giữ branch context nhất quán xuyên suốt các bước xử lý.
4. **Given** có nguy cơ truy cập hoặc thao tác order ngoài scope  
   **When** người dùng thực hiện attempt ngoài phạm vi  
   **Then** UI, API và query layer cùng chặn bằng guardrails rõ ràng.

## Tasks / Subtasks

- [ ] Thiết kế order lifecycle transitions gắn chặt với branch scope (AC: 1, 2, 3, 4)
  - [ ] Tạo hoặc mở rộng `apps/api/src/modules/orders/*` cho list, detail, update và status transitions.
  - [ ] Đảm bảo mọi queries và mutations đều nhận scoped context.
  - [ ] Không cho phép update order nếu branch context không khớp session hoặc route scope.
- [ ] Xây branch-scoped order list/detail surfaces (AC: 1, 2, 3)
  - [ ] Mở rộng `apps/web/src/features/orders/*` để hỗ trợ list, detail, status badges và action states theo role.
  - [ ] Giữ branch context bền vững trên list filters, detail header và action confirmations.
- [ ] Đồng bộ guardrails giữa UI, API và query layer (AC: 4)
  - [ ] Route guards, API guards và repository filters phải phản ánh cùng policy.
  - [ ] Trả stable error codes cho forbidden, scope-mismatch, invalid-order-state.
- [ ] Viết tests cho lifecycle + scoped visibility (AC: 1, 2, 3, 4)
  - [ ] Tests cho cashier update trong scope, manager view trong scope, blocked cross-scope access và status progression đúng branch.

## Dev Notes

### Story Foundation

- Story này hiện thực hóa FR18-FR20 và là lớp correctness quan trọng giữa order creation và payment capture. [Source: _bmad-output/planning-artifacts/epics.md#Story 4.2: Giữ order lifecycle và màn xem order trong đúng scope]
- Scope correctness ở story này phải ổn định cho cả cashier lẫn store manager; đừng thiết kế hai policy surface rời rạc. [Source: _bmad-output/planning-artifacts/prd.md#Order & Checkout Operations] [Source: _bmad-output/planning-artifacts/prd.md#Journey 3 - Store Manager: nhìn đúng dữ liệu trong đúng branch mà không bị lẫn]

### Technical Requirements

- Query filters, API guards và UI states phải đồng nhất để không xảy ra “thấy đúng nhưng thao tác sai scope”. [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3: Enforce quyền và quản lý staff theo branch cho store manager]
- Scope context phải được render trước và sau mutation để người dùng không mất ngữ cảnh. [Source: _bmad-output/planning-artifacts/architecture.md#Integration Points]

### Architecture Compliance

- Feature mapping đã chốt: `apps/api/src/modules/orders` và `apps/web/src/features/orders`. [Source: _bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping]
- AuthZ source of truth ở backend guards hoặc services; UI chỉ phản ánh policy để cải thiện UX. [Source: _bmad-output/planning-artifacts/architecture.md#API Boundaries]

### File Structure Requirements

- Primary targets:
  - `apps/api/src/modules/orders/*`
  - `apps/web/src/features/orders/*`
  - `apps/web/src/app/tenants/[tenantId]/branches/[branchId]/orders/page.tsx`
  - `libs/contracts/src/orders/*`

### Previous Story Intelligence

- Story 4.1 đã chốt order draft phải tạo với tenantId/branchId đúng từ đầu; story này phải bảo toàn các fields đó qua toàn bộ lifecycle, không recalculate lỏng lẻo ở mỗi step. [Source: _bmad-output/implementation-artifacts/4-1-tao-order-trong-branch-dang-hoat-dong.md]

### Testing Requirements

- Bắt buộc regression test “UI chặn nhưng API cho qua” và ngược lại.
- Bắt buộc test manager chỉ thấy order branch mình quản lý.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 4.2: Giữ order lifecycle và màn xem order trong đúng scope`
- `_bmad-output/planning-artifacts/prd.md#Order & Checkout Operations`
- `_bmad-output/planning-artifacts/prd.md#Journey 3 - Store Manager: nhìn đúng dữ liệu trong đúng branch mà không bị lẫn`
- `_bmad-output/planning-artifacts/architecture.md#API Boundaries`
- `_bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping`
- `_bmad-output/planning-artifacts/architecture.md#Integration Points`
- `_bmad-output/implementation-artifacts/4-1-tao-order-trong-branch-dang-hoat-dong.md`

## Dev Agent Record

### Agent Model Used

GPT-5.4 (model ID: gpt-5.4)

### Debug Log References

- Story creation workflow synthesis from order lifecycle requirements, branch governance rules, and prior order draft context.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Lifecycle transitions must preserve the branch scope established at order creation time.

### File List

- `_bmad-output/implementation-artifacts/4-2-giu-order-lifecycle-va-man-xem-order-trong-dung-scope.md`
- `apps/api/src/modules/orders/*`
- `apps/web/src/features/orders/*`
- `libs/contracts/src/orders/*`

