# DriveSync – Member 3 Frontend (Finance & Operations)

The Member 3 pages live **inside the shared team frontend** (`DriveSync-frontend`), so they reuse Member 1's login and the same React/Vite/Tailwind setup.
Colours come from the team palette PDF and are defined once, as `ds-*` tokens, in `src/index.css`.

## 1. Run it

```powershell
# 1) Backend: Payment (5004), Fleet (5005), Auth (5001) and the API Gateway (5000)
# 2) Frontend
cd DriveSync-frontend
npm install
Copy-Item .env.example .env      # VITE_API_BASE_URL=http://localhost:5000
npm run dev                       # http://localhost:5173
```

> ⚠️ **The gateway must route `/api/payments` and `/api/fleet`.** Member 1's gateway does not do this yet.
> Add the two `pathFilter` proxies from `MEMBER3_FINANCE_OPERATIONS_GUIDE.md` (Step 10). Without them, every page shows
> "The requested resource or route was not found".

### Ways to sign in
| Situation | How |
|---|---|
| Final demo | `/login` (Member 1). Register an `Admin` and a `Customer` user |
| Auth Service not ready | `/dev-login`: paste a token from `npm run token -- Admin` (in payment-service). Only available in `npm run dev` |
| No backend at all | Set `VITE_USE_MOCK=true` in `.env` and restart. `/dev-login` then offers "Continue as Admin / Customer" |

**Mock mode** uses sample data held in the browser (`src/api/mock/`). A yellow banner and a **MOCK DATA** badge are always shown, so mock data can never be mistaken for real backend data.

## 2. Pages and the API calls behind them

| Page | URL | Role | Backend calls (through the gateway) |
|---|---|---|---|
| Payment Dashboard | `/payments/dashboard` | Admin | `GET /api/payments/stats` |
| Checkout | `/payments/checkout` | All | `GET /api/bookings?userId=` (Member 2, read-only), `GET /api/catalog`, `GET /api/payments/booking/:id/summary`, `POST /api/payments` |
| Payment History / My Payments | `/payments/history` | All | Admin `GET /api/payments?search&status&type&method&page` · Customer `GET /api/payments/customer/:id?…` · `PATCH /api/payments/:id/status` |
| Receipt | `/payments/:paymentId/receipt` | Owner / Admin | `GET /api/payments/:id/receipt` |
| Refunds | `/payments/refunds` | Admin | `GET /api/payments?status=Successful/Refunded`, `POST /api/payments/:id/refund` |
| Fleet Dashboard | `/fleet/dashboard` | Admin | `GET /api/fleet/stats` |
| Vehicles | `/fleet/vehicles` | Admin | `GET/POST /api/fleet/vehicles`, `GET/PATCH /api/fleet/vehicles/:id`, `PATCH …/:id/status` |
| Maintenance | `/fleet/maintenance` | Admin | `GET /api/fleet/maintenance`, `GET/POST /api/fleet/vehicles/:id/maintenance`, `PATCH /api/fleet/maintenance/:mid/complete` |
| Vehicle Returns | `/fleet/returns` | Admin | `GET /api/fleet/vehicles?status=Rented`, `POST /api/fleet/vehicles/:id/return` |

`/` sends Admins to the Payment Dashboard and Customers to Checkout. Customers see only Checkout and My Payments.

**Backend additions made for the frontend:** `GET /api/payments/stats`, the payment list filters `search` and `method`, `GET /api/fleet/stats`, the vehicle's registration number on maintenance lists, and an optional `returnDate` on returns.

## 3. Folder structure (frontend)

```
src/
├── config/appConfig.js         ← .env values + the same enums/state machine as the backend
├── api/
│   ├── httpClient.js           ← Axios: gateway URL, adds the JWT, 401 → login, readable error messages
│   ├── paymentApi.js           ← one function per Payment endpoint
│   ├── fleetApi.js             ← one function per Fleet endpoint
│   ├── bookingApi.js           ← read-only calls to Member 2 (bookings, catalog)
│   └── mock/                   ← sample data + mock versions of the same functions (VITE_USE_MOCK)
├── hooks/useAsync.js           ← { data, loading, error, reload } for any API call
├── hooks/useDebounce.js        ← waits until the user stops typing before searching
├── utils/                      ← auth (localStorage session), format (money/dates), validators, status colours
├── components/
│   ├── layout/                 ← DashboardLayout, Sidebar (navy), Navbar, navigation menu
│   ├── auth/RouteGuards.jsx    ← RequireAuth, RequireRole, HomeRedirect
│   ├── ui/                     ← Button, Card, StatCard, StatusBadge, DataTable, Pagination,
│   │                              SearchFilterBar, FormField, Modal + ConfirmDialog, States, PageHeader
│   └── fleet/                  ← VehicleFormModal, VehicleDetailsModal, StatusChangeModal
└── pages/
    ├── payments/               ← PaymentDashboard, Checkout, PaymentHistory, PaymentReceipt, RefundManagement
    ├── fleet/                  ← FleetDashboard, VehicleManagement, MaintenanceManagement, VehicleReturns
    └── DevLogin.jsx
```

## 4. Key ideas (beginner-friendly)

- **Pages never call Axios directly.** They call `paymentApi.js` or `fleetApi.js`. To change a URL, or to switch to mock data, only those files change.
- **`useAsync`** runs an API call and gives the page `loading` (show a skeleton or spinner), `error` (show `ErrorState` with "Try again") and `data`. If the user types fast, older answers are ignored.
- **Validation happens twice.** The forms check input first (`utils/validators.js`) so users get instant feedback, and the backend still validates everything.
- **Every risky action is confirmed:** payments, refunds, status changes, completing maintenance and vehicle returns all open a `ConfirmDialog` first.
- **Same rules as the backend.** The status dropdown only enables the moves the backend allows (`STATUS_TRANSITIONS`). Return condition Poor or Damaged forces "Under Maintenance". Refunds can't exceed the amount paid.
- **No card data.** Checkout has no card fields. The "simulate a declined payment" checkbox is a labelled demo option.
- **Receipt download:** "Download / Print" opens the browser print dialog. Choose *Save as PDF*. The sidebar and buttons are hidden when printing.
- **Responsive:** on tablets and phones the sidebar becomes a slide-in menu, cards stack, and tables scroll sideways inside their card.

## 5. Test checklist

- [ ] Admin: dashboards show numbers and charts, and the stat cards link to filtered lists
- [ ] Checkout (customer): pick a booking or enter it manually → Pay → success screen → receipt
- [ ] Checkout with "simulate a declined payment" → failure screen, "Try again"
- [ ] Cash payment → Pending → Admin confirms it in Payment History → receipt appears
- [ ] Search, filters and pagination in Payment History, Vehicles and Maintenance
- [ ] Refund: an empty reason shows an error · partial refund works · it appears in the "Refunded" tab
- [ ] Vehicles: add (or pick from catalog), edit, view details and history, change status (blocked moves are disabled)
- [ ] Maintenance: add an In Progress job → vehicle Under Maintenance → complete → vehicle Available
- [ ] Returns: Good → Available · Damaged → Under Maintenance and a repair job opened automatically
- [ ] Customer opens `/fleet/vehicles` → "Access restricted"
- [ ] Phone width (DevTools, 390px): menu button, no sideways page scrolling
- [ ] `VITE_USE_MOCK=true` → banner shown, every page works without a backend
