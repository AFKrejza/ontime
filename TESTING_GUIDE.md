# Validation Testing Guide

This guide assumes your server runs on `http://localhost:3000` and that you've already run `npm install` to pull in `ajv`, `ajv-formats`, and `ajv-errors`.

There are two ways to verify the validation works:

1. **Automated:** `node testValidation.js` from the project root — runs 66 assertions against the compiled schemas and the middleware factory directly. No HTTP server needed. Should print `Pass: 66    Fail: 0`.
2. **Manual via curl:** the cases below.

## Setup

```bash
npm install
npm start    # or: npm run dev
```

Grab a JWT once for the protected endpoints:

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"userName":"alice_01","email":"alice@test.dev","password":"Password123"}'
# → { "message": "User registered.", "token": "eyJ..." }

export TOKEN="eyJ..."   # paste the token from the response
```

## Universal error response shape

Every validation failure returns HTTP 400 with this body:

```json
{
  "errors": [
    { "field": "email",  "message": "email must be a valid email address", "keyword": "errorMessage" },
    { "field": "(root)", "message": "userName is required",                "keyword": "errorMessage" }
  ]
}
```

`field` is dot-pathed for nested issues (`towerIds.0`), `(root)` for top-level problems like missing fields.

---

## Auth

### POST /auth/signup

**Valid:**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"userName":"alice_01","email":"alice@test.dev","password":"Password123"}'
# → 201 { "message": "User registered.", "token": "..." }
```

**Invalid — bad email:**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"userName":"alice_01","email":"not-email","password":"Password123"}'
# → 400 errors include "email must be a valid email address"
```

**Invalid — short password:**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"userName":"alice_01","email":"alice@test.dev","password":"short"}'
# → 400 "password must be at least 8 characters" + "password must contain at least one letter and one number"
```

**Invalid — password missing a number:**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"userName":"alice_01","email":"alice@test.dev","password":"alllettersnonum"}'
# → 400 "password must contain at least one letter and one number"
```

**Invalid — bad username chars:**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"userName":"alice!!","email":"alice@test.dev","password":"Password123"}'
# → 400 "username may only contain letters, numbers, underscores and hyphens"
```

**Invalid — extra unknown field:**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"userName":"alice_01","email":"alice@test.dev","password":"Password123","isAdmin":true}'
# → 400 "unknown field is not allowed"
```

**Edge — empty body:**
```bash
curl -X POST http://localhost:3000/auth/signup -H "Content-Type: application/json" -d '{}'
# → 400 with three "X is required" errors
```

### POST /auth/login

**Valid:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.dev","password":"Password123"}'
```

**Invalid — bad email format:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nope","password":"x"}'
# → 400 "email must be a valid email address"
```

---

## Gateways

### POST /gateways/register (auth required)

**Valid:**
```bash
curl -X POST http://localhost:3000/gateways/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"gatewayId":"c1895bf80e2b","gatewayName":"Living Room"}'
```

**Invalid — non-hex id:**
```bash
curl -X POST http://localhost:3000/gateways/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"gatewayId":"NOT_HEX_ID!!","gatewayName":"Living Room"}'
# → 400 "must be exactly 12 lowercase hexadecimal characters..."
```

**Invalid — uppercase id:**
```bash
curl -X POST http://localhost:3000/gateways/register \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"gatewayId":"C1895BF80E2B","gatewayName":"x"}'
# → 400 (uppercase rejected — IDs must be lowercase to match DB convention)
```

**Invalid — whitespace-only name:**
```bash
curl -X POST http://localhost:3000/gateways/register \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"gatewayId":"c1895bf80e2b","gatewayName":"   "}'
# → 400 "name must not be only whitespace"
```

### POST /gateways/check (note nested `data` field)

**Valid:**
```bash
curl -X POST http://localhost:3000/gateways/check \
  -H "Content-Type: application/json" \
  -d '{"data":{"gatewayId":"c1895bf80e2b"}}'
```

**Invalid — missing `data` wrapper:**
```bash
curl -X POST http://localhost:3000/gateways/check \
  -H "Content-Type: application/json" \
  -d '{"gatewayId":"c1895bf80e2b"}'
# → 400 "expected body.data to be present"
```

### POST /gateways/assigntowers

**Valid:**
```bash
curl -X POST http://localhost:3000/gateways/assigntowers \
  -H "Content-Type: application/json" \
  -d '{"gatewayId":"c1895bf80e2b","towerIds":["547c65321d0b","0123456789ab"]}'
```

**Invalid — empty array:**
```bash
curl -X POST http://localhost:3000/gateways/assigntowers \
  -H "Content-Type: application/json" \
  -d '{"gatewayId":"c1895bf80e2b","towerIds":[]}'
# → 400 "towerIds must contain at least one tower id"
```

**Invalid — duplicate towers:**
```bash
curl -X POST http://localhost:3000/gateways/assigntowers \
  -H "Content-Type: application/json" \
  -d '{"gatewayId":"c1895bf80e2b","towerIds":["547c65321d0b","547c65321d0b"]}'
# → 400 "towerIds must not contain duplicates"
```

**Invalid — bad item in array:**
```bash
curl -X POST http://localhost:3000/gateways/assigntowers \
  -H "Content-Type: application/json" \
  -d '{"gatewayId":"c1895bf80e2b","towerIds":["BAD"]}'
# → 400 with field "towerIds.0"
```

### POST /gateways/health

**Valid (boundary values):**
```bash
curl -X POST http://localhost:3000/gateways/health \
  -H "Content-Type: application/json" \
  -d '{"gatewayId":"c1895bf80e2b","towerId":"547c65321d0b","charge":0}'

curl -X POST http://localhost:3000/gateways/health \
  -H "Content-Type: application/json" \
  -d '{"gatewayId":"c1895bf80e2b","towerId":"547c65321d0b","charge":100}'
```

**Invalid — out of range:**
```bash
curl -X POST http://localhost:3000/gateways/health \
  -H "Content-Type: application/json" \
  -d '{"gatewayId":"c1895bf80e2b","towerId":"547c65321d0b","charge":150}'
# → 400 "charge must be at most 100"
```

**Invalid — string instead of number:**
```bash
curl -X POST http://localhost:3000/gateways/health \
  -H "Content-Type: application/json" \
  -d '{"gatewayId":"c1895bf80e2b","towerId":"547c65321d0b","charge":"50"}'
# → 400 "charge must be a number"  (no string-to-number coercion)
```

### PATCH /gateways/:gatewayId/rename

**Invalid — bad path param:**
```bash
curl -X PATCH http://localhost:3000/gateways/INVALID/rename \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"New Name"}'
# → 400 (param validation runs before body validation)
```

---

## Towers

### POST /towers/:towerId/addAssignment (note nested `assignment`)

**Valid (boundary — zero offset is allowed):**
```bash
curl -X POST http://localhost:3000/towers/547c65321d0b/addAssignment \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"assignment":{"departureOffset":0,"lineId":1,"stopId":1200}}'
```

**Invalid — positive offset (DB CHECK constraint says ≤ 0):**
```bash
curl -X POST http://localhost:3000/towers/547c65321d0b/addAssignment \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"assignment":{"departureOffset":5,"lineId":1,"stopId":1200}}'
# → 400 "departureOffset must be 0 or negative"
```

**Invalid — non-integer lineId:**
```bash
curl -X POST http://localhost:3000/towers/547c65321d0b/addAssignment \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"assignment":{"departureOffset":-5,"lineId":1.5,"stopId":1200}}'
# → 400 "must be an integer"
```

### PATCH /towers/:towerId

**Valid:**
```bash
curl -X PATCH http://localhost:3000/towers/547c65321d0b \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Front Door"}'
```

**Invalid — empty name:**
```bash
curl -X PATCH http://localhost:3000/towers/547c65321d0b \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"name":""}'
# → 400 "name must not be empty"
```

---

## Users

### PATCH /users/update

**Valid (either field alone is fine):**
```bash
curl -X PATCH http://localhost:3000/users/update \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"username":"alice_01"}'

curl -X PATCH http://localhost:3000/users/update \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"email":"alice2@test.dev"}'
```

**Invalid — empty body:**
```bash
curl -X PATCH http://localhost:3000/users/update \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{}'
# → 400 "at least one of username or email must be provided"
```

---

## Edge cases worth poking at

| Case | What to send | Expected |
|---|---|---|
| Malformed JSON | `-d '{not json'` to any endpoint | 400 "request body is not valid JSON" (caught by errorHandler.js) |
| Missing `Content-Type` | drop `-H "Content-Type: application/json"` | Express won't parse — body is `undefined`, validate returns 400 |
| Number where string expected | `{"gatewayId": 12345, ...}` | 400 "must be a string" |
| String where integer expected | `{"lineId": "1", ...}` | 400 "must be an integer" (no coercion) |
| Boundary | `charge: 0`, `charge: 100`, `departureOffset: 0` | All accepted |
| Just past boundary | `charge: -0.001`, `charge: 100.001`, `departureOffset: 1` | 400 |
| Empty string | `{"name": ""}` on rename | 400 |
| Whitespace only | `{"name": "   "}` on rename | 400 |
| Extra unknown property | `{"userName":"alice_01","email":"a@b.co","password":"Password123","admin":true}` | 400 "unknown field is not allowed" |
| Multiple errors at once | bad email AND short password AND bad username | 400 with all three errors in `errors[]` (because `allErrors: true`) |

## How the JWT auth interacts with validation

The middleware order is intentional:

```
authMiddleware → validate('xxxParam', 'params') → validate('xxxBody') → controller
```

Auth runs first because there's no point validating bodies for unauthenticated requests. `validate()` only ever inspects the request — it never touches `req.user` — so JWT auth and validation are independent.