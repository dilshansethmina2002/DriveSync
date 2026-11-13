# DriveSync – Member 3: Finance & Operations

**Services:** Payment Service (port 5004) and Fleet Management Service (port 5005)
**Databases:** `drivesync_payment_db`, `drivesync_fleet_db`
**Stack:** Node.js, Express 5, MongoDB + Mongoose 9, JWT, ES Modules (same setup as the rest of the team)

This guide follows the 12 steps of the assignment brief. Read it from top to bottom the first time.

---

## Step 1 – Architecture: how my two services fit in

```
                       React frontend (5173)
                               │
                               ▼
                    ┌──────────────────────┐
                    │  API Gateway  :5000  │  (Member 1)
                    └──────────┬───────────┘
      /api/auth   /api/catalog │ /api/bookings   /api/payments   /api/fleet
          │            │       │       │               │              │
          ▼            ▼       ▼       ▼               ▼              ▼
   Auth :5001   Catalog :5002   Booking :5003    Payment :5004   Fleet :5005
   (Member 1)   (Member 2)      (Member 2)       (ME)            (ME)
      │              │              │                │              │
   auth_db      catalog_db     booking_db       payment_db      fleet_db
```

Main ideas:

1. **Each service is its own Node.js app** with its own `package.json`, its own port and its own database. If the Payment Service crashes, Fleet still works.
2. **No service reads another service's database.** If Payment needs booking data, it calls the Booking Service's REST API.
3. **The frontend only talks to the API Gateway (5000).** The gateway forwards `/api/payments/*` to port 5004 and `/api/fleet/*` to port 5005.
4. **Login happens once, in the Auth Service.** It returns a JWT. My services check that JWT themselves using the shared `JWT_SECRET`. They do not need to call the Auth Service on every request.

### What the Payment Service does

| Job | How |
|---|---|
| Rental payments and security deposits | `POST /api/payments` with `paymentType` = `Rental Payment` or `Security Deposit` |
| Records every transaction | Saved as `Pending` first, then updated to `Successful` or `Failed` |
| Tracks status | `Pending`, `Successful`, `Failed`, `Refunded`, with a `statusHistory` audit trail |
| Digital receipts | A `receiptNumber` is created when a payment succeeds. `GET /:paymentId/receipt` |
| Refunds (full or partial) | `POST /:paymentId/refund`, for example a deposit returned minus a damage charge |
| Stops double charging | Only one *Successful* rental payment and one deposit per booking |
| Fake gateway | `paymentGateway.js` pretends to call a bank. **No card data is accepted or stored.** |

### What the Fleet Management Service does

| Job | How |
|---|---|
| Register vehicles in the fleet | `POST /api/fleet/vehicles` (uses the Catalog vehicle `_id` as `vehicleId`) |
| Track operational status | `Available`, `Rented`, `Under Maintenance`, `Inactive` |
| Validate status changes | A small "state machine" (`utils/statusTransitions.js`) |
| Record maintenance | Separate `Maintenance` collection, linked to the vehicle |
| Rental returns | `POST /vehicles/:id/return`: updates condition and mileage, then sets the vehicle to Available or Under Maintenance |

**Allowed status transitions:**

| From \ To | Available | Rented | Under Maintenance | Inactive |
|---|---|---|---|---|
| **Available** | – | ✅ | ✅ | ✅ |
| **Rented** | ✅ (return) | – | ✅ (returned damaged) | ❌ |
| **Under Maintenance** | ✅ *only if no maintenance is open and the car is not Damaged* | ❌ | – | ✅ |
| **Inactive** | ✅ | ❌ | ✅ | – |

---

## Step 2 – Folder structure

Both services use the same MVC + service layout:

```
DriveSync-backend/
├── payment-service/
│   ├── server.js                 ← entry point: load .env → connect DB → listen on 5004
│   ├── .env.example              ← copy to .env
│   ├── package.json
│   ├── scripts/
│   │   └── generate-test-token.js← makes a test JWT for Postman
│   └── src/
│       ├── app.js                ← Express app: security, CORS, routes, error handler
│       ├── config/
│       │   ├── env.js            ← reads all environment variables in one place
│       │   └── db.js             ← Mongoose connection
│       ├── models/
│       │   └── Payment.js        ← MongoDB schema (M of MVC)
│       ├── validators/
│       │   └── paymentValidators.js ← input rules (express-validator)
│       ├── routes/
│       │   └── paymentRoutes.js  ← URL → middlewares → controller
│       ├── controllers/
│       │   └── paymentController.js ← HTTP request/response only (C of MVC)
│       ├── services/
│       │   ├── paymentService.js ← ALL business rules
│       │   ├── paymentGateway.js ← simulated bank
│       │   └── bookingClient.js  ← REST calls to the Booking Service
│       ├── middleware/
│       │   ├── auth.js           ← JWT / service-key check + role check
│       │   ├── validate.js       ← turns validation errors into a 400 response
│       │   └── errorHandler.js   ← one place that formats every error
│       └── utils/
│           ├── AppError.js       ← error class with an HTTP status
│           ├── pagination.js
│           └── generateId.js     ← PAY-…, RCPT-…, TXN-… ids
│
├── fleet-service/                ← same layout
│   └── src/
│       ├── models/Vehicle.js, Maintenance.js
│       ├── services/fleetService.js, maintenanceService.js
│       ├── controllers/vehicleController.js, maintenanceController.js
│       ├── routes/fleetRoutes.js
│       ├── validators/fleetValidators.js
│       └── utils/statusTransitions.js  ← the state machine
│
└── docs/
    ├── MEMBER3_FINANCE_OPERATIONS_GUIDE.md   ← this file
    └── DriveSync-Member3.postman_collection.json
```

**How a request travels (example: create a payment):**

```
POST /api/payments
  → app.js (helmet, cors, rate limit, JSON parser)
  → paymentRoutes.js
      → authenticate   (is the JWT valid?)              401 if not
      → authorize      (is the role allowed?)           403 if not
      → createPaymentRules + validate (is input OK?)    400 if not
      → paymentController.createPayment
          → paymentService.processPayment   (rules, DB, gateway)
  → response 201 / 202 / 402
  (any error thrown anywhere → errorHandler.js → JSON error)
```

---

## Step 3 – Installation

### Prerequisites
1. **Node.js 18 or newer.** Check with `node -v`.
2. **MongoDB**, using one of these:
   - **Local:** install *MongoDB Community Server* (choose "Install as a Service") and optionally *MongoDB Compass* to look at the data. Then use the URI `mongodb://127.0.0.1:27017/...`.
   - **Atlas (cloud):** create a free cluster and use its `mongodb+srv://...` URI. Put the database name in the URI, for example `.../drivesync_payment_db?retryWrites=true&w=majority`.
3. **Postman.**

### Install and run (PowerShell)

```powershell
# Payment Service
cd DriveSync-backend\payment-service
npm install
Copy-Item .env.example .env     # then open .env and edit the values
npm run dev                      # nodemon (auto-restart). Use "npm start" for plain node.

# Fleet Service (second terminal)
cd DriveSync-backend\fleet-service
npm install
Copy-Item .env.example .env
npm run dev
```

You should see:
```
Payment DB connected: drivesync_payment_db
Payment Service running on port 5004 (development)
```

### Dependencies and why they are there

| Package | Purpose |
|---|---|
| `express` (v5) | Web framework. v5 forwards errors from `async` handlers to the error handler, so the controllers need no `try/catch` |
| `mongoose` | MongoDB models, validation and queries |
| `dotenv` | Loads `.env` into `process.env` |
| `jsonwebtoken` | Verifies the JWT issued by the Auth Service |
| `cors` | Lets the React app (5173) and the gateway (5000) call the API |
| `helmet` | Sets secure HTTP headers |
| `express-rate-limit` | Basic protection against request flooding |
| `express-validator` | Validates request bodies, params and query strings |
| `morgan` | Logs every request in the terminal |
| `nodemon` (dev) | Restarts the server when you save a file |

### Environment variables (`.env`)

| Variable | Payment | Fleet | Notes |
|---|---|---|---|
| `PORT` | 5004 | 5005 | |
| `MONGO_URI` | `.../drivesync_payment_db` | `.../drivesync_fleet_db` | **required** |
| `JWT_SECRET` | ✅ | ✅ | **required**, must be the **same value as the Auth Service** |
| `SERVICE_API_KEY` | ✅ | ✅ | shared key for service-to-service calls (use the same value in every service) |
| `CORS_ORIGINS` | ✅ | ✅ | comma-separated list |
| `VERIFY_BOOKING` | ✅ | | `true` = check the booking with the Booking Service before charging |
| `NOTIFY_BOOKING_ON_PAYMENT` | ✅ | | `true` = set the booking to `Confirmed` after the rental is paid |
| `BOOKING_SERVICE_URL` | ✅ | | default `http://localhost:5003` |
| `GATEWAY_DELAY_MS` | ✅ | | delay of the simulated gateway |
| `MAINTENANCE_INTERVAL_DAYS` | | ✅ | default 90 |

> ⚠️ `.env` is already listed in the repo's `.gitignore`. Commit **only** `.env.example`, never `.env`.

---

## Steps 4 and 5 – Payment Service: the important code explained

### `src/models/Payment.js`
- Has all the fields the brief asks for: `paymentId, bookingId, customerId, vehicleId, amount, paymentMethod, paymentType, paymentStatus, transactionReference, paymentDate, receiptNumber`.
- I also added `currency`, `description`, `failureReason`, `refund` (sub-document) and `statusHistory` (audit trail).
- `bookingId / customerId / vehicleId` are stored as **plain strings**, not Mongoose `ref`s, because those records live in other services' databases.
- `receiptNumber` is `unique` + `sparse`. Many payments (Pending or Failed) have no receipt, and `sparse` lets them all go without one while every real receipt number stays unique.
- `amount` has a setter that rounds to 2 decimals.
- The enum lists (`PAYMENT_STATUSES`, and so on) are exported so the validators reuse the same values.

### `src/services/paymentService.js`: `processPayment()` step by step
1. **Who is paying?** A customer can only pay for themselves. If `customerId` is missing, the id from the token is used. Admins and internal services can pay for anyone.
2. **Optional booking check** (`VERIFY_BOOKING=true`). The service asks the Booking Service for the booking and checks that it exists, belongs to the customer, has the same `vehicleId`, is not Cancelled or Completed, and that the rental amount equals `totalPrice`.
3. **No double charging.** If a *Successful* payment of the same type already exists for the booking, it answers `409 Conflict`.
4. **Save as `Pending` first**, so there is a record even if the gateway call crashes.
5. **Cash** payments stay `Pending` (the customer pays at the counter). An admin later confirms them with `PATCH /:paymentId/status`.
6. **Call the simulated gateway.** If it approves, the status becomes `Successful` and a `transactionReference` and `receiptNumber` are generated. If not, the status becomes `Failed` with a `failureReason`.
7. **Optional notification** to the Booking Service, setting the booking to `Confirmed`. This is *best effort*: if the Booking Service is down, the payment is still saved and a warning is logged.

### `paymentGateway.js` (simulated)
It waits `GATEWAY_DELAY_MS`, then approves the payment. To test the failure path, send `"simulateFailure": true`. It also refuses single charges above 1,000,000. **The validator rejects any request that contains `cardNumber`, `cvv`, `cardNo` or `card`**, so card data can never be stored.

### Refund rules
- Only `Successful` payments can be refunded, and only once.
- `refundAmount` is optional. Leave it out for a full refund, or send a smaller amount for a partial one (for example, a deposit minus a damage charge).
- The refund amount cannot be more than the amount paid.
- Only **Admin** can refund.

### Status update rules (`PATCH /:paymentId/status`, Admin)
- `Pending → Successful` (for example, cash received) or `Pending → Failed`.
- Any other change is rejected with **409**. `Refunded` can only be reached through the refund endpoint.

### `middleware/auth.js`: the JWT contract with Member 1
Member 1's Auth Service signs this payload:
```json
{ "user": { "id": "<userId>", "role": "Customer" }, "iat": ..., "exp": ... }
```
with `JWT_SECRET` (HS256, 1 day expiry). My middleware:
1. Reads `Authorization: Bearer <token>`.
2. Runs `jwt.verify(token, JWT_SECRET)`. If the signature or expiry is wrong, it returns **401**.
3. Sets `req.user = { id, role }`.
4. `authorize('Admin')` compares roles case-insensitively and returns **403** if the role is not allowed.

**Internal calls:** another service can send `x-service-key: <SERVICE_API_KEY>` instead of a JWT. It then gets the role `Service`. The key is compared with `crypto.timingSafeEqual`.

### `middleware/errorHandler.js`
Every error ends up here and produces the same JSON shape:
```json
{ "success": false, "message": "Validation failed", "errors": [{ "field": "amount", "message": "amount must be a number greater than 0" }] }
```
It also translates Mongoose errors: `ValidationError` becomes 400, `CastError` becomes 400, duplicate key `11000` becomes 409, and invalid JSON becomes 400. In production, 500 errors hide their details.

### Security summary
`helmet` headers · CORS allow-list · rate limit (300 requests per 15 minutes per IP) · 10 kb body limit · `mongoose.set('sanitizeFilter', true)` (NoSQL-injection protection) · strict validation and `matchedData()` (unknown fields are dropped) · HTML escaping of free-text fields · regex escaping in search · no card data · customers can only see their own payments.

---

## Steps 6 and 7 – Fleet Management Service: the important code explained

### Models
- **`Vehicle.js`**: `vehicleId, vehicleName, registrationNumber, currentStatus, condition, lastMaintenanceDate, nextMaintenanceDate, maintenanceHistory`, plus `mileage`, `lastReturn` and `statusHistory`.
  - `vehicleId` = the vehicle's `_id` in the **Catalog Service**. The same car has the same id in both services, but the databases stay separate.
  - `registrationNumber` is unique and saved in UPPERCASE.
- **`Maintenance.js`** is a separate model, because history keeps growing (MongoDB documents are limited to 16 MB) and maintenance records need their own paginated lists. The vehicle stores the list of maintenance `_id`s in `maintenanceHistory`. Both collections are in the **same** database, so using `ref`/`populate` here is fine.

### `utils/statusTransitions.js`
A plain object listing which status can move to which. `canTransition(from, to)` returns true or false.

### `services/fleetService.js`
- **`applyStatusChange()`** is the **only** function that changes `currentStatus`. It rejects:
  - the same status as before (409)
  - a change that is not in the transition table (409)
  - `→ Available` while a maintenance job is still `In Progress` (409)
  - `→ Available` while the condition is `Damaged` (409)

  It also adds an entry to `statusHistory`.
- **`processReturn()`** (rental return):
  1. The vehicle must currently be `Rented`.
  2. The new mileage cannot be lower than the old one.
  3. It saves `condition`, `mileage` and `lastReturn` (bookingId, date, notes).
  4. If the condition is `Poor` or `Damaged`, or `needsMaintenance: true` is sent, the vehicle becomes **Under Maintenance** and a maintenance job is **opened automatically** (`Repair` if Damaged, otherwise `Inspection`).
  5. Otherwise the vehicle becomes **Available**.

### `services/maintenanceService.js`
- **`recordMaintenance()`**
  - `status: "In Progress"` (the default) opens a job and moves the vehicle to **Under Maintenance**. This fails if the car is currently Rented.
  - `status: "Completed"` records a job from the past. Only `lastMaintenanceDate` is updated.
- **`completeMaintenance()`** closes the job and sets `cost`, `completionNotes`, `lastMaintenanceDate` and `nextMaintenanceDate` (from the body, or today + 90 days). It can also update `condition`. Then it makes the vehicle **Available**, unless other jobs are still open, the vehicle is still Damaged, or `makeAvailable: false` was sent.
- History endpoints return the records plus `totalCost`, which is useful for reports.

### Roles in Fleet
| Action | Allowed roles |
|---|---|
| Register or edit vehicles, record or complete maintenance, mark under-maintenance or available | `Admin` |
| List or view vehicles, change status, process a return, view vehicle history | `Admin`, `Service` |
| Check availability | any logged-in user |

---

## Step 8 – API documentation

All responses follow this pattern: `{ "success": true|false, "message"?, "data"?, "pagination"?, "errors"? }`.
Every endpoint except `/health` needs `Authorization: Bearer <token>` (or `x-service-key`).
Through the gateway, use `http://localhost:5000` instead of `:5004` or `:5005`.

### 8.1 Payment Service – `http://localhost:5004/api/payments`

| # | Method | URL | Role | Purpose |
|---|---|---|---|---|
| 1 | GET | `/health` | public | Service and DB status |
| 2 | POST | `/` | Customer, Admin, Service | Process a rental payment or a security deposit |
| 3 | GET | `/` | Admin | All payments (`?page&limit&status&type`) |
| 4 | GET | `/:paymentId` | owner, Admin | Payment details |
| 5 | GET | `/:paymentId/receipt` | owner, Admin | Digital receipt |
| 6 | GET | `/booking/:bookingId` | owner, Admin | Payment history for a booking |
| 7 | GET | `/booking/:bookingId/summary` | owner, Admin | Totals: paid, deposit held, refunded |
| 8 | GET | `/customer/:customerId` | owner, Admin | Payment history for a customer |
| 9 | PATCH | `/:paymentId/status` | Admin | Confirm or fail a Pending payment |
| 10 | POST | `/:paymentId/refund` | Admin | Full or partial refund |

**POST `/api/payments`: request**
```json
{
  "bookingId": "6650a1b2c3d4e5f601234567",
  "customerId": "6650a1b2c3d4e5f6000000c1",
  "vehicleId": "6650a1b2c3d4e5f6000000a1",
  "amount": 15000,
  "paymentMethod": "Credit Card",
  "paymentType": "Rental Payment",
  "description": "3-day rental"
}
```
> All IDs must be 24 hexadecimal characters (0-9, a-f), because they are MongoDB ObjectIds.

`paymentMethod`: `Credit Card | Debit Card | Cash | Bank Transfer | Online Wallet`
`paymentType`: `Rental Payment | Security Deposit`
Optional fields: `currency` (3 letters, default LKR), `description`, `simulateFailure` (true/false).

**Response `201 Created`**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "paymentId": "PAY-20261112-7F3A9C21",
    "bookingId": "6650a1b2c3d4e5f601234567",
    "customerId": "6650a1b2c3d4e5f6000000c1",
    "vehicleId": "6650a1b2c3d4e5f6000000a1",
    "amount": 15000,
    "currency": "LKR",
    "paymentMethod": "Credit Card",
    "paymentType": "Rental Payment",
    "paymentStatus": "Successful",
    "transactionReference": "TXN-1762960000000-A1B2C3",
    "paymentDate": "2026-11-12T10:00:00.000Z",
    "receiptNumber": "RCPT-20261112-1B2C3D4E",
    "failureReason": null,
    "refund": null,
    "statusHistory": [
      { "status": "Pending", "changedAt": "...", "note": "Payment created" },
      { "status": "Successful", "changedAt": "...", "note": "Credit Card payment approved" }
    ],
    "createdAt": "...", "updatedAt": "..."
  }
}
```
Other outcomes:
- `202 Accepted` for a cash payment that is recorded as Pending.
- `402 Payment Required` when the gateway declines (`"paymentStatus": "Failed"`, plus `failureReason`).
- `409` when this booking already has a successful payment of the same type.
- `400` for validation errors, `401` with no or a bad token, `403` when a customer pays for someone else.

**GET `/api/payments/booking/:bookingId?page=1&limit=10`: response 200**
```json
{
  "success": true,
  "count": 2,
  "pagination": { "page": 1, "limit": 10, "total": 2, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false },
  "data": [ { "paymentId": "PAY-...", "paymentType": "Security Deposit" }, { "paymentId": "PAY-...", "paymentType": "Rental Payment" } ]
}
```

**GET `/api/payments/booking/:bookingId/summary`: response 200**
```json
{ "success": true, "data": { "bookingId": "6650...", "rentalPaid": true, "depositPaid": true, "totalRentalPaid": 15000, "depositHeld": 5000, "totalRefunded": 0, "pendingPayments": 0, "numberOfTransactions": 2 } }
```

**GET `/api/payments/:paymentId/receipt`: response 200**
```json
{
  "success": true,
  "data": {
    "receiptNumber": "RCPT-20261112-1B2C3D4E",
    "issuedBy": "DriveSync - Online Vehicle Rental Management System",
    "issuedAt": "2026-11-12T10:05:00.000Z",
    "payment": { "paymentId": "PAY-...", "paymentType": "Rental Payment", "paymentMethod": "Credit Card", "paymentStatus": "Successful", "transactionReference": "TXN-...", "paymentDate": "..." },
    "booking": { "bookingId": "...", "customerId": "...", "vehicleId": "..." },
    "amount": { "currency": "LKR", "paid": 15000, "refunded": 0, "net": 15000 },
    "refund": null,
    "note": "This is a computer-generated receipt from a simulated payment gateway."
  }
}
```
Returns `409` if the payment has no receipt (Pending or Failed).

**PATCH `/api/payments/:paymentId/status` (Admin)**
```json
{ "status": "Successful", "note": "Cash received at counter" }
```
Response 200 with the payment: it now has a receipt and a `MANUAL-...` transaction reference.

**POST `/api/payments/:paymentId/refund` (Admin)**
```json
{ "refundAmount": 3500, "refundReason": "Deposit returned minus 1500 for scratch" }
```
Response 200, with `"paymentStatus": "Refunded"` and
`"refund": { "refundAmount": 3500, "refundReason": "...", "refundReference": "RFND-...", "refundDate": "...", "refundedBy": "<adminId>" }`.

### 8.2 Fleet Service – `http://localhost:5005/api/fleet`

| # | Method | URL | Role | Purpose |
|---|---|---|---|---|
| 1 | GET | `/health` | public | Service status |
| 2 | POST | `/vehicles` | Admin | Register a vehicle in the fleet |
| 3 | GET | `/vehicles` | Admin, Service | List (`?page&limit&status&condition&search&dueForMaintenance=true`) |
| 4 | GET | `/vehicles/:vehicleId` | Admin, Service | Details plus the last 5 maintenance records |
| 5 | PATCH | `/vehicles/:vehicleId` | Admin | Edit name, registration, condition, mileage, nextMaintenanceDate |
| 6 | GET | `/vehicles/:vehicleId/availability` | any logged-in user | Can this car be rented? |
| 7 | PATCH | `/vehicles/:vehicleId/status` | Admin, Service | Change status (validated) |
| 8 | PATCH | `/vehicles/:vehicleId/under-maintenance` | Admin | Mark as Under Maintenance |
| 9 | PATCH | `/vehicles/:vehicleId/available` | Admin | Mark as Available |
| 10 | POST | `/vehicles/:vehicleId/return` | Admin, Service | Process a rental return and update the condition |
| 11 | POST | `/vehicles/:vehicleId/maintenance` | Admin | Record a maintenance job |
| 12 | GET | `/vehicles/:vehicleId/maintenance` | Admin, Service | Maintenance history for a vehicle (`?status&type&page&limit`) |
| 13 | GET | `/maintenance` | Admin | All maintenance records |
| 14 | GET | `/maintenance/:maintenanceId` | Admin | One record |
| 15 | PATCH | `/maintenance/:maintenanceId/complete` | Admin | Complete a job, which makes the vehicle Available again |

**POST `/api/fleet/vehicles`**
```json
{
  "vehicleId": "6650a1b2c3d4e5f6000000a1",
  "vehicleName": "Toyota Prius 2022",
  "registrationNumber": "CAB-1234",
  "condition": "Excellent",
  "mileage": 15000,
  "nextMaintenanceDate": "2027-01-15"
}
```
Response `201`:
```json
{
  "success": true,
  "message": "Vehicle registered in fleet",
  "data": {
    "_id": "6733...", "vehicleId": "6650a1b2c3d4e5f6000000a1", "vehicleName": "Toyota Prius 2022",
    "registrationNumber": "CAB-1234", "currentStatus": "Available", "condition": "Excellent", "mileage": 15000,
    "lastMaintenanceDate": null, "nextMaintenanceDate": "2027-01-15T00:00:00.000Z", "maintenanceHistory": [],
    "statusHistory": [{ "from": null, "to": "Available", "reason": "Registered in fleet", "changedBy": "..." }]
  }
}
```
`409` if the vehicleId or registration number already exists.

**PATCH `/vehicles/:vehicleId/status`**
```json
{ "status": "Rented", "reason": "Booking 6650... picked up" }
```
`409` example (invalid transition):
```json
{ "success": false, "message": "Invalid status change: Rented -> Inactive. Allowed from Rented: Available, Under Maintenance" }
```

**POST `/vehicles/:vehicleId/return`**
```json
{
  "bookingId": "6650a1b2c3d4e5f601234567",
  "condition": "Damaged",
  "mileage": 15420,
  "damageNotes": "Rear bumper scratched"
}
```
Response 200:
```json
{
  "success": true,
  "message": "Return processed. Vehicle needs attention and is now Under Maintenance (MNT-20261112-9A8B7C6D).",
  "data": {
    "vehicle": { "currentStatus": "Under Maintenance", "condition": "Damaged", "mileage": 15420, "lastReturn": { "bookingId": "...", "conditionOnReturn": "Damaged" } },
    "maintenanceRecord": { "maintenanceId": "MNT-20261112-9A8B7C6D", "maintenanceType": "Repair", "status": "In Progress", "relatedBookingId": "..." }
  }
}
```
With `"condition": "Good"`, the vehicle becomes `Available` and `maintenanceRecord` is `null`.

**POST `/vehicles/:vehicleId/maintenance`**
```json
{ "maintenanceType": "Routine Service", "description": "10,000 km service", "cost": 12000, "serviceProvider": "AutoCare Colombo" }
```
`maintenanceType`: `Routine Service | Repair | Inspection | Tyre Replacement | Oil Change | Cleaning | Other`
Optional: `status` (`In Progress` is the default, or `Completed` for a past job), `startDate`, `completedDate`, `mileageAtService`, `completionNotes`.

**PATCH `/maintenance/:maintenanceId/complete`**
```json
{ "cost": 18500, "completionNotes": "Bumper repaired and repainted", "condition": "Good", "nextMaintenanceDate": "2027-03-01" }
```
Response 200: `"message": "Maintenance completed. Vehicle is now Available."`.
Send `"makeAvailable": false` to keep the vehicle out of service.

---

## Step 9 – Testing with Postman

### 9.1 Import the collection
Postman → **Import** → choose `docs/DriveSync-Member3.postman_collection.json`.
It has collection **variables** (`paymentUrl`, `fleetUrl`, `customerToken`, `adminToken`, `customerId`, `bookingId`, `vehicleId`, and so on), and the test scripts **save `paymentId` and `maintenanceId` automatically** after a request creates them.

### 9.2 Get tokens
**Option A – real login (for the final demo):**
1. `POST http://localhost:5000/api/auth/register` with `{ "name": "Admin", "email": "admin@drivesync.lk", "password": "Admin@123", "role": "Admin" }`
2. `POST http://localhost:5000/api/auth/login` and copy `token` and `user.id`.
3. Do the same for a customer (`"role": "Customer"`).

**Option B – test tokens (while the Auth Service is not ready):**
```powershell
cd payment-service
npm run token -- Admin
npm run token -- Customer 6650a1b2c3d4e5f6000000c1
```
Paste the tokens into the collection variables `adminToken` and `customerToken`, and set `customerId` to `6650a1b2c3d4e5f6000000c1`.
Both services must use the **same** `JWT_SECRET` (and it must be the same as the Auth Service's).

### 9.3 Suggested test order

**Payment**
1. Health → 200
2. Create Rental Payment (customer token) → 201, receipt number present
3. Same request again → **409** (double charge blocked)
4. Create Security Deposit → 201
5. Create a payment with `"simulateFailure": true` and a new bookingId → **402**, status Failed
6. Create a Cash payment → **202**, status Pending → Admin: PATCH status `Successful` → 200, receipt created
7. Get payment by ID, receipt, booking history, booking summary, customer history → 200
8. Customer token + another customer's id → **403**
9. Admin: list all payments `?status=Successful&page=1&limit=5` → 200 with pagination
10. Admin: partial refund of the deposit → 200, status Refunded. Refund again → **409**
11. Validation: amount `-5`, wrong `paymentType`, or a `cardNumber` field → **400**
12. No token → **401**. Customer calling refund → **403**

**Fleet** (admin token)
1. Health → 200
2. Register vehicle → 201. Same registration again → **409**
3. List vehicles `?status=Available` and `?search=prius` → 200
4. Status → `Rented` → 200. Status → `Inactive` → **409** (invalid transition)
5. Return with condition `Damaged` → 200, Under Maintenance, maintenance job opened automatically
6. Mark available → **409** (maintenance still open)
7. Complete maintenance with `"condition": "Good"` → 200, vehicle Available, dates set
8. Record maintenance (Routine Service) → 201, vehicle Under Maintenance → complete it
9. Maintenance history for the vehicle → 200 with `totalCost`
10. Mark under-maintenance → mark available → 200 each
11. Customer token: availability → 200. Customer token: list vehicles → **403**
12. Invalid `vehicleId` such as `123` → **400**. Unknown but valid id → **404**

---

## Step 10 – Integration with the API Gateway (Member 1)

The gateway currently does this:
```js
app.use('/api/auth', createProxyMiddleware({ target: 'http://localhost:5001', changeOrigin: true }));
```
When you mount with `app.use('/api/auth', ...)`, Express **removes** `/api/auth` from the path before forwarding. That works for Auth because Auth mounts its routes at `/`. **My services mount at `/api/payments` and `/api/fleet`**, so the full path must be kept. Ask Member 1 to add these lines using `pathFilter` (http-proxy-middleware v3):

```js
// --- Member 3: Finance & Operations ---
app.use(createProxyMiddleware({
  target: process.env.PAYMENT_SERVICE_URL || 'http://localhost:5004',
  changeOrigin: true,
  pathFilter: '/api/payments',      // keeps the full path: /api/payments/... -> :5004/api/payments/...
}));

app.use(createProxyMiddleware({
  target: process.env.FLEET_SERVICE_URL || 'http://localhost:5005',
  changeOrigin: true,
  pathFilter: '/api/fleet',
}));
```
(The same issue affects `/api/catalog` and `/api/bookings` from Member 2, and the same fix works for them.)

Notes for the gateway:
- Do **not** put `express.json()` *before* the proxies. It reads the request body, and then POST bodies arrive empty at the services.
- The gateway can simply forward the `Authorization` header (it does this by default). My services verify the token themselves.
- Test: `GET http://localhost:5000/api/payments/health` and `GET http://localhost:5000/api/fleet/health` should both return 200.

---

## Step 11 – Coordination with the Booking Service (Member 2)

### 11.1 How Payment gets `bookingId`, `customerId`, `vehicleId` and `amount`
**Recommended flow (frontend-driven):**
1. The customer creates a booking. Booking Service → `{ _id, userId, vehicleId, totalPrice, status: "Pending" }`.
2. The frontend takes those values and calls `POST /api/payments` (through the gateway) with
   `bookingId = booking._id`, `customerId = booking.userId`, `vehicleId = booking.vehicleId`, `amount = booking.totalPrice`.
3. To stop a user from changing the amount in the browser, set **`VERIFY_BOOKING=true`**. The Payment Service then calls
   `GET {BOOKING_SERVICE_URL}/api/bookings?userId=<customerId>` and checks the booking, the vehicle and the amount itself.
4. With **`NOTIFY_BOOKING_ON_PAYMENT=true`**, after a successful rental payment the Payment Service calls
   `PATCH {BOOKING_SERVICE_URL}/api/bookings/<bookingId>/status` with `{ "status": "Confirmed" }`.

**Alternative (service-driven):** the Booking Service calls the Payment Service directly:
```js
await fetch('http://localhost:5004/api/payments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-service-key': process.env.SERVICE_API_KEY },
  body: JSON.stringify({ bookingId, customerId: userId, vehicleId, amount: totalPrice,
                         paymentMethod: 'Credit Card', paymentType: 'Rental Payment' }),
});
```

### 11.2 How Fleet gets `vehicleId` and rental-return information
| Booking event | Call to the Fleet Service |
|---|---|
| Before confirming a booking (optional) | `GET /api/fleet/vehicles/:vehicleId/availability` → `isAvailableForRent` |
| Customer picks up the car | `PATCH /api/fleet/vehicles/:vehicleId/status` `{ "status": "Rented", "reason": "Booking <id> pick-up" }` |
| Booking `Completed` (car returned) | `POST /api/fleet/vehicles/:vehicleId/return` `{ "bookingId", "condition", "mileage", "damageNotes" }` |

Example call from the Booking Service:
```js
await fetch(`${process.env.FLEET_SERVICE_URL}/api/fleet/vehicles/${booking.vehicleId}/return`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-service-key': process.env.SERVICE_API_KEY, 'x-calling-service': 'booking-service' },
  body: JSON.stringify({ bookingId: booking._id, condition: 'Good', mileage: 15420 }),
});
```

### 11.3 Things to agree on with the team (put this in the shared Postman workspace)
1. **`JWT_SECRET`**: one value, shared by Auth, Payment and Fleet.
2. **Role names**: `Customer` and `Admin`, spelled exactly like this (my code ignores case, but please keep them consistent).
3. **`SERVICE_API_KEY`**: one value, shared by all services.
4. **IDs**: every id is a MongoDB ObjectId string (24 hex characters). The Fleet `vehicleId` is the Catalog vehicle's `_id`.
5. **Requests for Member 2:** add `GET /api/bookings/:id` (then only `bookingClient.getBooking` needs a small change). Optionally add a `PATCH /api/catalog/:id` so the Fleet Service can set `isAvailable=false` in the catalog when a car goes Under Maintenance.
6. **Deposit refund:** after a return, an admin refunds the Security Deposit (fully, or partly if the car was damaged) with `POST /api/payments/:paymentId/refund`.

---

## Step 12 – Run everything and final checklist

### Run the services at the same time
Open one terminal per service:
```powershell
# Terminal 1
cd DriveSync-backend\auth-service;    npm start
# Terminal 2
cd DriveSync-backend\payment-service; npm run dev
# Terminal 3
cd DriveSync-backend\fleet-service;   npm run dev
# Terminal 4
cd DriveSync-backend\api-gateway;     npm start
# (Members 2's catalog-service and booking-services as needed)
```
In VS Code you can split the terminal (`Ctrl+Shift+5`) to see all of them at once.

### Checklist
**Setup**
- [ ] MongoDB is running (local service or Atlas URI)
- [ ] `.env` was created from `.env.example` in both services
- [ ] `JWT_SECRET` is the same as the Auth Service's
- [ ] `npm install` was run in both services
- [ ] Both health endpoints return 200 (directly and through the gateway)
- [ ] MongoDB Compass shows `drivesync_payment_db.payments`, `drivesync_fleet_db.vehicles` and `drivesync_fleet_db.maintenances`

**Payment**
- [ ] Rental payment → 201 with receipt · deposit → 201
- [ ] Duplicate → 409 · simulated failure → 402 · cash → 202 → admin confirm → 200
- [ ] Get by id, receipt, history by booking and by customer, summary
- [ ] Pagination and filters on the admin list
- [ ] Full and partial refund · double refund → 409 · refund a Failed payment → 409
- [ ] Validation 400s · no token 401 · wrong role / other customer 403 · unknown payment 404

**Fleet**
- [ ] Register → 201 · duplicate → 409
- [ ] List with filters and pagination · get one · availability
- [ ] Valid and invalid status transitions (200 / 409)
- [ ] Return Good → Available · return Damaged → Under Maintenance and a job opened automatically
- [ ] Mark Available while a job is open → 409 · complete → Available, dates updated
- [ ] Maintenance history with totalCost
- [ ] Customer token on admin endpoints → 403

**Integration**
- [ ] Gateway routes `/api/payments` and `/api/fleet` (with `pathFilter`)
- [ ] Real login token from the Auth Service works on my services
- [ ] (optional) `VERIFY_BOOKING=true` works with a real booking
- [ ] (optional) Booking Service calls the Fleet return endpoint with `x-service-key`

### Git (team rule: separate branches)
```powershell
git checkout -b feat/payment-fleet-service
git add DriveSync-backend/payment-service DriveSync-backend/fleet-service DriveSync-backend/docs
git commit -m "feat: add payment and fleet management services (Member 3)"
git push -u origin feat/payment-fleet-service
```
Then open a Pull Request into `main`.

### Common problems
| Symptom | Fix |
|---|---|
| `Missing required environment variables` | Create `.env` (copy `.env.example`) |
| `connect ECONNREFUSED 127.0.0.1:27017` | MongoDB is not running. Start the "MongoDB" Windows service or use Atlas |
| `401 Not authorized: invalid token` | `JWT_SECRET` differs from the Auth Service's, or the token has expired |
| `403 Forbidden` | Wrong role (for example a Customer token on an admin route) |
| `EADDRINUSE :5004` | Another copy is already running. Close the other terminal |
| POST body empty through the gateway | The gateway has `express.json()` before the proxy. Remove it or move it after the proxy |
| `404` through the gateway but not directly | The gateway strips the prefix. Use `pathFilter` (Step 10) |
