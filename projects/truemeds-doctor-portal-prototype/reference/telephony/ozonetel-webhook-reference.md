# Ozonetel Webhook Reference

Every inbound webhook Ozonetel sends us, the fields each one carries, what we ingest, and why — plus every outgoing call we make to Ozonetel and why.

## Webhooks at a glance

Every webhook Ozonetel calls into, and the event values each one carries.

| Webhook | Event value(s) | Use case |
| --- | --- | --- |
| `GET /webhook/ozoneTel/doctorAnswered` | `NewCall, HANGUP, DIAL, DISCONNECT` | Doctor's call lands; resolve patient/order and bridge the call; track who disconnected |
| `GET /webhook/ozoneTel/customerAnswered` | — | Mark the moment the patient picks up; compute ring time |
| `POST /webhook/ozoneTel/callFinished` | — | Terminal event; compute final durations and recording URL |
| `GET /webhook/ozoneTel/transfer` | `NewCall, Hangup, Disconnect` | Bridge/reconcile a Health Advisor into or out of an active call |

## Outgoing calls at a glance

Every call we make out to Ozonetel's API, and what triggers it.

| Call | Method & Endpoint | Purpose |
| --- | --- | --- |
| Initiate Call | `GET outbound/outbound.php` | Doctor→patient click-to-call: rings the doctor, then bridges to patient |
| Transfer Call | `GET api/v1/CallControl/IVRTransfer` | Bridges a Health Advisor into/out of an active call |
| Get Live Call Status | `GET api/v1/CallControl/CallStatus` | Polls real-time status of an ongoing call |
| Get Call Details (CDR) | `GET restkookoo/index.php/api/Call_data/calldata/ucid/{callId}/date/{date}/format/json/` | Fetches historical call detail record for a completed call |

# A. Doctor–patient single-flow IVR

The core "Single Flow" call: a doctor (or Health Advisor) dials in, Ozonetel rings the matching patient, and we track both call legs end to end. Events below fire in this order for a single call.

## 1. doctorAnswered — `GET /webhook/ozoneTel/doctorAnswered`

The doctor's leg of the single-flow call. Ozonetel hits this one endpoint for four distinct moments, told apart by the `event` query param.

### event = NewCall

Doctor's call lands. We resolve which patient/order it belongs to and tell Ozonetel — via an XML `<dial>` response — to bridge the call to the patient's number.

| Field sent by Ozonetel | We ingest as | Purpose |
| --- | --- | --- |
| `sid` | `callId` | Primary key used to correlate every later event for this call |
| `cid` | `doctorNumber` | Trimmed of country code, looked up internally to resolve identity + role (Doctor / Health Advisor) |
| `called_number` | `callerId` | Stored on the call record |
| `randomId` | `customIdentifier` (match key) | Matched against the pending call record to find it; no match → event is a no-op |
| `orderId` | `orderId` | Stored on the call record |
| `circle` | `location` | Stored on the call record |
| `operator` | — | Captured for debug logging only, not persisted |
| `request_time` | `startStamp` | Parsed timestamp for call start |
| `patientCallBackUrl` | — | Captured, not currently persisted |

### event = HANGUP

Doctor disconnected the call.

| Field sent by Ozonetel | We ingest as | Purpose |
| --- | --- | --- |
| `sid` | `callId` (lookup key) | Finds the call record; `disconnectedBy` is then set to `"Doctor"` — a fixed value on our side, not a field Ozonetel sends |

### event = DIAL

Patient disconnected the call.

| Field sent by Ozonetel | We ingest as | Purpose |
| --- | --- | --- |
| `sid` | `callId` (lookup key) | Finds the call record; `disconnectedBy` is then set to `"Customer"` — a fixed value on our side, not a field Ozonetel sends |

### event = DISCONNECT

Call was transferred away.

| Field sent by Ozonetel | We ingest as | Purpose |
| --- | --- | --- |
| `sid` | `callId` (lookup key) | Finds the call record; `disconnectedBy` is cleared (set to `null`) |

## 2. customerAnswered — `GET /webhook/ozoneTel/customerAnswered`

Marks the moment the patient actually picks up, so we can compute how long the patient's leg rang before connecting.

| Field sent by Ozonetel | We ingest as | Purpose |
| --- | --- | --- |
| `sid` | `callId` | Used to look up the call record |
| `cid` | `fromNumber` | Patient's number; combined with `toNumber` to find the active call record |
| `dialled_number` | `toNumber` | Combined with `fromNumber` to find the matching call record |
| `pickduration` | `customerRingTime` | Added to `callInitiatedTimestamp` to derive `customerAnsweredTimestamp`; leg-2 marked `ANSWERED` |

No `event` discriminator on this endpoint — every call always means the patient picked up. Idempotent: if the pickup timestamp is already set, the call is skipped.

## 3. callFinished — `POST /webhook/ozoneTel/callFinished`

Terminal event for the call — computes final durations and the recording URL, then closes out the record.

| Field sent by Ozonetel | We ingest as | Purpose |
| --- | --- | --- |
| `sid` | `callId` | Used to look up the call record |
| `duration` | `leg1Duration` | Total call length |
| `ringing_time` | `leg2Duration = duration − ringing_time` | The actual doctor–patient conversation length |
| `end_time` | `endStamp` | Parsed call-end timestamp |
| `ivr_flow_details` | `recordingUrl` | String-searched for an embedded `AUDIO_URL:` marker to extract the recording link |

# B. Health Advisor transfer sub-flow

One endpoint, three events, covering the case where a Health Advisor gets bridged into (or out of) an in-progress doctor–patient call.

## transfer — `GET /webhook/ozoneTel/transfer`

Reconciles both call legs when a Health Advisor joins or leaves an active call. One endpoint, told apart by the `event` query param.

### event = NewCall

HA is being bridged into the call.

| Field sent by Ozonetel | We ingest as | Purpose |
| --- | --- | --- |
| `from_sid` | `callId` (lookup key) | Finds the HA call record |
| `outbound_sid` | `transferCallId` | Linked onto the HA call record; the doctor's sibling record is flagged as transferred |
| `haNumber` | — | Used to build the XML `<dial>` response bridging the call to the HA |

### event = Hangup

Customer hung up.

| Field sent by Ozonetel | We ingest as | Purpose |
| --- | --- | --- |
| `from_sid` | `callId` (lookup key) | Finds the HA call record |
| `callduration` | `leg2Duration` / `conversationDuration` | HA–customer conversation length |
| `total_call_duration` | `leg1Duration` | Total call length; both legs marked `COMPLETED`, `disconnectedBy = "Customer"` |

### event = Disconnect

HA hung up.

| Field sent by Ozonetel | We ingest as | Purpose |
| --- | --- | --- |
| `from_sid` | `callId` (lookup key) | Finds the HA call record and its doctor sibling record |
| `callduration` | `leg2Duration` / `conversationDuration` | HA–customer conversation length |
| `total_call_duration` | `leg1Duration` | Total call length; both legs marked `COMPLETED`, `disconnectedBy = "HA"` |

# C. Outgoing API calls to Ozonetel

Every call we make out to Ozonetel's API — initiating calls, transferring them, and pulling status/history back.

## 1. Initiate Call — `GET outbound/outbound.php`

**Host:** `https://in1-cpaas.ozonetel.com/`

Places an outbound call from Ozonetel to the doctor's number. When the doctor answers, Ozonetel is instructed — via the `url` param, a callback URL — to then bridge/dial the patient. This is the entry point of the doctor→patient click-to-call flow; the callback it points at is what triggers the **doctorAnswered** webhook in section A.

| Param we send | Purpose |
| --- | --- |
| `api_key` | Auth key for the Ozonetel account |
| `phone_no` | Doctor's number to dial |
| `caller_id` | Caller ID shown to the doctor |
| `url` | Callback URL carrying `randomId`, `orderId`, `patientCallBackUrl` — this is the URL Ozonetel calls back into, feeding the `doctorAnswered` webhook (section A) |
| `callback_url` | Final callback URL for terminal call events |

| Field in response (XML) | We map to | Purpose |
| --- | --- | --- |
| `status` | `status` | Whether the call was accepted/queued |
| `message` | `callId` | The UCID — used to correlate this call in all later lookups |

## 2. Transfer Call — `GET api/v1/CallControl/IVRTransfer`

**Host:** `https://in-ccaas.ozonetel.com/api/v1/CallControl/IVRTransfer`

Transfers/redirects an in-progress call to a different IVR/agent number — used to bridge a Health Advisor into an active doctor–patient call. The transfer this triggers is what surfaces as the **transfer** webhook in section B.

| Param we send | Purpose |
| --- | --- |
| `api_key` | Auth key for the Ozonetel account |
| `phoneno` | Customer's number |
| `ucid` | Call ID (UCID) of the call being transferred |
| `did` | Caller ID to present |
| `appURL` | Callback URL (carries the HA number) that Ozonetel hits, feeding the `transfer` webhook (section B) |
| `cburl` | Final callback URL |

| Field in response (JSON) | We map to | Purpose |
| --- | --- | --- |
| `status` | `status` | Whether the transfer request was accepted |
| `message` | `message` | Human-readable status detail |
| `ucid` | `callId` | The UCID for the transferred leg |

## 3. Get Live Call Status — `GET api/v1/CallControl/CallStatus`

**Host:** `https://in1-ccaas-api.ozonetel.com/api/v1/CallControl/CallStatus`

Polls Ozonetel for the real-time status of an ongoing call (dialing/answered/ended) — used to check whether a call is currently in progress for a user before taking further action.

| Param we send | Purpose |
| --- | --- |
| `ucid` | Call ID to check |
| `api_key` | Auth key for the Ozonetel account |
| `phoneno` (optional) | Number associated with the call |

| Field in response (JSON) | We map to | Purpose |
| --- | --- | --- |
| `status` | `status` | Top-level request status |
| `message` | `message` | Human-readable status detail |
| `data.status` | `data.status` | Live call state, e.g. `"call in Dial"`, `"answered"` — `data == null` means the call is not live/has ended |
| `data.starttime` | `data.starttime` | When the call started |
| `data.did` | `data.did` | Caller ID in use for the live call |

## 4. Get Call Details (CDR) — `GET restkookoo/index.php/api/Call_data/calldata/ucid/{callId}/date/{date}/format/json/`

**Host:** `https://in1-cpaas.ozonetel.com/restkookoo/index.php/api/Call_data/calldata`

Fetches the historical call detail record (CDR) for a completed call by UCID and date — duration, timestamps, hangup party, recording URL — used to populate internal call reports.

| Param we send | Purpose |
| --- | --- |
| `ucid` (path) | Call ID to fetch the CDR for |
| `date` (path) | Call date, `yyyy-MM-dd`, defaults to today |

| Field in response (JSON) | Purpose |
| --- | --- |
| `UCID` | Call ID |
| `UserID`, `SessionID` | Ozonetel-side identifiers |
| `Event`, `EventType`, `Channel` | Call classification fields |
| `StartTime`, `DialTime`, `PickTime`, `EndTime`, `Duration` | Call timing breakdown |
| `CallStatus` | Final call outcome |
| `CallerNo`, `CallerType`, `CallerCity`, `CallerCountry` | Caller details |
| `CalledNo`, `CalledCountry` | Callee details |
| `AudioUrl` | Call recording URL |
| `Comments` | Used to determine who ended the call |
