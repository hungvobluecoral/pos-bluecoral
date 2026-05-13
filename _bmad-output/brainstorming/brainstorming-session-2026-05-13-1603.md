---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Thiết kế User Hierarchy: Super Admin / Tenant Owner / Staff — Hướng A (Tách bảng User)'
session_goals: 'Khám phá toàn diện thiết kế tách User platform-level khỏi Staff assignment, bao gồm data model, JWT claims, auth flow, và edge cases'
selected_approach: 'Conversational Deep Dive'
techniques_used: ['First Principles', 'Assumption Busting', 'Edge Case Hunting']
ideas_generated: ['User + TenantMembership + BranchMembership model', 'Discriminated Union JWT', 'Zero-null DB design', 'Owner dual-context mode', 'Self-service TenantRegistration', 'Invite token onboarding', 'Permission matrix by role']
context_file: ''
---

# Brainstorming Session — Tóm Tắt Chính Thức

**Facilitator:** Mary (Business Analyst)
**Date:** 2026-05-13
**Dự án:** POS_BlueCoral

---

## 1. Vấn Đề Cần Giải Quyết

Model cũ (`Staff { tenantId, branchId }`) có 3 vấn đề cốt lõi:

- **Không có Super Admin** — không có platform-level user
- **Owner bị lock vào branch** — không thể quản lý toàn tenant
- **Null bắt buộc** — khi tạo tenant mới chưa có branch, branchId phải null → vi phạm NOT NULL hoặc cần workaround

---

## 2. Quyết Định Kiến Trúc

### Hướng được chọn: Tách bảng theo scope

Thay vì 1 bảng `Staff` với nullable columns → **3 thực thể rõ ràng:**

```
User                  — platform entity, không thuộc tenant nào
TenantMembership      — gắn User vào Tenant (Owner)
BranchMembership      — gắn User vào Branch (Manager/Cashier/Viewer)
```

---

## 3. Data Model

### users
| Column | Type | Ghi chú |
|--------|------|---------|
| id | UUID PK | |
| email | TEXT UNIQUE | globally unique |
| password_hash | TEXT | |
| is_super_admin | BOOLEAN | platform flag |
| is_active | BOOLEAN | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### tenant_memberships (Owner scope)
| Column | Type | Ghi chú |
|--------|------|---------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| tenant_id | UUID FK → tenants | |
| role | ENUM(owner) | chỉ owner |
| is_active | BOOLEAN | |
| UNIQUE | (user_id, tenant_id) | 1 user chỉ 1 tenant |

### branch_memberships (Branch scope)
| Column | Type | Ghi chú |
|--------|------|---------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| tenant_id | UUID FK → tenants | để enforce boundary |
| branch_id | UUID FK → branches | NOT NULL — không bao giờ null |
| role | ENUM(manager, cashier, viewer) | |
| is_active | BOOLEAN | |
| UNIQUE | (user_id, branch_id) | 1 role per branch |

### tenant_registrations (Self-service signup)
| Column | Type | Ghi chú |
|--------|------|---------|
| id | UUID PK | |
| company_name | TEXT | |
| desired_slug | TEXT | |
| owner_name | TEXT | |
| owner_email | TEXT | |
| locale / currency / timezone | TEXT | |
| status | ENUM(pending, approved, rejected) | |
| rejection_reason | TEXT | nullable — chỉ khi rejected |
| reviewed_by_id | UUID FK → users | Super Admin |
| reviewed_at | TIMESTAMPTZ | |

### invite_tokens (Set-password sau approve)
| Column | Type | Ghi chú |
|--------|------|---------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| token_hash | TEXT | |
| expires_at | TIMESTAMPTZ | TTL 48h |
| used_at | TIMESTAMPTZ | null = chưa dùng |

---

## 4. JWT Claims — Discriminated Union (Zero Null)

```ts
type AccessTokenClaims =
  | { type: 'super_admin';   userId; sessionId }
  | { type: 'tenant_scope';  userId; tenantId; role: 'owner';              sessionId }
  | { type: 'branch_scope';  userId; tenantId; branchId; role; sessionId }
```

**Không có null nào trong JWT.** Mỗi type chỉ chứa đúng fields cần thiết.

---

## 5. Login Flow

```
POST /auth/login { email, password }
  │
  ├─ isSuperAdmin: true  →  JWT type: super_admin  (done)
  │
  └─ Staff
       ├─ TenantMembership (owner)
       │    →  JWT type: tenant_scope  (done, không cần chọn branch)
       │
       └─ BranchMembership
            ├─ 1 branch   →  JWT type: branch_scope  (auto-select, done)
            └─ N branches →  Trả về branch list
                             POST /auth/select-branch { sessionToken, branchId }
                             →  JWT type: branch_scope  (done)
```

---

## 6. Owner Dual-Context Mode

```
Owner login → JWT: tenant_scope (default)
  ↓ Xem dashboard tổng hợp, quản lý staff, tạo branch

Owner muốn xem/làm việc trong 1 branch cụ thể:
POST /auth/enter-branch { branchId }
  → JWT mới: branch_scope { tenantId, branchId, role: 'owner' }
  → Chỉ cần issue access token mới (không tạo refresh token mới)

POST /auth/exit-branch
  → JWT mới: tenant_scope (quay về)
```

---

## 7. Self-Service Tenant Registration

```
[Người ngoài] POST /registrations (public)
  → TenantRegistration { status: PENDING }
  → Email xác nhận cho người đăng ký

[Super Admin] Xem danh sách PENDING
  → POST /admin/registrations/:id/approve
      → Tạo Tenant + User + TenantMembership
      → Tạo InviteToken (TTL 48h)
      → Email invite cho Owner

  → POST /admin/registrations/:id/reject { reason }
      → Email từ chối cho người đăng ký

[Owner] Click link → POST /auth/setup-password { token, password }
  → Activate User
  → Auto-login → JWT: tenant_scope
  → Tạo branch đầu tiên
```

---

## 8. API Security — 3 Lớp Guard

```
Request → JwtAuthGuard → ScopeGuard → RolesGuard → Controller
            (token ok?)   (đúng type?)  (đúng role?)
```

- **tenantId / branchId** không bao giờ lấy từ request body — luôn từ JWT
- **Super Admin** bị chặn hoàn toàn ở mọi route nghiệp vụ bởi ScopeGuard
- **Owner tenant_scope** bị chặn ở `/orders`, `/inventory` bởi BranchScopeGuard

---

## 9. Permission Matrix

| Action | super_admin | owner (tenant) | owner (branch) | manager | cashier | viewer |
|--------|:-----------:|:--------------:|:--------------:|:-------:|:-------:|:------:|
| Duyệt đăng ký tenant | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Tạo branch | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Thêm staff | ❌ | ✅ | ✅ | ✅* | ❌ | ❌ |
| Xem orders | ❌ | ✅** | ✅ | ✅ | ✅*** | ✅ |
| **Tạo order** | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Hủy order | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Tạo/sửa product | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Điều chỉnh inventory | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Ghi nhận payment | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Xem reports | ❌ | ✅** | ✅ | ✅ | ❌ | ✅ |

> \* Manager chỉ quản lý staff trong branch mình được assign
> \*\* Owner (tenant) xem cross-branch toàn tenant
> \*\*\* Cashier chỉ xem orders trong ca của mình

---

## 10. Nguyên Tắc Cốt Lõi

```
Owner   = Quản lý tổ chức   → Xem tất cả, cấu hình, không vận hành
Manager = Vận hành branch   → Tạo/hủy giao dịch, quản lý staff branch
Cashier = Thực thi POS      → Tạo order, nhận payment
Viewer  = Quan sát           → Read-only, không ghi
```

---

## 11. Những Thứ Cần Implement (Migration + New)

1. **Prisma migration** — tạo `users`, `tenant_memberships`, `branch_memberships`, `tenant_registrations`, `invite_tokens`; xóa `staff` cũ
2. **Auth module** — refactor sang User model, cập nhật JWT claims
3. **Guards** — SuperAdminGuard, TenantScopeGuard, BranchScopeGuard, RolesGuard
4. **Tenant Registration flow** — public endpoint + SA approve/reject
5. **Invite token flow** — setup-password endpoint
6. **enter-branch / exit-branch** — context switching cho Owner
7. **Branch select at login** — khi Manager có nhiều branch
8. **API injection** — tenantId/branchId từ JWT vào mọi service
