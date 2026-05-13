# Story 1.3: Guided setup wizard với scope header và readiness panel

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a system admin,
I want a guided tenant onboarding wizard that always shows current scope and readiness,
so that I can complete setup without guessing what branch or tenant I am affecting.

## Acceptance Criteria

1. **Given** admin đang thực hiện onboarding tenant/branch  
   **When** admin đi qua từng bước trong wizard  
   **Then** màn hình luôn hiển thị persistent scope header/breadcrumb với tenant, branch và bước hiện tại.
2. **Given** wizard đang điều phối tiến trình onboarding  
   **When** trạng thái từng bước thay đổi  
   **Then** stepper hiển thị rõ các trạng thái `active`, `completed`, `warning`, `blocked` và lý do bước bị chặn nếu có.
3. **Given** admin cần biết trạng thái sẵn sàng vận hành  
   **When** họ theo dõi readiness trong flow  
   **Then** readiness panel/checklist cho biết những điều kiện đã đạt, những mục còn thiếu, và cho phép quay lại đúng bước cần sửa.
4. **Given** xảy ra lỗi nhập liệu hoặc thiếu điều kiện  
   **When** hệ thống validate từng bước  
   **Then** validation xuất hiện inline, gắn với field liên quan, và nói rõ tác động tới readiness.
5. **Given** admin thao tác trên desktop hoặc tablet  
   **When** giao diện render wizard  
   **Then** trải nghiệm vẫn desktop-first, hỗ trợ tablet bằng progressive collapse, và đạt keyboard/focus/ARIA theo mục tiêu WCAG AA.

## Tasks / Subtasks

- [ ] Khóa prerequisite và source of truth trước khi mở rộng wizard (AC: 1, 2, 3, 4, 5)
  - [ ] Xác minh source tree thực tế đã có output của Story 1.1 và Story 1.2; nếu repo vẫn chỉ có docs/artifacts, **không** được triển khai 1.3 trên một cấu trúc tưởng tượng.
  - [ ] Giữ flow trong `apps/web/src/features/admin-onboarding/*`; không đẩy sớm `scope-header`, `setup-wizard-stepper`, `readiness-panel` sang `libs/ui`.
  - [ ] Preserve contracts, naming, state vocabulary và route structure đã chốt ở architecture/UX docs và hai story trước.
- [ ] Mở rộng onboarding shell thành guided wizard có scope hiện hữu xuyên suốt (AC: 1, 2)
  - [ ] Cập nhật `apps/web/src/app/(admin)/setup/tenants/new/page.tsx` hoặc layout liên quan để giữ `tenant`, `branch`, `currentStep` luôn hiện diện.
  - [ ] Tạo hoặc hoàn thiện `scope-header.tsx` với tenant name, branch name, trạng thái readiness ngắn, và current step rõ ràng.
  - [ ] Tạo hoặc hoàn thiện `setup-wizard-stepper.tsx` với các trạng thái `active`, `completed`, `warning`, `blocked`; hiển thị explicit blocking reason thay vì chỉ đổi màu.
  - [ ] Giữ source of truth của scope rõ ràng từ route/query/provisioning result; không duplicate mơ hồ giữa nhiều stores.
- [ ] Triển khai readiness model và panel quay lại đúng bước cần sửa (AC: 2, 3)
  - [ ] Tạo hoặc hoàn thiện `readiness-panel.tsx` để hiển thị checklist item, trạng thái, missing conditions, và action link quay lại step liên quan.
  - [ ] Dùng vocabulary readiness/wizard thống nhất theo architecture: `active`, `completed`, `warning`, `blocked`, `ready`.
  - [ ] Thiết kế readiness state sao cho có thể lấy từ validation/form state hiện tại và mở rộng sang backend-driven signals ở story sau mà không đổi semantics.
  - [ ] Không triển khai review/publish flow hoàn chỉnh của Story 1.4 trong story này.
- [ ] Gắn validation inline với readiness impact và recovery path ngắn (AC: 3, 4)
  - [ ] Tổ chức form/schema theo từng step dưới `components/`, `schemas/`, `hooks/`, `stores/` của feature admin-onboarding.
  - [ ] Mỗi lỗi phải chỉ rõ field, step liên quan, và tác động tới readiness; tránh dồn lỗi vào toast toàn cục.
  - [ ] Khi step bị `warning` hoặc `blocked`, wizard và readiness panel phải chỉ cùng một nguyên nhân ở hai góc nhìn nhất quán.
  - [ ] Giữ user-facing messaging ngắn, rõ, scope-aware; không dùng ngôn ngữ kỹ thuật nội bộ.
- [ ] Hoàn thiện responsive + accessibility guardrails cho wizard (AC: 1, 2, 3, 4, 5)
  - [ ] Giữ desktop-first layout với stepper/scope/readiness rõ ràng; tablet dùng progressive collapse nhưng vẫn luôn giữ context scope, progress hiện tại và readiness status.
  - [ ] Bảo đảm keyboard navigation đầy đủ cho stepper, form actions, readiness links và focus order giữa các panel.
  - [ ] Dùng semantic HTML/ARIA cho stepper, alerts, validation, readiness states; không phụ thuộc chỉ vào màu để thể hiện trạng thái.
  - [ ] Giữ skeleton/loading states ổn định layout nếu có fetch/re-hydration trong wizard.
- [ ] Bổ sung test và regression coverage cho guided flow (AC: 1, 2, 3, 4, 5)
  - [ ] Viết unit/component tests co-located cho `scope-header`, `setup-wizard-stepper`, `readiness-panel` và validation behavior.
  - [ ] Kiểm tra keyboard navigation, focus states, ARIA labels và semantic status text cho các custom component chính.
  - [ ] Thêm tests chứng minh admin có thể quay lại đúng step từ readiness panel và status/validation đồng bộ đúng khi dữ liệu đổi.
  - [ ] Nếu đã có test setup phù hợp từ 1.1/1.2, thêm integration coverage cho wizard state + onboarding route; chỉ thêm e2e nếu nó thật sự đo được behavior quan trọng của story.

## Dev Notes

### Story Foundation

- Story này hiện thực hóa Story 1.3 của Epic 1, tập trung vào guided onboarding UX thay vì persistence foundation hay publish/review flow hoàn chỉnh. [Source: _bmad-output/planning-artifacts/epics.md#Epic 1: Guided Tenant & Branch Onboarding]
- Story implement trực tiếp FR5, FR6 và FR31: luôn thấy tenant/branch context, có guardrails khi dễ gán nhầm scope, và giữ branch context nhất quán xuyên flow. [Source: _bmad-output/planning-artifacts/prd.md#Functional Requirements]
- Journey 1 và Journey 2 của PRD yêu cầu admin được dẫn hướng qua flow tạo tenant/branch với context rõ ràng, chặn sai scope sớm và giảm kiểm tra chéo thủ công. [Source: _bmad-output/planning-artifacts/prd.md#User Journeys]

### Cross-Story Context

- Story 1.1 chỉ dựng onboarding shell foundation với CTA `"Tạo tenant mới"`, placeholder stepper/scope header/readiness panel, và REST/OpenAPI baseline; Story 1.3 phải build tiếp trên shell đó chứ không thay đổi kiến trúc nền. [Source: _bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-starter-template.md#Tasks / Subtasks]
- Story 1.2 tạo tenant + branch đầu tiên, trả về `tenantId` / `branchId`, chuẩn hóa response/error envelopes và auditability; Story 1.3 phải tận dụng scope/provisioning result từ 1.2 làm nguồn ngữ cảnh chính cho wizard. [Source: _bmad-output/implementation-artifacts/1-2-tao-tenant-va-branch-dau-tien-voi-nen-du-lieu-dung-scope.md#Tasks / Subtasks]
- Story 1.4 mới xử lý review summary đầy đủ, guardrail publish và go-live gating; Story 1.3 chỉ dựng readiness + navigation semantics cần thiết để 1.4 mở rộng. [Source: _bmad-output/planning-artifacts/epics.md#Epic 1: Guided Tenant & Branch Onboarding]

### Current Repository State

- Repo hiện tại vẫn là **documentation-first**: chưa có Nx workspace, `apps/`, `libs/`, hay source implementation thực tế để cập nhật. Đây là guardrail quan trọng nhất cho dev agent. [Source: repository inspection] [Source: _bmad-output/implementation-artifacts/1-2-tao-tenant-va-branch-dau-tien-voi-nen-du-lieu-dung-scope.md#Current Repository State]
- Vì vậy mọi “update file” bên dưới phải được hiểu là **intended target files sau khi Story 1.1 và 1.2 đã được materialize**. Nếu chưa có source tree thật, dev agent phải materialize đúng dependency trước, không được tạo cấu trúc thay thế ngoài architecture.
- Không tìm thấy `project-context.md`; source of truth hiện tại là sprint status + epics + PRD + architecture + UX + previous story artifacts. [Source: repository inspection]

### Technical Requirements

- Frontend target là **Next.js App Router** trong `apps/web`, theo mô hình feature/domain-first; wizard state chỉ ở Zustand nếu là UI state thật sự cần, còn server state luôn qua TanStack Query. [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] [Source: _bmad-output/planning-artifacts/architecture.md#Communication Patterns]
- Primitive layer là **shadcn/ui + Tailwind CSS**; custom POS_BlueCoral patterns gồm `setup-wizard-stepper`, `scope-header`, `readiness-panel`, `review-summary-panel`, `risk alert`. Story này chỉ cần nhóm pattern liên quan stepper/scope/readiness/inline validation. [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy]
- API/error semantics từ 1.2 vẫn là chuẩn cứng cho dữ liệu wizard tiêu thụ hoặc hiển thị lỗi: success `{ data, meta? }`, error `{ error: { code, message, details?, requestId? } }`. Với guided flow, error cần chỉ rõ bước nào sai, scope nào bị ảnh hưởng, và thiếu gì để đạt readiness. [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns] [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns]
- Scope context phải có source of truth rõ ràng ở route/session/query/provisioning result; không duplicate mơ hồ giữa nhiều stores hoặc component-local state. [Source: _bmad-output/planning-artifacts/architecture.md#Communication Patterns]

### Architecture Compliance

- `apps/web/src/features/admin-onboarding/*` sở hữu guided setup flow cho tenant + branch đầu tiên. `apps/web/src/components/ui` và `libs/ui` chỉ dành cho primitives/generic helpers, không chứa business orchestration. [Source: _bmad-output/planning-artifacts/architecture.md#Architectural Boundaries]
- Guided linear admin flow là nguyên tắc kiến trúc; không refactor story này thành dashboard generic hoặc tách người dùng sang nhiều màn hình CRUD rời rạc. [Source: _bmad-output/planning-artifacts/architecture.md#Enforcement Guidelines] [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design Direction Decision]
- Wizard/readiness vocabulary đã bị khóa: `active`, `completed`, `warning`, `blocked`, `ready`. Không được phát minh thêm semantics cạnh tranh cho cùng một trạng thái. [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- Tests phải co-located với source; accessibility và flow regression cho admin onboarding là ưu tiên, không phải phần “nice to have”. [Source: _bmad-output/planning-artifacts/architecture.md#File Organization Patterns]

### Intended Update Files

- Sau khi 1.1 và 1.2 được materialize, story này nhiều khả năng sẽ **update**:
  - `apps/web/src/app/(admin)/setup/tenants/new/page.tsx`
  - `apps/web/src/app/(admin)/setup/tenants/new/layout.tsx` hoặc wrapper tương đương nếu 1.1 chỉ có shell ban đầu
  - `apps/web/src/features/admin-onboarding/components/scope-header.tsx`
  - `apps/web/src/features/admin-onboarding/components/setup-wizard-stepper.tsx`
  - `apps/web/src/features/admin-onboarding/components/readiness-panel.tsx`
  - `apps/web/src/features/admin-onboarding/components/*` cho step forms, validation summaries hoặc support blocks liên quan
  - `apps/web/src/features/admin-onboarding/hooks/*`
  - `apps/web/src/features/admin-onboarding/stores/*`
  - `apps/web/src/features/admin-onboarding/schemas/*`
  - `apps/web/src/features/admin-onboarding/api/*`
- Story có thể cần **đọc/tôn trọng** nhưng không mở rộng sai scope vào:
  - `apps/web/src/app/(admin)/dashboard/page.tsx`
  - `libs/contracts/src/common/*`
  - onboarding-related API contracts từ Story 1.2
- Vì repo hiện chưa có source tree này, dev agent phải xem đây là intended targets và đặt file đúng boundary khi materialize implementation.

### File Structure Requirements

- Frontend feature structure ưu tiên: `components/`, `hooks/`, `api/`, `stores/`, `schemas/` ngay trong `apps/web/src/features/admin-onboarding/`. [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- `scope-header`, `setup-wizard-stepper`, `readiness-panel` phải giữ file name dạng kebab-case, export PascalCase, và phản ánh intent rõ. [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- Không chuyển business-specific scope/readiness components vào `libs/ui` quá sớm; chỉ trích xuất khi đã có hơn một feature thực sự dùng chung. [Source: _bmad-output/planning-artifacts/architecture.md#Architectural Boundaries]

### UX Guardrails

- Design direction đã chốt là **Direction 01 - Guided Linear Flow**: CTA rõ trên dashboard, wizard nhiều bước, context header bền vững, readiness panel bên cạnh và review step ở story sau. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design Direction Decision]
- `Scope Header / Context Bar` phải hiển thị tenant name, branch name, scope badge, readiness trạng thái ngắn và current step; không chỉ là badge màu hoặc label mơ hồ. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy]
- `Setup Wizard Stepper` phải cho biết người dùng đang ở đâu, bước nào xong, bước nào bị chặn và vì sao; hỗ trợ keyboard navigation và `aria-current` cho step hiện tại. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy]
- `Readiness Panel / Checklist` phải hiển thị checklist item, status icon, missing conditions và action link quay lại step cần sửa; trạng thái không phụ thuộc màu. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy]
- Validation phải xuất hiện gần field/step liên quan, nói rõ impact tới readiness, và giúp error recovery ngắn; tránh dồn vào toast toàn cục hay error summary xa ngữ cảnh. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX Consistency Patterns] [Source: _bmad-output/planning-artifacts/ux-design-specification.md#User Journey Flows]

### Responsive & Accessibility Requirements

- Desktop là bối cảnh chính; tablet phải support gần ngang desktop bằng progressive collapse; mobile chỉ tối thiểu. Dù layout co lại, luôn giữ 3 yếu tố: context scope, progress hiện tại, readiness status. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility] [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns]
- Mục tiêu là **WCAG AA** cho flow này: keyboard navigation đầy đủ, focus states rõ, semantic HTML/ARIA cho stepper/alerts/validation/readiness states, icon + text thay vì color-only signaling. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility]
- Loading/skeleton states phải giữ layout ổn định ở wizard/readiness panels; không làm người dùng mất định hướng scope khi fetch hoặc step chuyển trạng thái. [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns]

### What Must Be Preserved

- Preserve latest planning intent: commit history cho thấy architecture đã được cập nhật bằng UX, nên nếu epics/PRD ngắn hơn, ưu tiên chi tiết cụ thể ở `architecture.md` + `ux-design-specification.md`. [Source: git log] [Source: _bmad-output/planning-artifacts/architecture.md#Architecture Validation Results]
- Preserve App Router, feature-first boundaries, TanStack Query cho server state và Zustand chỉ cho UI/wizard state thật sự cần. [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- Preserve response/error contract từ Story 1.2; 1.3 chỉ mở rộng cách biểu đạt lỗi/readiness trên UI, không đổi envelope hay naming conventions. [Source: _bmad-output/implementation-artifacts/1-2-tao-tenant-va-branch-dau-tien-voi-nen-du-lieu-dung-scope.md#API / Audit Guardrails]
- Preserve story boundaries: đừng nuốt luôn review/publish flow của 1.4, cũng đừng redesign lại foundation của 1.1/1.2. [Source: _bmad-output/planning-artifacts/epics.md#Epic 1: Guided Tenant & Branch Onboarding]

### What Is Explicitly Out of Scope

- Không triển khai review summary đầy đủ, publish gating hoàn chỉnh, hay go-live orchestration cuối cùng của Story 1.4.
- Không tái thiết kế persistence foundation, audit pipeline hay provisioning business flow đã thuộc Story 1.2.
- Không đẩy scope/readiness orchestration vào `libs/ui` hoặc generic dashboard code.
- Không triển khai mobile-first/full-mobile wizard cho V1; mobile chỉ là hỗ trợ tối thiểu. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility]

### Previous Story Intelligence

- Story 1.2 đã khóa một guardrail rất quan trọng: repo hiện vẫn docs-only, nên dev agent không được implement dựa trên các file “được nêu trong architecture” như thể chúng đã tồn tại. [Source: _bmad-output/implementation-artifacts/1-2-tao-tenant-va-branch-dau-tien-voi-nen-du-lieu-dung-scope.md#Current Repository State]
- Story 1.2 cũng nhấn mạnh `tenantId` / `branchId` phải là source of truth cho các bước sau và error/validation phải giữ inline, scope-aware; 1.3 nên tái sử dụng các contract và state semantics này thay vì phát minh flow trạng thái khác. [Source: _bmad-output/implementation-artifacts/1-2-tao-tenant-va-branch-dau-tien-voi-nen-du-lieu-dung-scope.md#Tasks / Subtasks] [Source: _bmad-output/implementation-artifacts/1-2-tao-tenant-va-branch-dau-tien-voi-nen-du-lieu-dung-scope.md#Frontend & UX Guardrails]
- Story 1.1 đã khóa boundary rằng onboarding là feature riêng, không phải generic dashboard extension; đây vẫn là quy tắc cốt lõi cho 1.3. [Source: _bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-starter-template.md#Architecture Compliance]

### Git Intelligence Summary

- Recent repo history:
  - `bcedf4c` Update Architecture With UX
  - `8fbaefb` Add UI
  - `c308986` Add Achitecture
  - `21459e4` Add PRD
  - `7f803c2` Add Product Brief
- Ý nghĩa cho dev agent: planning intent hiện tại là docs-driven, trong đó `architecture.md` đã absorb UX decisions. Khi có khác biệt về mức chi tiết, ưu tiên architecture + UX spec hơn assumption từ story titles hoặc PRD-level wording. [Source: git log]

### Latest Technical Information

- Next.js App Router vẫn là baseline chuẩn hiện tại; giữ `src/app` structure và tận dụng current stable guidance thay vì pattern cũ của Pages Router. [Source: https://nextjs.org/docs/app]
- NestJS stable line hiện tại là 11.x và migration guide lưu ý thay đổi liên quan Express 5; nếu onboarding shell hoặc middleware cần custom routing/error handling ở backend support, hãy dùng syntax tương thích hiện hành. [Source: https://docs.nestjs.com/migration-guide] [Source: https://www.npmjs.com/package/@nestjs/core?activeTab=versions]
- Prisma stable line hiện tại là 5.x; nếu story cần đọc readiness/provisioning data từ backend side, phải bám workflow migration/generate nhất quán của monorepo, không ad-hoc schema drift. [Source: https://www.prisma.io/docs]
- Nx / Next / frontend tooling nên dùng stable line hiện hành của workspace khi materialize implementation, nhưng không được làm lệch các quyết định kiến trúc đã chốt về App Router, feature boundaries, REST contracts và state separation. [Source: https://nx.dev/docs/reference/releases] [Source: https://next-changelog.vercel.app/]

### Testing Requirements

- Unit/component tests co-located với source theo `*.spec.tsx`; accessibility và flow regression cho admin onboarding là ưu tiên cao. [Source: _bmad-output/planning-artifacts/architecture.md#File Organization Patterns]
- Tối thiểu phải chứng minh:
  - scope header luôn render đúng tenant/branch/current step;
  - stepper phản ánh đúng `active`, `completed`, `warning`, `blocked` và blocking reason;
  - readiness panel hiển thị đủ complete/missing items và đưa người dùng về đúng step;
  - inline validation liên kết đúng field/step/readiness impact;
  - keyboard navigation, focus order và semantic labels/ARIA hoạt động đúng trên các custom component chính.
- Nếu có integration wiring với provisioning result từ 1.2, thêm coverage cho việc wizard giữ context đúng sau mutation hoặc reload relevant state; không cần e2e nặng nếu unit/integration đã chứng minh behavior cốt lõi.

### Project Structure Notes

- Story này nên được coi là **UI orchestration + UX guardrails layer** nối trên foundation 1.1/1.2, không phải một story backend-heavy.
- Vì repo chưa có source tree thật, developer phải ưu tiên verify dependency state trước khi tạo/update file; mọi “update” ở đây là intended target, không phải guarantee file hiện diện.

### References

- `_bmad-output/planning-artifacts/epics.md#Epic 1: Guided Tenant & Branch Onboarding`
- `_bmad-output/planning-artifacts/prd.md#User Journeys`
- `_bmad-output/planning-artifacts/prd.md#Functional Requirements`
- `_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`
- `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`
- `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`
- `_bmad-output/planning-artifacts/architecture.md#Architectural Boundaries`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Design Direction Decision`
- `_bmad-output/planning-artifacts/ux-design-specification.md#User Journey Flows`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy`
- `_bmad-output/planning-artifacts/ux-design-specification.md#UX Consistency Patterns`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility`
- `_bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-starter-template.md`
- `_bmad-output/implementation-artifacts/1-2-tao-tenant-va-branch-dau-tien-voi-nen-du-lieu-dung-scope.md`
- `https://nextjs.org/docs/app`
- `https://next-changelog.vercel.app/`
- `https://docs.nestjs.com/migration-guide`
- `https://www.npmjs.com/package/@nestjs/core?activeTab=versions`
- `https://www.prisma.io/docs`
- `https://nx.dev/docs/reference/releases`

## Dev Agent Record

### Agent Model Used

GPT-5.4 (model ID: gpt-5.4)

### Debug Log References

- Story creation workflow synthesis from sprint status, epics, PRD, architecture, UX spec, previous story artifacts, repo inspection, git history, and current framework/version references.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story explicitly calls out the mismatch between planning state and current repository state so the dev agent does not implement against imaginary files.
- Story keeps 1.3 focused on guided UX orchestration, scope visibility, readiness signaling, inline validation, and accessibility, while preserving Story 1.4 review/publish scope.

### File List

- `_bmad-output/implementation-artifacts/1-3-guided-setup-wizard-voi-scope-header-va-readiness-panel.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
