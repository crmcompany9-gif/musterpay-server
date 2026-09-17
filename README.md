# MusterPay — Payroll API (MERN backend)

Attendance-based payroll for a small team. This is the back end for the MusterPay
prototype: it stores employees + daily attendance and runs the exact same
salary math the prototype does, for the whole team at once.

## What it does

- Keep a roster of employees (name, monthly salary).
- Record daily attendance (present / absent / half day / short-leave / paid leave / holiday / weekly-off).
- Run payroll for any month → per-employee gross, LOP days, deduction, net + the company payout.
- Finalize a run → freeze payslips so past months never change.

Per-day salary = `monthlySalary ÷ days in that month` (calendar method, configurable).
Deductions: absent = 1 day, half day = 0.5, short/late = 0.25, and the first paid
leave each month is free.

## Requirements

- Node 18+
- MongoDB — either local (`mongod`) or a free MongoDB Atlas cluster

## Setup

```bash
npm install
cp .env.example .env          # then edit MONGO_URI if you use Atlas
npm run seed                  # loads 8 demo employees + September 2026 attendance
npm run dev                   # starts the API on http://localhost:4000
```

`npm run seed` prints the whole run in your terminal — you should see the same
numbers as the prototype (company payout ₹1,14,083.34).

## API

Base URL: `http://localhost:4000/api`

### Employees
| Method | Path             | Body                                   |
|--------|------------------|----------------------------------------|
| GET    | `/employees`     | —                                      |
| POST   | `/employees`     | `{ name, monthlySalary }`              |
| PATCH  | `/employees/:id` | any editable field                     |
| DELETE | `/employees/:id` | — (also clears that person's attendance)|

### Attendance
| Method | Path                          | Body / query                                   |
|--------|-------------------------------|------------------------------------------------|
| PUT    | `/attendance`                 | `{ employeeId, year, month, day, status }`     |
| GET    | `/attendance?year=&month=`    | —                                              |

`status` is one of `present, absent, half, short, paid, holiday, off`.
Sending `present` clears the day (present is the inferred default), so the DB only
stores the exceptions — same as the prototype.

### Payroll
| Method | Path                          | Returns                                        |
|--------|-------------------------------|------------------------------------------------|
| GET    | `/payroll/run?year=&month=`   | per-employee rows + totals (the run table)     |
| POST   | `/payroll/finalize?year=&month=` | freezes a `Payslip` per employee            |

Month is **1-12** in the API (September = 9).

### Quick check with curl

```bash
# the whole team's September 2026 run
curl "http://localhost:4000/api/payroll/run?year=2026&month=9"

# mark employee absent on the 8th
curl -X PUT http://localhost:4000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"<id>","year":2026,"month":9,"day":8,"status":"absent"}'
```

## How it maps to the prototype

| Prototype                       | Here                                             |
|---------------------------------|--------------------------------------------------|
| Roster rows                     | `Employee` collection                            |
| A painted matrix cell           | one `Attendance` doc `{ employeeId, date, status }` |
| The `compute()` function        | `src/services/payroll.js → computeEmployeePayroll` |
| The run table + payout          | `runPayroll()` / `GET /payroll/run`              |
| A single payslip                | `Payslip` collection (after finalize)            |

## Layout

```
server.js               app + startup
src/
  config/               db connection, payroll policy
  models/               Employee, Attendance, Holiday, Payslip
  services/payroll.js   the payroll engine (ported from the prototype)
  controllers/          request handlers
  routes/               endpoint wiring
  seed.js               demo data + prints a run
```

## Next steps

1. Point a React front end at these endpoints (the prototype's screens map 1:1).
2. Deploy: push to GitHub, deploy on Render, point `MONGO_URI` at MongoDB Atlas.
3. Add auth (who can mark attendance / run payroll) before real use.
