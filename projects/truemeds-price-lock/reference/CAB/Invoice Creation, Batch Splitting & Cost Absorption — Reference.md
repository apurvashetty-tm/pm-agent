# Invoice Creation, Batch Splitting & Cost Absorption — Reference

# Invoice Creation, Batch Splitting & Cost Absorption — Reference

Scope: `third-party-service` (+ `master-service` for shared entity definitions). Centered on `NetSuiteServiceImpl.createUpdateInvoice` and everything it touches.

## 1. Controller trace (end-to-end)

### 1a. Invoice creation

```
HTTP  POST /createInvoiceInZoho
        (name kept from the legacy Zoho-accounting integration; actually drives NetSuite)
      ThirdPartyServiceController.createUpdateInvoice(orderIdList, warehouseId, isUpdate,
                                                        newDeliveryCharge, transactionId)
        [ThirdPartyServiceController.java:1762-1779]
        |
        v
      NetSuiteServiceImpl.createUpdateInvoice(orderIdList, isUpdate, warehouseId,
                                               transactionId, newDeliveryCharge)
        [NetSuiteServiceImpl.java:8021]
        |
        |-- updateFinalSubsBatchWise(orderId, ...)              [line 8089]  -- batch split (S3)
        |-- orderService.checkCostAbsorption(orderId)           [line 8090]  -- cost absorption (S4)
        |-- prepareNsOrderBatchSelectionDto(orderId)            [line 8098]  -- build NS payload (S3.4)
        |
        v
      AutoInvoicingServiceImpl.createUpdateInvoice(orderId, transactionId,
                                                     batchesSelectedDetails, isUpdate, null)
        [AutoInvoicingServiceImpl.java:379]
        |
        |-- calculateAndStorePriceLockDiscountBeforeNsCall(orderId, batchesSelectedDetails) [line 408] (S5)
        |
        v
      restUtil.restPostCall(url, batchesSelectedDetails, ...)   [line 413]
        url = warehouse-service (per-warehouse IP) endpoint:
              handlerValue.warehouseService_saveInvoiceInNetsuite?orderId=..&isUpdate=..
        |
        v
      [warehouse-service instance for that warehouse] --> NetSuite ERP
        |
        v  (JSON response with ns_invoice_id, invoice totals, per-line price_locked_disc, ...)
      AutoInvoicingServiceImpl.saveInvDetailsInDb(responseJsonNode, orderId)  [line 610]
        -- writes net_suite_invoice_batch.priceLockDiscount, net_suite_invoice_tax, etc.
```

### 1b. Cost absorption (standalone entry point)

```
HTTP  POST /checkCostAbsorption?orderId=...
      ThirdPartyServiceController.checkCostAbsorption(orderId)   [line 3530-3533]
        |
        v
      OrderServiceImpl.checkCostAbsorption(orderId)               [line 1073]
```

Also invoked inline from the invoice flow at `NetSuiteServiceImpl.java:8090`, always **after** the batch split and **before** the NetSuite payload is built — so cost-absorption decisions are always made on the already-split `final_substitute_product` rows.

## 2. Tables involved

| Table | Entity | Defined in | Role |
| --- | --- | --- | --- |
| `net_suite_invoice_batch` | `NetSuiteInvoiceBatch` | master-service | One row per physical batch draw for a product on an order — `orderId`, `productCode`, `batchNumber`, `quantity`, `mrp`, `oldMrp`, `expiryDate`, `manufacturer_date`, `external_batch_number`, `fspId`, `active`, `priceLockDiscount`. Populated by WMS/putaway when stock is physically picked; a product picked from 2+ batches has 2+ rows here. |
| `final_substitute_product` | `FinalSubstituteProduct` | master-service | One row per order line item (original or substituted product) — `orderId`, `productId`, `recommendQuantity`, `requestedQuantity`, `subsMrp`/`originalMrp`, `subsMrpWithQty`, `sellingPrice`, `invoiceBatchId`, `priceLock`, `priceLockDiscount`. |
| `final_substitute_product_cab` | `FinalSubstituteProductCab` | master-service | Frozen, per-warehouse "locked" price snapshot (`locked=true`), used as the *promised* baseline for cost absorption. Never touched by the batch split. |
| `order_details` | `OrderDetails` | master-service | Order-level: `warehouseId`, `tmCredit`, `soUpdateRequired`, `statusId` (`@OneToOne → SystemValueMaster`). |
| `product_details` | `ProductDetails` | third-party-service only | Product-level pricing (`price`, `originalPrice`) + `isMultiBatchProduct` flag. |
| `package_details_tracking` | `PackageDetailsTracking` | third-party-service | Shipment/package status; detects hold-cancelled orders, updated post-invoice with invoice number/date. |
| `export_details_track` | `ExportDetailsTrack` | third-party-service | Audit row per invoice-creation call (fileType = single vs bulk, start/end time, element count). |
| `order_status` | `OrderStatus` | third-party-service only | Status-change history — distinct from `orderDetails.statusId`. |
| `final_calculated_amount` | `FinalCalculatedAmount` | master-service | Final billed numbers for the order — `totalAmount`, `finalAmount`, `discount`, `subsMrp`, `priceLockDisc`, `adjustmentAmt`, etc. |
| `net_suite_sales_order` / `net_suite_shipment_details` | (master-service) | master-service | Updated post-invoice with NetSuite invoice total / item-fulfillment id. |

## 3. `createUpdateInvoice` (`NetSuiteServiceImpl.java:8021`)

1. Resolve `warehouseId` — from param or `userWarehouseMappingRepository` (errors if the user maps to 0 or \>1 warehouse).
2. Create an `ExportDetailsTrack` audit row (`fileType` = single vs bulk based on `orderIdList.size()`).
3. **Single-order path only** (bulk branch just returns `null` — bulk invoicing isn't actually implemented here):
    - If the order's warehouse is WMS/putaway and its latest status is `HOLD_CANCELED`, cancel invoicing and mark the package cancelled.
    - `updateFinalSubsBatchWise(orderId, ...)` — batch split, line 8089 (section 3.1).
    - `orderService.checkCostAbsorption(orderId)` — section 4.
    - If `tmCredit > 0`, update TM-credit values and detach the entity.
    - `prepareNsOrderBatchSelectionDto(orderId)` — builds the wire DTO (section 3.4).
    - If batches exist, call `autoInvoicingServiceImpl.createUpdateInvoice(...)` — actual NetSuite POST (section 3.5).
4. `finally`: close out the `ExportDetailsTrack` row.

### 3.1 Batch split — `updateFinalSubsBatchWise` (`NetSuiteServiceImpl.java:12950`)

1. Load `fspList` = all `final_substitute_product` rows for the order, and `nsInvoiceBatchList` = all `net_suite_invoice_batch` rows (`active=true`).
2. Group `nsInvoiceBatchList` by `fspId` → `nsInvBatchMap`, sum quantities → `nsInvBatchQtyMap`.
3. Sanity check: summed batch quantity must equal `fsp.recommendQuantity`, else throw.
4. For each fsp, walk its batch list:
    - **First batch** → reuse the existing fsp row: qty = that batch's qty, pricing recomputed via `updateDataInFsp(fsp, invBatch.getMrp(), discount)`, `fsp.invoiceBatchId = batch.invoiceBatchId`.
    - **Every subsequent batch** → clone the fsp (`finalSubsId=null`, new row), qty/pricing recomputed for that batch's own `mrp`, linked to that batch's `invoiceBatchId`.
5. `finalSubstituteProductRepository.saveAll(...)` — the literal split: one order line becomes N `final_substitute_product` rows, one per physical batch.
6. If any product split: `orderDetails.soUpdateRequired = true` + `productDetailsRepository.updateAsMultiBatchProduct(true, ids)`.
7. Re-link every `net_suite_invoice_batch.fspId` to the fsp now representing it; save.
8. `finally`: `updateWalletAndFca` — recomputes wallet/FCA, writes an order footprint.

**MRP handling per batch** (`updateDataInFsp`, line 13088): `productMrp` passed in is that specific batch's own `mrp`, not a blended value and not any price-lock value. `net_suite_invoice_batch.mrp` is **never modified** by this method.

### 3.2–3.5 remaining sub-steps

`checkCostAbsorption` runs right after the split (line 8090). `prepareNsOrderBatchSelectionDto` (line 8154) flattens each `net_suite_invoice_batch` row into one `NsLineItems` wrapping one `NsBatchDetails` — the multi-batch fan-out already happened at the DB level; this just serializes it. `AutoInvoicingServiceImpl.createUpdateInvoice` (line 379) builds the warehouse-service URL, calls `calculateAndStorePriceLockDiscountBeforeNsCall` (section 5), POSTs the payload, and on success updates order status, `package_details_tracking`, `net_suite_shipment_details`, `net_suite_sales_order.total`, then calls `saveInvDetailsInDb` (line 610, section 5).

## 4. Cost absorption in the multi-batch case

`OrderServiceImpl.checkCostAbsorption` (line 1073) runs right after the batch split.

- **4.1 Regrouping by unit MRP** — `Utilities.findCostAbsorptionUpdatedMedsList` (line 4830) groups split fsp rows by `productCode + unit MRP`. Same-MRP rows merge into one `PriceInfoDto` bucket (qty/mrp/sellingPrice/coupon summed, all contributing `finalSubsId`s appended to `fspIds`); different-MRP rows get separate buckets.
- **4.2 Detecting multi-batch** — `addUpdateCostAbsorption` (line 1271): `isMultiBatch = !priceInfoList.isEmpty()`. If true, `generateCostAbsorptionDetails` runs once per bucket.
- **4.3 Per-bucket calculation** — `generateCostAbsorptionDetails` (line 1337): actual qty/mrp/sellingPrice from that bucket only; over-delivery computed against the total across all batches; promised selling price prorated to this batch's slice; `fspId` vs `fspIdsSameMrp` depending on whether the bucket merged multiple original rows; `calculateCostAbsorption` (line 1473) decides INCREASED/DECREASED/no-change + `diffAmt`.
- **4.4 Writing the result back** (lines 1183-1226) — `priceLockMap` built from cost-absorbed buckets; all `final_substitute_product` rows reloaded and `fsp.priceLock = perUnitPrice * fsp.recommendQuantity` set for matching ids; `orderWhMfcMapping.costAbsorptionApplied` flagged if any bucket absorbed.

## 5. Where `priceLock` is consumed downstream

`priceLock` feeds exactly one consumer, which fans out to two places:

### 5.1 Converted to a discount, right before the NetSuite call

`AutoInvoicingServiceImpl.calculateAndStorePriceLockDiscountBeforeNsCall` (line 2136), called at line 408 before the invoice POST. For each fsp with `priceLock > 0`:

```
currentSellingPrice = Σ(batch.mrp * batch.qty)        // from the outgoing payload
currentSellingPrice *= (1 - discountPercentage/100)   // normalized to fsp's discount %
priceLockDiscount   = (currentSellingPrice - couponCodeDiscount) - fsp.getPriceLock()
```

If positive, saved as `fsp.priceLockDiscount` (line 2183). Then `netSuiteService.updateWalletAndFca(...)` (line 2199) recomputes wallet/FCA.

### 5.2 NetSuite echoes its own value back onto the batch row

`saveInvDetailsInDb` (line 610) reads NetSuite's response line items, pulls `price_locked_disc` per `line_id`, and writes it onto `net_suite_invoice_batch.priceLockDiscount` keyed by `fspId` (line 777-783) — a second, independent write.

### 5.3 Rendered on the customer invoice/bill

Two near-duplicate invoice-generation code paths in `NetSuiteServiceImpl` (\~line 3150-3466 and \~15780-16233) read `batchItem.getPriceLockDiscount()` per line item and sum `finalSub.getPriceLockDiscount()` for an order-level total, shown as an extra discount on the customer-facing invoice.

## 6. Whole-project usage map

Scope: third-party-service + master-service. Headline finding: master-service **defines** these entities but has almost no operational repositories or service logic against them — all real reads/writes happen in third-party-service.

| Entity | master-service | third-party-service |
| --- | --- | --- |
| `order_details` / `OrderDetails` | Entity defined (\~50 fields). No repository — only `OrderStatusUtilImpl` (no persistence) and one JPQL join. | `OrderDetailsRepository`. Top consumers: NetSuiteServiceImpl (81 refs), CashFreeServiceImpl (28), ClickPostIntegrationServiceImpl (20), ShiprocketIntegrationServiceImpl (13), XpressBeeServiceImpl/DelhiveryServiceImpl (10 each). |
| `final_substitute_product` | Entity + Cx/Dr/Cart confirm variants defined. No repository, zero consumers (dormant). | `FinalSubstituteProductRepository`. Top consumers: NetSuiteServiceImpl (42), AutoInvoicingServiceImpl (10), MarketingPlatformService (6). |
| `product_details` | Does not exist (only `ProductDetailsCart`/DTOs). | Canonical entity. `ProductDetailsRepository`. Top consumer: NetSuiteServiceImpl (17). |
| FSP-prefixed | `FinalSubstituteProductCxConfirm`/`DrConfirm`/`Cart` — dormant. | `FinalSubstituteProductProcConfirm` — invoice-time audit snapshot (`saveInFinalSubs()`); `FspDto`. |
| `order_status` | Does not exist (uses `OrderStatusUtilImpl` + `EventOrderStatusEnum`). | Separate status-history entity. `OrderStatusRepository`. Top consumer: NetSuiteServiceImpl (24). |

## 7. Key files referenced

| File | Repo |
| --- | --- |
| presentation/controller/ThirdPartyServiceController.java | third-party-service |
| business/serviceimpl/NetSuiteServiceImpl.java | third-party-service |
| business/serviceimpl/AutoInvoicingServiceImpl.java | third-party-service |
| business/serviceimpl/OrderServiceImpl.java | third-party-service |
| util/Utilities.java | third-party-service |
| business/dto/{NsOrderBatchSelectionDto,NsLineItems,NsBatchDetails}.java | third-party-service |
| integration/domain/{ProductDetails,OrderStatus,FinalSubstituteProductProcConfirm}.java | third-party-service |
| integration/domain/{OrderDetails,FinalSubstituteProduct,NetSuiteInvoiceBatch,FinalSubstituteProductCab,FinalCalculatedAmount}.java | master-service |

---

# Calculation Reference (Formulas + Input/Output + Worked Example)

Each step lists **Inputs** (tagged `Config` = system\_value\_master row, `DB` = entity field, `Prior-step` = output of an earlier step, `External` = NetSuite API response), the **Formula**, and the **Output**. One running numeric example threads through every step.

### Configuration values used

| Name (system\_value\_master.name) | Used in | Meaning |
| --- | --- | --- |
| `PRICE_LOCK_STAGE` | Step 3 (getOrderFootprint) | Picks which lifecycle stage's snapshot counts as "promised" |
| `PRICE_LOCK_THRESHOLD_X` | Step 2 | Flat ₹ cost-absorption threshold |
| `PRICE_LOCK_THRESHOLD_Y` | Step 2 | % of promised MRP cost-absorption threshold |

All three are DB rows in `m_SystemValueMaster` (`name`, `value`, `active`), not hardcoded constants.

### Assumed example inputs

- `orderId=500123`, `warehouseId=12`, single order, product A (`MED-A`), original, `pack=1`
- `final_substitute_product` row before invoicing (`finalSubsId=7001`): `recommendQuantity=10`, `requestedQuantity=10`, `sellingPrice=90.00`, `subsMrpWithQty=100.00`
- Promised baseline (from `final_substitute_product_cab`, `locked=true`): `promisedMrp=10`, `promisedQty=10`, `promisedSellingPrice=90.00`, no coupon
- WMS picked 2 batches: batchA 6 units @ `mrp=10` (`invoiceBatchId=9001`), batchB 4 units @ `mrp=12` (`invoiceBatchId=9002`) — both start as `fspId=7001`
- Config: `PRICE_LOCK_THRESHOLD_X=10` (flat ₹), `PRICE_LOCK_THRESHOLD_Y` not set → `threshold=10`
- No coupon, no delivery/packaging/cash-handling charge, no TM cash/credit

After Step 1: `fsp7001` = batchA's portion (qty 6), `fsp7050` = batchB's cloned portion (qty 4).

## Step 1 — Batch split: per-batch MRP/price recompute

`NetSuiteServiceImpl.updateFinalSubsBatchWise` (line 12950), `updateDataInFsp` (line 13088)

**Inputs**

| Variable | Type | Source | Example |
| --- | --- | --- | --- |
| `fsp.sellingPrice` (pre-split) | DB | final\_substitute\_product | 90.00 |
| `fsp.subsMrpWithQty` (pre-split) | DB | final\_substitute\_product | 100.00 |
| `fsp.statusId` | DB | final\_substitute\_product — selects original vs substitute branch | ORIGINAL |
| `invBatch.mrp` | DB | net\_suite\_invoice\_batch, per batch, WMS-picked | 10.0 (A) / 12.0 (B) |
| `invBatch.quantity` | DB | net\_suite\_invoice\_batch | 6 (A) / 4 (B) |

**Formula**

| # | Variable | Formula | Example (batchA → fsp7001) | Example (batchB → fsp7050) |
| --- | --- | --- | --- | --- |
| 1.1 | `discount` | `fsp.sellingPrice / fsp.subsMrpWithQty` — computed once per fsp, before the batch loop starts (line 13012) | 90.00/100.00 = 0.9 | same 0.9, reused |
| 1.2 | `subsMrp` | = productMrp (invBatch.getMrp()) | 10.0 | 12.0 |
| 1.3 | `originalMrp` | = productMrp (only if statusId==ORIGINAL) | 10.0 | 12.0 |
| 1.4 | `originalMrpWithQty` | round(productMrp \* requestedQuantity, 2) | 10.0\*6=60.00 | 12.0\*4=48.00 |
| 1.5 | `sellingPrice` | round(discount \* (productMrp \* recommendQuantity), 2) | 0.9\*(10.0\*6)=54.00 | 0.9\*(12.0\*4)=43.20 |
| 1.6 | `subsMrpWithQty` | round(productMrp \* recommendQuantity, 2) | 60.00 | 48.00 |
| 1.7 | `product_details.price` | = productMrp \* requestedQuantity (overwritten per batch — last wins) | 60.00 | 48.00 (final DB value) |
| 1.8 | `product_details.originalPrice` | = productMrp (same overwrite caveat) | 10.0 | 12.0 (final DB value) |

**Output**: `subsMrp`, `originalMrp`, `originalMrpWithQty`, `sellingPrice`, `subsMrpWithQty`, `invoiceBatchId` → `final_substitute_product`; `price`/`originalPrice` → `product_details`; `fspId` re-linked on `net_suite_invoice_batch`. `net_suite_invoice_batch.mrp` itself is never modified.

## Step 2 — Cost-absorption threshold

`OrderServiceImpl.checkPriceLockThreshold` (line 1309)

| # | Variable | Formula | Example |
| --- | --- | --- | --- |
| 2.1 | `x` | value(PRICE\_LOCK\_THRESHOLD\_X) if non-blank, else null | 10 |
| 2.2 | `y` | round(promisedMrp \* (value(PRICE\_LOCK\_THRESHOLD\_Y)/100), 2) if non-blank, else null | null (Y not set) |
| 2.3 | `threshold` | min(x,y) if both non-null; else whichever is non-null; else null | x only → threshold=10 |

*Note: if both X and Y are NULL in the DB, threshold resolves to null, which flips Step 5's gate to "always absorb", regardless of diffAmt size.*

## Step 3 — Cost-absorption inputs

`OrderServiceImpl.generateCostAbsorptionDetails` (line 1337)

**3a. Promised side (whole-product, pre-split)**

| Variable | Formula | Example |
| --- | --- | --- |
| `promisedMrp` | orderConfirmedData.currProductMrp | 10 |
| `promisedSellingPrice` | couponDiscount\>0 ? round(currProductSellingPrice-couponDiscount,2) : currProductSellingPrice | 90.00 (no coupon) |
| `promisedUnits` | promisedQty \* pack | 10\*1=10 |
| `promisedPerUnitPrice` | promisedSellingPrice / promisedUnits | 90.00/10=9.00 |

**3b. Actual / box-verified side (one bucket per distinct unit-MRP)**

| Variable | Formula | Bucket1 (batchA) | Bucket2 (batchB) |
| --- | --- | --- | --- |
| `actualQty` | multibatch.qty | 6 | 4 |
| `actualSellingPrice` | couponDiscount\>0 ? round(multibatch.sellingPrice-couponDiscount,2) : multibatch.sellingPrice | 54.00 | 43.20 |
| `boxVerifiedUnits` | actualQty \* pack | 6 | 4 |
| `multibatchTotalUnits` | multibatchTotalQty \* pack | 10 | 10 |
| `additionalUnits` | multibatchTotalUnits - promisedUnits | 0 | 0 |
| `requiredQty` | floor(promisedUnits/pack), +1 if remainder | 10 | 10 |
| `tempUnits` | promisedUnits / requiredQty | 1.0 | 1.0 |
| `boxVerifiedPerUnitPrice` | actualSellingPrice / boxVerifiedUnits | 9.00 | 10.80 |
| `initialPromisedSellingPrice` | round(promisedPerUnitPrice\*(tempUnits\*actualQty),2) \[multibatchTotalQty≤requiredQty branch\] | 9.00\*6=54.00 | 9.00\*4=36.00 |

## Step 3.5 — Pack-size-change resolution (feeds into Step 4 as an alternate boxVerifiedData)

**Applies only when the promised product's productCode doesn't resolve to an active row on the actual side** — i.e. the actual-side row under that same productCode exists but is active=false, because it was pack-size-swapped to a different SKU (e.g. 10-tab strip → 15-tab strip) with its own productCode.

`OrderServiceImpl.packSizeChangedCostAbsorption` (line 1711), `packSizeChangeCostAbsorption` (line 1733), `reversePackSizeChangeProductCostAbsorption` (line 1786), `checkPackSizeForReplacedProductCostAbsorption` (line 1807)

**Inputs**

| Variable | Type | Source | Example |
| --- | --- | --- | --- |
| `confirmedData.productId` | Prior-step (Step 3a) | promised side | 301 (original pack's productId) |
| `boxOrInvoiceMedList` (full actual-side list) | Prior-step (same input as Step 3b) | live final\_substitute\_product rows via findCostAbsorptionUpdatedMedsList | includes both the old-pack (inactive) row and the new-pack (active) row |
| `m.packSizeChangeProductId` | DB | self-referential FK, set on the new-pack row, pointing at the old productId | new-pack row: packSizeChangeProductId=301 |

**Formula**

| # | Step | Logic | Example |
| --- | --- | --- | --- |
| 3.5.1 | Trigger | Runs only if confirmedData.isCurrProductActive() && !boxOrInvoiceVerifiedData.isCurrProductActive() (line 1713) — same-productCode row exists on the actual side but is inactive | old-pack row inactive → triggers |
| 3.5.2 | Chain-walk | packSizeChangeCostAbsorption (line 1733-1751): recursively find m in boxOrInvoiceMedList where m.packSizeChangeProductId == productId; recurse on the found m.productId, capped at MAX\_DEPTH=20 (handles a chain of successive pack-size changes) | finds new-pack row productId=305 whose packSizeChangeProductId=301 |
| 3.5.3 | Org-reclassification guard | isReplacedWithOrgCostAbsorption (line 1753-1784): reverse-walks via reversePackSizeChangeProductCostAbsorption (line 1786-1805) to check whether the resolved row is actually the original product re-emerging (a substitute was taken, then pack-size-changed back to the original code) — if so, returns null and it's classified as "replaced with OG" instead, not pack-size-changed | not applicable here → proceeds |
| 3.5.4 | Result | If a match survives 3.5.3, packSizeChangedCostAbsorption returns it; the caller tags the eventual absorption row with reasonId = ReasonValueEnum.PACK\_SIZE\_UPDATE | new-pack row (mrp/qty/sellingPrice of the 15-tab SKU) substituted in |

`checkPackSizeForReplacedProductCostAbsorption` (line 1807-1822) is the same chain-walk (3.5.2) without the org-reclassification guard (3.5.3) — used when even the promised productCode itself isn't found in the actual map at all, and the lookup falls back to matching by productId instead.

**Output**

| Variable | Passed to | Example |
| --- | --- | --- |
| `packSizeChanged` (resolved actual-side row) | Step 3b/4, substituted in as boxVerifiedData; reasonId=PACK\_SIZE\_UPDATE recorded on the eventual cost\_absorption\_details row | the new-pack row's mrp/qty/sellingPrice now feed the same unit-normalized (pack-based) comparison as any other bucket |

No separate pricing formula exists for the pack-size-change case — once boxVerifiedData is resolved this way, Steps 3b through 6 run completely unchanged.

### Worked example (independent of the main running example — different product, non-multibatch)

Assumed inputs: product B, promised as a 10-tab strip (productId=301), fulfilled instead as a 15-tab strip (productId=305, packSizeChangeProductId=301), 1 strip either way, no coupon.

| Variable | Formula | Promised (10-tab) | Actual (15-tab, resolved via 3.5) |
| --- | --- | --- | --- |
| `pack` | MedicineMaster.pack | 10 | 15 |
| `Qty` | strips ordered/fulfilled | 1 | 1 |
| `sellingPrice` | mrp × qty (no coupon) | 50.00 | 55.00 |
| `Units` | Qty \* pack | 10 | 15 |
| `PerUnitPrice` | sellingPrice / Units | 5.00 | 55.00/15 = 3.67 |

Since promisedPerUnitPriceRoundOff(5.00) != boxVerifiedPerUnitPriceRoundOff(3.67), and boxVerifiedUnits(15) is not \< promisedUnits(10), and actualQty(1) is not \> requiredQty (requiredQty = floor(10/15)=0, +1 for remainder =1, so 1 ≤ 1) — falls to the calculateCostAbsorption non-multibatch fallback branch that compares **absolute** selling prices rather than per-unit price:

| # | Variable | Formula | Example |
| --- | --- | --- | --- |
| 4.pack.1 | `diffAmt` | abs(actualSellingPrice - promisedSellingPrice) | abs(55.00-50.00) = 5.00 |
| 4.pack.2 | `type` | INCREASED (since actualSellingPrice \> promisedSellingPrice) | INCREASED |
| 4.pack.3 | `expectedSellingPrice` | actualSellingPrice - diffAmt | 55.00-5.00 = 50.00 |

Step 5 gate (config threshold=10 as in the main example): diffAmt(5.00) \< threshold(10) → isCostAbsorption = true.

Step 6 write-back (fspId=8020, recommendQuantity=1): perUnitLockedPrice = expectedSellingPrice/boxVerifiedQty = 50.00/1 = 50.00 → fsp8020.priceLock = 50.00\*1 = 50.00.

Step 7 (assuming this fsp's own batch-split discount ratio came out to 1.0, i.e. fsp.sellingPrice=fsp.subsMrpWithQty=55.00): currentSellingPrice(raw)=55.00, discountPercentage=100-(55.00/55.00\*100)=0, currentSellingPrice(adjusted)=55.00, priceLockDiscount=(55.00-0)-50.00=5.00 → fsp8020.priceLockDiscount=5.00.

Net effect: the customer is billed as if they'd received the promised 10-tab strip at ₹50.00, even though WMS fulfilled with a pricier 15-tab strip at ₹55.00 — the ₹5.00 gap is absorbed, tagged reasonId=PACK\_SIZE\_UPDATE on the saved cost\_absorption\_details row.

## Step 4 — Type / diffAmt decision

`calculateCostAbsorption` (line 1473), multibatch + multibatchTotalQty ≤ requiredQty branch

| Condition | type | diffAmt | expectedSellingPrice | Bucket1 | Bucket2 |
| --- | --- | --- | --- | --- | --- |
| boxVerifiedPerUnitPrice \> promisedPerUnitPrice | INCREASED (if diffAmt\>0) | abs(actualSellingPrice - initialPromisedSellingPrice) | actualSellingPrice - diffAmt | 9.00==9.00 → not taken | 10.80\>9.00 → taken |
| boxVerifiedPerUnitPrice \< promisedPerUnitPrice | DECREASED (if diffAmt\>0) | abs(initialPromisedSellingPrice - actualSellingPrice) | null | not taken | not taken |
| else | null | null | null | taken (54.00==54.00) | — |

Bucket2: `diffAmt = abs(43.20-36.00) = 7.20`, `expectedSellingPrice = 36.00`, `type=INCREASED`. Bucket1: `type=null`.

## Step 5 — Threshold gate

`generateCostAbsorptionDetails`, end of method (line \~1456-1465)

| Condition | isCostAbsorption | Bucket1 | Bucket2 |
| --- | --- | --- | --- |
| type==INCREASED and threshold!=null and diffAmt\<threshold | true | n/a | 7.20\<10 → true |
| type==INCREASED and threshold==null | true (unconditional) | — | — |
| type==INCREASED and diffAmt\>=threshold | false | — | not this case |
| type==DECREASED or type==null | false (gate never runs) | false | — |

**Output**: saved to `cost_absorption_details`. Bucket2 row: `isCostAbsorption=true, expectedSellingPrice=36.00, boxVerifiedQty=4, fspId=7050`.

## Step 6 — `priceLock` write-back onto `final_substitute_product`

`checkCostAbsorption` (lines 1191-1226) — only for rows where isCostAbsorption==true

| # | Variable | Formula | Example |
| --- | --- | --- | --- |
| 6.1 | `perUnitLockedPrice` | expectedSellingPrice / boxVerifiedQty | 36.00/4=9.00 |
| 6.2 | `fsp.priceLock` | perUnitLockedPrice \* fsp.recommendQuantity | 9.00\*4=36.00 |

**Output**: `fsp7050.priceLock=36.00`; `fsp7001.priceLock` stays 0/null.

## Step 7 — `priceLockDiscount` (pre-NetSuite-call)

`AutoInvoicingServiceImpl.calculateAndStorePriceLockDiscountBeforeNsCall` (line 2136) — only runs when fsp.priceLock\>0

| # | Variable | Formula | Example |
| --- | --- | --- | --- |
| 7.1 | `currentSellingPrice` (raw) | Σ(batch.mrp \* batch.quantity) | 12.0\*4=48.00 |
| 7.2 | `discountPercentage` | 100 - (round(fsp.sellingPrice,2)/fsp.subsMrpWithQty\*100) | 100-(43.20/48.00\*100)=10 |
| 7.3 | `currentSellingPrice` (adjusted) | currentSellingPrice(raw) \* (1-discountPercentage/100) | 48.00\*0.90=43.20 |
| 7.4 | `priceLockDiscount` | (currentSellingPrice(adjusted) - couponCodeDiscount) - fsp.priceLock | (43.20-0)-36.00=7.20 |
| 7.5 | `fsp.priceLockDiscount` | round(priceLockDiscount,2) if \>0, else 0.0 | 7.20 |

**Output**: `fsp7050.priceLockDiscount=7.20`. Also triggers `updateWalletAndFca` → re-enters Step 8/9.

## Step 8 — `final_calculated_amount` accumulation

`NetSuiteServiceImpl.calculateOrderAndSavingValue` (line 9253) — summed over fsp7001 + fsp7050

| # | Variable | Formula | Example |
| --- | --- | --- | --- |
| 8.1 | `subsTotal` | Σ fsp.subsMrpWithQty | 60.00+48.00=108.00 |
| 8.2 | `sellingPrice` | Σ (fsp.sellingPrice - (fsp.priceLockDiscount ?? 0)) | (54.00-0)+(43.20-7.20)=90.00 |
| 8.3 | `priceLockDiscAmt` | Σ (fsp.priceLockDiscount ?? 0) | 0+7.20=7.20 |
| 8.4 | `orderValue` | Σ (active ? originalMrp\*requestedQuantity : 0) | (10\*6)+(12\*4)=108.00 |
| 8.5 | `discountPrice` | round(subsTotal - sellingPrice, 2) | 108.00-90.00=18.00 |
| 8.6 | `updatedDiscountPrice` | calcCouponDiscountPrice(discountPrice, orderId, sellingPrice) | 18.00 (no coupon) |
| 8.7 | `calculatedTotal` | round(subsTotal - updatedDiscountPrice, 2) | 108.00-18.00=90.00 |

## Step 9 — `final_calculated_amount` save

`NetSuiteServiceImpl.saveFinalCalculatedAmt` (line 17115)

| # | Column | Formula | Example |
| --- | --- | --- | --- |
| 9.1 | `totalAmount` | round(calculatedTotal + packagingCharge + cashHandlingCharge, 2) | 90.00 |
| 9.2 | `discount` | round(updatedDiscountPrice - priceLockDiscAmt, 2) | 18.00-7.20=10.80 |
| 9.3 | `subsMrp` | round(subsTotal, 2) | 108.00 |
| 9.4 | `tmCash`/`tmCashback`/`tmCredit` | round(...,2) | 0/0/0 |
| 9.5 | `calculatedTotal` (post-credit) | calculatedTotal - truemedsCredit | 90.00 |
| 9.6 | `finalAmount` | round(calculatedTotal(post-credit)+packagingCharge+adjustmentAmt+cashHandlingCharge, 2) | 90.00 |
| 9.7 | `priceLockDisc` | = priceLockDiscAmt | 7.20 |

## Step 10 — Post-NetSuite reconciliation

`AutoInvoicingServiceImpl.adjustAmountInDb` (line 794)

| # | Variable | Formula | Example |
| --- | --- | --- | --- |
| 10.1 | `zohoAdjustmentValue` | round(amountDue - fca.totalAmount, 2) | 90.00-90.00=0.00 |
| 10.2 | (if abs≤1) `fca.adjustmentAmt` | = zohoAdjustmentValue | 0.00 |
| 10.3 | (if abs≤1) `fca.finalAmount` | round((fca.totalAmount - fca.tmCredit) + zohoAdjustmentValue, 2) | 90.00 |

**End result: invoice/finalAmount = ₹90.00** — identical to the originally promised price, because `priceLockDiscount=7.20` exactly absorbed the batchB MRP-hike gap.

## Source index

| Step | Method | File |
| --- | --- | --- |
| 1 | updateFinalSubsBatchWise, updateDataInFsp | NetSuiteServiceImpl.java:12950, 13088 |
| 2 | checkPriceLockThreshold | OrderServiceImpl.java:1309 |
| 3, 4, 5 | generateCostAbsorptionDetails, calculateCostAbsorption | OrderServiceImpl.java:1337, 1473 |
| 3.5 | packSizeChangedCostAbsorption, packSizeChangeCostAbsorption, reversePackSizeChangeProductCostAbsorption, checkPackSizeForReplacedProductCostAbsorption | OrderServiceImpl.java:1711, 1733, 1786, 1807 |
| 6 | checkCostAbsorption | OrderServiceImpl.java:1073 |
| 7 | calculateAndStorePriceLockDiscountBeforeNsCall | AutoInvoicingServiceImpl.java:2136 |
| 8, 9 | calculateOrderAndSavingValue, saveFinalCalculatedAmt | NetSuiteServiceImpl.java:9253, 17115 |
| 10 | adjustAmountInDb | AutoInvoicingServiceImpl.java:794 |
