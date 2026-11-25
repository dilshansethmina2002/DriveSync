# DriveSync – Payment Service (port 5004)

Member 3 – Finance & Operations. This service handles rental payments, security deposits, digital receipts and refunds through a **simulated** payment gateway. It accepts no card data and stores none.

```powershell
npm install
Copy-Item .env.example .env   # set MONGO_URI and JWT_SECRET (same secret as the Auth Service)
npm run dev                    # or: npm start
npm run token -- Admin         # make a test JWT for Postman
```

Health check: `GET http://localhost:5004/api/payments/health`

The full documentation (architecture, code walkthrough, API reference, Postman, gateway and booking integration) is in
[`../docs/MEMBER3_FINANCE_OPERATIONS_GUIDE.md`](../docs/MEMBER3_FINANCE_OPERATIONS_GUIDE.md).
