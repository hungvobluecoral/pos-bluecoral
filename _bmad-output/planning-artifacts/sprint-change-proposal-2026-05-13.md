# Sprint Change Proposal - Dashboard Tenant Overview

**Ngày:** 2026-05-13
**Dự án:** POS_BlueCoral
**Trigger:** Dashboard hiện chưa có UI hiển thị tenant đã tạo, gồm tenant count và/hoặc tenant list.
**Chế độ làm việc:** Incremental

## 1. Tóm tắt vấn đề

Trong scope hiện tại, dashboard admin mới đóng vai trò điểm vào cho flow onboarding thông qua CTA **"Tạo tenant mới"**. Sau khi provisioning tenant thành công, system admin chưa có một màn hình quay lại đủ rõ để:

- xác nhận đã có bao nhiêu tenant được tạo,
- xem lại các tenant đã có,
- tiếp tục thao tác từ dashboard thay vì chỉ quay lại flow onboarding.

Vấn đề này được xác định là **khoảng trống scope/story**, không phải lỗi implementation. Các story Epic 1 hiện tại giải quyết onboarding, scope-awareness, readiness và review/publish, nhưng chưa giải quyết nhu cầu quan sát tenant đã tạo trên dashboard.

## 2. Phân tích tác động

### Epic Impact

- **Epic bị ảnh hưởng:** Epic 1 - Guided Tenant & Branch Onboarding
- **Mức độ ảnh hưởng:** Moderate
- **Kết luận:** Epic 1 vẫn hợp lệ, nhưng nên mở rộng bằng một story mới sau Story 1.4 để dashboard không chỉ là entry point mà còn là landing surface sau onboarding.

### Story Impact

- **Story 1.1:** Không cần sửa trực tiếp vì đã hoàn thành đúng scope ban đầu.
- **Story 1.2:** Không cần sửa trực tiếp; provisioning flow hiện có là nền dữ liệu cho dashboard overview.
- **Story 1.3 / 1.4:** Không cần sửa logic cốt lõi, nhưng story mới sẽ tận dụng outcome của onboarding.
- **Đề xuất mới:** Thêm **Story 1.5 - Dashboard tenant overview sau onboarding**.

### Tác động tới artifacts

- **PRD:** Cần bổ sung dashboard admin như một operational landing surface tối thiểu, không chỉ là CTA entry.
- **Epics:** Cần thêm story mới trong Epic 1.
- **Architecture:** Cần bổ sung frontend/API boundary cho dashboard tenant summary/list.
- **UX Design:** Cần mở rộng dashboard với tenant overview, empty/loading/error/list states.

### Tác động kỹ thuật

- Có thể cần endpoint đọc tenant summary/list cho dashboard.
- Cần giữ nguyên CTA **"Tạo tenant mới"** là primary action.
- Cần test cho dashboard states: empty, loading, success, error.

## 3. Hướng tiếp cận được khuyến nghị

### Phương án được chọn: Direct Adjustment

Thay vì rollback hoặc re-scope MVP, đề xuất **thêm một story mới trong Epic 1** để xử lý tenant overview trên dashboard.

### Lý do chọn

- Chi phí thay đổi thấp hơn rollback.
- Không phá guided onboarding direction đã chốt.
- Giữ tính nhất quán giữa trải nghiệm "bắt đầu onboarding" và "quay lại xem kết quả provisioning".
- Giảm rủi ro nhồi thêm scope vào các story đã done.

### Đánh giá

- **Effort:** Low-Medium
- **Risk:** Low
- **Timeline impact:** Nhỏ, chủ yếu là thêm 1 story và sync artifacts liên quan.

## 4. Chi tiết đề xuất thay đổi

### 4.1 Epics - Thêm story mới

**Artifact:** `_bmad-output/planning-artifacts/epics.md`

**OLD**

Epic 1 kết thúc ở Story 1.4 với onboarding, review, guardrails và publish tenant/branch.

**NEW**

Thêm story mới sau Story 1.4:

**Story 1.5: Dashboard tenant overview sau onboarding**

As a system admin,  
I want the admin dashboard to show tenant count and a list of created tenants,  
so that I can confirm provisioning outcomes and quickly return to the right tenant context.

**Acceptance Criteria đề xuất**

1. Dashboard hiển thị tenant count rõ ràng cho system admin.
2. Dashboard hiển thị danh sách tenant đã tạo với thông tin tối thiểu phù hợp scope.
3. CTA **"Tạo tenant mới"** vẫn là primary action.
4. Dashboard có empty/loading/error states rõ ràng.
5. Mỗi tenant item có action phù hợp để review hoặc tiếp tục vào đúng context nếu capability đó đã sẵn sàng.

**Rationale:** Bổ sung năng lực quan sát sau onboarding mà không làm loãng scope của Story 1.1-1.4.

### 4.2 PRD - Mở rộng vai trò dashboard

**Artifact:** `_bmad-output/planning-artifacts/prd.md`

**OLD**

Dashboard admin chủ yếu được mô tả như điểm vào để bắt đầu flow **"Tạo tenant mới"**.

**NEW**

Bổ sung rằng dashboard admin cần là **operational landing surface tối thiểu** cho system admin, gồm:

- CTA **"Tạo tenant mới"**
- tenant count
- tenant list/summary sau provisioning

**Rationale:** Biến nhu cầu này thành yêu cầu sản phẩm chính thức thay vì implementation detail.

### 4.3 UX Design - Dashboard overview

**Artifact:** `_bmad-output/planning-artifacts/ux-design-specification.md`

**OLD**

Dashboard được định nghĩa chủ yếu là điểm vào cho guided linear flow.

**NEW**

Mở rộng dashboard với:

- CTA **"Tạo tenant mới"** vẫn là primary action
- một khu **tenant overview**
- tenant count + danh sách tenant
- empty state dẫn vào onboarding khi chưa có tenant
- loading/error states giữ layout ổn định và chỉ rõ next action

**Rationale:** Giữ nguyên design direction nhưng thêm landing utility sau onboarding.

### 4.4 Architecture - Frontend/API boundary

**Artifact:** `_bmad-output/planning-artifacts/architecture.md`

**OLD**

Architecture mô tả dashboard CTA và guided onboarding, chưa có tenant overview surface.

**NEW**

Bổ sung:

- dashboard tenant overview là một frontend surface rõ ràng
- nếu cần, có API read endpoint cho tenant summary/list
- response tuân theo shared REST envelope
- test coverage cho dashboard overview states

**Rationale:** Đảm bảo thay đổi được triển khai như một boundary rõ ràng, không phải patch UI rời rạc.

## 5. Kế hoạch handoff triển khai

### Phân loại scope

**Moderate** — cần backlog reorganization nhẹ và cập nhật planning artifacts, nhưng chưa phải replan lớn.

### Handoff recipients

- **Product Owner / Developer**

### Trách nhiệm

- **PO:** cập nhật epics/PRD/UX/architecture theo proposal đã duyệt
- **DEV:** triển khai story mới sau khi backlog được cập nhật

### Success criteria

- Epic 1 có story mới rõ scope
- Dashboard hiển thị tenant count/list mà không làm mất CTA onboarding
- Planning artifacts đồng bộ với implementation direction mới

## 6. Kế hoạch hành động mức cao

1. Cập nhật `epics.md` để thêm Story 1.5
2. Cập nhật `prd.md` để mở rộng vai trò dashboard
3. Cập nhật `ux-design-specification.md` cho dashboard overview
4. Cập nhật `architecture.md` cho frontend/API boundary
5. Sau khi approve, route cho implementation planning/development
