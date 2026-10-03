# Login and Voucher API

## Admin dashboard

1. Register an account with `POST /api/register` or create one through the existing registration flow. New accounts always receive the `USER` role.
2. In the Supabase SQL Editor, promote the intended account:

   ```sql
   UPDATE public.users
   SET role = 'ADMIN'
   WHERE LOWER(email) = LOWER('admin@example.com')
   RETURNING id, email, role;
   ```

3. Open `/admin` and sign in with that account.

Existing accounts receive the `USER` role when the role migration runs. Role changes are checked against the database for every admin operation. There is intentionally no public API for promoting accounts.

## Admin API

- `POST /api/admin/login` authenticates accounts with role `ADMIN`.
- `GET /api/admin/vouchers` lists all vouchers.
- `POST /api/admin/vouchers` creates a voucher.
- `PUT /api/admin/vouchers/:voucherId` updates a voucher.
- `PATCH /api/admin/vouchers/:voucherId/status` activates or deactivates a voucher.

Voucher management and score updates require `Authorization: Bearer <token>` from admin login. Standard users cannot write point balances. Deactivating a voucher preserves its redemption history.

## Run locally

Set `DATABASE_URL` and a strong `JWT_SECRET` in `.env`, then run:

```bash
npm install
npm start
```

The database schema and initial voucher catalog are initialized when the app receives its first request.