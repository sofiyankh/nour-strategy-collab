# NOUR Shop — Pro Upgrade Plan

A focused overhaul of the storefront, cart, dashboards, and notifications. **No online payments** — orders are cash/peer-to-peer (Cash on Delivery), confirmed by phone, fulfilled by hand delivery.

---

## 1. Cart fixes (highest priority)

Current bugs to address:
- Cart updates only persist to localStorage; nothing syncs across tabs/devices.
- "Add to cart" gives no feedback — user clicks twice → double quantity.
- Cart count in header doesn't animate; users miss the change.
- Quantity buttons in sidebar don't validate against `stock` from DB.

Fixes:
- Toast confirmation on every add ("تمت الإضافة إلى السلة" + product thumb).
- Disable +/- buttons at stock cap; show "نفذت الكمية".
- Header cart icon: animated badge bump on item count change.
- Cross-tab sync via `storage` event listener.
- Persist authenticated users' carts to a new `carts` table (merge on login).

---

## 2. Notifications system

A unified `notifications` table + bell icon in header (both customer and admin).

- **Customer notifications**: order placed, status changed (processing → shipped → delivered), order cancelled, new offer/promo on a wishlisted product.
- **Admin notifications**: new order received, low stock (<5), new user registered.
- Realtime via Supabase Realtime channel on `notifications` table.
- Bell dropdown with unread badge, "mark all read", click-through to relevant page.
- Toast (sonner) for live events while the user is browsing.

---

## 3. Customer dashboard upgrade (`/account`)

Replace the bare order-history list with a real dashboard:

- **Sidebar tabs**: Profile · My Orders · Addresses · Wishlist · Notifications
- **Profile**: edit name, phone, default address; change password.
- **My Orders**: 
  - Card list with status timeline (Pending → Confirmed → Shipped → Delivered).
  - Filter by status, search by order ID.
  - Order detail drawer: items, totals, shipping address, contact admin button (WhatsApp link with order ref pre-filled), cancel button (only while pending).
- **Addresses**: saved addresses for faster checkout.
- **Wishlist**: heart icon on product cards saves to `wishlists` table.

---

## 4. Admin dashboard upgrade (`/admin`)

Pro layout with collapsible sidebar, gradient header, KPI cards, charts.

- **Overview**: revenue (today/week/month), orders by status (donut), top products (bar), recent orders feed, low-stock alerts.
- **Orders** (major rebuild): 
  - Table with filters (status, date range, search by customer/phone/ID).
  - Bulk actions (mark shipped, export CSV).
  - Order detail panel: customer info, items, status workflow buttons, internal notes, "call customer" / WhatsApp shortcut.
  - Print-friendly delivery slip.
- **Products**: 
  - Grid + table toggle, image upload to Cloud storage, stock editor inline, discount/offer scheduler (start/end date), bulk price edit.
  - Mark as "featured" or "new arrival".
- **Offers/Promotions** (new): create site-wide banners, percentage discounts on categories, flash-sale countdown.
- **Customers**: list with order count + total spent; promote to admin; ban toggle.
- **Notifications**: same bell as customers + admin-only feed.

---

## 5. Storefront polish + animated sections

Make the site feel premium and dynamic.

- **Hero slider**: auto-playing carousel (Embla) with 3–4 slides — current promo, new arrivals, brand story. Smooth fade + parallax.
- **Featured offers strip**: horizontal scroll of discounted products with countdown timers.
- **Animated category showcase**: scroll-triggered fade-in tiles for Skincare / Makeup.
- **Story section**: split-screen scroll animation (text left, image right) with intersection observer.
- **Testimonials carousel**: customer reviews from DB.
- **Newsletter strip** before footer.
- All animations: Framer Motion + Tailwind keyframes, respecting `prefers-reduced-motion`.
- Product cards: hover zoom on image, quick-add overlay, badge for "جديد"/"خصم".

---

## 6. Database additions

New tables (migration, with RLS):
- `carts` (user_id, items jsonb, updated_at)
- `wishlists` (user_id, product_id)
- `addresses` (user_id, label, name, phone, address, city, zip, is_default)
- `notifications` (user_id nullable for admin-broadcast, type, title, body, link, read, created_at)
- `offers` (title, description, discount_pct, category, starts_at, ends_at, active)
- `reviews` (product_id, user_id, rating, comment, approved)
- `order_status_history` (order_id, status, note, changed_by, created_at)

Extend `orders`: add `order_number` (human-readable), `customer_phone`, `payment_method` ENUM (`cash_on_delivery` only for now), `internal_notes`.

Triggers:
- On `orders` insert → notify admin + create initial status history row.
- On `orders` status update → notify customer + append history row.
- On product `stock` < 5 → notify admin (low stock).

---

## 7. Tech approach (technical section)

- **State**: TanStack Query for all server data (orders, products, notifications) — replaces ad-hoc `useEffect` fetches.
- **Realtime**: single Supabase channel per user subscribed to their notifications + their orders.
- **Animations**: `framer-motion` (already common), Embla for carousels.
- **Charts**: `recharts` for admin analytics.
- **Image upload**: Cloud storage bucket `product-images`, signed admin uploads.
- **Cart context**: refactor to sync with `carts` table when authenticated, fallback to localStorage when guest, merge on login.
- **Routing**: convert admin to nested layout under `/admin/*` using TanStack `_authenticated/_admin/` pattern.

---

## Out of scope (intentionally)

- Online card payments / Stripe — confirmed cash-only.
- Multi-vendor / multi-admin permissions beyond single admin role.
- Shipping carrier integrations.
- Mobile app.

---

## Suggested execution order

1. Database migration (all new tables + triggers).
2. Cart fixes + DB sync + toast feedback.
3. Notifications system (table, realtime, bell UI).
4. Customer dashboard rebuild.
5. Admin dashboard rebuild (orders → products → offers → analytics).
6. Storefront animated sections + hero slider + offers strip.
7. Polish pass (loading skeletons, empty states, RTL audit, reduced-motion).

I'll execute phase by phase, pausing for your review between major phases. Approve to begin with Phase 1 (database) + Phase 2 (cart fixes).
