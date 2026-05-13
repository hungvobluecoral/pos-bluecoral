# Story 1.2: Tạo tenant và branch đầu tiên với nền dữ liệu đúng scope

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a system admin,
I want to create a tenant and its first branch with persisted scoped configuration,
so that a new business unit starts from a correct operational structure.

## Acceptance Criteria

1. **Given** admin đang ở onboarding flow và nhập thông tin tenant/branch hợp lệ  
   **When** admin gửi yêu cầu tạo tenant cùng branch đầu tiên  
   **Then** API và database chỉ tạo các entity/schema cần thiết cho tenant, branch và cấu hình nền tối thiểu theo mô hình tenant-first và branch-first.
2. **Given** tenant và branch đầu tiên đang được provision  
   **When** dữ liệu được ghi xuống database  
   **Then** tenant và branch được liên kết đúng quan hệ, có unique constraints/index cần thiết và được version-control bằng Prisma migrations.
3. **Given** frontend cần giữ context nhất quán cho các bước tiếp theo  
   **When** provisioning thành công  
   **Then** response trả về đúng chuẩn `{ data, meta? }` và bao gồm `tenantId` / `branchId` cần thiết để các bước sau giữ context nhất quán.
4. **Given** xảy ra dữ liệu trùng, không hợp lệ, hoặc scope sai  
   **When** API xử lý request  
   **Then** hệ thống trả về error code ổn định theo format `{ error: { code, message, details?, requestId? } }`.
5. **Given** provisioning tenant/branch là thao tác nhạy cảm cần truy vết  
   **When** request hoàn tất hoặc thất bại có ý nghĩa bảo mật/nghiệp vụ  
   **Then** hệ thống ghi audit log provisioning với actor, tenantId, branchId và request correlation để phục vụ truy vết sau này.

## Tasks / Subtasks

- [x] Khóa prerequisite từ Story 1.1 trước khi viết business logic (AC: 1, 2, 3, 4, 5)
  - [x] Xác minh source tree thực tế đã có workspace foundation của Story 1.1: Nx monorepo, `apps/web`, `apps/api`, `libs/contracts`, Docker dev stack, REST/OpenAPI scaffold.
  - [x] Nếu foundation chưa tồn tại trong source, **không** tạo ad-hoc cấu trúc khác để “lách” Story 1.2; phải triển khai hoặc rebase trên output thật của Story 1.1 trước.
  - [x] Giữ nguyên các conventions từ Story 1.1: App Router, Nest module boundaries, REST envelope, feature-first admin onboarding shell.
- [x] Thiết kế và triển khai persistence tenant-first / branch-first bằng Prisma (AC: 1, 2)
  - [x] Cập nhật `apps/api/prisma/schema.prisma` với các model tối thiểu cho `tenants`, `branches` và configuration foundation cần thiết cho onboarding ban đầu.
  - [x] Bảo đảm branch luôn thuộc đúng tenant; không model branch như metadata rời.
  - [x] Thêm unique constraints / indexes tối thiểu cho định danh tenant, branch và tra cứu theo scope.
  - [x] Tạo Prisma migration version-controlled; không chỉnh schema “tay” mà thiếu migration.
- [x] Xây backend provisioning flow cho tenant + branch đầu tiên (AC: 1, 2, 4)
  - [x] Tạo hoặc mở rộng `tenants` module và `branches` module theo boundary `controllers/`, `services/`, `repositories/`, `dto/`, `entities/`.
  - [x] Dùng application service rõ ràng cho flow tạo tenant cùng branch đầu tiên; không cho controller thao tác Prisma trực tiếp.
  - [x] Đảm bảo transaction hoặc orchestration backend không để tenant được tạo thành công nhưng branch/config nền ở trạng thái mồ côi.
  - [x] Chuẩn hóa các conflict/error cases cho dữ liệu trùng, payload không hợp lệ, hoặc scope mismatch với error code ổn định.
- [x] Chuẩn hóa API contract, OpenAPI và shared contracts cho provisioning (AC: 3, 4)
  - [x] Định nghĩa request/response DTOs và shared contracts ở `libs/contracts` nếu thực sự được dùng bởi cả web và api.
  - [x] Trả success envelope đúng chuẩn `{ data, meta? }` với `tenantId`, `branchId` và dữ liệu tối thiểu phục vụ các bước tiếp theo của onboarding.
  - [x] Trả error envelope đúng chuẩn `{ error: { code, message, details?, requestId? } }` cho validation, conflict và scope failures.
  - [x] Cập nhật OpenAPI/Swagger cho endpoint provisioning; không để contract chỉ tồn tại “ngầm” trong code.
- [x] Gắn request correlation và audit logging cho provisioning (AC: 5)
  - [x] Tận dụng hoặc bổ sung requestId/correlation ở bootstrap/common layer theo patterns đã chốt.
  - [x] Ghi audit record cho provisioning success và các failure path cần điều tra, tối thiểu gồm actorId, tenantId, branchId, action, requestId.
  - [x] Không swallow lỗi; structured log và audit log phải phân vai rõ giữa vận hành và truy vết.
- [x] Nối onboarding UI hiện có với provisioning API theo scope nhất quán (AC: 3, 4)
  - [x] Mở rộng `apps/web/src/features/admin-onboarding/*` thay vì đẩy sớm logic vào shared UI.
  - [x] Thêm form/schema/mutation tối thiểu để admin nhập tenant + branch đầu tiên và submit qua feature API layer.
  - [x] Giữ `tenantId` / `branchId` trong flow state theo source of truth rõ ràng; không duplicate mơ hồ qua nhiều store.
  - [x] Hiển thị inline validation / error feedback gắn với đúng field hoặc bước liên quan, chuẩn bị nền cho Story 1.3.
- [x] Bổ sung test chứng minh correctness và guardrails (AC: 1, 2, 3, 4, 5)
  - [x] Unit tests cho service provisioning, validation logic, error mapping và audit behavior.
  - [x] Integration tests cho API + Prisma flow: success path, duplicate/conflict path, invalid payload, scope-related failures.
  - [x] Kiểm tra response/error envelopes và sự hiện diện của `requestId`.
  - [x] Nếu web foundation đã có test setup từ Story 1.1, thêm tests cho mutation/form handling để bảo đảm context được giữ đúng sau provisioning.

### Review Findings

- [x] [Review][Patch] Api exception filter drops standard Nest error details [apps/api/src/common/http/api-exception.filter.ts:92]
- [x] [Review][Patch] Prisma client generation is not wired into a clean install/build path [package.json:7]
- [x] [Review][Patch] Test suite stubs `global.fetch` without restoring the original implementation [apps/web/src/app/(admin)/setup/tenants/new/page.spec.tsx:5]

## Dev Notes

### Story Foundation

- Story này hiện thực hóa Story 1.2 của Epic 1: tạo tenant và branch đầu tiên với persisted scoped configuration đúng mô hình tenant-first / branch-first. [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2: Tạo tenant và branch đầu tiên với nền dữ liệu đúng scope]
- Story implement trực tiếp FR1-FR4; đồng thời phải tôn trọng NFR về tenant/branch isolation, contract stability, auditability và modular extensibility. [Source: _bmad-output/planning-artifacts/epics.md#Requirements Inventory] [Source: _bmad-output/planning-artifacts/prd.md#Domain-Specific Requirements] [Source: _bmad-output/planning-artifacts/prd.md#SaaS B2B Specific Requirements]
- User journey gốc nhấn mạnh system admin phải có thể tạo tenant + branch mới “đúng ngay từ đầu”, với guardrails chống nhầm scope. [Source: _bmad-output/planning-artifacts/prd.md#Journey 1 - System Admin nội bộ: tạo tenant và branch mới đúng ngay từ đầu] [Source: _bmad-output/planning-artifacts/prd.md#Journey 2 - System Admin nội bộ: xử lý edge case khi có nguy cơ gán nhầm tenant/branch]

### Cross-Story Context

- Story 1.2 phụ thuộc thực chất vào foundation của Story 1.1: Nx monorepo, `web` + `api`, Docker dev stack, onboarding shell, REST/OpenAPI scaffold và shared contracts baseline. [Source: _bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-starter-template.md#Tasks / Subtasks] [Source: _bmad-output/planning-artifacts/architecture.md#Decision Impact Analysis]
- Story 1.3 sẽ mở rộng guided wizard, scope header và readiness panel. Vì vậy Story 1.2 chỉ nên nối data persistence + submit flow vừa đủ, không “nuốt” luôn toàn bộ UX của 1.3. [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3: Guided setup wizard với scope header và readiness panel]
- Story 1.4 sẽ xử lý review, guardrails publish và readiness cuối. Story 1.2 không nên tự dựng review/publish flow hoàn chỉnh. [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4: Review, guardrails và publish tenant/branch an toàn]

### Current Repository State

- Repository hiện tại **chưa có source implementation thực tế** cho Nx workspace, `apps/`, `libs/`, Prisma hay Docker stack; những gì đang tồn tại chủ yếu là planning artifacts và story file 1.1. Đây là rủi ro lớn nhất cho dev agent. [Source: _bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-starter-template.md#Current Repository State]
- Vì vậy dev agent phải xem Story 1.1 là dependency kỹ thuật bắt buộc. Không được giả định rằng `apps/api/prisma/schema.prisma` hay `apps/web/src/features/admin-onboarding/*` đã có sẵn trong repo chỉ vì chúng xuất hiện trong architecture doc.
- Nếu triển khai 1.2 trên repo docs-only hiện tại, việc đầu tiên là materialize foundation theo Story 1.1 hoặc làm việc trên nhánh đã có output thật của 1.1; nếu không, mọi “update file” bên dưới phải được hiểu là **intended target files**, không phải file đang tồn tại.

### Technical Requirements

- Kiến trúc mục tiêu là **Nx integrated monorepo** với `web` (Next.js App Router) và `api` (NestJS), TypeScript-first cho cả hai phía. [Source: _bmad-output/planning-artifacts/architecture.md#Selected Starter: Nx Official Integrated Monorepo]
- Database chính là **PostgreSQL**, ORM/migrations là **Prisma**, Redis chỉ đóng vai trò support cho cache/token/rate limit chứ không là source of truth. [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- API là **REST-first** với OpenAPI/Swagger; success/error envelope là chuẩn cứng, không được thay đổi theo từng endpoint. [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns] [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- Tenant và branch là context nền xuyên schema, query filters, audit records và event payloads. Branch là security boundary độc lập, không phải field phụ. [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture] [Source: _bmad-output/planning-artifacts/prd.md#Technical Constraints]
- Audit logging, structured logging và request correlation là cross-cutting concern bắt buộc cho các thao tác nhạy cảm như tenant/branch provisioning. [Source: _bmad-output/planning-artifacts/architecture.md#Infrastructure & Deployment] [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]

### Architecture Compliance

- Chỉ `apps/api` được truy cập DB/Redis trực tiếp; `apps/web` gọi API qua `lib/api-client` và feature API hooks. [Source: _bmad-output/planning-artifacts/architecture.md#Architectural Boundaries]
- `apps/api/src/modules/*` sở hữu services, DTOs, repository contracts của module mình; không import chéo repository trực tiếp giữa modules. [Source: _bmad-output/planning-artifacts/architecture.md#Architectural Boundaries]
- `apps/web/src/features/admin-onboarding/*` sở hữu guided setup flow cho tenant + branch đầu tiên; không đẩy business orchestration sang `libs/ui`. [Source: _bmad-output/planning-artifacts/architecture.md#Architectural Boundaries] [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy]
- Shared contracts chỉ sống ở `libs/contracts` nếu thật sự dùng chung; không copy-paste DTO giữa `web` và `api`. [Source: _bmad-output/planning-artifacts/epics.md#Additional Requirements] [Source: _bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping]
- Customer và Promotion là post-MVP extension seams; không được dựng tree hoặc dependency thừa trong story này. [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions] [Source: _bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping]

### Intended Update Files

- Nếu Story 1.1 đã được materialize, Story 1.2 nhiều khả năng sẽ **update** các file sau:
  - `apps/api/prisma/schema.prisma`
  - `apps/api/src/app.module.ts`
  - `apps/api/src/main.ts` (nếu request correlation / Swagger / filters cần mở rộng)
  - `apps/api/src/common/**` cho envelopes, filters, interceptors, errors, request-id handling
  - `apps/api/src/modules/tenants/**`
  - `apps/api/src/modules/branches/**`
  - `apps/api/src/modules/audit/**`
  - `libs/contracts/src/common/**`
  - `libs/contracts/src/tenants/**`
  - `libs/contracts/src/branches/**`
  - `apps/web/src/app/(admin)/setup/tenants/new/page.tsx`
  - `apps/web/src/features/admin-onboarding/api/**`
  - `apps/web/src/features/admin-onboarding/components/**`
  - `apps/web/src/features/admin-onboarding/schemas/**`
  - `apps/web/src/features/admin-onboarding/stores/**` hoặc local state hooks nếu thật sự cần
- Vì repo hiện chưa có các file này, story implementation phải treat chúng là intended targets và tạo chúng đúng boundary thay vì “vá” vào vị trí khác.

### Intended New Files

- Các file mới nhiều khả năng cần có trong story này:
  - `apps/api/prisma/migrations/<timestamp>_create_tenant_branch_foundation/*`
  - DTOs / entities / repositories / service files cho `tenants` và `branches` modules nếu Story 1.1 chỉ mới scaffold backend trống
  - Audit event / record helpers liên quan provisioning
  - Shared contract files cho provisioning request/response nếu chưa có
  - Frontend feature-specific form schema / mutation helpers / test files cho onboarding provisioning

### Database & Domain Guardrails

- Prisma schema phải phản ánh rõ quan hệ tenant → branches và configuration nền tối thiểu; không tạo mô hình “branch standalone rồi gắn tenant sau”. [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- Naming trong DB dùng `snake_case`, còn JSON/API fields dùng `camelCase`. Đừng để Prisma model/mapper làm rò rỉ naming hỗn loạn ra API. [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns] [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- Mọi thay đổi schema phải đi qua migration version-controlled; không bỏ migration chỉ vì “repo đang greenfield”. [Source: _bmad-output/planning-artifacts/epics.md#Additional Requirements] [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- Nếu flow tạo tenant và branch là một operation nghiệp vụ duy nhất, backend phải bảo toàn tính nhất quán transactionally; không được để orphan tenant/branch khi lỗi giữa chừng.
- Chuẩn bị chỗ cho `tenant.created` / `branch.created` style events nếu story cần side effects, nhưng không dùng eventing để che business flow chính. [Source: _bmad-output/planning-artifacts/architecture.md#Communication Patterns]

### API / Audit Guardrails

- Success response luôn là `{ data, meta? }`; error response luôn là `{ error: { code, message, details?, requestId? } }`. [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- Error codes phải ổn định cho ít nhất các nhóm: validation failure, duplicate tenant/branch, scope mismatch, not found/conflict có liên quan provisioning. [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns]
- User-facing message ngắn gọn, không lộ raw Prisma/Nest exception. [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns]
- Audit log tối thiểu phải có `actorId`, `tenantId`, `branchId`, `requestId`, action và outcome; cần cả đường success và những failure path đáng điều tra. [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2: Tạo tenant và branch đầu tiên với nền dữ liệu đúng scope] [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- Structured log và audit log không thay thế nhau: log hỗ trợ debug vận hành, audit record hỗ trợ accountability/tracing.

### Frontend & UX Guardrails

- Flow vẫn phải giữ narrative “guided onboarding”, không biến thành admin CRUD page generic. [Source: _bmad-output/planning-artifacts/architecture.md#Enforcement Guidelines] [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design Direction Decision]
- Scope header / readiness / stepper là foundation từ Story 1.1 và sẽ được mở rộng ở Story 1.3; Story 1.2 chỉ cần preserve chứ không được làm vỡ semantic/status vocabulary `active`, `completed`, `warning`, `blocked`, `ready`. [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns] [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy]
- Validation phải inline và gắn với bước/field liên quan; đừng dồn mọi lỗi vào toast chung. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#User Journey Flows] [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX Consistency Patterns]
- Desktop-first vẫn là target chính; khi layout co lại, phải giữ rõ scope, progress và readiness. [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns] [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility]

### What Must Be Preserved

- Preserve App Router structure và feature-first organization của web; không lùi về Pages Router hay generic shared screen. [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- Preserve backend module boundaries; controller gọi service, service điều phối repository/Prisma, infrastructure không chứa business rule. [Source: _bmad-output/planning-artifacts/architecture.md#Architectural Boundaries]
- Preserve `libs/contracts` là nơi duy nhất cho shared contracts thật sự dùng chung; không copy DTO hai nơi. [Source: _bmad-output/planning-artifacts/epics.md#Additional Requirements]
- Preserve latest planning intent: architecture đã absorb UX, nên nếu có chỗ nào epics/PRD ngắn hơn, ưu tiên chi tiết ở `architecture.md` + `ux-design-specification.md`. [Source: _bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-starter-template.md#What Must Be Preserved]

### Previous Story Intelligence

- Story 1.1 dev notes đã khóa nhiều guardrails nền: không đưa business-specific onboarding components vào `libs/ui`, giữ guided onboarding là feature riêng, và chuẩn hóa REST/OpenAPI từ foundation. Story 1.2 phải build tiếp trên các quyết định đó thay vì “thiết kế lại” workspace. [Source: _bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-starter-template.md#Architecture Compliance] [Source: _bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-starter-template.md#API / Contract Guardrails]
- Story 1.1 cũng ghi rõ repo đang chỉ có planning artifacts và chưa có source tree thực tế. Đây là learning quan trọng nhất để tránh dev agent viết guidance dựa trên file không tồn tại. [Source: _bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-starter-template.md#Current Repository State]

### Git Intelligence Summary

- Recent repo history:
  - `bcedf4c` Update Architecture With UX
  - `8fbaefb` Add UI
  - `c308986` Add Achitecture
  - `21459e4` Add PRD
  - `7f803c2` Add Product Brief
- Ý nghĩa cho dev agent: lịch sử gần đây vẫn là **documentation-first**, chưa chứng minh Story 1.1 đã được materialize trong source. Vì vậy mọi assumption về existing implementation đều phải được verify trước khi code. [Source: git log]

### Latest Technical Information

- Giữ tất cả `nx` và `@nx/*` cùng major version; track stable line hiện tại là Nx 22.x. [Source: https://nx.dev/docs/reference/releases]
- Next.js App Router vẫn là đường chuẩn cho web app; stable line hiện tại là 16.x. [Source: https://next-changelog.vercel.app/] [Source: https://nextjs.org/docs/app]
- NestJS stable line hiện tại là 11.x và đi cùng Express 5; chú ý wildcard/route behavior mới nếu thêm bootstrap customizations hoặc fallback routes. [Source: https://docs.nestjs.com/migration-guide] [Source: https://www.npmjs.com/package/@nestjs/core?activeTab=versions]
- Prisma stable line hiện tại là 5.x; phải giữ `prisma generate`/migration workflow nhất quán trong monorepo. [Source: https://www.prisma.io/docs]
- Chọn baseline Node 20 LTS+ để thỏa mãn Next/Nest hiện hành và giữ đồng bộ với story foundation. Không downgrade Node chỉ vì requirement tối thiểu của từng framework thấp hơn.

### Testing Requirements

- Unit tests co-located với source theo `*.spec.ts` / `*.spec.tsx`; integration/e2e theo app boundary. [Source: _bmad-output/planning-artifacts/architecture.md#File Organization Patterns]
- Tối thiểu phải chứng minh:
  - provisioning flow tạo đúng tenant + branch + config nền tối thiểu;
  - unique constraints/conflict handling hoạt động đúng;
  - response/error envelope đúng chuẩn và có `requestId`;
  - audit logging được gọi với actor/scope/correlation phù hợp;
  - frontend onboarding mutation giữ được context phục vụ các bước tiếp theo.
- Ưu tiên integration tests ở API layer hơn UI e2e nặng cho story này, vì rủi ro chính nằm ở persistence correctness và contract stability.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 1.2: Tạo tenant và branch đầu tiên với nền dữ liệu đúng scope`
- `_bmad-output/planning-artifacts/epics.md#Story 1.3: Guided setup wizard với scope header và readiness panel`
- `_bmad-output/planning-artifacts/epics.md#Story 1.4: Review, guardrails và publish tenant/branch an toàn`
- `_bmad-output/planning-artifacts/epics.md#Additional Requirements`
- `_bmad-output/planning-artifacts/prd.md#Journey 1 - System Admin nội bộ: tạo tenant và branch mới đúng ngay từ đầu`
- `_bmad-output/planning-artifacts/prd.md#Journey 2 - System Admin nội bộ: xử lý edge case khi có nguy cơ gán nhầm tenant/branch`
- `_bmad-output/planning-artifacts/prd.md#Technical Constraints`
- `_bmad-output/planning-artifacts/prd.md#SaaS B2B Specific Requirements`
- `_bmad-output/planning-artifacts/architecture.md#Data Architecture`
- `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`
- `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`
- `_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`
- `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`
- `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`
- `_bmad-output/planning-artifacts/architecture.md#Architectural Boundaries`
- `_bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping`
- `_bmad-output/planning-artifacts/architecture.md#File Organization Patterns`
- `_bmad-output/planning-artifacts/architecture.md#Decision Impact Analysis`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Design Direction Decision`
- `_bmad-output/planning-artifacts/ux-design-specification.md#User Journey Flows`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy`
- `_bmad-output/planning-artifacts/ux-design-specification.md#UX Consistency Patterns`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility`
- `_bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-starter-template.md#Current Repository State`
- `_bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-starter-template.md#Architecture Compliance`
- `_bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-starter-template.md#API / Contract Guardrails`
- `_bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-starter-template.md#What Must Be Preserved`
- `https://nx.dev/docs/reference/releases`
- `https://next-changelog.vercel.app/`
- `https://nextjs.org/docs/app`
- `https://docs.nestjs.com/migration-guide`
- `https://www.npmjs.com/package/@nestjs/core?activeTab=versions`
- `https://www.prisma.io/docs`

## Dev Agent Record

### Agent Model Used

GPT-5.4 (model ID: gpt-5.4)

### Debug Log References

- Story creation workflow synthesis from sprint status, epics, PRD, architecture, UX spec, previous story file, repo inspection, git history, and current framework/version research.
- Background repo analysis confirmed current repository is documentation-only and does not yet contain the intended Nx workspace source tree.
- Reconciled the stale story tracker with the real Story 1.2 worktree, then closed the remaining gap by auditing unexpected provisioning transaction failures before rethrowing them.
- Hardened the web provisioning client with explicit envelope type guards so the current WIP source builds cleanly under production Next.js settings.
- Full validation for this story completed with `NODE_ENV=production pnpm build && pnpm test && pnpm lint` because the shared shell environment injects a non-standard `NODE_ENV` value that breaks Next.js prerendering outside production mode.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story explicitly calls out the mismatch between planning state and actual repository state so the dev agent does not implement against imaginary files.
- Story keeps 1.2 focused on tenant/branch persistence, contracts, auditability and onboarding submission, while preserving Story 1.3/1.4 scope.
- Verified Story 1.1 foundation exists in the current repo: Nx workspace, `apps/web`, `apps/api`, `libs/contracts`, Docker dev stack, request-id/error envelope middleware, Swagger scaffold, and onboarding shell are present; actual backend root module path is `apps/api/src/app/app.module.ts`.
- Completed Story 1.2 against the existing WIP source by validating Prisma persistence, transaction-scoped provisioning, REST envelopes, request correlation, audit logging, and onboarding UI wiring.
- Added failure-audit coverage for unexpected backend transaction errors and hardened the web API client response typing to keep the provisioning flow build-safe.
- Confirmed story-level behavior through API, service, and onboarding UI tests, then re-validated the repository with build, test, and lint.

### File List

- `apps/api/prisma/migrations/20260513045810_create_tenant_branch_foundation/migration.sql`
- `apps/api/prisma/migrations/migration_lock.toml`
- `apps/api/prisma/schema.prisma`
- `apps/api/src/app/app.module.ts`
- `apps/api/src/common/http/api-exception.filter.ts`
- `apps/api/src/infrastructure/prisma/prisma.module.ts`
- `apps/api/src/infrastructure/prisma/prisma.service.ts`
- `apps/api/src/modules/audit/audit.module.ts`
- `apps/api/src/modules/audit/audit.service.ts`
- `apps/api/src/modules/audit/repositories/audit-log.repository.ts`
- `apps/api/src/modules/branches/branches.module.ts`
- `apps/api/src/modules/branches/repositories/branches.repository.ts`
- `apps/api/src/modules/tenants/dto/provision-tenant.dto.ts`
- `apps/api/src/modules/tenants/entities/provision-tenant-response.entity.ts`
- `apps/api/src/modules/tenants/repositories/tenants.repository.ts`
- `apps/api/src/modules/tenants/tenant-provisioning.http.spec.ts`
- `apps/api/src/modules/tenants/tenant-provisioning.service.spec.ts`
- `apps/api/src/modules/tenants/tenant-provisioning.service.ts`
- `apps/api/src/modules/tenants/tenants.controller.ts`
- `apps/api/src/modules/tenants/tenants.module.ts`
- `apps/web/next-env.d.ts`
- `apps/web/src/app/(admin)/setup/tenants/new/page.spec.tsx`
- `apps/web/src/app/(admin)/setup/tenants/new/page.tsx`
- `apps/web/src/features/admin-onboarding/api/provision-tenant.ts`
- `apps/web/src/features/admin-onboarding/components/readiness-panel.tsx`
- `apps/web/src/features/admin-onboarding/components/scope-header.tsx`
- `apps/web/src/features/admin-onboarding/components/setup-stepper.tsx`
- `apps/web/src/features/admin-onboarding/components/tenant-provisioning-shell.tsx`
- `apps/web/src/features/admin-onboarding/schemas/provision-tenant-form.ts`
- `libs/contracts/src/index.ts`
- `libs/contracts/src/tenants/index.ts`
- `libs/contracts/src/tenants/provision-tenant.ts`
- `_bmad-output/implementation-artifacts/1-2-tao-tenant-va-branch-dau-tien-voi-nen-du-lieu-dung-scope.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-05-13: completed Story 1.2 by reconciling the existing provisioning WIP with the story tracker, adding failure-audit handling for unexpected backend errors, hardening the web API client envelope typing, and validating build/test/lint end to end.
