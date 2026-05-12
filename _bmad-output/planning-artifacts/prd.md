---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
releaseMode: phased
inputDocuments:
  - "_bmad-output/planning-artifacts/product-brief-POS_BlueCoral.md"
  - "_bmad-output/planning-artifacts/research/domain-medusajs-research-2026-05-12.md"
documentCounts:
  briefCount: 1
  researchCount: 1
  brainstormingCount: 0
  projectDocsCount: 0
classification:
  projectType: "SaaS B2B platform"
  domain: "retail commerce / POS multi-tenant"
  complexity: "rất cao"
  projectContext: "brownfield"
  architecturalStance: "Hệ thống modular trên NestJS + NextJS, ưu tiên modular monolith với khả năng tách selective services khi cần; không neo vào Medusa Core"
workflowType: 'prd'
---

# Tài liệu Yêu cầu Sản phẩm - POS_BlueCoral

**Tác giả:** Hung
**Ngày:** 2026-05-12

## Executive Summary

POS_BlueCoral là một nền tảng POS retail multi-tenant theo hướng SaaS B2B, hỗ trợ nhiều tenant độc lập, mỗi tenant có nhiều branch, nhưng vẫn giữ kiến trúc đủ rõ để hệ thống không trở nên rối khi mở rộng. Trọng tâm của sản phẩm không phải là gom thật nhiều capability retail ngay từ đầu, mà là xây một lõi POS modular trên NestJS và NextJS, nơi các domain như Order, Product, Promotion, Multi Tenant, Payment, Inventory, Customer và Staff được tách thành các module rõ ràng, có ranh giới trách nhiệm sạch và có thể phát triển tiếp mà không phá vỡ phần còn lại của hệ thống.

Giá trị cốt lõi của POS_BlueCoral nằm ở việc giải quyết bài toán tenant và branch ngay từ kiến trúc. Thay vì để multi-tenancy trở thành lớp vá thêm vào sau này, sản phẩm đặt tenant/branch isolation làm nguyên tắc thiết kế trung tâm. Điều đó giúp dữ liệu, quyền truy cập, quy trình vận hành và khả năng mở rộng được tổ chức mạch lạc từ đầu, giảm rủi ro hệ thống bị chồng chéo logic khi số tenant, số branch và số module tăng lên.

Sản phẩm hướng tới việc giúp đội xây dựng và vận hành nhìn vào hệ thống là hiểu mỗi module làm gì, tenant và branch được tách ở đâu, và capability mới có thể được thêm vào mà không làm mất tính nhất quán của nền tảng. Với hướng đi này, POS_BlueCoral không cạnh tranh bằng việc "nhiều tính năng hơn" ở giai đoạn đầu, mà bằng một nền móng đúng: rõ module, rõ ranh giới tenant/branch, và đủ sạch để mở rộng thành một hệ POS mạnh hơn theo thời gian.

### Điều gì làm sản phẩm này khác biệt

Điểm khác biệt của POS_BlueCoral là sự đơn giản có chủ đích ở cấp kiến trúc. Nhiều hệ POS trở nên khó mở rộng vì tenant, branch, quyền hạn, inventory, payment và promotion bị đan chéo trong cùng một khối logic. POS_BlueCoral đi theo hướng ngược lại: coi modularity và tenant/branch isolation là nền tảng trước, rồi mới xây capability lên phía trên. Kết quả là một sản phẩm dễ hiểu hơn cho team phát triển, dễ kiểm soát hơn khi mở rộng, và phù hợp hơn với bối cảnh nhiều tenant nhiều branch.

Khoảnh khắc khác biệt của sản phẩm không nằm ở giao diện hào nhoáng mà ở việc cấu trúc hệ thống giữ được sự sạch sẽ khi domain phức tạp dần lên. Khi thêm hoặc chỉnh các module như Order, Inventory, Payment hay Staff, hệ thống vẫn duy trì được ranh giới rõ giữa các tenant và branch thay vì lan truyền độ phức tạp ra toàn bộ nền tảng. Đây là insight cốt lõi làm nên định hướng sản phẩm.

## Project Classification

- **Project Type:** SaaS B2B platform
- **Domain:** retail commerce / POS multi-tenant
- **Complexity:** rất cao
- **Project Context:** brownfield
- **Architectural Stance:** hệ thống modular trên NestJS + NextJS, ưu tiên modular monolith với khả năng tách selective services khi cần; không neo vào Medusa Core

## Success Criteria

### User Success

Người dùng thành công khi có thể vận hành đúng trong đúng tenant và đúng branch mà không bị nhầm lẫn ở các flow chính. Với POS_BlueCoral, cảm giác "đúng cái mình cần" không đến từ số lượng tính năng, mà đến từ việc cấu trúc tenant/branch rõ đến mức người vận hành không cần suy đoán hệ thống đang ở phạm vi nào. Ở giai đoạn đầu, tiêu chí user success quan trọng nhất là lỗi thao tác nhầm tenant/branch trong các flow chính phải gần như bằng 0.

### Business Success

Từ góc business và product, thành công không chỉ là hệ thống chạy được, mà là hệ thống giữ được khả năng mở rộng có kiểm soát. Một tín hiệu thành công quan trọng là mỗi module mới có thể được tích hợp vào mà không kéo theo việc phải sửa dây chuyền nhiều module cũ. Điều đó chứng minh hướng modular đang mang lại giá trị thực: giảm độ rối của sản phẩm khi phạm vi tăng lên, thay vì tích lũy nợ kiến trúc ngay từ đầu.

### Technical Success

Về kỹ thuật, thành công nghĩa là mỗi module có ranh giới rõ, trách nhiệm rõ và ít phụ thuộc chéo. Kiến trúc phải cho phép thêm hoặc chỉnh một module mà không gây lan truyền thay đổi không cần thiết sang các module còn lại. Tenant isolation cũng phải được thực thi nhất quán xuyên suốt, nhưng dấu hiệu kỹ thuật quan trọng nhất trong giai đoạn đầu là hệ thống thể hiện được modular boundaries sạch và đủ ổn định để phát triển tiếp.

### Measurable Outcomes

- Lỗi thao tác nhầm tenant/branch trong các flow chính ở pilot ở mức gần như bằng 0.
- Các module mới được thêm vào mà không phát sinh yêu cầu sửa dây chuyền trên nhiều module cũ.
- Ranh giới module đủ rõ để đội phát triển có thể xác định nhanh nơi cần thay đổi mà không phải rà soát toàn bộ hệ thống.
- Các flow lõi của MVP giữ được tính ổn định khi bổ sung module mới.

## Product Scope

### MVP - Minimum Viable Product

MVP cần chứng minh hai điều: tenant/branch isolation được thiết kế đúng ngay từ đầu, và modular architecture thực sự giúp mở rộng hệ thống mà không làm nó rối đi. Vì vậy MVP nên bao gồm: Multi Tenant, Branch, Order, Product, Inventory, Staff và Payment. Đây là tập capability tối thiểu để kiểm chứng được cả vận hành tenant/branch lẫn khả năng phối hợp giữa các module lõi.

### Growth Features (Post-MVP)

Sau khi lõi ổn định, giai đoạn growth nên mở rộng theo các capability làm hệ thống cạnh tranh hơn nhưng chưa bắt buộc để chứng minh nền móng: Promotion, Customer, rule handling phức tạp hơn, báo cáo vận hành, và các cải tiến giúp quản trị nhiều branch mượt hơn. Ở giai đoạn này, trọng tâm không phải thêm thật nhiều tính năng, mà là thêm đúng các module mà vẫn giữ được ranh giới kiến trúc sạch.

### Vision (Future)

Về lâu dài, POS_BlueCoral hướng tới một nền tảng POS multi-tenant đủ mạnh để tiếp tục mở rộng mà không đánh mất tính rõ ràng ban đầu. Vision không chỉ là nhiều module hơn, mà là một kiến trúc nơi tenant, branch và domain boundaries luôn được duy trì sạch kể cả khi sản phẩm đi tới các bài toán phức tạp hơn như orchestration sâu hơn giữa modules, selective service extraction, hoặc các capability retail mở rộng.

## User Journeys

### Journey 1 - System Admin nội bộ: tạo tenant và branch mới đúng ngay từ đầu

Ta gặp system admin ở thời điểm bắt đầu onboarding một tenant mới. Họ không tìm kiếm một màn hình nhiều chức năng, mà cần một hệ thống đủ rõ để biết tenant nào đang được tạo, branch nào đang được gắn, module nào đang được bật, và quyền nào đang đi kèm. Ở phần rising action, họ đi qua các bước cấu hình tenant, tạo branch đầu tiên, gán cấu hình nền và chuẩn bị cho vận hành. Climax của journey này là khoảnh khắc system admin hoàn tất thiết lập mà vẫn tin chắc mọi thứ đang nằm đúng phạm vi tenant/branch, không có cảm giác phải kiểm tra chéo nhiều lớp logic. Resolution là tenant mới có thể bước vào vận hành với nền tảng sạch ngay từ đầu.

### Journey 2 - System Admin nội bộ: xử lý edge case khi có nguy cơ gán nhầm tenant/branch

Ta gặp lại system admin trong một tình huống căng hơn: họ đang thao tác nhanh, nhưng hệ thống xuất hiện nguy cơ gán nhầm tenant hoặc nhầm branch. Giá trị của POS_BlueCoral ở đây không phải "cho làm nhanh bằng mọi giá", mà là làm cho sai sót nguy hiểm trở nên khó xảy ra và dễ phát hiện. Rising action của journey này là hệ thống buộc context phải rõ, làm lộ ra các điểm dễ nhầm và khiến admin nhận ra vấn đề trước khi sai lệch lan sang cấu hình hoặc dữ liệu vận hành. Climax là khoảnh khắc lỗi được chặn hoặc được nhìn thấy đủ sớm để không làm bẩn tenant/branch khác. Resolution là admin giữ được niềm tin rằng kiến trúc đang bảo vệ họ khỏi loại sai sót nguy hiểm nhất.

### Journey 3 - Store Manager: nhìn đúng dữ liệu trong đúng branch mà không bị lẫn

Ta gặp store manager trong bối cảnh đang theo dõi vận hành của branch mình. Họ không muốn nhìn một hệ thống chung chung; họ muốn biết dữ liệu mình đang thấy thật sự thuộc branch nào, có liên quan trực tiếp đến việc điều hành cửa hàng của mình hay không. Rising action của journey này là manager đi qua các màn hình và thao tác thường ngày nhưng luôn giữ được cảm giác rõ ràng về phạm vi. Climax xảy ra khi họ có thể ra quyết định vận hành dựa trên dữ liệu đúng branch mà không phải nghi ngờ hệ thống đang lẫn dữ liệu từ nơi khác. Resolution là công việc quản lý trở nên bình tĩnh và chắc chắn hơn.

### Journey 4 - Staff/Cashier: thao tác trong đúng branch mà không nhầm phạm vi

Ta gặp staff/cashier ở nhịp vận hành hằng ngày, nơi mọi thao tác cần nhanh nhưng không được mơ hồ. Họ không cần hiểu kiến trúc modular phía sau; họ chỉ cần hệ thống dẫn họ đi trong đúng phạm vi branch đang làm việc. Rising action là các thao tác bán hàng diễn ra trong ngữ cảnh branch rõ ràng. Climax là staff hoàn tất công việc mà không bị lạc context, không phải tự suy đoán mình đang ở tenant/branch nào. Resolution là hệ thống trở thành công cụ dễ tin cậy, không tạo thêm áp lực nhận thức trong ca làm việc.

### Journey Requirements Summary

Các journey này làm lộ ra một nhóm capability rất rõ:
- tenant/branch context phải luôn hiển thị rõ trong các flow quan trọng;
- system admin cần flow tạo tenant/branch có guardrails chống gán nhầm;
- dữ liệu và quyền phải được ràng buộc chặt theo tenant/branch;
- store manager và staff cần luôn nhìn thấy và thao tác trong đúng phạm vi branch;
- kiến trúc module phải đủ sạch để việc thêm module mới không phá vỡ các guardrails trên.

## Domain-Specific Requirements

### Compliance & Regulatory

Ở giai đoạn hiện tại, POS_BlueCoral chưa cần chốt bộ compliance chính thức như PCI-DSS hay framework audit mở rộng. Tuy vậy, hệ thống vẫn cần được thiết kế theo tinh thần kiểm soát truy cập chặt ngay từ đầu. Trọng tâm trước mắt là RBAC đủ rõ để mỗi người chỉ thấy và thao tác trong đúng phạm vi tenant/branch được phép.

### Technical Constraints

Constraint kỹ thuật quan trọng nhất của domain này là tenant isolation không được dừng ở mức tenant, mà phải đi xuống tận branch context. Hệ thống phải đảm bảo người dùng không nhìn thấy dữ liệu ngoài tenant/branch của mình, và mọi flow chính đều phải giữ ngữ cảnh tenant/branch rõ ràng. Kiến trúc module cũng phải ngăn trường hợp thêm module mới nhưng vô tình làm lỏng ranh giới phân quyền hoặc làm sai branch context.

### Integration Requirements

Các module lõi như Multi Tenant, Staff, Order, Product, Inventory và Payment phải chia sẻ cùng một mô hình ngữ cảnh tenant/branch nhất quán. Tích hợp giữa các module không được chỉ đúng ở mức tenant mà sai ở mức branch. Điều này có nghĩa là mọi contract giữa module cần mang rõ scope dữ liệu và quyền truy cập tương ứng với tenant/branch.

### Risk Mitigations

- Không ai được nhìn thấy dữ liệu ngoài tenant/branch của mình.
- Phải coi "đúng tenant nhưng sai branch" là một failure mode riêng, không gộp chung vào bài toán tenant isolation.
- RBAC cần được thiết kế như guardrail nền, không phải vá thêm sau này.
- Khi thêm module mới, phải giữ nguyên các ranh giới phân quyền và branch context đã có.

## Innovation & Novel Patterns

### Detected Innovation Areas

Góc innovation của POS_BlueCoral không nằm ở việc phát minh ra một loại POS hoàn toàn mới, mà ở việc biến tenant/branch correctness thành một năng lực sản phẩm có chủ đích. Thay vì coi multi-tenancy chỉ là một cơ chế phân vùng dữ liệu, POS_BlueCoral có thể được định vị như một operational safety platform cho POS multi-tenant: tenant và branch trở thành first-class principal trong kiến trúc, trong contract giữa các module, và trong cách hệ thống kiểm soát thao tác rủi ro.

Điểm mới thực sự nằm ở chỗ modular extensibility không được tách rời khỏi safety. Khi thêm module mới, hệ thống vẫn phải giữ được guardrails chống sai tenant, sai branch, và sai phạm vi truy cập. Nếu làm đúng, đây không chỉ là "kiến trúc sạch", mà là một cách đóng gói correctness thành giá trị sản phẩm.

### Market Context & Competitive Landscape

Nhiều hệ POS multi-tenant giải quyết bài toán tăng feature hoặc tăng khả năng cấu hình, nhưng ít hệ thống lấy safety của tenant/branch boundaries khi mở rộng module làm narrative trung tâm. Vì vậy, nếu POS_BlueCoral đi theo hướng này, điểm khác biệt không phải là nhiều capability hơn, mà là lời hứa mạnh hơn: hệ thống có thể lớn lên mà vẫn giữ được phạm vi vận hành đúng.

### Validation Approach

- Prototype trên một flow nhạy cảm như tenant/branch setup hoặc inventory adjustment.
- Chứng minh cross-tenant/cross-branch leak bằng 0 trong các scenario thử nghiệm chính.
- Đo lỗi wrong-branch giảm mạnh hoặc gần như bằng 0.
- Kiểm tra việc thêm module mới có giữ được scope safety và system stability hay không.

### Risk Mitigation

Nếu góc innovation này không đủ mạnh để trở thành narrative sản phẩm, không nên cố gọi đó là breakthrough. Khi đó, fallback hợp lý là định vị POS_BlueCoral như một hệ POS multi-tenant có reliability, modularity và correctness vượt trội. Giá trị vẫn mạnh, chỉ khác ở cách kể câu chuyện.

## SaaS B2B Specific Requirements

### Project-Type Overview

POS_BlueCoral là một nền tảng SaaS B2B nhiều tenant, trong đó mỗi tenant có nhiều branch và được vận hành trên cùng một platform. Giá trị cốt lõi của mô hình này không nằm ở việc gom nhiều capability nhất có thể, mà ở việc giữ tenant model và branch model đủ rõ để sản phẩm mở rộng mà không phá vỡ correctness. Vì vậy, các yêu cầu đặc thù của project type này tập trung vào multi-tenancy, RBAC theo scope, tích hợp giữa các module nội bộ, và guardrails để giữ tenant/branch isolation nhất quán.

### Technical Architecture Considerations

Kiến trúc phải coi tenant và branch là context nền của toàn hệ thống. Điều đó có nghĩa là mọi module lõi như Multi Tenant, Staff, Order, Product, Inventory và Payment đều phải hiểu cùng một tenant model và cùng một branch model. RBAC không chỉ dừng ở role, mà phải gắn với phạm vi tenant và branch. Vì product chưa ưu tiên subscription tiers ở giai đoạn này, kiến trúc có thể tập trung vào correctness và modularity trước, thay vì tối ưu sớm cho packaging thương mại.

### Tenant Model

- Một platform phục vụ nhiều tenant.
- Mỗi tenant có nhiều branch.
- Tenant và branch phải được thể hiện rõ trong dữ liệu, quyền truy cập và flow vận hành.
- Branch không phải là thuộc tính phụ; nó là một scope vận hành cốt lõi cần được enforce xuyên module.

### RBAC Matrix

- Quyền được gắn theo tenant và branch, không chỉ theo role chung.
- Người dùng chỉ được nhìn thấy và thao tác trong đúng tenant/branch được cấp.
- Các thao tác nhạy cảm cần có guardrails để tránh sai scope.
- RBAC cần đủ rõ để khi thêm module mới, hệ thống không làm lỏng các ranh giới quyền hiện có.

### Subscription Tiers

- Chưa được đưa vào phạm vi cốt lõi của PRD hiện tại.
- Không nên để subscription tiers chi phối kiến trúc giai đoạn đầu.
- Có thể xem đây là một concern thương mại hóa ở giai đoạn sau khi lõi vận hành đã ổn định.

### Integration List

- Trọng tâm trước mắt là integration giữa các module nội bộ.
- Contract giữa module phải mang rõ tenant/branch context.
- Integration nội bộ không được chỉ đúng ở mức tenant mà sai ở mức branch.
- Mọi điểm giao tiếp giữa module cần hỗ trợ mở rộng mà không phá vỡ isolation và RBAC.

### Compliance Requirements

- Trọng tâm compliance trước mắt là RBAC chặt và tenant/branch isolation đúng.
- Chưa cần mở rộng ngay sang subscription/commercial compliance hoặc audit framework lớn.
- Khi product đi sâu hơn vào payment hoặc external integrations, phần compliance có thể cần được mở rộng ở các bước sau.

### Implementation Considerations

Ở giai đoạn triển khai, project type này đòi hỏi team phải coi correctness theo scope là nguyên tắc ngang hàng với feature delivery. Thành công không đến từ việc module nào được build trước, mà đến từ việc module nào được build mà vẫn giữ được tenant/branch boundaries. Vì vậy, implementation cần ưu tiên contract rõ giữa module, quyền rõ theo scope, và integration nội bộ nhất quán trước khi mở rộng thêm các concern như tiers hoặc external platform integrations.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-solving MVP. Phase 1 không nhằm chứng minh rằng POS_BlueCoral đã đầy đủ capability retail, mà nhằm chứng minh rằng hệ thống thực sự giải đúng bài toán tenant/branch ngay từ kiến trúc và vận hành.

**Resource Requirements:** Team vừa, đủ backend, frontend và QA để giữ cân bằng giữa tốc độ build và độ an toàn của scope. Với loại bài toán này, correctness theo tenant/branch không thể chỉ phó mặc cho backend; cần đủ năng lực để kiểm soát flow, UI context và regression xuyên module.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- System admin tạo tenant và branch mới đúng ngay từ đầu.
- System admin tránh được lỗi gán nhầm tenant/branch.
- Store manager nhìn đúng dữ liệu trong đúng branch.
- Staff/cashier thao tác trong đúng branch mà không nhầm phạm vi.

**Must-Have Capabilities:**
- Multi Tenant
- Branch
- Order
- Product
- Inventory
- Staff
- Payment
- RBAC theo tenant và branch
- Guardrails cho tenant/branch context trong các flow chính

### Post-MVP Features

**Phase 2:**
- Promotion
- Customer
- Rule handling phức tạp hơn
- Báo cáo vận hành
- Các capability mở rộng nhưng vẫn phải tuân theo tenant/branch isolation và modular boundaries

**Phase 3:**
- Mở rộng innovation angle thành operational safety platform rõ nét hơn
- Selective service extraction khi thật sự cần
- Các capability retail mở rộng hơn sau khi lõi modular và correctness đã được kiểm chứng

### Risk Mitigation Strategy

**Technical Risks:** Rủi ro lớn nhất là tenant/branch isolation không giữ được xuyên suốt module. Cách giảm rủi ro là đặt tenant/branch context thành guardrail nền, kiểm tra chặt ở các flow chính, và không cho module mới làm lỏng scope.

**Market Risks:** Rủi ro thị trường lớn nhất là người dùng không cảm nhận đủ giá trị từ narrative "correctness + clarity" nếu Phase 1 không làm lộ rõ lợi ích vận hành. Vì vậy MVP phải chứng minh được sai nhầm tenant/branch giảm mạnh và hệ thống thực sự dễ tin cậy hơn.

**Resource Risks:** Nếu nguồn lực thấp hơn kế hoạch, vẫn phải giữ nguyên tenant/branch isolation, RBAC theo scope và các flow lõi của Phase 1; phần có thể lùi hợp lý là Promotion, Customer và các capability phức tạp hơn ở giai đoạn sau.

## Functional Requirements

### Tenant & Branch Governance

- FR1: System admin có thể tạo tenant mới trên platform.
- FR2: System admin có thể tạo một hoặc nhiều branch trong phạm vi một tenant.
- FR3: System admin có thể gán cấu hình vận hành cơ bản cho từng tenant.
- FR4: System admin có thể gán cấu hình vận hành cơ bản cho từng branch.
- FR5: System admin có thể xem rõ tenant và branch context của mọi cấu hình đang thao tác.
- FR6: Hệ thống có thể ngăn hoặc cảnh báo khi thao tác có nguy cơ gán nhầm tenant hoặc branch.

### Access Control & Staff Management

- FR7: System admin có thể tạo và quản lý tài khoản staff trong phạm vi tenant phù hợp.
- FR8: System admin có thể gán role cho staff theo phạm vi tenant hoặc branch.
- FR9: Staff chỉ có thể xem dữ liệu trong phạm vi tenant/branch được cấp quyền.
- FR10: Staff chỉ có thể thực hiện thao tác trong phạm vi tenant/branch được cấp quyền.
- FR11: Hệ thống có thể áp dụng guardrails cho các thao tác nhạy cảm theo role và scope.
- FR12: Store manager có thể quản lý staff thuộc branch mình phụ trách trong phạm vi được cấp.

### Product & Catalog Management

- FR13: Người dùng được phân quyền có thể tạo và quản lý product trong phạm vi tenant.
- FR14: Người dùng được phân quyền có thể gán product cho branch phù hợp.
- FR15: Người dùng được phân quyền có thể xem product theo đúng tenant/branch context.
- FR16: Hệ thống có thể giữ product data nhất quán với scope tenant/branch khi được sử dụng bởi các module khác.

### Order & Checkout Operations

- FR17: Staff/cashier có thể tạo order trong đúng branch đang vận hành.
- FR18: Staff/cashier có thể thao tác order mà không bị mất branch context trong flow chính.
- FR19: Store manager có thể xem order thuộc đúng branch mình quản lý.
- FR20: Hệ thống có thể ngăn order được tạo hoặc xử lý ngoài phạm vi tenant/branch hợp lệ.

### Inventory & Payment Management

- FR21: Người dùng được phân quyền có thể xem inventory trong đúng branch hoặc tenant context phù hợp.
- FR22: Hệ thống có thể cập nhật inventory theo đúng scope của order hoặc giao dịch liên quan.
- FR23: Staff/cashier có thể ghi nhận payment cho order trong đúng tenant/branch context.
- FR24: Hệ thống có thể đảm bảo payment gắn đúng với order và scope vận hành liên quan.

### Customer & Promotion Capabilities

- FR25: Người dùng được phân quyền có thể tạo và quản lý customer trong phạm vi tenant phù hợp.
- FR26: Hệ thống có thể gắn customer vào order trong đúng tenant/branch context.
- FR27: Người dùng được phân quyền có thể tạo và quản lý promotion trong phạm vi tenant phù hợp.
- FR28: Hệ thống có thể áp dụng promotion theo đúng scope tenant/branch và rule được cấu hình.

### Internal Module Coordination

- FR29: Các module lõi có thể trao đổi dữ liệu với nhau mà vẫn giữ nguyên tenant/branch context.
- FR30: Hệ thống có thể đảm bảo integration giữa các module nội bộ không làm sai lệch quyền truy cập theo scope.
- FR31: Hệ thống có thể giữ branch context nhất quán xuyên suốt các flow đi qua nhiều module.

### Platform Safety & Expansion

- FR32: Hệ thống có thể duy trì tenant/branch isolation khi capability mới được thêm vào.
- FR33: Hệ thống có thể hỗ trợ mở rộng module mới mà không làm mất các guardrails theo scope đã có.
- FR34: System admin có thể xác định module nào đang ảnh hưởng đến tenant hoặc branch cụ thể trong quá trình vận hành.
- FR35: Hệ thống có thể hỗ trợ kiểm tra tính đúng scope của các flow chính trước khi mở rộng thêm capability mới.

## Non-Functional Requirements

### Security

- Tenant/branch isolation phải được enforce xuyên suốt các flow chính và các module lõi.
- Người dùng không được nhìn thấy hoặc thao tác dữ liệu ngoài tenant/branch được cấp quyền.
- RBAC phải được áp dụng nhất quán theo tenant và branch, không chỉ theo role chung.
- Hệ thống phải coi "đúng tenant nhưng sai branch" là một failure mode cần được ngăn chặn và phát hiện rõ.

### Performance

- Các thao tác chính của người dùng phải phản hồi trong khoảng 2 giây trong điều kiện vận hành bình thường.
- Hiệu năng không được làm gián đoạn các flow chính như tạo tenant/branch, xem dữ liệu đúng branch, tạo order và ghi nhận payment trong đúng scope.
- Khi hiệu năng giảm, hệ thống vẫn phải giữ đúng tenant/branch context thay vì ưu tiên tốc độ bằng cách nới lỏng guardrails.

### Scalability

- Hệ thống phải sẵn sàng tăng số tenant và branch theo thời gian mà không làm vỡ tenant model, branch model hoặc RBAC model.
- Việc mở rộng số tenant/branch không được làm mất tính rõ ràng của scope giữa các module lõi.
- Kiến trúc phải cho phép tăng phạm vi vận hành mà vẫn giữ được correctness theo tenant/branch.

### Reliability

- Các flow chính phải duy trì correctness kể cả khi hệ thống được mở rộng thêm module mới.
- Hệ thống không được để việc thêm capability mới làm hỏng các guardrails hiện có về scope.
- Những lỗi liên quan đến sai tenant/sai branch phải dễ phát hiện và không được âm thầm lan sang các module khác.

### Integration

- Contract giữa các module phải ổn định và nhất quán theo tenant/branch context.
- Integration giữa các module nội bộ không được làm sai lệch scope dữ liệu hoặc quyền truy cập.
- Các module mới phải tuân theo contract scope hiện có thay vì tạo ra ngoại lệ riêng.
