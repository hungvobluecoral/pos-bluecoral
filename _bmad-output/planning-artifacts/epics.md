---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
---

# POS_BlueCoral - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for POS_BlueCoral, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: System admin có thể tạo tenant mới trên platform.
FR2: System admin có thể tạo một hoặc nhiều branch trong phạm vi một tenant.
FR3: System admin có thể gán cấu hình vận hành cơ bản cho từng tenant.
FR4: System admin có thể gán cấu hình vận hành cơ bản cho từng branch.
FR5: System admin có thể xem rõ tenant và branch context của mọi cấu hình đang thao tác.
FR6: Hệ thống có thể ngăn hoặc cảnh báo khi thao tác có nguy cơ gán nhầm tenant hoặc branch.
FR7: System admin có thể tạo và quản lý tài khoản staff trong phạm vi tenant phù hợp.
FR8: System admin có thể gán role cho staff theo phạm vi tenant hoặc branch.
FR9: Staff chỉ có thể xem dữ liệu trong phạm vi tenant/branch được cấp quyền.
FR10: Staff chỉ có thể thực hiện thao tác trong phạm vi tenant/branch được cấp quyền.
FR11: Hệ thống có thể áp dụng guardrails cho các thao tác nhạy cảm theo role và scope.
FR12: Store manager có thể quản lý staff thuộc branch mình phụ trách trong phạm vi được cấp.
FR13: Người dùng được phân quyền có thể tạo và quản lý product trong phạm vi tenant.
FR14: Người dùng được phân quyền có thể gán product cho branch phù hợp.
FR15: Người dùng được phân quyền có thể xem product theo đúng tenant/branch context.
FR16: Hệ thống có thể giữ product data nhất quán với scope tenant/branch khi được sử dụng bởi các module khác.
FR17: Staff/cashier có thể tạo order trong đúng branch đang vận hành.
FR18: Staff/cashier có thể thao tác order mà không bị mất branch context trong flow chính.
FR19: Store manager có thể xem order thuộc đúng branch mình quản lý.
FR20: Hệ thống có thể ngăn order được tạo hoặc xử lý ngoài phạm vi tenant/branch hợp lệ.
FR21: Người dùng được phân quyền có thể xem inventory trong đúng branch hoặc tenant context phù hợp.
FR22: Hệ thống có thể cập nhật inventory theo đúng scope của order hoặc giao dịch liên quan.
FR23: Staff/cashier có thể ghi nhận payment cho order trong đúng tenant/branch context.
FR24: Hệ thống có thể đảm bảo payment gắn đúng với order và scope vận hành liên quan.
FR25: Người dùng được phân quyền có thể tạo và quản lý customer trong phạm vi tenant phù hợp.
FR26: Hệ thống có thể gắn customer vào order trong đúng tenant/branch context.
FR27: Người dùng được phân quyền có thể tạo và quản lý promotion trong phạm vi tenant phù hợp.
FR28: Hệ thống có thể áp dụng promotion theo đúng scope tenant/branch và rule được cấu hình.
FR29: Các module lõi có thể trao đổi dữ liệu với nhau mà vẫn giữ nguyên tenant/branch context.
FR30: Hệ thống có thể đảm bảo integration giữa các module nội bộ không làm sai lệch quyền truy cập theo scope.
FR31: Hệ thống có thể giữ branch context nhất quán xuyên suốt các flow đi qua nhiều module.
FR32: Hệ thống có thể duy trì tenant/branch isolation khi capability mới được thêm vào.
FR33: Hệ thống có thể hỗ trợ mở rộng module mới mà không làm mất các guardrails theo scope đã có.
FR34: System admin có thể xác định module nào đang ảnh hưởng đến tenant hoặc branch cụ thể trong quá trình vận hành.
FR35: Hệ thống có thể hỗ trợ kiểm tra tính đúng scope của các flow chính trước khi mở rộng thêm capability mới.

### NonFunctional Requirements

NFR1: Tenant/branch isolation phải được enforce xuyên suốt các flow chính và các module lõi.
NFR2: Người dùng không được nhìn thấy dữ liệu ngoài tenant/branch được cấp quyền.
NFR3: RBAC phải được áp dụng nhất quán theo tenant và branch, không chỉ theo role chung.
NFR4: Hệ thống phải coi "đúng tenant nhưng sai branch" là một failure mode cần được ngăn chặn và phát hiện rõ.
NFR5: Các thao tác chính của người dùng phải phản hồi trong khoảng 2 giây trong điều kiện vận hành bình thường.
NFR6: Hiệu năng không được làm gián đoạn các flow chính như tạo tenant/branch, xem dữ liệu đúng branch, tạo order và ghi nhận payment trong đúng scope.
NFR7: Khi hiệu năng giảm, hệ thống vẫn phải giữ đúng tenant/branch context thay vì ưu tiên tốc độ bằng cách nới lỏng guardrails.
NFR8: Hệ thống phải sẵn sàng tăng số tenant và branch theo thời gian mà không làm vỡ tenant model, branch model hoặc RBAC model.
NFR9: Việc mở rộng số tenant/branch không được làm mất tính rõ ràng của scope giữa các module lõi.
NFR10: Kiến trúc phải cho phép tăng phạm vi vận hành mà vẫn giữ được correctness theo tenant/branch.
NFR11: Các flow chính phải duy trì correctness kể cả khi hệ thống được mở rộng thêm module mới.
NFR12: Hệ thống không được để việc thêm capability mới làm hỏng các guardrails hiện có về scope.
NFR13: Những lỗi liên quan đến sai tenant/sai branch phải dễ phát hiện và không được âm thầm lan sang các module khác.
NFR14: Contract giữa các module phải ổn định và nhất quán theo tenant/branch context.
NFR15: Integration giữa các module nội bộ không được làm sai lệch scope dữ liệu hoặc quyền truy cập.
NFR16: Các module mới phải tuân theo contract scope hiện có thay vì tạo ra ngoại lệ riêng.

### Additional Requirements

- Starter template cho implementation foundation là **Nx Official Integrated Monorepo** với `web` (Next.js App Router) và `api` (NestJS); đây phải là story đầu tiên của Epic 1.
- Ngay sau khởi tạo workspace cần thiết lập **Tailwind CSS + shadcn/ui** cho `web` làm primitive layer của design system.
- Local/dev environment phải chạy được với **PostgreSQL và Redis bằng Docker**, backend và supporting services phải container-ready từ đầu.
- Schema và data access phải theo mô hình **tenant-first và branch-first** xuyên suốt Prisma schema, index, query filters, audit records và event payloads.
- Mọi thay đổi schema phải đi qua **Prisma migrations version-controlled**.
- Authentication phải dùng **access JWT ngắn hạn + refresh token rotation**.
- Authorization phải là **RBAC theo tenant/branch scope**, trong đó branch là security boundary độc lập chứ không chỉ là metadata.
- API phải theo hướng **REST-first** với **OpenAPI/Swagger**, response chuẩn hóa `{ data, meta? }` và error chuẩn hóa `{ error: { code, message, details?, requestId? } }`.
- `libs/contracts` là nơi chứa shared contracts thật sự dùng chung; không copy-paste DTO giữa `web` và `api`.
- Cross-module integration phải đi qua services hoặc domain events có kiểm soát; không import chéo repository trực tiếp giữa các module.
- Guided admin onboarding phải là foundation của MVP, gồm setup wizard, scope header, readiness panel và review step; không được biến thành dashboard generic.
- Server state phải dùng **TanStack Query**; Zustand chỉ dùng cho UI state/wizard state/filter state ở frontend.
- Cần có **structured logging, audit logging, request correlation** và rate limiting đủ sớm để debug sai scope xuyên module.
- Accessibility target là **WCAG AA** với keyboard-first support cho wizard, form, dialog và review flows.
- Các capability **Customer** và **Promotion** là **post-MVP extension seams**, không được làm phình implementation tree của MVP.
- Ở giai đoạn story design cần bổ sung **access-control matrix chi tiết theo role/tenant/branch** để hiện thực hóa RBAC chính xác.
- Payment stories phải giữ kiến trúc **provider-agnostic** vì payment provider cụ thể chưa được chốt.
- Deployment stories chỉ cần giữ hệ thống **cloud-vendor agnostic** ở giai đoạn đầu vì production hosting cụ thể đang defer có chủ đích.

### UX Design Requirements

UX-DR1: Giao diện V1 phải là **web app desktop-first** tối ưu cho system admin nội bộ trong bối cảnh back-office.
UX-DR2: Dashboard admin phải có CTA khởi tạo rõ ràng **"Tạo tenant mới"** để bắt đầu flow onboarding tenant.
UX-DR3: Flow core phải là **guided linear wizard** theo đúng thứ tự: thông tin tenant, branch đầu tiên, quyền/cấu hình nền và review trước khi publish.
UX-DR4: Mọi màn hình quan trọng trong flow phải có **persistent context header/breadcrumb** hiển thị tenant, branch và bước hiện tại để người dùng không phải suy đoán scope.
UX-DR5: Flow phải có **stepper/progress component** thể hiện trạng thái `active`, `completed`, `warning`, `blocked` và giải thích vì sao bước bị chặn.
UX-DR6: Flow phải có **readiness panel/checklist** cho biết tenant/branch đã đủ điều kiện go-live hay chưa và còn thiếu gì.
UX-DR7: Trước khi publish phải có **review summary step/panel** tổng hợp phạm vi ảnh hưởng, thay đổi chính và điều kiện readiness.
UX-DR8: Validation phải xuất hiện **inline theo từng bước**, chỉ rõ field lỗi, bước liên quan và tác động tới readiness.
UX-DR9: Khi phát hiện nguy cơ **sai tenant hoặc sai branch**, hệ thống phải chặn hành động lưu/publish và chỉ rõ nơi cần sửa.
UX-DR10: Trạng thái thành công phải diễn đạt **ý nghĩa nghiệp vụ thực** như "Branch đầu tiên đã sẵn sàng vận hành", không chỉ hiển thị thông báo lưu thành công chung chung.
UX-DR11: UI foundation phải dùng **shadcn/ui primitives** cho button, input, select, dialog, table, badge, alert, toast, skeleton và form patterns.
UX-DR12: Cần hiện thực custom component **Setup Wizard Stepper** cho các flow nhiều bước có hệ quả cao.
UX-DR13: Cần hiện thực custom component **Scope Header / Context Bar** để giữ scope luôn hiện diện trên setup, review và các màn admin nhạy cảm.
UX-DR14: Cần hiện thực custom component **Readiness Panel / Checklist** với action link quay lại đúng bước cần sửa.
UX-DR15: Cần hiện thực custom component **Review Summary Panel** có section summary, scope confirmation, risk note và primary action.
UX-DR16: Cần hiện thực **Permission/Configuration Summary Blocks** để tóm tắt cấu hình và quyền theo scope trong review hoặc màn cấu hình.
UX-DR17: Cần hiện thực **Inline Validation Group Patterns** cho các form nhiều bước, hỗ trợ giải thích ngữ cảnh và recovery nhanh.
UX-DR18: Cần hiện thực **Risk Alert Banner** có contextual actions cho các tình huống warning hoặc scope-sensitive operations.
UX-DR19: Empty, loading và error states phải giữ layout ổn định bằng skeleton/placeholders và luôn chỉ ra hành động tiếp theo cho người dùng.
UX-DR20: Feedback phải áp dụng semantic system rõ ràng cho `success`, `warning`, `error`, `info` và xuất hiện gần khu vực liên quan thay vì chỉ dùng toast toàn cục.
UX-DR21: Design system phải chuẩn hóa **color semantics** cho trạng thái an toàn, cảnh báo, lỗi và guidance; không được dùng màu như tín hiệu duy nhất.
UX-DR22: Design system phải chuẩn hóa **typography hierarchy**, base spacing 8px và layout rhythm phù hợp cho desktop admin giàu thông tin nhưng dễ quét.
UX-DR23: Toàn bộ trải nghiệm phải đạt **WCAG AA**, gồm contrast phù hợp, focus states rõ, semantic HTML/ARIA cho stepper/alerts/validation/readiness và keyboard navigation đầy đủ.
UX-DR24: Responsive behavior phải ưu tiên **desktop (1280px+)**, hỗ trợ **tablet (768px-1279px)** bằng progressive collapse, và chỉ hỗ trợ **mobile (320px-767px)** cho tra cứu hoặc action nhẹ ở phase đầu.

### FR Coverage Map

FR1: Epic 1 - Guided Tenant & Branch Onboarding
FR2: Epic 1 - Guided Tenant & Branch Onboarding
FR3: Epic 1 - Guided Tenant & Branch Onboarding
FR4: Epic 1 - Guided Tenant & Branch Onboarding
FR5: Epic 1 - Guided Tenant & Branch Onboarding
FR6: Epic 1 - Guided Tenant & Branch Onboarding
FR7: Epic 2 - Scoped Staff Access & Branch Governance
FR8: Epic 2 - Scoped Staff Access & Branch Governance
FR9: Epic 2 - Scoped Staff Access & Branch Governance
FR10: Epic 2 - Scoped Staff Access & Branch Governance
FR11: Epic 2 - Scoped Staff Access & Branch Governance
FR12: Epic 2 - Scoped Staff Access & Branch Governance
FR13: Epic 3 - Branch Catalog & Stock Readiness
FR14: Epic 3 - Branch Catalog & Stock Readiness
FR15: Epic 3 - Branch Catalog & Stock Readiness
FR16: Epic 3 - Branch Catalog & Stock Readiness
FR17: Epic 4 - Branch Checkout & Payment Execution
FR18: Epic 4 - Branch Checkout & Payment Execution
FR19: Epic 4 - Branch Checkout & Payment Execution
FR20: Epic 4 - Branch Checkout & Payment Execution
FR21: Epic 3 - Branch Catalog & Stock Readiness
FR22: Epic 3 - Branch Catalog & Stock Readiness
FR23: Epic 4 - Branch Checkout & Payment Execution
FR24: Epic 4 - Branch Checkout & Payment Execution
FR25: Epic 5 - Customer & Promotion Growth Capabilities
FR26: Epic 5 - Customer & Promotion Growth Capabilities
FR27: Epic 5 - Customer & Promotion Growth Capabilities
FR28: Epic 5 - Customer & Promotion Growth Capabilities
FR29: Epic 1 - Guided Tenant & Branch Onboarding
FR30: Epic 1 - Guided Tenant & Branch Onboarding
FR31: Epic 1 - Guided Tenant & Branch Onboarding
FR32: Epic 1 - Guided Tenant & Branch Onboarding
FR33: Epic 1 - Guided Tenant & Branch Onboarding
FR34: Epic 1 - Guided Tenant & Branch Onboarding
FR35: Epic 1 - Guided Tenant & Branch Onboarding

## Epic List

### Epic 1: Guided Tenant & Branch Onboarding
System admin có thể tạo tenant, tạo branch đầu tiên, cấu hình scope an toàn và có một nền tảng đúng để các module sau vận hành mà không làm sai tenant/branch context.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR29, FR30, FR31, FR32, FR33, FR34, FR35

### Epic 2: Scoped Staff Access & Branch Governance
System admin và store manager có thể tạo staff, gán role theo tenant/branch và enforce truy cập đúng scope trong vận hành hằng ngày.
**FRs covered:** FR7, FR8, FR9, FR10, FR11, FR12

### Epic 3: Branch Catalog & Stock Readiness
Người dùng được phân quyền có thể quản lý product và inventory đúng scope để branch sẵn sàng bán hàng mà vẫn giữ dữ liệu nhất quán xuyên module.
**FRs covered:** FR13, FR14, FR15, FR16, FR21, FR22

### Epic 4: Branch Checkout & Payment Execution
Staff/cashier có thể tạo order và ghi nhận payment trong đúng branch, giúp vận hành giao dịch hoàn chỉnh mà không mất context.
**FRs covered:** FR17, FR18, FR19, FR20, FR23, FR24

### Epic 5: Customer & Promotion Growth Capabilities
Khi bước sang phase tăng trưởng, đội vận hành có thể quản lý customer và promotion trong đúng tenant/branch scope mà không phá vỡ nền tảng MVP.
**FRs covered:** FR25, FR26, FR27, FR28

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic 1: Guided Tenant & Branch Onboarding

System admin có thể tạo tenant, tạo branch đầu tiên, cấu hình scope an toàn và có một nền tảng đúng để các module sau vận hành mà không làm sai tenant/branch context.

### Story 1.1: Set up initial project from starter template

As a system admin,
I want a running admin workspace with a clear "Tạo tenant mới" entry point and onboarding shell,
So that I can begin provisioning a tenant in a consistent, scope-aware environment.

**Implements:** FR29, FR30, FR31

**Acceptance Criteria:**

**Given** repository đang được khởi tạo cho phase MVP
**When** workspace foundation được thiết lập
**Then** Nx monorepo cung cấp `web` và `api` apps có thể chạy local thông qua Nx targets
**And** Docker dev stack khởi động được PostgreSQL và Redis với file env mẫu để onboarding đơn giản
**And** dashboard admin hiển thị CTA "Tạo tenant mới" và route tới onboarding shell ban đầu
**And** onboarding shell có sẵn khung stepper, scope header và readiness panel placeholder để các story sau mở rộng
**And** contract nền cho tenant/branch onboarding tuân theo REST response/error standard và có OpenAPI scaffold để frontend/backend mở rộng nhất quán

### Story 1.2: Tạo tenant và branch đầu tiên với nền dữ liệu đúng scope

As a system admin,
I want to create a tenant and its first branch with persisted scoped configuration,
So that a new business unit starts from a correct operational structure.

**Implements:** FR1, FR2, FR3, FR4

**Acceptance Criteria:**

**Given** admin đang ở onboarding flow và nhập thông tin tenant/branch hợp lệ
**When** admin gửi yêu cầu tạo tenant cùng branch đầu tiên
**Then** API và database chỉ tạo các entity/schema cần thiết cho tenant, branch và cấu hình nền tối thiểu theo mô hình tenant-first và branch-first
**And** tenant và branch được liên kết đúng quan hệ, có unique constraints/index cần thiết và được version-control bằng Prisma migrations
**And** response trả về đúng chuẩn `{ data, meta? }` và bao gồm tenantId/branchId cần thiết để các bước sau giữ context nhất quán
**And** trường hợp dữ liệu trùng, không hợp lệ, hoặc scope sai sẽ trả về error code ổn định theo format `{ error: { code, message, details?, requestId? } }`
**And** hệ thống ghi audit log provisioning với actor, tenantId, branchId và request correlation để phục vụ truy vết sau này

### Story 1.3: Guided setup wizard với scope header và readiness panel

As a system admin,
I want a guided tenant onboarding wizard that always shows current scope and readiness,
So that I can complete setup without guessing what branch or tenant I am affecting.

**Implements:** FR5, FR6, FR31

**Acceptance Criteria:**

**Given** admin đang thực hiện onboarding tenant/branch
**When** admin đi qua từng bước trong wizard
**Then** màn hình luôn hiển thị persistent scope header/breadcrumb với tenant, branch và bước hiện tại
**And** stepper hiển thị rõ các trạng thái `active`, `completed`, `warning`, `blocked` và lý do bước bị chặn nếu có
**And** readiness panel/checklist cho biết những điều kiện đã đạt, những mục còn thiếu, và cho phép quay lại đúng bước cần sửa
**And** validation xuất hiện inline theo từng bước, gắn với field liên quan, và nói rõ tác động tới readiness
**And** giao diện đạt yêu cầu desktop-first, hỗ trợ tablet bằng progressive collapse, và đạt keyboard/focus/ARIA theo mục tiêu WCAG AA

### Story 1.4: Review, guardrails và publish tenant/branch an toàn

As a system admin,
I want to review onboarding impact and publish only when scope and readiness are valid,
So that I can go live without creating tenant or branch mistakes.

**Implements:** FR6, FR32, FR33, FR34, FR35

**Acceptance Criteria:**

**Given** admin đã hoàn tất các bước onboarding cần thiết
**When** admin mở review step trước khi publish
**Then** review summary panel tổng hợp tenant, branch, cấu hình chính, readiness status và phạm vi ảnh hưởng của thay đổi
**And** hệ thống chặn publish nếu còn thiếu readiness item, có scope mismatch, hoặc có guardrail violation và chỉ rõ bước/field cần sửa
**And** hệ thống hiển thị module hoặc capability bị ảnh hưởng bởi cấu hình tenant/branch vừa tạo để admin nhận biết tác động vận hành
**And** khi publish thành công, hệ thống trả về trạng thái có nghĩa nghiệp vụ rằng branch đầu tiên đã sẵn sàng vận hành hoặc nếu chưa thì nói rõ điều kiện còn thiếu
**And** các kết quả validation scope chính được lưu/báo cáo theo cách hỗ trợ kiểm tra tính đúng scope của flow trước khi mở rộng thêm capability mới

### Story 1.5: Dashboard tenant overview sau onboarding

As a system admin,
I want the admin dashboard to show tenant count and a list of created tenants,
So that I can confirm provisioning outcomes and quickly return to the right tenant context.

**Implements:** FR1, FR5, FR34

**Acceptance Criteria:**

**Given** system admin mở dashboard sau khi đã có tenant được tạo
**When** dashboard tải dữ liệu overview
**Then** hệ thống hiển thị tenant count rõ ràng và danh sách tenant đã tạo với thông tin tối thiểu phù hợp scope
**And** CTA "Tạo tenant mới" vẫn là primary action để bắt đầu onboarding tiếp
**And** dashboard có empty, loading và error states rõ ràng mà vẫn giữ layout ổn định
**And** mỗi tenant item cung cấp action phù hợp để xem lại summary hoặc tiếp tục vào đúng context khả dụng
**And** dữ liệu dashboard tuân theo contract/API envelope chuẩn, không tạo thêm semantics cạnh tranh với guided onboarding flow

## Epic 2: Scoped Staff Access & Branch Governance

System admin và store manager có thể tạo staff, gán role theo tenant/branch và enforce truy cập đúng scope trong vận hành hằng ngày.

### Story 2.1: Đăng nhập với session gắn tenant/branch scope

As a staff member,
I want to sign in with a session that knows my tenant and branch permissions,
So that I can enter only the workspaces I am allowed to operate.

**Implements:** FR9, FR10, FR11

**Acceptance Criteria:**

**Given** một tài khoản staff hợp lệ đã được kích hoạt
**When** staff đăng nhập vào hệ thống
**Then** hệ thống cấp access JWT ngắn hạn và refresh token rotation có chứa claims cần thiết cho tenant/branch scope và role được gán
**And** route/API guards chỉ cho phép staff vào workspace và thực hiện action nằm trong scope được cấp
**And** nếu token hết hạn, bị thu hồi, hoặc scope không hợp lệ, hệ thống trả về error code auth/authz ổn định và không để lộ chi tiết nội bộ
**And** audit log ghi nhận đăng nhập, làm mới token, và từ chối truy cập đối với các sự kiện nhạy cảm liên quan đến scope

### Story 2.2: Tạo staff và gán role theo tenant/branch

As a system admin,
I want to create staff accounts and assign roles at tenant or branch scope,
So that the right people can operate in the right business context.

**Implements:** FR7, FR8

**Acceptance Criteria:**

**Given** system admin đang quản lý một tenant hợp lệ
**When** admin tạo mới hoặc cập nhật staff account
**Then** hệ thống cho phép gán role theo tenant hoặc branch scope một cách rõ ràng và không cho tạo assignment mơ hồ
**And** màn hình/flow quản trị hiển thị summary rõ về tenant, branch, role và phạm vi ảnh hưởng trước khi lưu
**And** hệ thống chặn các assignment xung đột, trùng lặp, hoặc vượt scope quản lý của admin đang thao tác
**And** dữ liệu staff/role được lưu theo contract nhất quán và sẵn sàng cho auth/authz sử dụng ngay sau đó
**And** các thay đổi role/staff được audit log với actor, scope và thay đổi chính

### Story 2.3: Enforce quyền và quản lý staff theo branch cho store manager

As a store manager,
I want to manage branch staff and perform only permitted actions within my branch,
So that branch operations stay secure without depending on central admin for every change.

**Implements:** FR9, FR10, FR11, FR12

**Acceptance Criteria:**

**Given** store manager đã đăng nhập với branch scope hợp lệ
**When** manager xem danh sách staff hoặc thực hiện thao tác quản trị được cấp quyền
**Then** hệ thống chỉ hiển thị staff và action nằm trong branch manager phụ trách
**And** manager có thể cập nhật những thuộc tính/hành động được phép mà không vượt qua role policy đã quy định
**And** mọi thao tác nhạy cảm bị bảo vệ bởi guardrails rõ ràng, thông điệp lỗi gọn rõ, và không cho phép truy cập ngoài scope
**And** query filters, API guards và UI states phải đồng nhất để không xảy ra tình huống thấy dữ liệu đúng scope nhưng thao tác sai scope, hoặc ngược lại

## Epic 3: Branch Catalog & Stock Readiness

Người dùng được phân quyền có thể quản lý product và inventory đúng scope để branch sẵn sàng bán hàng mà vẫn giữ dữ liệu nhất quán xuyên module.

### Story 3.1: Quản lý tenant product catalog nền

As an authorized catalog manager,
I want to create and maintain products within my tenant,
So that branches work from a governed catalog instead of ad-hoc item data.

**Implements:** FR13, FR16

**Acceptance Criteria:**

**Given** người dùng có quyền quản lý catalog trong một tenant hợp lệ
**When** họ tạo mới hoặc cập nhật product
**Then** hệ thống lưu product ở tenant scope với dữ liệu tối thiểu cần cho bán hàng và không tạo dữ liệu ngoài tenant hiện tại
**And** API/UI trả về dữ liệu theo contract chuẩn, hỗ trợ xem lại product trong đúng tenant context
**And** các rule trùng lặp hoặc dữ liệu không hợp lệ bị chặn với error code ổn định
**And** thay đổi product được ghi audit log để hỗ trợ truy vết

### Story 3.2: Gán product cho branch và xem catalog đúng scope

As a branch operator,
I want to assign approved products to my branch and see only the catalog for my scope,
So that my branch sells the correct assortment without cross-branch confusion.

**Implements:** FR14, FR15, FR16

**Acceptance Criteria:**

**Given** tenant đã có product hợp lệ
**When** người dùng được phân quyền gán product vào branch hoặc mở màn hình catalog theo branch
**Then** hệ thống cho phép gán product theo đúng tenant/branch scope và hiển thị chỉ các product khả dụng cho branch đó
**And** hệ thống chặn mọi attempt gán product sang branch hoặc tenant ngoài phạm vi được phép
**And** branch-scoped catalog view vẫn giữ liên kết nhất quán với tenant-level product data để các module khác dùng lại an toàn
**And** scope header/filter hiển thị rõ tenant và branch hiện tại trên các màn catalog liên quan

### Story 3.3: Theo dõi inventory và cập nhật tồn kho theo đúng scope

As a branch operator,
I want to view and adjust inventory within my branch with order-related context,
So that stock remains accurate for selling and reconciliation.

**Implements:** FR21, FR22

**Acceptance Criteria:**

**Given** branch đã có product khả dụng
**When** người dùng được phân quyền xem inventory hoặc ghi nhận điều chỉnh tồn kho
**Then** hệ thống chỉ hiển thị inventory trong tenant/branch context hợp lệ của người dùng
**And** mỗi inventory adjustment phải ghi rõ nguồn gốc hoặc lý do đủ để liên kết với order/giao dịch liên quan khi cần
**And** hệ thống cập nhật tồn kho theo scope đúng và chặn mọi thao tác gây sai branch hoặc sai tenant
**And** trạng thái loading, empty và error của inventory view phải giữ context rõ và hỗ trợ recovery nhanh

## Epic 4: Branch Checkout & Payment Execution

Staff/cashier có thể tạo order và ghi nhận payment trong đúng branch, giúp vận hành giao dịch hoàn chỉnh mà không mất context.

### Story 4.1: Tạo order trong branch đang hoạt động

As a cashier,
I want to create an order in my active branch context,
So that each sale is recorded for the correct store from the start.

**Implements:** FR17, FR20

**Acceptance Criteria:**

**Given** cashier đã đăng nhập và đang ở branch workspace hợp lệ
**When** cashier bắt đầu một order mới
**Then** hệ thống tạo order draft gắn đúng tenantId/branchId và không cho tạo order ngoài branch đang hoạt động
**And** giao diện luôn hiển thị branch context trong suốt flow tạo order
**And** nếu branch context mất đồng bộ hoặc không hợp lệ, hệ thống chặn thao tác và trả về error rõ ràng thay vì âm thầm fallback
**And** order API/DTO tuân theo contract chuẩn để các bước xử lý tiếp theo có thể dùng lại nhất quán

### Story 4.2: Giữ order lifecycle và màn xem order trong đúng scope

As a cashier or store manager,
I want order actions and order visibility to stay inside my branch scope,
So that checkout and supervision remain consistent and trustworthy.

**Implements:** FR18, FR19, FR20

**Acceptance Criteria:**

**Given** đã có order thuộc một branch hợp lệ
**When** cashier cập nhật order hoặc store manager xem danh sách/chi tiết order
**Then** hệ thống chỉ cho phép xem và thao tác các order thuộc branch người dùng được cấp quyền
**And** store manager có thể xem order của branch mình quản lý mà không nhìn thấy order ngoài scope
**And** các trạng thái order chính vẫn giữ branch context nhất quán xuyên suốt các bước xử lý
**And** mọi attempt truy cập hoặc thao tác order ngoài scope đều bị chặn bởi guardrails ở UI, API và query layer

### Story 4.3: Ghi nhận payment cho order đúng tenant/branch scope

As a cashier,
I want to capture payment against a valid branch order,
So that the transaction is completed accurately and traceably.

**Implements:** FR23, FR24

**Acceptance Criteria:**

**Given** một order hợp lệ đang ở branch mà cashier được phép thao tác
**When** cashier ghi nhận payment cho order đó
**Then** payment được gắn đúng với order, tenant và branch liên quan
**And** payment flow dùng contract/provider abstraction đủ rõ để vẫn provider-agnostic ở giai đoạn chưa chốt payment provider
**And** hệ thống chặn mọi trường hợp payment áp vào order ngoài scope, order không hợp lệ, hoặc trạng thái không cho phép
**And** audit log ghi lại payment action và lỗi liên quan để phục vụ reconciliation và điều tra sự cố

## Epic 5: Customer & Promotion Growth Capabilities

Khi bước sang phase tăng trưởng, đội vận hành có thể quản lý customer và promotion trong đúng tenant/branch scope mà không phá vỡ nền tảng MVP.

### Story 5.1: Quản lý customer trong tenant scope và gắn vào order

As an authorized operator,
I want to create and maintain customer records within my tenant and attach them to orders,
So that repeat customers can be served consistently without cross-tenant leakage.

**Implements:** FR25, FR26

**Acceptance Criteria:**

**Given** tenant đã bật phase mở rộng customer capability
**When** người dùng được phân quyền tạo/cập nhật customer hoặc gắn customer vào order
**Then** customer records chỉ tồn tại trong tenant scope hợp lệ và không thể bị truy cập chéo tenant
**And** hệ thống chỉ cho phép gắn customer vào order cùng tenant/branch context hợp lệ
**And** contract customer được thiết kế như extension seam, không phá vỡ các module MVP hiện có
**And** các lỗi scope mismatch hoặc liên kết không hợp lệ được trả về bằng error code ổn định

### Story 5.2: Tạo promotion theo scope và áp dụng vào order đủ điều kiện

As an authorized operator,
I want to define promotions and apply them only to eligible scoped orders,
So that discounts remain controlled and consistent across tenant and branch operations.

**Implements:** FR27, FR28

**Acceptance Criteria:**

**Given** tenant đã bật phase promotion capability
**When** người dùng được phân quyền tạo promotion hoặc áp promotion vào order
**Then** promotion được cấu hình theo tenant scope và có rule áp dụng rõ cho branch hoặc ngữ cảnh được phép
**And** hệ thống chỉ áp promotion cho order đủ điều kiện trong đúng tenant/branch context
**And** các rule xung đột, ngoài scope, hoặc không hợp lệ bị chặn với thông điệp rõ ràng và audit trail phù hợp
**And** implementation giữ đúng extension path post-MVP, không kéo customer/promotion vào foundation stories của MVP
