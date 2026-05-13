---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/product-brief-POS_BlueCoral.md"
  - "_bmad-output/planning-artifacts/research/domain-medusajs-research-2026-05-12.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
workflowType: 'architecture'
lastStep: 8
status: 'complete'
project_name: 'POS_BlueCoral'
user_name: 'Hung'
date: '2026-05-13'
completedAt: '2026-05-13'
---

# Architecture Decision Document

_This document is the architecture source of truth derived from the latest PRD, with product brief and research retained as supporting context, and UX specification added as an additional current input._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
Hệ thống hiện có 35 functional requirements, nhưng scope triển khai được chia pha rõ ràng. MVP tập trung vào các capability lõi để chứng minh tenant/branch correctness và modular extensibility: Multi Tenant, Branch, Staff/RBAC, Product, Order, Inventory và Payment. Customer và Promotion vẫn được kiến trúc dự phòng từ đầu, nhưng theo PRD chúng là capability **post-MVP**, không phải module bắt buộc của implementation phase đầu tiên. Ngoài capability backend, trải nghiệm cốt lõi của V1 xoay quanh flow **system admin tạo tenant + branch đầu tiên đúng scope ngay từ đầu**, cùng các flow vận hành branch cho store manager và staff/cashier mà không mất branch context.

**Non-Functional Requirements:**
Những NFR có ảnh hưởng kiến trúc mạnh nhất là tenant/branch isolation, RBAC theo scope, reliability của các flow chính, khả năng tăng số tenant/branch mà không làm vỡ mô hình quyền, cùng hiệu năng đủ tốt để các thao tác vận hành chính phản hồi quanh ngưỡng mục tiêu 2 giây trong điều kiện bình thường. PRD cũng yêu cầu rất rõ rằng hiệu năng không được đánh đổi bằng cách nới lỏng guardrails. Từ UX, accessibility ở mức **WCAG AA**, keyboard-first support cho các flow quản trị, và khả năng giữ scope/progress/readiness rõ ràng trên desktop-first layouts cũng trở thành NFR thực thụ.

**UX & Operational Experience Requirements:**
UX specification chốt rằng V1 phải ưu tiên **system admin nội bộ trên desktop back-office**, với cảm giác bình tĩnh, kiểm soát tốt và tự tin rằng hệ thống đang bảo vệ họ khỏi sai scope. Điều này kéo theo một số yêu cầu kiến trúc trực tiếp: cần một guided linear setup flow, context header/breadcrumb bền vững, readiness/review patterns, validation theo ngữ cảnh, và component strategy đủ linh hoạt để biểu diễn “scope-aware + readiness-aware” xuyên suốt các màn hình. Tablet được hỗ trợ gần ngang desktop, còn mobile chỉ là bối cảnh tối thiểu ở giai đoạn đầu.

**Scale & Complexity:**
Dự án có mức phức tạp cao vì đồng thời chứa:
- Multi-tenancy + branch-level isolation
- RBAC theo tenant/branch scope
- POS operational flows với order, inventory, payment
- Guided admin onboarding UX có guardrails mạnh
- Mở rộng capability theo pha mà không làm drift kiến trúc

- Primary domain: SaaS B2B POS multi-tenant
- Complexity level: cao / enterprise-leaning
- Estimated architectural components: khoảng 10-12 khối chính ở MVP, cộng thêm extension seams cho post-MVP

### Technical Constraints & Dependencies

PRD và UX cùng chỉ ra các ràng buộc cứng sau:
- Tenant và branch phải là context nền của mọi module, mọi contract và mọi UI flow quan trọng.
- “Đúng tenant nhưng sai branch” là failure mode độc lập, phải được detect và chặn rõ ràng.
- Kiến trúc ưu tiên **modular monolith** trước, nhưng phải đủ sạch để selective extraction về sau không phá boundaries.
- UI V1 là **desktop-first web app** cho back-office, tối ưu mouse + keyboard, không tối ưu mobile-first.
- Flow tạo tenant/branch đầu tiên phải là trải nghiệm trọng tâm, không phải một tập màn hình rời rạc.
- Customer và Promotion phải được giữ như extension path có chủ đích, không làm phình MVP foundation.

### Cross-Cutting Concerns Identified

Các concern xuyên suốt có ảnh hưởng trực tiếp tới mọi quyết định về sau gồm:
- Tenant isolation và branch isolation
- RBAC theo tenant/branch scope
- Scope visibility trên UI và API contracts
- Guided validation + readiness signaling cho admin flows
- Auditability cho thao tác nhạy cảm
- Integration consistency giữa các module
- Accessibility và keyboard-first interaction cho flow nhiều bước
- Khả năng thêm module mới mà không làm lỏng guardrails hiện có

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web platform theo hướng monorepo: một web app desktop-first cho admin/vận hành và một backend API/domain layer rõ module boundaries.

### Starter Options Considered

**1. Nx Official Integrated Monorepo**
- Trạng thái: phù hợp nhất cho workspace full-stack có nhiều apps/libs
- Phù hợp vì hỗ trợ tốt cả Next.js và NestJS trong cùng một dependency graph
- Điểm mạnh: monorepo orchestration, workspace libs, generator-based workflow, phù hợp modular monolith nhiều bounded contexts
- Điểm cần chấp nhận: cấu hình ban đầu nhiều hơn scaffold đơn lẻ

**2. Turborepo Official Starter**
- Điểm mạnh: DX tốt và build orchestration mạnh
- Hạn chế trong bối cảnh này: NestJS không phải first-class path tự nhiên như Nx; team sẽ phải tự chuẩn hóa thêm nhiều conventions backend/frontend

**3. Next.js + Nest CLI riêng lẻ**
- Điểm mạnh: bám sát CLI chính thức của từng framework
- Hạn chế: thiếu workspace foundation chung, dễ làm drift conventions giữa app web, app api và shared libs ngay từ đầu

### Selected Starter: Nx Official Integrated Monorepo

**Rationale for Selection:**
Nx vẫn là lựa chọn đúng nhất sau khi đối chiếu lại PRD và UX. PRD cần modular monolith rõ domain boundaries; UX cần một frontend đủ lớn để tổ chức guided admin flows, custom patterns và shared UI tokens một cách nhất quán. Nx cho phép dựng `web`, `api` và `libs/*` trong cùng một workspace có dependency graph rõ, từ đó giúp AI agents không bị drift khi phát triển song song. Đây cũng là nền tảng hợp lý để giữ MVP nhỏ nhưng có extension seams cho post-MVP modules như Customer và Promotion.

**Initialization Command:**

```bash
npx create-nx-workspace@latest pos-bluecoral --preset=apps --packageManager=pnpm
cd pos-bluecoral
nx add @nx/next
nx g @nx/next:app web --appDir --srcDir
nx add @nx/nest
nx g @nx/nest:app api
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript-first workspace cho cả Next.js frontend và NestJS backend, phù hợp với nhu cầu shared contracts và consistent implementation.

**Styling Solution:**
Workspace foundation sẽ kết hợp **Tailwind CSS + shadcn/ui** ở app `web`, vì UX spec đã chốt một themeable design system với shadcn/ui làm primitive layer và một pattern layer riêng cho POS_BlueCoral.

**Build Tooling:**
Nx cung cấp task graph, caching, project boundaries và workspace orchestration phù hợp cho multi-app repository có nhiều libs shared.

**Testing Framework:**
Nx giúp duy trì test targets nhất quán theo app/lib; đây là nền tốt để sau đó thêm unit, integration và e2e theo boundaries đã định.

**Code Organization:**
Tổ chức theo `apps/` và `libs/`, rất phù hợp để tách web app, api app, shared contracts, auth helpers, UI primitives và domain-specific modules.

**Development Experience:**
Generator-based workflow, dependency graph rõ và khả năng mở rộng dần từ MVP sang các phase sau mà không phá cấu trúc nền.

**Note:** Project initialization với Nx phải là implementation story đầu tiên; setup Tailwind + shadcn/ui cho `web` là story nền ngay sau đó.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Workspace foundation: Nx integrated monorepo với Next.js + NestJS.
- Architectural style: modular monolith, domain boundaries rõ, chỉ extraction khi thật sự cần.
- Primary database: PostgreSQL cho transactional multi-tenant data.
- ORM and migrations: Prisma với migration workflow version-controlled.
- Supporting infra: Redis cho rate limiting, token/session support và cache có chủ đích.
- Authentication: access JWT ngắn hạn + refresh token rotation.
- Authorization: RBAC theo tenant/branch scope; branch là security boundary độc lập.
- API style: REST-first, có OpenAPI/Swagger contract.
- Frontend stack: Next.js App Router + TanStack Query + Zustand + React Hook Form.
- UI system: Tailwind CSS + shadcn/ui primitives + POS_BlueCoral-specific pattern layer.
- Experience direction: desktop-first admin UX với guided linear flow, scope header, readiness panel và review step.
- MVP scope: chỉ triển khai foundation cho Multi Tenant, Branch, Staff/RBAC, Product, Order, Inventory, Payment; Customer và Promotion là extension path post-MVP.
- Development environment: app chạy local/dev; PostgreSQL và Redis khởi động bằng Docker.

**Important Decisions (Shape Architecture):**
- Data model phải tenant-first và branch-first xuyên schema, indexes, query filters và audit trails.
- Validation chia lớp: transport/contract validation ở boundary, business invariants ở application/domain layer.
- Audit logging cho auth, role changes, tenant/branch provisioning, inventory/payment/order actions nhạy cảm.
- Responsive strategy: desktop-first, tablet gần ngang desktop, mobile tối thiểu.
- Accessibility target: WCAG AA, keyboard-first cho wizard/form/dialog/review flows.
- Pattern layer phải ưu tiên “scope-aware + readiness-aware” hơn dashboard generic.
- Post-MVP modules phải cắm vào cùng contract và boundary model, không tạo exception riêng.

**Deferred Decisions (Post-MVP):**
- Production hosting target cụ thể (AWS/ECS, Railway, Render, v.v.).
- Payment provider cụ thể.
- Customer và Promotion implementation chi tiết.
- External event bus hoặc service extraction beyond modular monolith.
- Báo cáo vận hành, analytics stack và observability vendor cụ thể.
- Mobile-first expansion beyond lightweight access.

### Data Architecture

- **Database:** PostgreSQL là lựa chọn chính cho transactional data của POS multi-tenant.
- **ORM:** Prisma được dùng cho schema, migrations và type-safe data access.
- **Data modeling approach:** tenant và branch phải xuất hiện rõ trong schema, indexes, repository filters, audit records và event payloads; branch không bao giờ bị xem là metadata phụ.
- **Domain partitioning:** MVP schema tập trung vào tenants, branches, staff, auth, products, orders, inventory, payments và audit. Customer/Promotion không được ép vào phase đầu nếu chưa cần cho capability lõi.
- **Validation strategy:** validate request shape ở API boundary; business correctness và scope correctness giữ ở service/domain layer.
- **Migration approach:** mọi schema thay đổi đều đi qua migrations version-controlled; migration là một phần chính thức của implementation flow.
- **Caching strategy:** Redis chỉ dùng cho rate limiting, token/session support và selective caching; không là source of truth.

### Authentication & Security

- **Authentication model:** access JWT ngắn hạn + refresh token rotation.
- **Authorization model:** RBAC theo tenant/branch scope; scope mismatch phải có error code rõ ràng.
- **Security boundaries:** tenant boundary và branch boundary đều phải enforce xuyên UI route guards, API guards, service layer và data-access layer.
- **Sensitive operations:** tenant/branch provisioning, role assignment, payment recording, inventory adjustment và publish/go-live actions cần audit logging rõ.
- **UI security posture:** context tenant/branch phải luôn hiện diện trên các flow nhạy cảm; UI không được che giấu scope hiện tại ở những bước có khả năng gây sai lệch.

### API & Communication Patterns

- **Primary API style:** REST-first.
- **API contract/documentation:** OpenAPI/Swagger để thống nhất contract giữa frontend, backend và AI agents.
- **Scope propagation:** mọi request và response liên quan domain nghiệp vụ phải giữ tenantId/branchId rõ ở route, body, claims hoặc metadata phù hợp.
- **Error handling:** backend chuẩn hóa error format và error codes, đặc biệt cho validation, authn/authz, scope mismatch, conflict và not-found.
- **Internal communication:** application services là mặc định; domain events chỉ dùng cho side effects hoặc cross-module reactions có kiểm soát.
- **External communication:** hiện vẫn giữ trong modular monolith; không thiết kế quanh distributed services ở phase đầu.

### Frontend Architecture

- **Routing model:** Next.js App Router.
- **Server state:** TanStack Query là lớp chuẩn cho fetch/cache/invalidation/prefetch.
- **Client/UI state:** Zustand chỉ giữ UI state cục bộ như wizard progress, temporary interaction state, filter state hoặc shell state; không cache lâu dài server data.
- **Forms:** React Hook Form cho admin setup flows, auth, staff management và các form nghiệp vụ phức tạp.
- **Component architecture:** chia theo feature/module boundaries; custom “scope-aware” patterns ở lại gần feature trước khi trích xuất.
- **Dashboard surface:** admin dashboard không chỉ là CTA entry point mà còn là tenant overview surface tối thiểu; tenant count/list nên nằm ở boundary rõ ràng trong dashboard feature thay vì trộn vào onboarding shell.
- **Design system:** shadcn/ui là primitive layer; POS_BlueCoral-specific patterns gồm setup wizard stepper, scope header/context bar, readiness panel/checklist, review summary panel, risk alert và permission/config summary blocks.
- **Responsive direction:** desktop-first, tablet support gần ngang desktop; mobile chỉ tối thiểu cho tra cứu/flow nhẹ.
- **Accessibility direction:** WCAG AA, keyboard navigation đầy đủ, semantic HTML/ARIA cho stepper, alerts, validation summary và readiness states.
- **Performance direction:** tận dụng Server Components cho shell/data phù hợp, giữ client state tối thiểu cần thiết và tránh nhồi logic vào global stores.

Tenant overview trên dashboard, nếu cần backend support, phải đi qua read endpoint hoặc service riêng cho summary/list và vẫn tuân theo shared REST envelope cùng scope semantics hiện có; không được tạo API ad-hoc phá vỡ contract chung của onboarding/admin surfaces.

### Infrastructure & Deployment

- **Dev/runtime baseline:** app chạy local/dev; PostgreSQL và Redis khởi động bằng Docker để onboarding đơn giản.
- **Container posture:** backend và supporting services phải container-ready ngay từ đầu.
- **CI/CD direction:** pipeline nên build/test theo monorepo targets và tôn trọng app/lib boundaries.
- **Observability baseline:** structured logging, audit logging và request correlation đủ sớm để debug sai scope xuyên module.
- **Production hosting:** deferred intentionally; kiến trúc không phụ thuộc vào một cloud vendor cụ thể ở giai đoạn này.

### Decision Impact Analysis

**Implementation Sequence:**
1. Khởi tạo Nx monorepo, tạo `web` và `api`.
2. Thiết lập Tailwind + shadcn/ui foundation cho `web`.
3. Dựng Docker dev cho PostgreSQL + Redis.
4. Xây schema tenant/branch-first và migration foundation với Prisma.
5. Thiết kế auth module với JWT + refresh rotation + RBAC theo scope.
6. Dựng guided admin onboarding foundation: setup wizard, scope header, readiness panel, review step.
7. Chuẩn hóa REST contracts, error format và shared contracts/libs.
8. Xây MVP modules: tenants, branches, staff, products, orders, inventory, payments.
9. Bổ sung audit logging, rate limiting và accessibility/regression checks cho các flow nhạy cảm.

**Cross-Component Dependencies:**
- Tenant/branch data model chi phối auth, authorization, query filters, audit log, API contracts và UI context rendering.
- Guided admin onboarding UX chi phối route structure, component boundaries, error semantics và state model của frontend.
- REST contract và error standard chi phối shared DTO/contracts giữa `web` và `api`.
- Việc để Customer/Promotion ở post-MVP yêu cầu structure có sẵn extension seams nhưng không làm phình MVP tree.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
14 nhóm điểm xung đột tiềm năng nơi AI agents có thể chọn khác nhau nếu không được khóa quy ước trước, đặc biệt ở scope propagation, guided flow semantics và MVP vs post-MVP boundaries.

### Naming Patterns

**Database Naming Conventions:**
- Table names dùng **snake_case, plural**: `tenants`, `branches`, `orders`, `inventory_adjustments`.
- Column names dùng **snake_case**: `tenant_id`, `branch_id`, `created_at`, `updated_at`.
- Foreign keys theo mẫu **`<entity>_id`**.
- Index names theo mẫu: `idx_<table>__<column_list>`.
- Unique constraints theo mẫu: `uq_<table>__<column_list>`.

**API Naming Conventions:**
- REST resources dùng **plural nouns**: `/tenants`, `/branches`, `/orders`.
- Nested scope rõ ràng khi cần: `/tenants/:tenantId/branches/:branchId/orders`.
- URL path segments dùng **kebab-case** nếu có nhiều từ.
- Route params và query params dùng **camelCase** ở contract phía app/backend: `tenantId`, `branchId`, `pageSize`.
- Không dùng verb trong endpoint trừ action đặc biệt có side effect rõ: `POST /orders/:orderId/cancel`.

**Code Naming Conventions:**
- TypeScript variables/functions: **camelCase**.
- Classes, DTOs, React components, types/interfaces/enums: **PascalCase**.
- File names: **kebab-case** cho source files (`branch-access.guard.ts`, `setup-wizard-stepper.tsx`).
- React component exports vẫn dùng PascalCase dù file name là kebab-case.
- Tên component/pattern liên quan UX phải phản ánh intent rõ: `scope-header`, `readiness-panel`, `review-summary-panel`.

### Structure Patterns

**Project Organization:**
- `apps/web` chứa UI theo **feature/domain-first**.
- `apps/api` chứa backend theo **module/domain-first**.
- `libs/contracts` chỉ chứa shared contracts thực sự dùng ở nhiều app/module.
- `libs/ui` chỉ chứa UI primitives, tokens và generic hooks; business-specific scope/readiness patterns ưu tiên ở `apps/web/src/features/*` cho tới khi đủ reusable.
- Unit tests **co-located** với source dưới dạng `*.spec.ts` / `*.spec.tsx`.
- E2E tests tách theo app/project boundary.

**File Structure Patterns:**
- Backend domain module ưu tiên cấu trúc: `controllers/`, `services/`, `repositories/`, `dto/`, `entities/` hoặc biến thể tương đương miễn nhất quán.
- Frontend feature ưu tiên cấu trúc: `components/`, `hooks/`, `api/`, `stores/`, `schemas/`.
- Zod schemas, DTOs và contract mappers sống gần nơi dùng nhất; chỉ đưa vào `libs/` nếu thật sự shared.
- Các component phục vụ guided setup flow phải sống cùng feature admin onboarding, không rơi vào “shared dumping ground”.
- Customer và Promotion không tạo tree MVP trống; chỉ thêm khi bước vào phase tương ứng.

### Format Patterns

**API Response Formats:**
- Success responses chuẩn hóa theo wrapper nhẹ: `{ data, meta? }`.
- Error responses chuẩn hóa: `{ error: { code, message, details?, requestId? } }`.
- Không trả raw strings hoặc raw ORM errors ra ngoài API.
- Date/time trong API luôn là **ISO-8601 UTC string**.
- IDs trong JSON giữ theo convention camelCase ở API layer dù DB là snake_case.

**Data Exchange Formats:**
- API JSON fields dùng **camelCase**.
- Boolean luôn là `true/false`, không dùng `0/1` ở API contract.
- `null` chỉ dùng khi field thực sự mang nghĩa “không có giá trị”.
- Danh sách luôn trả array, kể cả rỗng.
- Wizard/review state dùng vocabulary thống nhất: `active`, `completed`, `warning`, `blocked`, `ready`.

### Communication Patterns

**Event System Patterns:**
- Event names dùng **dot-separated past tense**: `tenant.created`, `branch.created`, `order.completed`, `inventory.adjusted`.
- Event payload chuẩn hóa tối thiểu: `eventId`, `eventVersion`, `occurredAt`, `tenantId`, `branchId` (nếu có), `actorId` (nếu có), `data`.
- Event versioning bắt đầu từ `v1` ở metadata, không encode version vào event name trừ khi có breaking change thật.
- Domain events chỉ dùng cho side effects và cross-module reactions, không che business flow chính.

**State Management Patterns:**
- Server state luôn qua **TanStack Query**.
- Zustand chỉ giữ UI state, interaction state, wizard state, filter state hoặc shell-level state thật sự cần.
- Query keys theo mẫu: `['domain', tenantId, branchId, identifierOrParams]`.
- State updates phải **immutable và explicit**.
- Scope context không được duplicate một cách mơ hồ giữa nhiều stores; source of truth của scope phải rõ ràng ở route/session/query context.

### Process Patterns

**Error Handling Patterns:**
- Backend dùng exception mapping tập trung từ domain/app errors sang API error format chuẩn.
- User-facing error messages phải ngắn, rõ, không lộ chi tiết kỹ thuật nội bộ.
- Với guided admin flows, error cần chỉ rõ **bước nào sai**, **scope nào bị ảnh hưởng**, và **còn thiếu gì để đạt readiness**.
- Structured logs tách bạch giữa `message` cho vận hành và `details/context` cho debugging.
- Các lỗi authz/authn, scope mismatch, validation, conflict, not-found phải có error code ổn định.

**Loading State Patterns:**
- Loading state local dùng tên chuẩn như `isLoading`, `isFetching`, `isSubmitting`, `isPending`.
- Không tạo global loading store trừ khi là app bootstrap hoặc shell-level transition thật sự cần.
- Retry mặc định chỉ áp dụng cho **idempotent reads**; mutation retries phải cân nhắc nghiệp vụ.
- Skeleton/placeholders phải giữ layout ổn định ở wizard, readiness panel và review screens.

**Accessibility & Responsive Patterns:**
- Keyboard navigation là first-class requirement cho wizard, form, dialog và review steps.
- Không dùng màu như tín hiệu duy nhất cho scope, risk hoặc readiness.
- Khi responsive làm giảm không gian hiển thị, luôn giữ lại 3 yếu tố: context scope, progress hiện tại, readiness status.
- Tablet dùng progressive collapse; mobile chỉ hỗ trợ các action nhẹ và tra cứu cơ bản ở phase đầu.

### Enforcement Guidelines

**All AI Agents MUST:**
- Giữ tenant/branch context nhất quán giữa route, guard, service, query và UI rendering.
- Tôn trọng MVP boundaries; không tự thêm `customers`/`promotions` vào foundation khi chưa có story phase tương ứng.
- Dùng đúng naming conventions giữa DB, API và code.
- Chuẩn hóa responses, errors, events, query keys, wizard states và readiness semantics theo tài liệu này.
- Giữ guided linear admin flow và scope visibility làm nguyên tắc thiết kế, không refactor thành dashboard generic.

**Pattern Enforcement:**
- Review thay đổi dựa trên architecture document này trước khi merge.
- Nếu một pattern chưa đủ rõ, cập nhật architecture doc trước khi tạo ngoại lệ.
- Pattern violations phải được xem như architecture drift, không phải stylistic preference.

### Pattern Examples

**Good Examples:**
- Table: `inventory_adjustments`
- API: `GET /tenants/:tenantId/branches/:branchId/orders`
- File: `setup-wizard-stepper.tsx`
- Response: `{ data: { orderId: 'ord_123' } }`
- Error: `{ error: { code: 'BRANCH_SCOPE_MISMATCH', message: 'Branch scope is invalid', requestId: 'req_1' } }`
- Query key: `['orders', tenantId, branchId, { status, page }]`
- UI state: `status: 'warning'` khi thiếu bước readiness

**Anti-Patterns:**
- Trộn `camelCase` và `snake_case` ngẫu nhiên trong API payload.
- Dùng Zustand để cache lâu dài dữ liệu server vốn đã có trong TanStack Query.
- Đặt business-specific scope/readiness components sâu vào `libs/ui` quá sớm.
- Tạo sẵn tree rỗng cho `customers`/`promotions` trong MVP chỉ để “chuẩn bị trước”.
- Trả raw Prisma/Nest exception trực tiếp ra client.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
pos-bluecoral/
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── nx.json
├── tsconfig.base.json
├── .gitignore
├── .editorconfig
├── .env.example
├── docker-compose.dev.yml
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── quality.yml
├── apps/
│   ├── web/
│   │   ├── project.json
│   │   ├── next.config.ts
│   │   ├── postcss.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   ├── public/
│   │   │   └── assets/
│   │   └── src/
│   │       ├── app/
│   │       │   ├── layout.tsx
│   │       │   ├── globals.css
│   │       │   ├── login/
│   │       │   │   └── page.tsx
│   │       │   ├── (admin)/
│   │       │   │   ├── dashboard/
│   │       │   │   │   └── page.tsx
│   │       │   │   └── setup/
│   │       │   │       └── tenants/
│   │       │   │           └── new/
│   │       │   │               └── page.tsx
│   │       │   └── tenants/
│   │       │       └── [tenantId]/
│   │       │           └── branches/
│   │       │               └── [branchId]/
│   │       │                   ├── page.tsx
│   │       │                   ├── orders/
│   │       │                   │   └── page.tsx
│   │       │                   ├── products/
│   │       │                   │   └── page.tsx
│   │       │                   ├── inventory/
│   │       │                   │   └── page.tsx
│   │       │                   ├── staff/
│   │       │                   │   └── page.tsx
│   │       │                   └── payments/
│   │       │                       └── page.tsx
│   │       ├── features/
│   │       │   ├── admin-onboarding/
│   │       │   │   ├── components/
│   │       │   │   ├── hooks/
│   │       │   │   ├── api/
│   │       │   │   ├── schemas/
│   │       │   │   └── stores/
│   │       │   ├── auth/
│   │       │   ├── tenants/
│   │       │   ├── branches/
│   │       │   ├── staff/
│   │       │   ├── products/
│   │       │   ├── orders/
│   │       │   ├── inventory/
│   │       │   ├── payments/
│   │       │   └── audit/
│   │       ├── components/
│   │       │   ├── ui/
│   │       │   ├── layouts/
│   │       │   └── guards/
│   │       ├── providers/
│   │       ├── lib/
│   │       │   ├── api-client/
│   │       │   ├── auth/
│   │       │   ├── query/
│   │       │   └── utils/
│   │       ├── middleware.ts
│   │       └── test-setup.ts
│   ├── api/
│   │   ├── project.json
│   │   ├── nest-cli.json
│   │   ├── tsconfig.app.json
│   │   ├── tsconfig.spec.json
│   │   ├── .env.example
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── config/
│   │   │   ├── common/
│   │   │   │   ├── decorators/
│   │   │   │   ├── filters/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── pipes/
│   │   │   │   ├── errors/
│   │   │   │   └── constants/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── tenants/
│   │   │   │   ├── branches/
│   │   │   │   ├── staff/
│   │   │   │   ├── products/
│   │   │   │   ├── orders/
│   │   │   │   ├── inventory/
│   │   │   │   ├── payments/
│   │   │   │   ├── audit/
│   │   │   │   └── health/
│   │   │   ├── infrastructure/
│   │   │   │   ├── prisma/
│   │   │   │   ├── redis/
│   │   │   │   ├── logging/
│   │   │   │   └── events/
│   │   │   └── bootstrap/
│   │   └── test/
│   │       ├── integration/
│   │       └── e2e/
│   ├── web-e2e/
│   └── api-e2e/
├── libs/
│   ├── contracts/
│   │   └── src/
│   │       ├── auth/
│   │       ├── tenants/
│   │       ├── branches/
│   │       ├── staff/
│   │       ├── products/
│   │       ├── orders/
│   │       ├── inventory/
│   │       ├── payments/
│   │       └── common/
│   ├── ui/
│   │   └── src/
│   │       ├── components/
│   │       ├── tokens/
│   │       └── hooks/
│   ├── auth/
│   │   └── src/
│   │       ├── constants/
│   │       ├── types/
│   │       └── utils/
│   ├── shared/
│   │   └── src/
│   │       ├── dates/
│   │       ├── errors/
│   │       ├── pagination/
│   │       └── validation/
│   └── tooling/
│       └── src/
├── docs/
│   └── architecture/
└── tools/
    ├── scripts/
    └── generators/
```

### Architectural Boundaries

**API Boundaries:**
- `apps/api/src/modules/*/controllers` là ranh giới HTTP duy nhất ra ngoài.
- AuthN/AuthZ được enforce tại `common/guards`, decorators và auth module; frontend không tự quyết scope.
- Chỉ `apps/api` được truy cập DB/Redis trực tiếp.
- `apps/web` chỉ gọi API qua `lib/api-client` + feature API hooks.

**Component Boundaries:**
- `apps/web/src/features/admin-onboarding/*` sở hữu guided setup flow cho tenant + branch đầu tiên.
- `apps/web/src/features/*` chứa UI/business interaction theo domain.
- `apps/web/src/components/ui` chỉ chứa UI primitives/layout helpers, không chứa domain logic.
- Scope/readiness-specific components ở lại cùng feature cho tới khi thật sự reusable.
- Shared UI trong `libs/ui` chỉ chứa primitives/tokens/hook chung, không chứa business orchestration.

**Service Boundaries:**
- Mỗi module backend trong `modules/*` sở hữu application services, DTOs và repository contracts của chính nó.
- Cross-module integration đi qua services hoặc domain events; không import chéo repository trực tiếp giữa modules.
- `infrastructure/*` chỉ cung cấp adapter kỹ thuật, không chứa business rules.

**Data Boundaries:**
- Prisma schema và migrations thuộc ownership của `apps/api`.
- Repository/data-access logic nằm trong từng module hoặc adapter Prisma liên quan, không rải rác toàn repo.
- Redis chỉ dùng cho cache/rate limit/token-support, không làm source of truth.
- Tenant/branch scope phải xuất hiện xuyên schema, query filters, audit records và event payloads.

### Requirements to Structure Mapping

**Feature/Epic Mapping:**
- Tenant & Branch governance → `apps/api/src/modules/tenants`, `apps/api/src/modules/branches`, `apps/web/src/features/admin-onboarding`, `apps/web/src/features/tenants`, `apps/web/src/features/branches`
- Staff & RBAC → `apps/api/src/modules/staff`, `apps/api/src/modules/auth`, `apps/web/src/features/staff`, `apps/web/src/features/auth`
- Product management → `apps/api/src/modules/products` + `apps/web/src/features/products`
- Order & checkout → `apps/api/src/modules/orders` + `apps/web/src/features/orders`
- Inventory management → `apps/api/src/modules/inventory` + `apps/web/src/features/inventory`
- Payment handling → `apps/api/src/modules/payments` + `apps/web/src/features/payments`
- Audit / sensitive actions → `apps/api/src/modules/audit` + `apps/web/src/features/audit`
- Customer / Promotion (post-MVP) → thêm theo cùng pattern ở phase sau, không nằm trong implementation tree ban đầu

**Cross-Cutting Concerns:**
- Contracts/DTO alignment → `libs/contracts`
- Shared auth constants/types → `libs/auth`
- Shared generic validation/errors/pagination/date helpers → `libs/shared`
- UI primitives/design tokens → `libs/ui`
- Logging, Redis, Prisma, events adapters → `apps/api/src/infrastructure`

### Integration Points

**Internal Communication:**
- Web → API qua REST client + TanStack Query.
- API controllers → application services → repositories/adapters.
- Guided admin onboarding flow gọi qua dedicated feature API layer, không truy cập shared data trực tiếp.
- Shared contracts/types đi qua `libs/contracts`, không copy-paste DTOs giữa app.

**External Integrations:**
- PostgreSQL qua Prisma.
- Redis qua infrastructure adapter.
- Payment provider tương lai phải đi qua `apps/api/src/modules/payments` + adapter tương ứng, không gọi trực tiếp từ module khác.

**Data Flow:**
- Admin action ở guided setup flow → feature mutation layer → REST endpoint → Nest controller → service → repository/Prisma → DB.
- Auth/permission checks xảy ra trước business action.
- Audit logging và domain events chạy như side effects có kiểm soát sau khi pass authorization/business validation.
- Scope context phải được render ở UI trước và sau mutation để người dùng không mất ngữ cảnh.

### File Organization Patterns

**Configuration Files:**
- Root giữ config monorepo, workspace, CI và Docker dev.
- App-specific config sống trong `apps/web` và `apps/api`.
- Shared tooling scripts/generators ở `tools/`.

**Source Organization:**
- Domain-first ở cả web lẫn api.
- Guided onboarding flow là một feature riêng, không bị hòa tan vào generic dashboard code.
- Chỉ phần thật sự reusable mới được đi vào `libs/`.
- Không tạo “shared dumping ground”.

**Test Organization:**
- Unit tests co-located với source.
- Integration/e2e tests tách theo app boundary: `apps/api/test`, `apps/web-e2e`, `apps/api-e2e`.
- Accessibility và flow regression tests phải ưu tiên cho admin onboarding journey.
- Test fixtures/helpers nằm gần test suite sở hữu chúng.

**Asset Organization:**
- Static assets của web ở `apps/web/public/assets`.
- Docs architecture nội bộ ở `docs/architecture/` khi cần output bổ sung ngoài BMAD artifacts.

### Development Workflow Integration

**Development Server Structure:**
- `apps/web` và `apps/api` chạy độc lập trong dev.
- PostgreSQL và Redis khởi động bằng `docker-compose.dev.yml`.
- Nx targets điều phối chạy song song theo app/lib boundaries.

**Build Process Structure:**
- Build và test theo target của từng app/lib.
- Shared libs build/typecheck trước các apps phụ thuộc.
- Monorepo graph dùng để tránh chạy dư thừa.

**Deployment Structure:**
- Cấu trúc hiện tại hỗ trợ tách deploy web và api sau này.
- `apps/api` container-ready; `apps/web` giữ độc lập để có thể deploy riêng.
- Việc defer production hosting không làm đổi boundaries hiện tại.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
Các quyết định công nghệ hiện tại vẫn tương thích tốt với nhau và giờ đã khớp hơn với bộ tài liệu đầu vào hiện tại. Nx phù hợp cho monorepo gồm Next.js và NestJS; PostgreSQL + Prisma phù hợp cho backend transactional multi-tenant; Redis hỗ trợ tốt cho rate limiting và token support; App Router + TanStack Query + Zustand + React Hook Form tạo ra frontend model rõ ràng; Tailwind + shadcn/ui phù hợp trực tiếp với UX strategy desktop-first, guided flow và custom pattern layer. Không còn mâu thuẫn đáng kể giữa architecture doc và PRD, trong khi brief/research vẫn giữ vai trò bối cảnh hỗ trợ và UX bổ sung thêm các quyết định giao diện/vận hành cần thiết.

**Pattern Consistency:**
Bộ implementation patterns hiện hỗ trợ đồng thời các quyết định kiến trúc và intent UX: DB dùng snake_case trong khi API/code dùng camelCase/PascalCase; response/error/event/query-key formats đã đủ để tránh drift giữa agents; guided flow semantics như scope/readiness/wizard states cũng đã được khóa quy ước.

**Structure Alignment:**
Project structure đã được chỉnh để phản ánh đúng scope hiện tại: `admin-onboarding` là feature nền của V1, còn `customers`/`promotions` không còn được xem như module implementation mặc định của MVP. `apps/web`, `apps/api` và `libs/*` vẫn có boundaries rõ; `apps/api` là nơi duy nhất sở hữu DB/Redis; `apps/web` bám feature-first và guided-flow-first cho admin setup.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
Dù không có epic files riêng, toàn bộ các nhóm feature từ PRD đã có hỗ trợ kiến trúc rõ ràng. MVP capabilities được map trực tiếp vào module/backend boundary và feature/frontend boundary: tenant governance, branch management, staff & RBAC, product, orders, inventory, payments, audit. Customer và Promotion đã được giữ dưới dạng extension seams post-MVP thay vì bị ép vào phase đầu.

**Functional Requirements Coverage:**
35 functional requirements hiện đã được phản ánh đúng hơn:
- FR1-FR24 và FR29-FR35 được cover trực tiếp bởi decisions, patterns và structure MVP.
- FR25-FR28 về Customer và Promotion được support ở mức architectural extension path, phù hợp với PRD post-MVP scope.
- Các journey cho system admin, store manager và staff/cashier đều đã có boundary và flow ownership rõ.

**Non-Functional Requirements Coverage:**
- Security: được bao phủ bởi JWT + refresh rotation, RBAC theo tenant/branch, guard-based enforcement, audit logging và scope visibility.
- Performance: được hỗ trợ bằng server/client state separation, Redis hỗ trợ selective caching/rate limiting và desktop-first UI giảm complexity không cần thiết ở V1.
- Scalability: được hỗ trợ bởi modular monolith boundaries và extension path cho post-MVP modules.
- Reliability: guardrails, readiness signaling và scope propagation rules giúp ngăn lỗi sai tenant/sai branch lan xuyên module.
- Accessibility: WCAG AA, keyboard-first flows, semantic patterns và responsive priorities đã được đưa thành quyết định kiến trúc.

### Implementation Readiness Validation ✅

**Decision Completeness:**
Các critical decisions đã đủ rõ để bắt đầu implementation: stack, data layer, auth model, API style, UI system, responsive/accessibility strategy, MVP scope và dev/runtime baseline.

**Structure Completeness:**
Project tree đã đủ cụ thể để AI agents biết code nên sống ở đâu, integration point nằm ở đâu và phần nào thuộc ownership của `web`, `api`, `libs/ui`, `libs/contracts` hay feature `admin-onboarding`.

**Pattern Completeness:**
Những điểm dễ gây xung đột nhất giữa agents — naming, structure, response format, event naming, loading/error handling, state boundaries, wizard/readiness semantics và MVP boundaries — đều đã được khóa quy ước với ví dụ cụ thể.

### Gap Analysis Results

**Critical Gaps:**
- Không có critical gap đang mở.

**Important Gaps:**
- Chưa chốt production hosting target cụ thể; đây là defer có chủ đích.
- Chưa chốt payment provider cụ thể.
- Chưa có access-control matrix chi tiết theo role/tenant/branch; nên bổ sung ở giai đoạn story design.

**Nice-to-Have Gaps:**
- Có thể bổ sung observability vendor/log pipeline cụ thể khi bước vào implementation planning.
- Có thể bổ sung test matrix chi tiết cho admin onboarding + branch operation flows.
- Có thể bổ sung extension blueprint riêng cho Customer và Promotion khi bước sang phase 2.

### Validation Issues Addressed

Các issue chính đã được xử lý trong lần cập nhật này:
- Giữ nguyên product brief và research trong `inputDocuments`, đồng thời bổ sung thêm UX specification như một tài liệu đầu vào mới.
- Loại bỏ giả định rằng Customer và Promotion là phần implementation mặc định của MVP.
- Thêm các quyết định còn thiếu từ UX: desktop-first strategy, shadcn/ui, guided linear flow, readiness patterns, accessibility target và responsive priorities.

### Architecture Completeness Checklist

**Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**

- [x] Critical decisions documented with versions or stable technology choices
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** high

**Key Strengths:**
- Kiến trúc giờ bám sát PRD hiện tại, vẫn giữ product brief và research làm bối cảnh tham chiếu, và bổ sung thêm UX làm nguồn quyết định cho phần trải nghiệm/giao diện.
- Tenant/branch correctness đã được phản ánh xuyên data, auth, API, structure và UX patterns.
- Guided admin onboarding đã trở thành phần kiến trúc lõi thay vì chỉ là chi tiết UI.
- MVP boundaries rõ hơn, giảm rủi ro build thừa hoặc drift sang post-MVP quá sớm.

**Areas for Future Enhancement:**
- Chốt production hosting khi chuẩn bị pilot/deployment thật.
- Bổ sung payment provider decision và observability vendor decision khi implementation đi sâu hơn.
- Viết thêm access-control matrix và phase-2 extension blueprint cho Customer/Promotion.

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented.
- Use implementation patterns consistently across all components.
- Respect project structure, MVP boundaries and scope-propagation rules.
- Refer to this document for all architectural questions.

**First Implementation Priority:**
Khởi tạo Nx monorepo, tạo `web` và `api`, sau đó dựng Tailwind + shadcn/ui foundation cho `web`, rồi thiết lập guided admin onboarding skeleton cùng PostgreSQL + Redis cho local/dev trước khi đi sâu vào schema, auth và shared contracts.
