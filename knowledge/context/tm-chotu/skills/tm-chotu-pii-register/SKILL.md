---
name: tm-chotu-pii-register
description: Where customer and staff PII actually sits in Truemeds systems, and the hard rules for handling it. Covers the tm_view_nopii role on prod MySQL, the tables and columns confirmed to carry plaintext personal data, which "encrypted" columns are genuinely encrypted and which only look it, and the Redshift 170 exposure posture. Load BEFORE writing any query that touches mobile numbers, email, name, address, DOB, prescriptions, medical profile, bank details, call recordings or device/IP identity; before exporting customer-level rows to CSV/Excel/chat; before recommending any grant, role or masking control; and whenever the user asks "is this PII", "can I query mobile numbers", "where is our PII", "what can I share".
---

# PII register + handling guardrail

**Why this exists:** you cannot protect what you cannot locate. This register says where personal data lives so that queries, exports and grants are built to avoid it — not so that anyone can go find it.

---

## 🔴 Guardrail — non-negotiable

1. **Never `SELECT *`** on any table in the register below. Name the columns you need.
2. **Never export identity columns** (mobile, email, name, address, DOB, bank, prescription image/URL, call recording URL) to CSV, Excel, chat, a screenshot, or a ticket. Aggregate, hash, or join on the surrogate id instead. `customer_id` / `order_id` are the safe currency.
3. **If an analysis genuinely needs identity** (a CSR call list, an outreach cohort), say so explicitly, keep it to the minimum column set and the minimum row count, and deliver it through the channel the user names — never volunteer it into the transcript.
4. **Flag, don't silently comply.** If a user's request would pull identity columns, name the exposure in one line and offer the id-only version first. Proceed if they confirm — it is their data and their call — but the flag is mandatory.
5. **Never widen access to fix a query error.** A `permission denied` on a PII column is usually the control working. Route around it with a different column, or escalate — do not recommend a grant.
6. **A no-PII role is not a mask.** Data already replicated downstream is still there (see *tap vs tank* below).
7. **Never echo infrastructure secrets-identifiers into a reply** — Secrets Manager ARNs, AWS account ids, RDS/EC2 hostnames, bucket names. Refer to them by purpose ("the Mongo creds secret"), not by literal value. They are not passwords, but a transcript travels into tickets and shared docs, and the account id is the one field that makes everything else targetable.

---

## Access model — prod MySQL (`TMMUMPSDB`, DB 2 live / DB 630 replica)

The three CDC pipeline users — `snowflake_shellkode@%`, `airbyteuser@%`, `prod_dms@%` — no longer hold blanket `SELECT`. They read via the **`tm_view_nopii`** role (`SET DEFAULT ROLE ALL` applied to all three), plus the global-only replication privileges CDC requires (`REPLICATION SLAVE`, `REPLICATION CLIENT`, and for Airbyte `RELOAD`, `SHOW DATABASES`).

**What this means for you:** if a pipeline or downstream table suddenly cannot see a column, that is the lock, not a bug. Do not "fix" it with a grant.

Deliberate exception: `prod_dms` holds a direct `SELECT` on `fraud_customers_address` (granted on the user, not the role).

---

## The register — confirmed plaintext PII on prod MySQL

Sampled with evidence and revoked from the no-PII role on 2026-08-13. Treat every row here as **do not select, do not export**.

| Table | Column(s) | What is actually in there |
|---|---|---|
| `oauth_access_token` | `authentication` | 🔴 **The worst one.** Java-serialised `OAuth2Authentication` blob, **not encrypted** — a regex pulled valid mobile numbers from 5 of 5 sampled rows. ~1.6M rows ⇒ on the order of **1.6M customer mobiles in clear**. This silently defeats the encryption on `customer_details.encrypted_mobile_no`. |
| `truemeds_doctor` | bank account, IFSC, DOB, cancelled-cheque path, signature / certificate paths | Staff (doctor) financial + identity documents |
| `exotel_customer_feedback` | `call_from`, `call_to`, `dial_whom_number` | Raw customer phone numbers |
| `true_caller_response_data` | given name, family name, city, zipcode, social IDs | Third-party identity enrichment |
| `support_ticket_details` | `audio_url` | Call recordings on the prod storage bucket |
| `cashfree_payment_details`, `cash_free_mapping_new` | `card_number` | Empty today; revoked pre-emptively |
| `biometric_data` | `url` | ⚠️ **Still readable** at last check — a table-level grant survived, so the column-level revoke did not close it |
| `register_details` | `drx_link`, `invoice_link` | 🔴 **Prescription and invoice document URLs.** The Rx register is otherwise safe and useful (see `tm-chotu-rx-cadence`) — select the clinical columns, never the two link columns |
| `third_party_api_logs` | request / response bodies | 3.2M rows of third-party payloads, never column-listed. Assume it carries identity until proven otherwise |

**Not yet sampled — treat as PII by default:** `medical_profile`, `prescription_details`, `patient_current_medicine`, `patient_symptoms`, `customer_address_details`, `customer_contact_mapping`, `customer_access_token_update`, `paytm_details`, `wallet*`, `delivery_agent`.

Plus the obvious core: `customer_details` (mobile, email, name, DOB), `d_address_master` / address tables, prescription image tables, `order_device_mapping` + `customer_device_tracker` (device id / IP = personal data under DPDP).

---

## Encryption — what is real and what only looks it

- `customer_details.lookup_mobile_no` and `lookup_email_address` **are** encrypted, deterministically — so they remain usable as **stable join keys** without exposing the value. Prefer these when you need identity matching.
- `customer_details.encrypted_mobile_no` is encrypted **at that column**, and then undone by the plaintext copy sitting in `oauth_access_token.authentication`.
- **Rule: a column name is not evidence of encryption.** Sample before you trust it. `encrypted_*` proved nothing here.

---

## Redshift 170 posture

- **Column-level restriction:** 5 PTS columns on `inward_product_details` — `pts`, `verified_pts`, `final_pts`, `verified_pts_by_cp`, `invoiced_final_pts` — are excluded from the `tm_analytics` group grant. `SELECT *` on that table fails by design; name the columns.
- **Three holders of `sys:superuser`** on the cluster (granted 2026-08-13 for the DE handover). Superuser bypasses every permission check including the PTS column exclusion — so **any grant-based control on DB 170 is advisory for those users.** Check `svv_user_grants` before proposing one.
- **`tmmumpsdb.customer_details` was emptied on 2026-08-13 with no backup**, and the operation cannot be rolled back on Redshift. Refill depends on the connector's sync mode — full-refresh self-heals, incremental does not. **Always probe row count before using `customer_details` on 170**; if it is empty or short, fall back to DB 630. This also means "we removed the PII" is false for the schema as a whole — mobile / email / name / address / DOB / prescription columns remain across other tables in the same 3,461-table schema.

---

## Mechanics that trip people up

See `tm-chotu-learnings` L13 for the full set. The four that matter here:

1. **Column-level privileges live in `mysql.columns_priv` and survive a table-level revoke.** Revoke both, then verify.
2. **Column-level-only grants break CDC metadata discovery** — MySQL hides ungranted columns from `information_schema.columns` and refuses `SHOW CREATE TABLE`, so DMS fails "no table definition found" and Airbyte fails "SHOW command denied". Only the column-scoped tables show the symptom.
3. **Grants never filter the binlog.** `REPLICATION SLAVE` streams every column of every base table, and views do not exist in the binlog at all. So a column-scoped role constrains the query path only — **CDC stays wide open**. For any binlog-CDC pipeline, PII exclusion must live in the **connector** (DMS `remove-column` transformation rules, Airbyte `column.exclude.list`). Table-level `SELECT` + connector-side exclusion is strictly better than column grants: it fixes discovery *and* covers both paths.
4. **`_` is a single-character wildcard.** Hunting PII column names with `ILIKE '%pan_%'` matches `company_nm` and similar. Escape it: `LIKE '%pan\_%'`.

Useful audit queries:

```sql
-- every table with a column-scoped grant to the no-PII role
SELECT DISTINCT table_name
FROM information_schema.column_privileges
WHERE grantee = "'tm_view_nopii'@'%'"
ORDER BY table_name;
```

```sql
-- what a group can actually read on a Redshift table
SELECT column_name, privilege_type
FROM information_schema.column_privileges
WHERE table_schema = '<schema>' AND table_name = '<table>' AND grantee = '<group>';
```

---

## Tap vs tank

Revoking access **closes the tap, not the tank.** The ~1.6M plaintext mobiles from `oauth_access_token` had already replicated into the Snowflake / Airbyte / DMS targets before the revoke. Downstream copies are a live DPDP question and are **not** addressed by anything in the register above.

**Applies to your work directly:** any extract you took before a lock is still an extract. Old CSVs, old Excel deliverables and old scratch dirs carry whatever the grant allowed at the time.

---

## Open items (as of 2026-08-14)

1. `biometric_data` — table-level grant still exposes `url`; needs a table-level revoke, not a column one.
2. DMS tasks failing on column-scoped tables — agreed direction is table-level `SELECT` + DMS `remove-column` rules.
3. `third_party_api_logs` — 3.2M rows, still fully granted, column list never produced.
4. Class-B tables listed above never sampled.
5. Is the prod storage bucket publicly readable? If so, revoking `support_ticket_details.audio_url` is moot.
6. Downstream purge / DPDP position on data already synced.
7. Application fix: the serialised auth blob should not carry a plaintext principal at all.

**If a user asks you to work on any of these, treat it as a security task** — evidence first, smallest sample that proves the point, and never paste a sampled value into the transcript.
