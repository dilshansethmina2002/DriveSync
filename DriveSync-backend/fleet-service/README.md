# DriveSync – Fleet Management Service (port 5005)

Member 3 – Finance & Operations. This service tracks each vehicle's operational status (Available / Rented / Under Maintenance / Inactive), its condition, its maintenance history and its rental returns.

```powershell
npm install
Copy-Item .env.example .env   # set MONGO_URI and JWT_SECRET (same secret as the Auth Service)
npm run dev                    # or: npm start
npm run token -- Admin         # make a test JWT for Postman
```

Health check: `GET http://localhost:5005/api/fleet/health`

The full documentation is in [`../docs/MEMBER3_FINANCE_OPERATIONS_GUIDE.md`](../docs/MEMBER3_FINANCE_OPERATIONS_GUIDE.md).
