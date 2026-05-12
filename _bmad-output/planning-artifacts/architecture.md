---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/product-brief-POS_BlueCoral.md"
  - "_bmad-output/planning-artifacts/research/domain-medusajs-research-2026-05-12.md"
workflowType: 'architecture'
lastStep: 8
status: 'complete'
project_name: 'POS_BlueCoral'
user_name: 'Hung'
date: '2026-05-12'
completedAt: '2026-05-12'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
Hệ thống có 35 yêu cầu chức năng, tập trung thành 8 cụm năng lực chính. Nhóm thứ nhất là tenant & branch governance, nơi system admin tạo tenant, tạo branch, gán cấu hình nền và được bảo vệ khỏi thao tác sai scope. Nhóm thứ hai là access control & staff management, yêu cầu RBAC không chỉ theo role mà còn theo tenant/branch scope. Nhóm thứ ba và thứ tư bao phủ product/catalog cùng order/checkout, cho thấy các flow bán hàng phải luôn mang context branch rõ ràng. Nhóm thứ năm kết hợp inventory và payment, nhấn mạnh việc cập nhật tồn kho và ghi nhận thanh toán phải đúng với order và đúng scope vận hành. Nhóm thứ sáu là customer và promotion, hiện ở mức capability cần thiết nhưng vẫn phải tuân thủ tenant/branch rules. Nhóm thứ bảy là internal module coordination, hàm ý hệ thống cần contract liên module rõ ràng. Nhóm cuối cùng là platform safety & expansion, cho thấy kiến trúc phải bảo toàn correctness khi product mở rộng thêm capability mới.

**Non-Functional Requirements:**
Các NFR quan trọng nhất là tenant/branch isolation, RBAC theo scope, reliability của flow chính, khả năng mở rộng số tenant/branch mà không làm vỡ mô hình quyền và dữ liệu, cùng hiệu năng đủ tốt cho thao tác vận hành chính. PRD cũng đặt yêu cầu rõ rằng hiệu năng không được đánh đổi bằng cách nới lỏng guardrails. Ngoài ra, integration consistency là một NFR ngầm nhưng rất mạnh: mọi contract giữa module phải giữ nguyên tenant/branch context.

**Scale & Complexity:**
Dự án có mức phức tạp cao vì đồng thời chứa multi-tenancy, branch-level isolation, POS operational flows, payment/inventory coupling, và yêu cầu mở rộng module về sau mà không phá ranh giới kiến trúc.

- Primary domain: SaaS B2B POS multi-tenant
- Complexity level: cao / enterprise-leaning
- Estimated architectural components: khoảng 10-12 khối chính nếu tách theo bounded contexts và cross-cutting services

### Technical Constraints & Dependencies

PRD đã thể hiện một số ràng buộc định hướng quan trọng: hệ thống đi theo modular architecture, ưu tiên modular monolith có thể selective extraction khi cần; tenant và branch phải là context nền của mọi module; contract giữa các module phải mang theo scope rõ ràng; hệ thống chưa cần chốt framework compliance đầy đủ nhưng payment/privacy/auditability đã là concern bắt buộc; và kiến trúc không được phụ thuộc vào giả định “chỉ đúng ở mức tenant là đủ”.

### Cross-Cutting Concerns Identified

Các concern xuyên suốt gồm tenant isolation, branch isolation, RBAC theo tenant/branch, auditability cho thao tác nhạy cảm, integration contracts giữa module, consistency của context khi đi qua nhiều flow, và khả năng quan sát lỗi sai scope trước khi chúng lan ra toàn hệ thống. Đây sẽ là các trục ảnh hưởng trực tiếp đến hầu hết quyết định kiến trúc về sau.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web platform theo hướng monorepo, dựa trên yêu cầu SaaS B2B POS multi-tenant với frontend quản trị/vận hành và backend API/domain layer tách rõ.

### Starter Options Considered

**1. Nx Official Integrated Monorepo**
- Trạng thái: maintained chính thức bởi Nx team
- Phiên bản create CLI đã kiểm tra trên web: `create-nx-workspace@22.7.0`
- Phù hợp vì hỗ trợ chính thức cả Next.js và NestJS generators trong cùng workspace
- Điểm mạnh: monorepo orchestration, workspace libs, dependency graph, generator-first workflow, phù hợp modular monolith nhiều bounded contexts
- Điểm cần chấp nhận: cấu hình ban đầu nhiều hơn create-next-app thuần

**2. Turborepo Official Starter**
- Trạng thái: maintained chính thức bởi Vercel
- Phiên bản create CLI đã kiểm tra trên web: `create-turbo@2.9.12`
- Điểm mạnh: rất tốt cho monorepo performance và DX
- Hạn chế với bối cảnh hiện tại: không cung cấp NestJS như first-class starter; cần lắp backend thủ công hoặc ghép thêm Nest CLI

**3. Next.js + Nest CLI riêng lẻ**
- Next.js CLI đã kiểm tra trên web: `create-next-app@16.2.4`
- Nest CLI đã kiểm tra trên web: `@nestjs/cli@11.0.21`
- Điểm mạnh: bám sát công cụ chính thức từng framework
- Hạn chế: thiếu workspace foundation chung, dễ phát sinh drift về conventions giữa web/app/backend/lib ngay từ đầu

**4. Next Forge**
- Lệnh init hiện tại vẫn tồn tại: `npx next-forge@latest init`
- Tuy nhiên tín hiệu maintenance/compatibility năm 2026 không đủ mạnh để dùng làm nền móng dài hạn cho dự án này

### Selected Starter: Nx Official Integrated Monorepo

**Rationale for Selection:**
Nx là lựa chọn phù hợp nhất với POS_BlueCoral vì dự án cần đồng thời: (1) frontend Next.js, (2) backend NestJS, (3) shared libraries cho domain contracts, types, auth, utilities và test support, và (4) cấu trúc monorepo đủ kỷ luật để AI agents triển khai nhất quán. So với Turborepo, Nx phù hợp hơn ở giai đoạn khởi tạo vì Next.js và NestJS đều là first-class generators. So với cách scaffold rời từng app, Nx giảm nguy cơ lệch convention và hỗ trợ tách bounded contexts rõ ràng ngay từ đầu.

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
TypeScript-first workspace, phù hợp với cả Next.js frontend và NestJS backend trong cùng một hệ conventions.

**Styling Solution:**
Starter Nx không ép chặt một styling system ở cấp workspace; quyết định styling có thể giữ linh hoạt cho app `web`, nhưng hướng an toàn là bám theo setup mặc định hiện hành của Next.js app generator.

**Build Tooling:**
Nx cung cấp workspace orchestration, target graph, caching, task pipelines và tooling phù hợp cho multi-app repository.

**Testing Framework:**
Nx tạo nền kiểm thử theo từng project/app/lib và giữ test targets nhất quán trong workspace; điều này hỗ trợ tốt cho việc chia domain thành nhiều libraries.

**Code Organization:**
Tổ chức theo `apps/` và `libs/`, rất phù hợp để tách web app, api app, shared contracts, domain libraries, infrastructure libraries và cross-cutting concerns.

**Development Experience:**
Generator-based workflow, consistent scripts, dependency graph, monorepo-aware commands, và khả năng mở rộng thêm app/lib mà không phá cấu trúc nền.

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Workspace foundation: Nx integrated monorepo với Next.js + NestJS.
- Primary database: PostgreSQL 17.x theo hướng conservative stable line.
- ORM and migrations: Prisma ORM 7.8.0 với migration workflow tập trung.
- Cache/supporting infra: Redis 8.6.3 cho cache, rate limiting, token/session support khi cần.
- Authentication: access JWT ngắn hạn + refresh token rotation.
- Authorization: RBAC theo tenant/branch scope, coi branch là security boundary riêng.
- API style: REST-first, có OpenAPI/Swagger contract.
- Frontend state model: App Router + TanStack Query 5 cho server state + Zustand 5 cho client/UI state + React Hook Form 7 cho form phức tạp.
- Development environment: app chạy local/dev, PostgreSQL và Redis khởi động bằng Docker.

**Important Decisions (Shape Architecture):**
- Kiến trúc ưu tiên modular monolith, domain boundaries rõ, communication nội bộ qua application services và domain events khi cần.
- Validation chia lớp: contract validation ở boundary, domain invariants ở service/domain layer.
- Auditability cho thao tác nhạy cảm như auth, role changes, discount override, inventory adjustments.
- Rate limiting cho endpoint nhạy cảm dùng Redis-backed strategy.
- Container-ready architecture để sau này đưa lên cloud không phải đổi mô hình runtime.

**Deferred Decisions (Post-MVP):**
- Production hosting target cụ thể (AWS/ECS, Railway, Render, v.v.).
- External event bus hoặc service extraction beyond modular monolith.
- GraphQL hoặc BFF riêng.
- Advanced caching ngoài các use case nền tảng.
- Multi-region, HA topology và scaling policy chi tiết.

### Data Architecture

- **Database:** PostgreSQL 17.x được chọn thay vì 18.3 để ưu tiên độ chín hệ sinh thái và giảm rủi ro ở giai đoạn đầu.
- **ORM:** Prisma ORM 7.8.0 được chọn vì migration tooling mạnh, type-safe client tốt, và phù hợp với tốc độ triển khai của team intermediate.
- **Data modeling approach:** tenant và branch là scope nền, phải xuất hiện rõ trong schema, indexes, access patterns và audit trails; không coi branch chỉ là metadata phụ.
- **Validation strategy:** validate payload ở API boundary, nhưng business correctness giữ ở application/domain layer để tránh phụ thuộc hoàn toàn vào transport.
- **Migration approach:** schema migrations version-controlled qua Prisma; migration phải được xem như một phần của implementation flow chính thức.
- **Caching strategy:** Redis 8.6.3 dùng cho cache có chủ đích, rate limiting, và hỗ trợ auth/session-token concerns; không biến Redis thành source of truth.

### Authentication & Security

- **Authentication model:** access JWT ngắn hạn + refresh token rotation.
- **Authorization model:** RBAC theo tenant/branch scope; “đúng tenant nhưng sai branch” được xem là security failure mode độc lập.
- **Security boundaries:** tenant boundary và branch boundary đều phải enforce xuyên API, service, query layer và audit logs.
- **Sensitive operations:** discount override, inventory adjustment, role assignment, tenant/branch provisioning đều cần audit log và policy checks rõ ràng.
- **API security strategy:** token validation tập trung, guard-based authorization ở backend, và Redis hỗ trợ rate limiting cho endpoint nhạy cảm.

### API & Communication Patterns

- **Primary API style:** REST-first.
- **API contract/documentation:** OpenAPI/Swagger để thống nhất contract giữa frontend, backend và AI agents.
- **Error handling:** chuẩn lỗi nhất quán ở backend, tránh mỗi module trả lỗi theo format riêng.
- **Internal communication:** application services là mặc định; domain events dùng cho các hành vi bất đồng bộ hoặc cross-module side effects khi cần.
- **External communication:** chưa tách thành distributed services; mọi giao tiếp hiện đi theo hướng modular monolith trước.

### Frontend Architecture

- **Routing model:** Next.js App Router.
- **Server state:** TanStack Query 5.100.10 là lớp chuẩn cho fetch/cache/invalidation/prefetch.
- **Client/UI state:** Zustand 5.0.13 dành cho UI state ngắn hạn, POS interaction state và context cục bộ không nên nhồi vào server-state cache.
- **Forms:** React Hook Form 7.75.0 cho flow cấu hình, auth, quản trị và form nghiệp vụ phức tạp.
- **Component architecture:** UI nên chia theo feature/module boundaries thay vì theo loại component thuần túy, để giữ consistency với backend bounded contexts.
- **Performance direction:** tận dụng Server Components cho shell và dữ liệu phù hợp, giữ client state ở mức tối thiểu cần thiết.

### Infrastructure & Deployment

- **Dev/runtime baseline:** app chạy local/dev; PostgreSQL và Redis khởi động bằng Docker để giữ onboarding đơn giản.
- **Container posture:** backend và supporting services phải container-ready ngay từ đầu.
- **CI/CD direction:** chưa chốt platform production, nhưng pipeline nên giả định kiểm thử và build theo monorepo targets.
- **Observability baseline:** structured logging, audit logging cho security-sensitive flows, và metrics/log hooks đủ sớm để hỗ trợ debug cross-module.
- **Production hosting:** deferred intentionally; kiến trúc không được phụ thuộc vào một cloud vendor cụ thể ở giai đoạn này.

### Decision Impact Analysis

**Implementation Sequence:**
1. Khởi tạo Nx monorepo và tạo app `web` + `api`.
2. Thiết lập PostgreSQL + Redis bằng Docker cho local/dev.
3. Xây schema tenant/branch-first và migration foundation với Prisma.
4. Thiết kế auth module với JWT + refresh rotation + RBAC theo scope.
5. Chuẩn hóa REST contracts và error format.
6. Xây shared contracts/libs cho frontend-backend consistency.
7. Thiết lập frontend data/state layers theo App Router + TanStack Query + Zustand + RHF.
8. Bổ sung audit logging và rate limiting cho các flow nhạy cảm.

**Cross-Component Dependencies:**
- Data model tenant/branch chi phối auth, authorization, query filtering, audit log và API contracts.
- Auth strategy chi phối cách frontend quản lý session state, token refresh và protected routes.
- REST contract và error standard chi phối shared DTO/contracts giữa `web` và `api`.
- Việc defer production hosting khiến code cần container-ready nhưng không được gắn chặt vào vendor-specific services.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
12 nhóm điểm xung đột tiềm năng nơi AI agents có thể chọn khác nhau nếu không được khóa quy ước trước.

### Naming Patterns

**Database Naming Conventions:**
- Table names dùng **snake_case, plural**: `tenants`, `branches`, `orders`, `inventory_adjustments`.
- Column names dùng **snake_case**: `tenant_id`, `branch_id`, `created_at`, `updated_at`.
- Foreign keys theo mẫu **`<entity>_id`**.
- Join table đặt theo 2 danh từ chính ở dạng plural snake_case nếu cần: `staff_roles`, `branch_staff_assignments`.
- Index names theo mẫu: `idx_<table>__<column_list>`.
- Unique constraints theo mẫu: `uq_<table>__<column_list>`.

**API Naming Conventions:**
- REST resources dùng **plural nouns**: `/tenants`, `/branches`, `/orders`.
- Nested scope rõ ràng khi cần: `/tenants/:tenantId/branches/:branchId/orders`.
- URL path segments dùng **kebab-case** nếu có nhiều từ.
- Route params và query params dùng **camelCase** ở contract phía app/backend: `tenantId`, `branchId`, `pageSize`.
- Không dùng verb trong endpoint trừ action thật sự đặc biệt: ưu tiên `POST /orders/:orderId/cancel` thay vì `/cancelOrder`.

**Code Naming Conventions:**
- TypeScript variables/functions: **camelCase**.
- Classes, DTOs, React components, types/interfaces/enums: **PascalCase**.
- File names: **kebab-case** cho source files (`tenant-guard.ts`, `create-order.dto.ts`, `branch-selector.tsx`).
- Nest module structure names phản ánh domain rõ ràng: `orders.module.ts`, `orders.service.ts`, `orders.controller.ts`.
- React component exports vẫn dùng PascalCase dù file name là kebab-case.

### Structure Patterns

**Project Organization:**
- `apps/web` chứa UI theo **feature/domain-first**.
- `apps/api` chứa backend theo **module/domain-first**.
- `libs/` dùng cho shared contracts, shared utilities, auth helpers, UI primitives, và domain-shared logic có chủ đích.
- Không đặt business logic vào `libs/shared` nếu logic đó thực chất thuộc một bounded context cụ thể.
- Unit tests **co-located** với source dưới dạng `*.spec.ts` / `*.spec.tsx`.
- E2E tests tách theo app/project boundary.

**File Structure Patterns:**
- Backend domain module ưu tiên cấu trúc: `controllers/`, `services/`, `repositories/`, `dto/`, `entities/` hoặc biến thể tương đương miễn nhất quán toàn repo.
- Frontend feature ưu tiên cấu trúc: `components/`, `hooks/`, `api/`, `stores/`, `schemas/`.
- Zod schemas, DTOs, và contract mappers phải sống gần nơi dùng nhất; chỉ đưa vào `libs/` nếu thật sự shared.
- Environment config tách rõ `web` và `api`; không đọc env chéo app.

### Format Patterns

**API Response Formats:**
- Success responses chuẩn hóa theo wrapper nhẹ: `{ data, meta? }`.
- Error responses chuẩn hóa: `{ error: { code, message, details?, requestId? } }`.
- Không trả raw strings hoặc raw ORM errors ra ngoài API.
- Date/time trong API luôn là **ISO-8601 UTC string**.
- IDs trong JSON giữ theo convention camelCase ở API layer, dù DB là snake_case.

**Data Exchange Formats:**
- API JSON fields dùng **camelCase**.
- Boolean luôn là `true/false`, không dùng `0/1` ở API contract.
- `null` chỉ dùng khi field thực sự có ý nghĩa “không có giá trị”; tránh lẫn giữa `undefined`, missing field, và `null`.
- Danh sách luôn trả array, kể cả rỗng; object đơn không bọc trong array.

### Communication Patterns

**Event System Patterns:**
- Event names dùng **dot-separated past tense**: `tenant.created`, `branch.assigned`, `order.completed`, `inventory.adjusted`.
- Event payload chuẩn hóa tối thiểu: `eventId`, `eventVersion`, `occurredAt`, `tenantId`, `branchId` (nếu có), `actorId` (nếu có), `data`.
- Event versioning bắt đầu từ `v1` ở metadata, không encode version vào name trừ khi thật sự cần breaking change.
- Domain events dùng cho side effects và cross-module reactions, không dùng để che giấu business flow chính.

**State Management Patterns:**
- Server state luôn qua **TanStack Query**; không duplicate server state dài hạn vào Zustand.
- Zustand chỉ giữ UI state, interaction state, wizard state, filter state, cart/session-local state khi thật sự cần.
- Query keys theo mẫu: `['domain', scope, identifier, params]`.
- State updates phải **immutable và explicit**.
- Async mutation side effects phải đi qua mutation handlers + query invalidation rõ ràng.

### Process Patterns

**Error Handling Patterns:**
- Backend dùng exception mapping tập trung từ domain/app errors sang API error format chuẩn.
- User-facing error messages ngắn, rõ, không lộ chi tiết kỹ thuật nội bộ.
- Structured logs phải tách bạch giữa `message` cho người vận hành và `details/context` cho debugging.
- Các lỗi authz/authn, scope mismatch, validation, conflict, not-found phải có error code ổn định.

**Loading State Patterns:**
- Loading state local dùng tên chuẩn như `isLoading`, `isFetching`, `isSubmitting`, `isPending`.
- Không tạo global loading store trừ khi là app bootstrap hoặc shell-level transition thật sự cần.
- Retry mặc định chỉ áp dụng cho **idempotent reads**; mutation retries phải cân nhắc nghiệp vụ.
- Form submit/loading state nằm trong form flow, không kéo vào global app state nếu không cần.

### Enforcement Guidelines

**All AI Agents MUST:**
- Giữ domain boundaries nhất quán giữa `apps/web`, `apps/api`, và `libs/`.
- Dùng đúng naming conventions giữa DB, API và code thay vì tự chọn kiểu riêng.
- Chuẩn hóa responses, errors, events, query keys và loading states theo tài liệu này.

**Pattern Enforcement:**
- Review thay đổi dựa trên architecture document này trước khi merge.
- Nếu một pattern chưa đủ rõ, cập nhật architecture doc trước khi tạo thêm ngoại lệ mới.
- Pattern violations phải được xem như architecture drift, không phải stylistic preference.

### Pattern Examples

**Good Examples:**
- Table: `inventory_adjustments`
- API: `GET /tenants/:tenantId/branches/:branchId/orders`
- File: `branch-access.guard.ts`
- Response: `{ data: { orderId: 'ord_123' } }`
- Error: `{ error: { code: 'BRANCH_SCOPE_MISMATCH', message: 'Branch scope is invalid', requestId: 'req_1' } }`
- Event: `order.completed`
- Query key: `['orders', tenantId, branchId, { status, page }]`

**Anti-Patterns:**
- Trộn `camelCase` và `snake_case` ngẫu nhiên trong API payload.
- Dùng Zustand để cache lâu dài dữ liệu server vốn đã có trong TanStack Query.
- Đặt business logic domain sâu vào `shared` chỉ vì nhiều module cùng gọi.
- Endpoint kiểu RPC như `/createOrder`, `/getBranchOrders` khi không thực sự cần.
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
│       └── typecheck-test.yml
├── apps/
│   ├── web/
│   │   ├── project.json
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   ├── public/
│   │   │   └── assets/
│   │   └── src/
│   │       ├── app/
│   │       │   ├── layout.tsx
│   │       │   ├── page.tsx
│   │       │   ├── globals.css
│   │       │   ├── login/
│   │       │   │   └── page.tsx
│   │       │   └── (dashboard)/
│   │       │       ├── layout.tsx
│   │       │       ├── tenants/
│   │       │       │   └── [tenantId]/
│   │       │       │       ├── page.tsx
│   │       │       │       ├── branches/
│   │       │       │       │   └── [branchId]/
│   │       │       │       │       ├── page.tsx
│   │       │       │       │       ├── orders/
│   │       │       │       │       │   └── page.tsx
│   │       │       │       │       ├── products/
│   │       │       │       │       │   └── page.tsx
│   │       │       │       │       ├── inventory/
│   │       │       │       │       │   └── page.tsx
│   │       │       │       │       ├── customers/
│   │       │       │       │       │   └── page.tsx
│   │       │       │       │       ├── staff/
│   │       │       │       │       │   └── page.tsx
│   │       │       │       │       ├── promotions/
│   │       │       │       │       │   └── page.tsx
│   │       │       │       │       └── payments/
│   │       │       │       │           └── page.tsx
│   │       ├── features/
│   │       │   ├── auth/
│   │       │   │   ├── components/
│   │       │   │   ├── hooks/
│   │       │   │   ├── api/
│   │       │   │   └── schemas/
│   │       │   ├── tenants/
│   │       │   ├── branches/
│   │       │   ├── orders/
│   │       │   ├── products/
│   │       │   ├── inventory/
│   │       │   ├── customers/
│   │       │   ├── staff/
│   │       │   ├── promotions/
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
│   │       ├── stores/
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
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── strategies/
│   │   │   │   │   └── auth.module.ts
│   │   │   │   ├── tenants/
│   │   │   │   ├── branches/
│   │   │   │   ├── staff/
│   │   │   │   ├── products/
│   │   │   │   ├── pricing-promotions/
│   │   │   │   ├── customers/
│   │   │   │   ├── orders/
│   │   │   │   ├── payments/
│   │   │   │   ├── inventory/
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
│   │       ├── orders/
│   │       ├── products/
│   │       ├── inventory/
│   │       ├── payments/
│   │       ├── customers/
│   │       ├── staff/
│   │       └── promotions/
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
- AuthN/AuthZ được enforce tại `common/guards`, decorators và module auth; frontend không tự quyết scope.
- Chỉ `apps/api` được truy cập DB/Redis trực tiếp.
- `apps/web` chỉ gọi API qua `lib/api-client` + feature API hooks.

**Component Boundaries:**
- `apps/web/src/features/*` là nơi chứa UI/business interaction theo domain.
- `apps/web/src/components/ui` chỉ chứa UI primitives, không chứa domain logic.
- Zustand stores không vượt ranh giới feature nếu không thật sự global.
- Shared UI trong `libs/ui`, nhưng business components ở lại trong `apps/web/src/features/*`.

**Service Boundaries:**
- Mỗi module backend trong `modules/*` sở hữu application services, DTOs và repository contracts của chính nó.
- Cross-module integration đi qua services hoặc domain events; không import chéo repository trực tiếp giữa modules.
- `infrastructure/*` cung cấp adapter kỹ thuật, không chứa business rules.

**Data Boundaries:**
- Prisma schema và migrations thuộc ownership của `apps/api`.
- Repository/data-access logic nằm trong từng module hoặc adapter Prisma liên quan, không rải rác toàn repo.
- Redis chỉ dùng cho cache/rate limit/token-support, không làm source of truth.
- Tenant/branch scope phải xuất hiện xuyên schema, query filters, audit records và event payloads.

### Requirements to Structure Mapping

**Feature/Epic Mapping:**
- Tenant governance → `apps/api/src/modules/tenants` + `apps/web/src/features/tenants`
- Branch management → `apps/api/src/modules/branches` + `apps/web/src/features/branches`
- Staff & RBAC → `apps/api/src/modules/staff`, `apps/api/src/modules/auth` + `apps/web/src/features/staff`, `apps/web/src/features/auth`
- Product/catalog → `apps/api/src/modules/products` + `apps/web/src/features/products`
- Pricing/promotion → `apps/api/src/modules/pricing-promotions` + `apps/web/src/features/promotions`
- Customer management → `apps/api/src/modules/customers` + `apps/web/src/features/customers`
- Order/checkout → `apps/api/src/modules/orders` + `apps/web/src/features/orders`
- Payment handling → `apps/api/src/modules/payments` + `apps/web/src/features/payments`
- Inventory update flow → `apps/api/src/modules/inventory` + `apps/web/src/features/inventory`
- Audit/sensitive actions → `apps/api/src/modules/audit` + `apps/web/src/features/audit`

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
- Cross-module side effects qua domain events khi cần.
- Shared contracts/types đi qua `libs/contracts`, không copy-paste DTOs giữa app.

**External Integrations:**
- PostgreSQL qua Prisma.
- Redis qua infrastructure adapter.
- Payment provider tương lai phải đi qua `apps/api/src/modules/payments` + adapter tương ứng, không gọi trực tiếp từ module khác.

**Data Flow:**
- User action ở `apps/web/src/features/*` → query/mutation layer → REST endpoint → Nest controller → service → repository/Prisma → DB.
- Auth/permission checks xảy ra trước business action.
- Audit logging và domain events chạy như side effects có kiểm soát sau khi pass authorization/business validation.

### File Organization Patterns

**Configuration Files:**
- Root giữ config monorepo, workspace, CI và Docker dev.
- App-specific config sống trong `apps/web` và `apps/api`.
- Shared tooling scripts/generators ở `tools/`.

**Source Organization:**
- Domain-first ở cả web lẫn api.
- Chỉ phần thật sự reusable mới được đi vào `libs/`.
- Không tạo “shared dumping ground”.

**Test Organization:**
- Unit tests co-located với source.
- Integration/e2e tests tách theo app boundary: `apps/api/test`, `apps/web-e2e`, `apps/api-e2e`.
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
Các quyết định công nghệ hiện tại tương thích tốt với nhau. Nx phù hợp cho monorepo gồm Next.js và NestJS; PostgreSQL 17 + Prisma 7.8.0 phù hợp cho backend transactional multi-tenant; Redis 8.6.3 hỗ trợ tốt cho rate limiting và cache phụ trợ; App Router + TanStack Query + Zustand + React Hook Form tạo ra frontend model rõ ràng, không chồng lấn trách nhiệm. Không phát hiện quyết định nào mâu thuẫn trực tiếp với nhau.

**Pattern Consistency:**
Bộ implementation patterns hỗ trợ đúng các quyết định kiến trúc: DB dùng snake_case trong khi API/code dùng camelCase/PascalCase đã được khóa quy tắc rõ; response/error/event/query-key formats đã đủ để tránh drift giữa agents; domain-first structure nhất quán với modular monolith và FR mapping.

**Structure Alignment:**
Project structure hỗ trợ đúng các architectural decisions đã chốt. `apps/web`, `apps/api`, và `libs/*` có boundaries rõ; `apps/api` là nơi duy nhất sở hữu DB/Redis; `apps/web` bám feature-first; shared code chỉ đi qua `libs` khi thật sự reusable. Structure này hỗ trợ cả local/dev trước mắt và container-ready path về sau.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
Dù không có epics riêng, toàn bộ các nhóm feature từ PRD đã được map đầy đủ vào module/backend boundary và feature/frontend boundary: tenant governance, branch management, staff & RBAC, product/catalog, pricing/promotions, customers, orders/checkout, payments, inventory, audit.

**Functional Requirements Coverage:**
35 functional requirements hiện đã có hỗ trợ kiến trúc tương ứng. Các FR về tenant/branch isolation, RBAC theo scope, order/payment/inventory coordination, và cross-module consistency đều được phản ánh trong decisions, patterns, và structure.

**Non-Functional Requirements Coverage:**
- Security: được bao phủ bởi JWT + refresh rotation, RBAC theo tenant/branch, error handling chuẩn hóa, audit logging, và boundary enforcement.
- Performance: được hỗ trợ bằng server/client state separation, Redis hỗ trợ selective caching/rate limiting, và monorepo structure giúp tổ chức build/test hiệu quả.
- Scalability: được hỗ trợ bởi modular monolith boundaries, event-ready integration points, container-ready posture và khả năng tách deploy web/api sau này.
- Compliance/supportability: payment/privacy/auditability đã có architectural hooks, dù compliance framework cụ thể vẫn chưa cần chốt ở giai đoạn hiện tại.

### Implementation Readiness Validation ✅

**Decision Completeness:**
Các critical decisions đã được ghi đủ rõ để bắt đầu implementation: stack, data layer, auth model, API style, frontend state model, dev/runtime baseline. Những phần deferred còn lại không chặn story khởi tạo nền móng.

**Structure Completeness:**
Project tree đã đủ cụ thể để AI agents biết code nên sống ở đâu, integration point nằm ở đâu, và phần nào thuộc ownership của web, api hay shared libs.

**Pattern Completeness:**
Những điểm dễ gây xung đột nhất giữa agents — naming, structure, response format, event naming, loading/error handling, state boundaries — đều đã được khóa quy ước với ví dụ cụ thể.

### Gap Analysis Results

**Critical Gaps:**
- Không có critical gap đang mở.

**Important Gaps:**
- Chưa chốt production hosting target cụ thể; đây là defer có chủ đích, không chặn implementation phase đầu.
- Chưa chốt payment provider cụ thể; hiện đã có boundary rõ để tích hợp sau mà không phá kiến trúc.

**Nice-to-Have Gaps:**
- Có thể bổ sung access-control matrix chi tiết theo role/tenant/branch ở giai đoạn story design.
- Có thể bổ sung observability stack cụ thể (ví dụ vendor/log pipeline) khi bước vào implementation planning.
- Có thể bổ sung test matrix theo module khi chuyển sang sprint/story breakdown.

### Validation Issues Addressed

Không phát hiện issue blocking. Các điểm chưa chốt đều đã được xác định là deferred có chủ đích và đã có boundary để không gây drift trong quá trình triển khai ban đầu.

### Architecture Completeness Checklist

**Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**

- [x] Critical decisions documented with versions
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
- Tenant/branch correctness đã được phản ánh xuyên data, auth, API, structure và consistency rules.
- Kiến trúc modular monolith đủ rõ để AI agents triển khai đồng nhất.
- Project structure map rất sát với FR categories, giảm rủi ro drift khi bắt đầu build.
- Các deferred decisions đã được cô lập, không làm mơ hồ implementation phase đầu tiên.

**Areas for Future Enhancement:**
- Chốt production hosting khi cần pilot/deployment thật.
- Bổ sung payment provider decision và observability vendor decision khi implementation đi sâu hơn.
- Có thể mở rộng tài liệu bằng role-permission matrix và test strategy chi tiết.

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented.
- Use implementation patterns consistently across all components.
- Respect project structure and boundaries.
- Refer to this document for all architectural questions.

**First Implementation Priority:**
Khởi tạo Nx monorepo, tạo `web` và `api`, rồi dựng PostgreSQL + Redis bằng Docker cho local/dev trước khi đi vào schema, auth và shared contracts.
