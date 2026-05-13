# Story 4.1: Tạo order trong branch đang hoạt động

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a cashier,
I want to create an order in my active branch context,
so that each sale is recorded for the correct store from the start.

## Acceptance Criteria

1. **Given** cashier đã đăng nhập và đang ở branch workspace hợp lệ  
   **When** cashier bắt đầu một order mới  
   **Then** hệ thống tạo order draft gắn đúng tenantId/branchId và không cho tạo order ngoài branch đang hoạt động.
2. **Given** order creation là flow branch-critical  
   **When** giao diện hiển thị flow tạo order  
   **Then** giao diện luôn hiển thị branch context trong suốt flow tạo order.
3. **Given** branch context có thể mất đồng bộ  
   **When** context không hợp lệ hoặc bị drift  
   **Then** hệ thống chặn thao tác và trả về error rõ ràng thay vì fallback âm thầm.
4. **Given** order sẽ được các bước sau xử lý tiếp  
   **When** order draft được tạo  
   **Then** order API và DTO tuân theo contract chuẩn để các bước sau dùng lại nhất quán.

## Tasks / Subtasks

- [ ] Thiết kế order draft model và contract theo branch scope (AC: 1, 4)
  - [ ] Tạo hoặc mở rộng `apps/api/src/modules/orders/*` và `libs/contracts/src/orders/*`.
  - [ ] Bắt buộc `tenantId`, `branchId`, `status` và timestamps rõ trên order draft.
  - [ ] Không để order draft hình thành nếu active branch context không hợp lệ.
- [ ] Xây order creation flow cho cashier với scope header bền vững (AC: 1, 2, 3)
  - [ ] Tạo `apps/web/src/features/orders/*` và branch orders page.
  - [ ] Hiển thị branch context rõ trong shell tạo order và mọi loading/error state.
  - [ ] Không reset sang branch khác hoặc bỏ trống branch context khi refresh hoặc mutation fail.
- [ ] Enforce context validation trên API/service layer (AC: 1, 3, 4)
  - [ ] So khớp session scope, route scope và payload scope.
  - [ ] Trả stable error code cho scope mismatch hoặc invalid branch context.
- [ ] Viết tests cho order draft creation (AC: 1, 2, 3, 4)
  - [ ] Tests cho valid branch order draft, invalid branch context và contract reuse.

## Dev Notes

### Story Foundation

- Story này mở Epic 4 và là điểm bắt đầu của checkout flow; nếu order draft sai tenant hoặc branch từ đầu thì lifecycle, payment và reconciliation đều sai. [Source: _bmad-output/planning-artifacts/epics.md#Story 4.1: Tạo order trong branch đang hoạt động]
- Journey 4 của PRD yêu cầu staff hoặc cashier thao tác trong đúng branch mà không nhầm phạm vi. [Source: _bmad-output/planning-artifacts/prd.md#Journey 4 - Staff/Cashier: thao tác trong đúng branch mà không nhầm phạm vi]

### Technical Requirements

- Order creation phải coi branch context là security và correctness boundary, không chỉ UI filter. [Source: _bmad-output/planning-artifacts/prd.md#Order & Checkout Operations] [Source: _bmad-output/planning-artifacts/prd.md#Security]
- API contract chuẩn hóa để order lifecycle và payment dùng lại nhất quán. [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]

### Architecture Compliance

- Feature mapping đã chốt: `apps/api/src/modules/orders` và `apps/web/src/features/orders`. [Source: _bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping]
- Web → API qua feature API layer + TanStack Query; không cho cashier UI tự “tin” local state mà bỏ qua backend scope checks. [Source: _bmad-output/planning-artifacts/architecture.md#Integration Points]

### File Structure Requirements

- Primary targets:
  - `apps/api/src/modules/orders/*`
  - `apps/web/src/features/orders/*`
  - `apps/web/src/app/tenants/[tenantId]/branches/[branchId]/orders/page.tsx`
  - `libs/contracts/src/orders/*`

### Testing Requirements

- Bắt buộc test invalid branch context không thể tạo draft.
- UI regression test phải chứng minh branch context luôn hiện diện xuyên create flow.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 4.1: Tạo order trong branch đang hoạt động`
- `_bmad-output/planning-artifacts/prd.md#Order & Checkout Operations`
- `_bmad-output/planning-artifacts/prd.md#Journey 4 - Staff/Cashier: thao tác trong đúng branch mà không nhầm phạm vi`
- `_bmad-output/planning-artifacts/prd.md#Security`
- `_bmad-output/planning-artifacts/architecture.md#Format Patterns`
- `_bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping`
- `_bmad-output/planning-artifacts/architecture.md#Integration Points`

## Dev Agent Record

### Agent Model Used

GPT-5.4 (model ID: gpt-5.4)

### Debug Log References

- Story creation workflow synthesis from order requirements, branch scope rules, and contract consistency guidance.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Order draft scope correctness is the prerequisite for lifecycle and payment correctness.

### File List

- `_bmad-output/implementation-artifacts/4-1-tao-order-trong-branch-dang-hoat-dong.md`
- `apps/api/src/modules/orders/*`
- `apps/web/src/features/orders/*`
- `libs/contracts/src/orders/*`
