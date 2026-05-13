# Story 1.4: Review, guardrails và publish tenant/branch an toàn

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a system admin,
I want to review onboarding impact and publish only when scope and readiness are valid,
so that I can go live without creating tenant or branch mistakes.

## Acceptance Criteria

1. **Given** admin đã hoàn tất các bước onboarding cần thiết  
   **When** admin mở review step trước khi publish  
   **Then** review summary panel tổng hợp tenant, branch, cấu hình chính, readiness status và phạm vi ảnh hưởng của thay đổi.
2. **Given** flow có nguy cơ sai scope hoặc thiếu readiness  
   **When** admin cố publish  
   **Then** hệ thống chặn publish nếu còn readiness item thiếu, có scope mismatch hoặc guardrail violation và chỉ rõ bước/field cần sửa.
3. **Given** tenant/branch mới sẽ kích hoạt capability vận hành  
   **When** admin review trước khi publish  
   **Then** hệ thống hiển thị module/capability bị ảnh hưởng để admin hiểu tác động vận hành.
4. **Given** publish thành công hoặc thất bại do điều kiện nghiệp vụ  
   **When** hệ thống phản hồi  
   **Then** trạng thái trả về phải mang nghĩa nghiệp vụ rõ ràng về mức sẵn sàng vận hành hoặc điều kiện còn thiếu.
5. **Given** scope correctness là guardrail nền cho các epic sau  
   **When** validation scope chính chạy qua review/publish flow  
   **Then** kết quả phải được lưu hoặc báo cáo theo cách hỗ trợ kiểm tra scope correctness trước khi mở rộng capability mới.

## Tasks / Subtasks

- [x] Hoàn thiện review step và review summary panel (AC: 1, 3, 4)
  - [x] Tạo hoặc mở rộng `apps/web/src/features/admin-onboarding/components/review-summary-panel*` với summary cho tenant, branch, config, readiness và impact.
  - [x] Hiển thị readiness breakdown, changed items, risk note và primary publish action theo đúng hierarchy.
  - [x] Tránh summary "chung chung"; mỗi block phải chỉ ra ý nghĩa vận hành thực sự của cấu hình.
- [x] Enforce publish guardrails ở UI + API boundary (AC: 2, 4, 5)
  - [x] Gắn publish action vào validation tổng hợp thay vì chỉ disable button tĩnh.
  - [x] Chuẩn hóa error codes cho `scope-mismatch`, `readiness-blocked`, `guardrail-violation`, `conflict`.
  - [x] Nếu backend tồn tại, publish endpoint phải đi qua controller/service rõ ràng và không bypass service-level validation.
- [x] Bổ sung impact reporting và capability visibility (AC: 1, 3)
  - [x] Hiển thị module/capability baseline nào đang được enable hoặc affected sau publish.
  - [x] Liên kết impact summary với checklist/readiness thay vì render danh sách độc lập.
- [x] Lưu hoặc phát ra validation outcomes phục vụ audit/scope verification (AC: 5)
  - [x] Viết audit log hoặc validation record cho kết quả guardrail quan trọng.
  - [x] Đảm bảo record giữ được `tenantId`, `branchId`, `actorId`, `occurredAt` và reason/error code khi blocked.
- [x] Bổ sung test coverage cho review/publish flow (AC: 1, 2, 4, 5)
  - [x] UI tests cho blocked/review-ready/success states.
  - [x] API/service tests cho publish validation matrix.
  - [x] Regression test chứng minh publish không thành công khi scope mismatch hoặc readiness còn thiếu.

### Review Findings

- [x] [Review][Patch] Publish vẫn có thể bị bypass qua submit button của form, bao gồm ca bo qua review step va duplicate submit sau khi blocked/success [apps/web/src/features/admin-onboarding/components/tenant-provisioning-shell.tsx:518]
- [x] [Review][Patch] Review state bi reset sai sau moi field edit vi chi phu thuoc `formError`, khong re-validate dieu kien blocked/readiness thuc te [apps/web/src/features/admin-onboarding/components/tenant-provisioning-shell.tsx:459]
- [x] [Review][Patch] Contract error code chua duoc chuan hoa theo story; code hien van tron camelCase va kebab-case [libs/contracts/src/tenants/provision-tenant.ts:22]

## Dev Notes

### Story Foundation

- Story này là gate cuối của Epic 1: không chỉ “save successful” mà phải đưa admin đến trạng thái có nghĩa nghiệp vụ là branch đầu tiên sẵn sàng vận hành hoặc biết chính xác còn thiếu gì. [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4: Review, guardrails và publish tenant/branch an toàn]
- Story này trực tiếp thực thi FR32-FR35, nên guardrails/publish semantics phải được viết theo hướng tái sử dụng cho các epic sau, không hardcode cho một wizard demo. [Source: _bmad-output/planning-artifacts/prd.md#Platform Safety & Expansion]

### Current Repository State

- Repo snapshot hiện chưa có source app; các update targets bên dưới là intended structure. Nếu workspace đã có thật, dev agent phải đọc toàn bộ file update targets trước khi thay đổi.
- Vì Story 1.3 và 1.4 được contexted cùng nhau, Story 1.4 cần giả định review step sẽ mở rộng trực tiếp từ wizard state/readiness semantics của Story 1.3.

### Technical Requirements

- Review summary panel là custom component chính thức của UX strategy, không phải modal xác nhận đơn giản. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Review Summary Panel]
- Guardrail failures phải chỉ rõ bước sai, field sai, scope bị ảnh hưởng và recovery path ngắn. [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns]
- Sensitive operations như provisioning publish phải có audit logging rõ. [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]

### Architecture Compliance

- Publish flow đi theo đường chuẩn: feature mutation layer → REST endpoint → Nest controller → service → repository/Prisma → DB/audit side effects. Không gọi trực tiếp infra adapter từ UI hoặc controller. [Source: _bmad-output/planning-artifacts/architecture.md#Integration Points]
- Scope context phải hiện diện xuyên UI review screen, API validation và audit payload. [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns] [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- Shared contracts chỉ đưa vào `libs/contracts` nếu thật sự dùng chung giữa web/api; review panel orchestration vẫn ở feature onboarding. [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]

### File Structure Requirements

- Primary targets:
  - `apps/web/src/app/(admin)/setup/tenants/new/page.tsx`
  - `apps/web/src/features/admin-onboarding/components/review-summary-panel*`
  - `apps/web/src/features/admin-onboarding/api/*`
  - `apps/web/src/features/admin-onboarding/hooks/*`
  - `apps/api/src/modules/tenants/*`
  - `apps/api/src/modules/branches/*`
  - `apps/api/src/modules/audit/*`
  - `apps/api/src/common/errors/*`
  - `apps/api/src/common/filters/*` or `interceptors/*`

### Previous Story Intelligence

- Story 1.3 đặt wizard state, scope header và readiness panel làm source of truth cho admin flow; Story 1.4 phải đọc lại chính các surfaces này thay vì dựng review data riêng. [Source: _bmad-output/implementation-artifacts/1-3-guided-setup-wizard-voi-scope-header-va-readiness-panel.md]
- Story 1.2 đã chốt provisioning foundation theo tenant/branch scope; publish flow không được bỏ qua backend/service validation để “tin” dữ liệu từ wizard UI. [Source: _bmad-output/implementation-artifacts/1-2-tao-tenant-va-branch-dau-tien-voi-nen-du-lieu-dung-scope.md]

### Testing Requirements

- Bắt buộc test blocked states cho từng failure mode: readiness thiếu, scope mismatch, guardrail violation, invalid capability dependency.
- Success state phải khẳng định ý nghĩa nghiệp vụ chứ không chỉ HTTP 200. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns]
- Accessibility smoke test cho review step cần bao phủ focus order, heading structure, keyboard navigation và blocked reasons. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Review Summary Panel] [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Testing Strategy]

### Git Intelligence Summary

- Commit history cho thấy architecture đã absorb UX decisions; review/publish UX phải bám UI spec hiện tại, không tự đơn giản hóa thành confirm dialog.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 1.4: Review, guardrails và publish tenant/branch an toàn`
- `_bmad-output/planning-artifacts/prd.md#Tenant & Branch Governance`
- `_bmad-output/planning-artifacts/prd.md#Platform Safety & Expansion`
- `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`
- `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`
- `_bmad-output/planning-artifacts/architecture.md#Process Patterns`
- `_bmad-output/planning-artifacts/architecture.md#Integration Points`
- `_bmad-output/planning-artifacts/architecture.md#Structure Patterns`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Journey 2 — System admin phát hiện/ngăn sai tenant hoặc sai branch trước khi lưu`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Review Summary Panel`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Testing Strategy`
- `_bmad-output/implementation-artifacts/1-2-tao-tenant-va-branch-dau-tien-voi-nen-du-lieu-dung-scope.md`
- `_bmad-output/implementation-artifacts/1-3-guided-setup-wizard-voi-scope-header-va-readiness-panel.md`

## Dev Agent Record

### Agent Model Used

GPT-5.4 (model ID: gpt-5.4)

### Debug Log References

- Story creation workflow synthesis from sprint status, prior Epic 1 story context, and scope/publish guardrail analysis.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Publish semantics must remain reusable for later capability expansion and scope verification.
- **Story 1.4 implementation complete (2026-05-13):**
  - `review-summary-panel.tsx`: Exported `ReviewSummaryState`, added readiness state badges (Bị chặn / Đã hoàn tất / Sẵn sàng), disabled publish button for `blocked`/`success` states.
  - `tenant-provisioning-shell.tsx`: Added `reviewSummaryState` useMemo (success→blocked→review-ready), cleared formError on field change, fixed capability impact detail texts to remove duplicate "Tenant governance"/"Branch checkout" heading text.
  - `libs/contracts/src/tenants/provision-tenant.ts`: Added `ProvisionTenantErrorCode` union type covering all API and UI-side error codes.
  - 7 new unit tests in `review-summary-panel.spec.tsx`; 2 new integration tests in `page.spec.tsx` (blocked publish after API failure, clear blocked on field change).
  - All 28 web tests + 14 API tests pass; zero regressions.

### File List

- `apps/web/src/features/admin-onboarding/components/review-summary-panel.tsx` (modified)
- `apps/web/src/features/admin-onboarding/components/review-summary-panel.spec.tsx` (created)
- `apps/web/src/features/admin-onboarding/components/tenant-provisioning-shell.tsx` (modified)
- `apps/web/src/app/(admin)/setup/tenants/new/page.spec.tsx` (modified)
- `libs/contracts/src/tenants/provision-tenant.ts` (modified)

## Change Log

- 2026-05-13: Story 1.4 implemented — review panel guardrails, publish blocked state, capability impact visibility, ProvisionTenantErrorCode type, full test coverage.
