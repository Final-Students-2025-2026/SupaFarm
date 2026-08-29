# SupaFarm — Digital Crop Marketplace for Ghana

> Final year project (BSc Computer Science). This README is written as an **agent brief** — context an AI coding agent (e.g. Antigravity, Claude Code, Cursor, etc.) can use to scaffold, plan, and build the application without needing the full PDF proposal.

## 1. One-line summary
A mobile-first marketplace app that directly connects Ghanaian crop farmers (sellers) with buyers, cutting out exploitative middlemen and reducing post-harvest losses through fresh-crop listings, direct voice calls, and flexible delivery.

## 2. Problem being solved
- Post-harvest losses of up to 50% for some farmers due to slow, poor market linkages (~USD 1.9B/year lost nationally).
- Middlemen exploitation — farmers sold to at below-market, farm-gate prices due to lack of alternatives/information.
- Price volatility and information asymmetry between planting/harvest and lean seasons.
- Poor rural road infrastructure limiting physical access to urban markets.
- No existing centralized digital platform tailored to Ghanaian farmers/buyers.

## 3. Target users
- **Sellers (Farmers)**: smallholder and large-scale crop farmers who post their **fresh crops** for sale.
- **Buyers**: sign up as one of several account types:
  - Individual
  - Business (e.g. restaurants, hotels, food processors, supermarkets)
  - *(design the `account_type` field as an enum so more types — e.g. exporter, institution — can be added later without a schema rewrite)*
- **Admins**: platform operators coordinating platform-managed deliveries.

Both farmers and buyers sign up through the same flow but branch into role-specific profile fields (farmer profile vs. buyer profile + `account_type`).

## 4. Core objectives (map to feature backlog)
1. Seller (farmer) registration, **fresh crop** listing w/ images, real-time inventory management.
2. Buyer-facing search/filter/browse by crop type, location, quantity, price.
3. Real-time in-app **voice call** between buyer and seller (no in-app chat/messaging — calling only).
4. **Delivery module** with 3 modes: self pick-up, seller-arranged delivery, platform-managed third-party delivery.
5. **Location/map features**: sellers visible on a map; live tracking for platform-managed deliveries.
6. Image upload for produce listings (trust/transparency).
7. User testing with real farmers/buyers in Ghana.
8. Post-launch evaluation of impact on post-harvest loss and market access.

## 4a. Location requirements (confirmed)
- **At sign-up**, both farmers and buyers must **enter/search for their location** (address search or map pin drop — not just device GPS, since either side may be registering a farm/business location that differs from their current position). Store as lat/lng (+ optional address text) on the user's profile.
- **Search by location**: buyers can filter/search crop listings by proximity to a location (theirs, or another point they search).
- **On purchase**: once a buyer buys from a farmer, both parties should be able to see **directions to the farmer's location** — i.e. a map view with a route/"get directions" action linking the buyer's location (or current position) to the farmer's registered location. This applies regardless of delivery mode, since even seller-delivery or platform-delivery orders benefit from both sides knowing where the farm is.

## 4b. Sign-up flow (confirmed)
Sign-up happens in **three distinct steps**, not one combined form:

1. **Role selection** — user picks **Farmer** or **Buyer** first, before anything else. (If buyer, `account_type` — Individual / Business — can be chosen here too, or deferred to profile setup; pick one and be consistent.)
2. **Auth step** — phone number + password only (create the Supabase Auth user). This step should be minimal: just credentials needed to create the account.
3. **Profile setup** — a separate step *after* auth succeeds, where the user fills in profile details:
   - Full name / business name
   - Location (search/pin — required, see §4a)
   - Profile image (optional, both roles)
   - Farm background image (optional, farmers only)
   - Any other role-specific fields

Implementation note: the `role` chosen in step 1 should be carried through (e.g. as local/session state or a query param) into the auth step, then written to the `profiles` row once the Supabase Auth user is created — profile setup (step 3) then becomes an *update* to that row rather than an insert. Treat "auth succeeded but profile incomplete" as a valid intermediate state the app should detect and route back into (e.g. on next login, incomplete profiles redirect to step 3 instead of the home screen).

## 5. Scope

### In scope
- Mobile app, **Android-first** (cross-platform architecture preferred if feasible, e.g. Flutter or React Native).
- Seller & buyer registration/profiles.
- Crop listing CRUD with image upload.
- Search & filter (crop type, location, quantity, price).
- Real-time **voice call** between matched buyer/seller (no in-app chat).
- Three-tier delivery system (see above).
- Map-based seller location view + delivery tracking.
- Ratings/reviews for sellers.
- Admin dashboard (platform management, delivery coordination).
- Testing suite + documentation.

### Out of scope (do not build unless explicitly asked)
- **Payment model: payment on delivery** (cash or in-person payment handled between buyer and farmer/delivery agent, not through the app). No online payment gateway / in-app transactions needed — the app tracks order status only, not money movement.
- Native iOS app.
- Government agricultural database integrations.
- Crop advisory / weather services.
- Cross-border/international trade features.

## 6. Confirmed tech decisions
- **Backend**: **Supabase** (Postgres + Auth + Storage + Realtime).
  - Use **PostGIS** (enable the extension on the Supabase Postgres instance) for storing/querying lat/lng and doing "nearby" searches.
  - Supabase Storage for crop listing images.
  - Supabase Realtime (Postgres changes / broadcast) for order/delivery status updates and call-signaling events.
- **Auth**: **phone number + password** (not email, not OTP-only).
  - Supabase Auth's native flow is email/OTP-centric, so plan to store `phone_number` as the unique identifier: either (a) use Supabase's phone auth provider configured for password-based sign-in if supported by the chosen Supabase SDK version, or (b) map phone number to a synthetic email internally (e.g. `<phone>@supafarm.local`) and let Supabase Auth handle it as email+password under the hood — pick one approach early and keep it consistent, since it affects sign-up, login, and password-reset flows.
  - Both farmers and buyers authenticate the same way; a `role` (and buyer `account_type`, see below) is stored on the user's profile row.
- **Maps/location**: Google Maps SDK or Mapbox for map display + directions (turn-by-turn or "get directions" deep link).
- **Frontend/mobile**: Flutter or React Native (cross-platform, Android-first) — still open, confirm with user if needed.
- **Voice call**: WebRTC or a provider SDK (e.g. Agora, Twilio Voice) for buyer↔farmer calling. No chat/messaging feature — calling is the only direct-communication channel; Supabase Realtime handles call-signaling metadata (e.g. "incoming call" events).

## 6a. Suggested Supabase schema sketch (starting point, refine as needed)
```
profiles
  id (uuid, FK -> auth.users)
  role              enum('farmer','buyer','admin')
  account_type      enum('individual','business')   -- buyers only, nullable for farmers
  full_name / business_name
  phone_number      text unique
  latitude / longitude   (geography/point via PostGIS)
  address_text      text (optional, human-readable)
  profile_image_url     text, optional   -- both farmers & buyers
  farm_background_image_url  text, optional   -- farmers only (photo of the farm)
  created_at

crop_listings
  id
  farmer_id (FK -> profiles.id)
  crop_type
  description
  quantity / unit
  price
  images[]          (Supabase Storage URLs)
  latitude / longitude   (usually = farmer's location, but allow override)
  status            enum('available','sold_out','inactive')
  created_at

orders
  id
  listing_id (FK)
  buyer_id (FK -> profiles.id)
  farmer_id (FK -> profiles.id)
  delivery_mode     enum('self_pickup','seller_delivery','platform_delivery')
  payment_method    'cash_on_delivery'   -- only method supported; no payment processing in-app
  status            enum('pending','confirmed','in_delivery','completed','cancelled')
  created_at

reviews
  id
  farmer_id
  buyer_id
  rating
  comment
```
Once an `order` is created, both `buyer_id` and `farmer_id` resolve to profile rows with lat/lng — use those two points to render the map + directions link. Calls are placed directly (e.g. tap-to-call via the provider SDK using stored phone numbers or provider identities) — no persisted conversation history is needed since there's no chat.

## 7. Build order (per proposal's Phase 3)
1. User authentication — role selection → phone/password auth → profile setup (see §4b)
2. Product/crop listing + image upload
3. Search & browse
4. Voice call
5. Delivery module (3-tier)
6. Location tracking (map + live delivery tracking)
7. Admin dashboard
8. Ratings/reviews layered in alongside listings

## 8. Suggested repo structure (for agent scaffolding)
```
/mobile          # Flutter or React Native app (buyer + seller experience)
/backend         # API server, auth, business logic
/admin           # Admin dashboard (web)
/docs            # SRS, design docs, user manual, testing report
README.md
```

## 9. Non-functional / testing expectations
- Unit + integration tests for backend and key mobile flows.
- User Acceptance Testing (UAT) with real farmers/buyers is part of the academic deliverables — build with usability/low-literacy/low-bandwidth users in mind (simple UI, offline-tolerant where possible, works on lower-end Android devices).
- Documentation deliverables expected: SRS, System Design Doc, Testing Report, User Manual, Final Report — agent should be ready to help generate/update these alongside code.

## 10. Remaining placeholders
- `[University Name]`, `[Supervisor Name]`, team member names — academic metadata only, not needed for the codebase. App name is confirmed as **SupaFarm**.

## 11. Key stats worth keeping in mind (for pitch decks / in-app copy, not code logic)
- Ghana agriculture market: ~USD 10.21B (2026), growing ~4.9% CAGR.
- Post-harvest losses: ~USD 1.9B/year nationally.
- 24.3M internet users, 93.4% broadband mobile coverage (2025) — supports a mobile-first approach.

---
*Source: converted and summarized from the original "SupaFarm — Final Year Project Proposal" PDF.*