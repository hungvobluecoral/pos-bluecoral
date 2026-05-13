# Story 1.1: Set up initial project from starter template

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a system admin,
I want a running admin workspace with a clear "Tạo tenant mới" entry point and onboarding shell,
so that I can begin provisioning a tenant in a consistent, scope-aware environment.

## Acceptance Criteria

1. **Given** repository đang được khởi tạo cho phase MVP  
   **When** workspace foundation được thiết lập  
   **Then** Nx monorepo cung cấp `web` và `api` apps có thể chạy local thông qua Nx targets.
2. **Given** developer cần môi trường dev đơn giản để onboarding  
   **When** local stack được bật  
   **Then** Docker dev stack khởi động được PostgreSQL và Redis với file env mẫu.
3. **Given** system admin mở dashboard admin  
   **When** họ bắt đầu onboarding tenant mới  
   **Then** dashboard hiển thị CTA rõ ràng `"Tạo tenant mới"` và route tới onboarding shell ban đầu.
4. **Given** onboarding shell được mở  
   **When** Story 1.1 hoàn tất  
   **Then** shell có sẵn khung stepper, scope header và readiness panel placeholder để các story sau mở rộng.
5. **Given** frontend/backend sẽ mở rộng flow onboarding ở các story sau  
   **When** contract nền được tạo  
   **Then** REST response/error standard được scaffold đúng chuẩn và OpenAPI/Swagger bootstrap sẵn sàng cho việc mở rộng nhất quán.

## Tasks / Subtasks

- [x] Khởi tạo workspace Nx theo kiến trúc đã chốt (AC: 1)
  - [x] Tạo monorepo với `pnpm` bằng Nx official integrated workspace.
  - [x] Sinh `web` bằng Next.js App Router và `api` bằng NestJS bằng Nx generators, giữ đúng tinh thần `apps/` + `libs/`.
  - [x] Giữ Nx core và các plugin `@nx/*` cùng major version; không trộn version lệch major.
  - [x] Không tạo source tree cho Customer/Promotion hoặc các capability post-MVP.
- [x] Dựng nền môi trường local/dev (AC: 1, 2)
  - [x] Thêm `.env.example` ở root và app-specific env mẫu nếu cần.
  - [x] Thêm `docker-compose.dev.yml` cho PostgreSQL và Redis; backend/supporting services phải container-ready từ đầu.
  - [x] Đảm bảo các target serve/build/test/lint của Nx có thể được dùng cho `web` và `api`.
- [x] Dựng foundation UI cho admin onboarding (AC: 3, 4)
  - [x] Tạo dashboard admin với CTA `"Tạo tenant mới"` dễ thấy và route tới `/setup/tenants/new`.
  - [x] Tạo onboarding shell desktop-first với stepper placeholder, scope header placeholder và readiness panel placeholder.
  - [x] Đặt tất cả component business-specific của flow này dưới `apps/web/src/features/admin-onboarding/*`; không đẩy sớm vào `libs/ui`.
  - [x] Dùng `shadcn/ui` làm primitive layer và Tailwind CSS cho layout/tokens ban đầu.
- [x] Dựng foundation REST/OpenAPI cho onboarding (AC: 5)
  - [x] Bật OpenAPI/Swagger bootstrap cho `api`.
  - [x] Chuẩn hóa success envelope `{ data, meta? }` và error envelope `{ error: { code, message, details?, requestId? } }`.
  - [x] Tạo shared contract/common types tối thiểu để frontend/backend mở rộng tiếp mà không copy-paste.
  - [x] Chỉ scaffold foundation; không implement persistence thật cho tenant/branch ở story này.
- [x] Bổ sung test và smoke coverage cho foundation (AC: 1, 3, 4, 5)
  - [x] Thêm unit/smoke tests tối thiểu cho dashboard CTA, onboarding shell render, và API bootstrap/contract helpers.
  - [x] Giữ test co-located với source; chỉ tạo e2e nếu Nx scaffold mặc định đã có và test thực sự đo được behavior của story.

### Review Findings

- [x] [Review][Patch] Đánh dấu story là `review` và check xong toàn bộ checklist khi phần implementation vẫn còn `untracked`, nên change set được review chưa thực sự chứa các thay đổi đã được tuyên bố [_bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-starter-template.md:3]
- [x] [Review][Patch] Mã lỗi API đang dùng `snake_case` (`bad_request`, `not_found`, `internal_server_error`) thay vì `camelCase` như contract đã nêu [apps/api/src/common/http/api-exception.filter.ts:34]

## Dev Notes

### Story Foundation

- Story này là story nền của Epic 1 và mở đường cho Story 1.2-1.4; mục tiêu là foundation đúng, không phải hoàn thiện business flow. [Source: _bmad-output/planning-artifacts/epics.md#Epic 1: Guided Tenant & Branch Onboarding]
- Story implement FR29, FR30, FR31: giữ tenant/branch context nhất quán qua contracts, integration và UI flow ngay từ foundation. [Source: _bmad-output/planning-artifacts/epics.md#Epic 1: Guided Tenant & Branch Onboarding]
- Journey gốc yêu cầu system admin bắt đầu từ một CTA rõ ràng trên dashboard, đi vào flow setup tập trung thay vì nhiều màn hình rời rạc. [Source: _bmad-output/planning-artifacts/prd.md#User Journeys] [Source: _bmad-output/planning-artifacts/ux-design-specification.md#2. Core User Experience]

### Current Repository State

- Repository hiện tại mới có planning artifacts/BMAD artifacts; chưa có `package.json`, Nx workspace, hay source apps thực tế. Story 1.1 vì vậy chủ yếu là tạo mới workspace từ đầu.
- Không có previous story để kế thừa learnings; Story 1.1 phải tự thiết lập baseline đủ sạch cho các story sau.
- Vì chưa có source tree, trọng tâm là tạo đúng skeleton theo architecture, không phát minh cấu trúc khác.

### Technical Requirements

- Starter template bắt buộc là **Nx Official Integrated Monorepo** với `web` (Next.js App Router) và `api` (NestJS). [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation]
- TypeScript-first cho cả frontend và backend. [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation]
- Local/dev environment phải dùng PostgreSQL + Redis bằng Docker. Redis chỉ là cache/token/rate-limit support, không là source of truth. [Source: _bmad-output/planning-artifacts/epics.md#Additional Requirements] [Source: _bmad-output/planning-artifacts/architecture.md#Infrastructure & Deployment] [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- API style là REST-first với OpenAPI/Swagger; response/error format phải chuẩn hóa từ foundation. [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns] [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- Tenant và branch là context nền xuyên hệ thống; dù story này chưa lưu dữ liệu thật, contract và UI shell không được mơ hồ về scope. [Source: _bmad-output/planning-artifacts/prd.md#SaaS B2B Specific Requirements] [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]

### Architecture Compliance

- Tuân thủ cấu trúc `apps/web`, `apps/api`, `libs/*`; không tổ chức theo kiểu repo rời hay shared dumping ground. [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- `apps/web` phải đi theo feature/domain-first; guided onboarding thuộc `apps/web/src/features/admin-onboarding/*`. [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns] [Source: _bmad-output/planning-artifacts/architecture.md#Architectural Boundaries]
- `apps/api` phải theo module/domain-first; bootstrap OpenAPI và common error/response scaffolding ở đúng boundary backend, không rải logic vào infrastructure. [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns] [Source: _bmad-output/planning-artifacts/architecture.md#Architectural Boundaries]
- `libs/contracts` chỉ chứa shared contracts thật sự dùng chung; `libs/ui` chỉ chứa primitives/tokens/hooks generic. Đừng chuyển stepper/scope-header/readiness-panel sang shared quá sớm. [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns] [Source: _bmad-output/planning-artifacts/architecture.md#Architectural Boundaries]
- Guided admin onboarding là pattern kiến trúc, không phải trang dashboard generic. [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns] [Source: _bmad-output/planning-artifacts/ux-design-specification.md#User Journey Flows]

### Library / Framework Requirements

- **Nx / Next.js / NestJS:** dùng current stable major, nhưng luôn giữ Nx workspace và các plugin `@nx/next`, `@nx/nest` cùng major version. Nếu generator flags ở Nx hiện tại khác ví dụ trong architecture doc, giữ nguyên intent kiến trúc: App Router + `src/` cho web, Nest app cho api, pnpm workspace. [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation] [Source: https://github.com/nrwl/nx/releases] [Source: https://nextjs.org/docs/app/guides/upgrading/version-16] [Source: https://nx.dev/docs/technologies/node/nest/introduction]
- **Node / TypeScript:** dùng baseline tương thích với Next.js 16 và Nx stable hiện tại; tối thiểu Node 20.9+ và TypeScript 5.1+ để tránh drift tooling. [Source: https://nextjs.org/docs/app/guides/upgrading/version-16]
- **Tailwind CSS + shadcn/ui:** dùng Tailwind v4 mindset và `shadcn/ui` làm primitive layer; component tùy biến POS_BlueCoral nằm ở layer feature/pattern phía trên. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design System Foundation] [Source: https://ui.shadcn.com/docs/tailwind-v4]
- **TanStack Query / Zustand / React Hook Form:** Story 1.1 chỉ cần wiring tối thiểu hoặc placeholder architecture nếu thật sự cần; không dựng store/server-state phức tạp khi chưa có business data thật. [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- **NestJS 11 / Express 5 caveat:** nếu cần thêm wildcard route hoặc middleware custom ở bootstrap, kiểm tra cú pháp mới của Express v5 thay vì dùng assumptions cũ. [Source: https://docs.nestjs.com/migration-guide]

### File Structure Requirements

- Root files tối thiểu kỳ vọng sau story này: `package.json`, `pnpm-workspace.yaml`, `nx.json`, `tsconfig.base.json`, `.env.example`, `docker-compose.dev.yml`. [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- Web routes/surfaces cần có:
  - `apps/web/src/app/layout.tsx`
  - `apps/web/src/app/(admin)/dashboard/page.tsx`
  - `apps/web/src/app/(admin)/setup/tenants/new/page.tsx`
  - `apps/web/src/features/admin-onboarding/components/*`
  - chỉ thêm `login/page.tsx` hoặc provider/lib folders nếu Nx/generator hoặc wiring thực tế cần. [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- API surfaces cần có:
  - `apps/api/src/main.ts`
  - `apps/api/src/app.module.ts`
  - `apps/api/src/common/*` cho error/response conventions
  - bootstrap OpenAPI/Swagger
  - chỉ tạo onboarding-related module/controller skeleton nếu nó phục vụ AC 5 mà không giả lập business persistence. [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries] [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- Không tạo trước các module/post-MVP trees như `customers` hoặc `promotions`. [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]

### UX Guardrails

- CTA `"Tạo tenant mới"` phải rõ ràng, là primary entry point từ dashboard, không bị chìm trong dashboard generic. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#2. Core User Experience] [Source: _bmad-output/planning-artifacts/ux-design-specification.md#User Journey Flows]
- Onboarding shell phải thể hiện rõ narrative setup: stepper, scope header, readiness panel placeholder. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy]
- Desktop-first; tablet chỉ cần progressive collapse-friendly foundation. Mobile không phải target chính cho flow này. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility]
- Không dùng màu làm tín hiệu duy nhất cho readiness/scope. Keyboard navigation và semantic markup phải được tính từ đầu cho stepper/panel placeholders. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility] [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns]

### API / Contract Guardrails

- Success envelope luôn là `{ data, meta? }`. Error envelope luôn là `{ error: { code, message, details?, requestId? } }`. [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- JSON/API contract dùng camelCase; không đẩy snake_case từ DB lên API layer. [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- Nếu tạo placeholder endpoint/controller cho onboarding, chỉ scaffold contract shape và docs; không trả giả dữ liệu nghiệp vụ gây hiểu nhầm là đã có tenant persistence.
- `requestId` và stable error codes nên có baseline ngay từ đầu vì các story sau cần tracing/scope mismatch handling. [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns]

### What Must Be Preserved

- Preserve Nx defaults wherever possible; để generator tạo baseline rồi chỉ thêm cấu hình cần thiết cho Docker/env/OpenAPI/UI placeholders.
- Preserve App Router model của Next.js; không quay về Pages Router hay trộn structure hai kiểu.
- Preserve Nest module boundaries; đừng nhét business logic vào bootstrap hoặc infrastructure adapters.
- Preserve latest planning intent: commit history cho thấy architecture đã được cập nhật bằng UX sau cùng, nên khi tài liệu có khác biệt nhẹ, ưu tiên `architecture.md` + `ux-design-specification.md` hiện tại.

### What Is Explicitly Out of Scope

- Không implement tạo tenant/branch thật, Prisma domain schema đầy đủ, migrations business, audit log thật, RBAC thật, auth flows thật, hay publish/review business logic ở story này. Những phần đó thuộc Story 1.2+ hoặc Epic sau. [Source: _bmad-output/planning-artifacts/epics.md#Epic 1: Guided Tenant & Branch Onboarding]
- Không tạo module trống cho Customer/Promotion. [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- Không xây dashboard admin hoàn chỉnh beyond CTA + shell entry point.
- Không over-engineer shared libs nếu chưa có use case thật từ story này.

### Testing Requirements

- Unit tests co-located với source theo `*.spec.ts` / `*.spec.tsx`; integration/e2e theo app boundary nếu đã có scaffold phù hợp. [Source: _bmad-output/planning-artifacts/architecture.md#File Organization Patterns]
- Tối thiểu cần chứng minh:
  - `web` và `api` boot qua Nx targets.
  - Dashboard render CTA đúng copy.
  - Onboarding shell render được stepper/scope header/readiness panel placeholders.
  - API bootstrap có Swagger/OpenAPI và response/error helpers không phá compile/test.
- Ưu tiên smoke/unit tests hơn e2e nặng ở story nền, nhưng không bỏ qua accessibility smoke cho keyboard/focus/semantic landmarks nếu component placeholders đã hiện diện. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility]

### Git Intelligence Summary

- Recent repo history:
  - `bcedf4c` Update Architecture With UX
  - `8fbaefb` Add UI
  - `c308986` Add Achitecture
  - `21459e4` Add PRD
  - `7f803c2` Add Product Brief
- Ý nghĩa cho dev agent: tài liệu architecture hiện tại đã absorb UX guidance, nên đừng bám một mình epics/PRD nếu có chi tiết UI/structure cụ thể hơn ở architecture/UX docs.

### Latest Technical Information

- Nx stable hiện tại là 22.x và Next.js stable hiện tại là 16.x; khi scaffold, dùng docs/generators current stable chứ không cố ép CLI cũ, nhưng phải giữ đúng kiến trúc đã chọn. [Source: https://github.com/nrwl/nx/releases] [Source: https://nextjs.org/docs/app/guides/upgrading/version-16]
- NestJS 11 đi cùng Express 5; nếu cần route wildcard/middleware đặc biệt trong bootstrap, dùng cú pháp tương thích Express 5. [Source: https://docs.nestjs.com/migration-guide]
- Tailwind v4 + shadcn/ui là pairing hiện tại hợp lý; nếu generated config khác với ví dụ cũ trong docs, ưu tiên pattern hiện hành của shadcn/Tailwind và giữ design-system intent. [Source: https://ui.shadcn.com/docs/tailwind-v4]

### Project Structure Notes

- Không tìm thấy `project-context.md` trong repo, nên source of truth hiện tại cho story là epics + PRD + architecture + UX + sprint status.
- Story này là greenfield foundation; implementation nên ít sáng tạo ở cấu trúc, nhiều kỷ luật ở boundaries và naming.

### References

- `_bmad-output/planning-artifacts/epics.md#Epic 1: Guided Tenant & Branch Onboarding`
- `_bmad-output/planning-artifacts/prd.md#User Journeys`
- `_bmad-output/planning-artifacts/prd.md#SaaS B2B Specific Requirements`
- `_bmad-output/planning-artifacts/prd.md#Functional Requirements`
- `_bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation`
- `_bmad-output/planning-artifacts/architecture.md#Data Architecture`
- `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`
- `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`
- `_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`
- `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`
- `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Design System Foundation`
- `_bmad-output/planning-artifacts/ux-design-specification.md#2. Core User Experience`
- `_bmad-output/planning-artifacts/ux-design-specification.md#User Journey Flows`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility`
- `https://github.com/nrwl/nx/releases`
- `https://nextjs.org/docs/app/guides/upgrading/version-16`
- `https://nx.dev/docs/technologies/node/nest/introduction`
- `https://ui.shadcn.com/docs/tailwind-v4`
- `https://docs.nestjs.com/migration-guide`

## Dev Agent Record

### Agent Model Used

GPT-5.4 (model ID: gpt-5.4)

### Debug Log References

- Story creation workflow synthesis from sprint status, planning artifacts, repo inspection, git history, and latest-version documentation.
- Scaffolded Nx integrated monorepo from generators, then resolved pnpm build-script approvals required by Nx/Next/Nest installs.
- Completed RED-GREEN cycle with failing route/API tests before implementing dashboard CTA, onboarding shell placeholders, request-id/error envelopes, and Swagger bootstrap.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story intentionally scopes only workspace foundation, onboarding shell foundation, and REST/OpenAPI scaffolding.
- No previous story intelligence was available because this is the first story in the sprint.
- Scaffolded `web` and `api` applications plus root workspace tooling, env sample, Docker dev stack, and shared `libs/contracts` foundation.
- Replaced Nx starter screens with a dashboard CTA and desktop-first onboarding shell using Tailwind CSS plus shadcn-style button primitives under `apps/web/src/features/admin-onboarding/*`.
- Added API foundation for Swagger/OpenAPI, standardized success/error envelopes, request IDs, and smoke coverage for UI render plus API bootstrap routes.

### File List

- `.editorconfig`
- `.env.example`
- `.gitignore`
- `.prettierignore`
- `.prettierrc`
- `.vscode/extensions.json`
- `.vscode/launch.json`
- `_bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-starter-template.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `README.md`
- `apps/api/eslint.config.mjs`
- `apps/api/jest.config.cts`
- `apps/api/project.json`
- `apps/api/src/app/app.controller.spec.ts`
- `apps/api/src/app/app.controller.ts`
- `apps/api/src/app/app.http.spec.ts`
- `apps/api/src/app/app.module.ts`
- `apps/api/src/app/app.service.spec.ts`
- `apps/api/src/app/app.service.ts`
- `apps/api/src/assets/.gitkeep`
- `apps/api/src/common/http/api-exception.filter.ts`
- `apps/api/src/common/http/api-response.ts`
- `apps/api/src/common/http/request-id.middleware.ts`
- `apps/api/src/common/openapi/swagger.ts`
- `apps/api/src/main.ts`
- `apps/api/tsconfig.app.json`
- `apps/api/tsconfig.json`
- `apps/api/tsconfig.spec.json`
- `apps/api/webpack.config.js`
- `apps/web/.swcrc`
- `apps/web/eslint.config.mjs`
- `apps/web/index.d.ts`
- `apps/web/jest.config.cts`
- `apps/web/next.config.js`
- `apps/web/next-env.d.ts`
- `apps/web/project.json`
- `apps/web/public/.gitkeep`
- `apps/web/public/favicon.ico`
- `apps/web/specs/index.spec.tsx` (deleted)
- `apps/web/src/app/(admin)/dashboard/page.spec.tsx`
- `apps/web/src/app/(admin)/dashboard/page.tsx`
- `apps/web/src/app/(admin)/setup/tenants/new/page.spec.tsx`
- `apps/web/src/app/(admin)/setup/tenants/new/page.tsx`
- `apps/web/src/app/api/hello/route.ts` (deleted)
- `apps/web/src/app/global.css`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/page.module.css` (deleted)
- `apps/web/src/app/page.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/features/admin-onboarding/components/create-tenant-entry.tsx`
- `apps/web/src/features/admin-onboarding/components/readiness-panel.tsx`
- `apps/web/src/features/admin-onboarding/components/scope-header.tsx`
- `apps/web/src/features/admin-onboarding/components/setup-stepper.tsx`
- `apps/web/src/lib/utils.ts`
- `apps/web/src/test-setup.ts`
- `apps/web/tsconfig.json`
- `apps/web/tsconfig.spec.json`
- `docker-compose.dev.yml`
- `eslint.config.mjs`
- `jest.config.ts`
- `jest.preset.js`
- `libs/contracts/src/index.ts`
- `nx.json`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `postcss.config.mjs`
- `tsconfig.base.json`

## Change Log

- 2026-05-13: Scaffolded Nx integrated workspace with Next.js `web` app, NestJS `api` app, pnpm tooling, Docker local stack, Tailwind/shadcn-style onboarding UI placeholders, shared contracts, and Swagger/error-envelope foundations for Story 1.1.
