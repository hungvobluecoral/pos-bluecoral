# Story 1.5: Dashboard tenant overview sau onboarding

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a system admin,
I want the admin dashboard to show tenant count and a list of created tenants,
so that I can confirm provisioning outcomes and quickly return to the right tenant context.

## Acceptance Criteria

1. **Given** system admin mở dashboard sau khi đã có tenant được tạo  
   **When** dashboard tải dữ liệu overview  
   **Then** hệ thống hiển thị tenant count rõ ràng và danh sách tenant đã tạo với thông tin tối thiểu phù hợp scope.
2. **Given** system admin đang ở dashboard  
   **When** tenant overview được render  
   **Then** CTA **"Tạo tenant mới"** vẫn là primary action để bắt đầu onboarding tiếp.
3. **Given** dashboard đang load, chưa có tenant, hoặc API overview lỗi  
   **When** page hiển thị  
   **Then** hệ thống có loading, empty và error states rõ ràng mà vẫn giữ layout ổn định.
4. **Given** dashboard đang hiển thị một tenant item  
   **When** system admin cần xem lại kết quả provisioning hoặc quay lại đúng ngữ cảnh  
   **Then** mỗi tenant item cung cấp action phù hợp để xem lại summary hoặc tiếp tục vào đúng context khả dụng.
5. **Given** dashboard overview đọc dữ liệu tenant đã được provision  
   **When** web gọi API/read surface  
   **Then** dữ liệu tuân theo shared REST envelope chuẩn và không tạo semantics cạnh tranh với guided onboarding flow.

## Tasks / Subtasks

- [ ] Bổ sung read contract và backend overview endpoint cho dashboard (AC: 1, 3, 5)
  - [ ] Mở rộng `libs/contracts/src/tenants/*` với response type tối thiểu cho dashboard overview, ví dụ `totalTenants` + `items[]`, giữ envelope `{ data, meta? }` và dùng camelCase.
  - [ ] Mở rộng `apps/api/src/modules/tenants/tenants.controller.ts` bằng read endpoint REST-first trong cùng module `tenants`; ưu tiên endpoint đọc rõ ràng như `GET /tenants` hoặc một read subresource nhất quán, không dùng action verb.
  - [ ] Thêm service/repository read path trong `apps/api/src/modules/tenants/**` để lấy tenant list từ Prisma cùng default branch/config summary cần cho dashboard.
  - [ ] Trả empty list ổn định khi chưa có tenant; không trả `null`, không trả raw Prisma payload, và giữ Swagger/OpenAPI khớp contract.
- [ ] Render tenant overview trên dashboard mà vẫn giữ CTA onboarding làm trọng tâm (AC: 1, 2)
  - [ ] Mở rộng `apps/web/src/app/(admin)/dashboard/page.tsx` để dashboard vừa là landing surface vừa giữ CTA **"Tạo tenant mới"** ở hierarchy nổi bật hiện tại.
  - [ ] Tách phần tenant overview ra một dashboard-focused boundary rõ ràng dưới `apps/web/src/features/` thay vì trộn logic mới vào onboarding shell hoặc `libs/ui`.
  - [ ] Hiển thị tối thiểu cho mỗi tenant item: tenant name, tenant slug, branch đầu tiên/default branch, và trạng thái summary đủ để xác nhận provisioning outcome mà không biến dashboard thành CRUD screen đầy đủ.
- [ ] Thiết kế action cho từng tenant item theo context đang thật sự tồn tại trong source (AC: 4)
  - [ ] Vì Story 1.4 hiện mới ở `ready-for-dev` và chưa có source review summary/publish screen, **không** link sang route/flow chưa tồn tại.
  - [ ] Ưu tiên action an toàn như **"Xem tóm tắt"** mở summary card/drawer/sheet read-only ngay trên dashboard để admin xem lại tenant + branch context đã provision.
  - [ ] Nếu bổ sung thêm action điều hướng, chỉ dùng route/context đã tồn tại thật trong source; không tạo dangling navigation.
- [ ] Xử lý loading, empty và error states mà không làm vỡ layout admin hiện tại (AC: 3)
  - [ ] Giữ shell/header/CTA ổn định khi data đang load hoặc lỗi; tránh layout shift lớn.
  - [ ] Empty state phải vẫn nhấn mạnh CTA tạo tenant mới thay vì tạo cảm giác dashboard "trống hẳn".
  - [ ] Error state phải ngắn, rõ, có khả năng retry nếu phù hợp, và không che mất CTA chính.
- [ ] Khóa chiến lược transport web -> API cho dashboard overview trước khi code UI fetch (AC: 5)
  - [ ] Hiện repo **chưa có** Next route handler/rewrite cho `/api/*`, trong khi `apps/web/src/features/admin-onboarding/api/provision-tenant.ts` đang gọi relative path `/api/tenants/provisioning`; Story 1.5 không được lặp lại thêm một transport pattern ad-hoc khác.
  - [ ] Chọn một hướng nhất quán cho dashboard read path: hoặc bổ sung web-side route/rewrite/base URL helper rõ ràng, hoặc gọi backend theo server-side helper nhất quán với kiến trúc hiện tại.
  - [ ] Nếu phải chạm transport layer, đảm bảo không làm regress provisioning flow hiện có.
- [ ] Bổ sung test coverage cho dashboard overview end-to-end theo boundary hiện có (AC: 1, 2, 3, 4, 5)
  - [ ] Mở rộng `apps/web/src/app/(admin)/dashboard/page.spec.tsx` để cover count, populated list, empty state, error state, và preservation của CTA chính.
  - [ ] Thêm unit/service/http tests ở `apps/api/src/modules/tenants/**` cho overview endpoint: populated, empty, envelope shape, và mapping dữ liệu branch/config.
  - [ ] Nếu tenant item có summary drawer/sheet, thêm interaction test chứng minh action mở đúng summary thay vì điều hướng tới route không tồn tại.

## Dev Notes

### Story Foundation

- Story này là phần mở rộng trực tiếp của Epic 1 sau guided onboarding: dashboard admin phải trở thành **entry point + operational landing surface**, không chỉ còn mỗi CTA tạo tenant. [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5: Dashboard tenant overview sau onboarding] [Source: _bmad-output/planning-artifacts/prd.md#Product Scope]
- Acceptance criteria của story tập trung vào ba ý: thấy được kết quả provisioning, giữ CTA chính, và không tạo một semantics mới cạnh tranh với guided onboarding. [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5: Dashboard tenant overview sau onboarding]

### Cross-Story Context

- Story 1.2 đã persist đủ nền dữ liệu tenant + branch đầu tiên trong Prisma (`Tenant`, `Branch`, `TenantConfiguration`, `BranchConfiguration`) và đã chuẩn hóa REST envelope + audit behavior cho provisioning. Story 1.5 nên **đọc lại** các entity này thay vì dựng thêm bảng/cache mới. [Source: _bmad-output/implementation-artifacts/1-2-tao-tenant-va-branch-dau-tien-voi-nen-du-lieu-dung-scope.md#Tasks / Subtasks] [Source: apps/api/prisma/schema.prisma]
- Story 1.3 đã làm xong guided wizard/readiness và trong source còn ghi rõ: readiness đã đủ dữ liệu nhưng **review/publish vẫn ở story kế tiếp**. Dashboard overview không được kéo ngược logic review vào onboarding shell. [Source: apps/web/src/features/admin-onboarding/components/tenant-provisioning-shell.tsx] [Source: _bmad-output/implementation-artifacts/1-3-guided-setup-wizard-voi-scope-header-va-readiness-panel.md]
- Story 1.4 hiện mới ở trạng thái `ready-for-dev`; source hiện tại chưa có review summary/publish screen để tenant item điều hướng tới. Vì vậy Story 1.5 phải dùng action summary an toàn trên chính dashboard hoặc route đã tồn tại thật, thay vì giả định Story 1.4 đã live. [Source: _bmad-output/implementation-artifacts/1-4-review-guardrails-va-publish-tenant-branch-an-toan.md] [Source: _bmad-output/implementation-artifacts/sprint-status.yaml]

### Current Repository State

- `apps/web/src/app/(admin)/dashboard/page.tsx` hiện chỉ render page header và `CreateTenantEntry`; chưa có bất kỳ list/count/error/loading state nào cho tenant overview.
- `apps/web/src/app/(admin)/dashboard/page.spec.tsx` hiện chỉ assert CTA khởi tạo tenant và copy cơ bản của dashboard.
- `apps/web/src/features/admin-onboarding/components/create-tenant-entry.tsx` đang giữ visual hierarchy/CTA copy chuẩn; Story 1.5 phải preserve component này hoặc preserve exact CTA semantics nếu trích xuất thêm layout.
- `apps/api/src/modules/tenants/tenants.controller.ts` hiện chỉ có `POST /tenants/provisioning`; chưa có read endpoint cho dashboard summary/list.
- `apps/api/src/modules/tenants/repositories/tenants.repository.ts` hiện chỉ có `findBySlug` và `createTenant`; chưa có query phục vụ dashboard overview.

### Technical Requirements

- Contract overview phải theo shared wrapper `{ data, meta? }`; error vẫn theo `{ error: { code, message, details?, requestId? } }`. Danh sách phải luôn là array, kể cả khi rỗng. [Source: libs/contracts/src/index.ts] [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- Dữ liệu mỗi tenant item nên là summary tối thiểu phục vụ xác nhận provisioning outcome, ví dụ: `tenantId`, `name`, `slug`, `createdAt`, `defaultBranch { branchId, name, slug, code }`, và readiness summary nếu lấy được từ `BranchConfiguration`. Không trả audit payload hay Prisma-internal fields ra dashboard.
- Dashboard overview là **read surface** riêng; không được reuse `POST /tenants/provisioning` response làm source of truth lâu dài cho dashboard.
- Nếu cần count + list, ưu tiên một endpoint/read model duy nhất để web nhận được total + items cùng lúc, tránh hai request ad-hoc tách rời gây semantics cạnh tranh.

### Architecture Compliance

- Dashboard tenant overview phải nằm ở dashboard boundary rõ ràng, không trộn logic mới vào onboarding shell. [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- Web/API vẫn phải đi theo REST-first, plural resources, camelCase contracts và envelope chuẩn. [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns] [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns] [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- Backend vẫn theo controller -> service -> repository -> Prisma; controller không query Prisma trực tiếp. [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- `apps/web` vẫn theo feature/domain-first; business-specific dashboard components ở `apps/web/src/features/*`, không đẩy vào `libs/ui`. [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]

### File Structure Requirements

- Update targets có khả năng cao:
  - `apps/web/src/app/(admin)/dashboard/page.tsx`
  - `apps/web/src/app/(admin)/dashboard/page.spec.tsx`
  - `apps/web/src/features/admin-onboarding/components/create-tenant-entry.tsx`
  - `apps/web/src/features/dashboard/**` hoặc boundary tương đương trong `apps/web/src/features/`
  - `apps/api/src/modules/tenants/tenants.controller.ts`
  - `apps/api/src/modules/tenants/tenants.module.ts`
  - `apps/api/src/modules/tenants/repositories/tenants.repository.ts`
  - `apps/api/src/modules/tenants/**` cho service/dto/entity/spec mới phục vụ overview
  - `libs/contracts/src/tenants/*`
  - `libs/contracts/src/index.ts`
- Không thêm tenant overview vào `apps/web/src/features/admin-onboarding/components/tenant-provisioning-shell.tsx` trừ khi chỉ tái sử dụng nhỏ về presentational primitive; dashboard feature phải độc lập với wizard.

### What Must Be Preserved

- Preserve CTA **"Tạo tenant mới"** là primary action và vẫn trỏ tới `/setup/tenants/new`. [Source: apps/web/src/app/(admin)/dashboard/page.spec.tsx] [Source: apps/web/src/features/admin-onboarding/components/create-tenant-entry.tsx]
- Preserve onboarding vocabulary/state semantics đã dùng trong flow: `active`, `completed`, `warning`, `blocked`, `ready`; dashboard summary nếu hiển thị readiness không được tự nghĩ vocabulary khác làm lệch experience. [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns] [Source: apps/web/src/features/admin-onboarding/components/tenant-provisioning-shell.tsx]
- Preserve tenant/branch-first data model hiện có trong Prisma; không flatten branch ra ngoài tenant scope. [Source: apps/api/prisma/schema.prisma]
- Preserve existing provisioning code path; nếu Story 1.5 buộc phải chỉnh transport/helper để dashboard fetch được data, không được làm hỏng submit provisioning hiện có. [Source: apps/web/src/features/admin-onboarding/api/provision-tenant.ts]

### Transport and Integration Risk

- Đây là guardrail quan trọng nhất cho implementation: repo hiện **không có** Next route handler dưới `apps/web/src/app/api/**`, cũng chưa thấy rewrite/proxy hay `api-client` helper trong web source, nhưng onboarding API client hiện lại gọi `fetch('/api/tenants/provisioning')`. [Source: apps/web/src/features/admin-onboarding/api/provision-tenant.ts]
- Vì vậy dev agent phải chốt chiến lược transport trước:  
  1. thêm route/rewrite/helper rõ ràng và dùng lại nhất quán, hoặc  
  2. giữ dashboard overview ở server-side fetch có base URL rõ ràng.  
  Không được thêm một cách gọi thứ ba chỉ để “cho chạy tạm”.

### Library / Framework Requirements

- Stack thực tế trong repo hiện tại: Nx `22.7.1`, Next `~16.1.6`, React `^19.0.0`, Nest `^11.0.0`, Prisma `^5.22.0`. [Source: package.json]
- Architecture document nói TanStack Query là chuẩn cho server state, nhưng **package.json hiện chưa có `@tanstack/react-query`** và source cũng chưa có query provider/hydration setup. Nếu Story 1.5 cần interactivity nhỏ (ví dụ summary drawer), ưu tiên tận dụng Server Component + client island nhỏ trước; chỉ thêm TanStack Query nếu đồng thời materialize dependency + provider theo boundary rõ ràng. [Source: package.json] [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- Thông tin kỹ thuật mới nhất vẫn ủng hộ hybrid App Router pattern: server-fetch cho initial admin dashboard shell, rồi hydrate/client-manage phần tương tác khi thật sự cần. Điều này khớp tốt với tenant overview MVP vì SEO không quan trọng nhưng first-load clarity và ít JS vẫn có lợi. [Source: web research - Next.js App Router + TanStack Query stable guidance]

### Testing Requirements

- Web tests phải chứng minh dashboard không còn là CTA-only page và vẫn giữ CTA làm primary action trong cả populated/empty/error states.
- API tests phải chứng minh overview endpoint trả đúng envelope, list rỗng là `[]`, và count khớp số tenant thực trong DB.
- Nếu dùng summary drawer/sheet cho tenant item, cần interaction test cho keyboard/focus cơ bản để không phá direction accessibility desktop/tablet của dashboard. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Accessibility Considerations] [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility]

### Previous Story Intelligence

- Story 1.3 review fix vừa hoàn tất đã nhấn mạnh focus management, blocked semantics và progressive collapse ở tablet; dashboard summary surface mới nên giữ cùng tinh thần accessibility/semantic clarity thay vì mở modal mơ hồ không focusable.
- Story 1.2 đã có pattern shared contracts + Swagger + audit cho `tenants` module; Story 1.5 nên mở rộng module này thay vì tạo module mới chỉ để đọc overview.
- Git history gần nhất cho thấy các commit source thực đã materialize theo từng story (`Story 1.1`, `Story 1.2`, `Story 1.3`), nên Story 1.5 phải bám source code thật hiện có thay vì chỉ bám planning docs.

### Project Structure Notes

- Repo đã materialize source cho Epic 1, nên story này phải coi các file hiện có là **update targets thực tế**, không còn là intended placeholders như các story sớm.
- Mismatch cần lưu ý: architecture nói TanStack Query là chuẩn, nhưng workspace thực tế chưa cài package này; transport web -> API cũng chưa được chuẩn hóa ở web app. Đây là hai chỗ dễ làm dev agent chọn sai hướng nếu không đọc source trước.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 1.5: Dashboard tenant overview sau onboarding`
- `_bmad-output/planning-artifacts/prd.md#Product Scope`
- `_bmad-output/planning-artifacts/prd.md#Journey Requirements Summary`
- `_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`
- `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`
- `_bmad-output/planning-artifacts/architecture.md#Structure Patterns`
- `_bmad-output/planning-artifacts/architecture.md#Format Patterns`
- `_bmad-output/planning-artifacts/ux-design-specification.md#2.3 Success Criteria`
- `_bmad-output/planning-artifacts/ux-design-specification.md#2.5 Experience Mechanics`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Accessibility Considerations`
- `_bmad-output/implementation-artifacts/1-2-tao-tenant-va-branch-dau-tien-voi-nen-du-lieu-dung-scope.md`
- `_bmad-output/implementation-artifacts/1-3-guided-setup-wizard-voi-scope-header-va-readiness-panel.md`
- `_bmad-output/implementation-artifacts/1-4-review-guardrails-va-publish-tenant-branch-an-toan.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/web/src/app/(admin)/dashboard/page.tsx`
- `apps/web/src/app/(admin)/dashboard/page.spec.tsx`
- `apps/web/src/features/admin-onboarding/components/create-tenant-entry.tsx`
- `apps/web/src/features/admin-onboarding/api/provision-tenant.ts`
- `apps/web/src/features/admin-onboarding/components/tenant-provisioning-shell.tsx`
- `apps/api/src/modules/tenants/tenants.controller.ts`
- `apps/api/src/modules/tenants/tenants.module.ts`
- `apps/api/src/modules/tenants/repositories/tenants.repository.ts`
- `apps/api/prisma/schema.prisma`
- `libs/contracts/src/index.ts`
- `libs/contracts/src/tenants/provision-tenant.ts`
- `package.json`

## Dev Agent Record

### Agent Model Used

GPT-5.4 (model ID: gpt-5.4)

### Debug Log References

- Story creation workflow synthesis from Epic 1 planning artifacts, current dashboard/onboarding source, tenants API module, contracts, Prisma schema, package versions, and current sprint tracking.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story 1.5 is intentionally guarded against two current repo mismatches: missing dashboard read endpoint and unstandardized web -> API transport.
- Tenant item action is constrained to currently existing context so implementation does not depend on unbuilt Story 1.4 routes.

### File List

- `_bmad-output/implementation-artifacts/1-5-dashboard-tenant-overview-sau-onboarding.md`
- `apps/web/src/app/(admin)/dashboard/page.tsx`
- `apps/web/src/app/(admin)/dashboard/page.spec.tsx`
- `apps/web/src/features/admin-onboarding/components/create-tenant-entry.tsx`
- `apps/web/src/features/dashboard/**`
- `apps/api/src/modules/tenants/tenants.controller.ts`
- `apps/api/src/modules/tenants/tenants.module.ts`
- `apps/api/src/modules/tenants/repositories/tenants.repository.ts`
- `apps/api/src/modules/tenants/**`
- `libs/contracts/src/tenants/*`
- `libs/contracts/src/index.ts`
