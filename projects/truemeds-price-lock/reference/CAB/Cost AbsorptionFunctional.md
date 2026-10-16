# Cost Absorption

## Document History

| 1.   | Document Version | V5.0 |
| --- | --- | --- |
| 1.   | Document Date | V5.0 29-Sep-2025 (Consumer facing changes) V4.0 25-Sep-2025 (Core logic Revised) V3.0 04-Sep-2025 (Ops Changes) V2.0 21-Aug-2025 (Core Logic) V1.0 19-Aug-2025 (MCP Logic) |
| 1.   | Prepared By | @Advait Kelapure |
| 1.   | Reviewed By |   |
| 1.   | Approved By |   |

## Background

Currently, customer payments are captured after warehouse operations, specifically post item picking and box verification. Since prices may fluctuate between order placement and final invoicing due to operational or product-level changes (e.g., batch, SKU, pack-size or substitute changes), this leads to customer dissatisfaction, particularly in cases of price increases.

To mitigate negative experience and reinforce customer trust, we want to:

- **Absorb item-level price increases** under controlled constraints\*.
- **Highlight lowered prices** as a delight factor.
- Manage this with configurable thresholds, audit tracking, and customer visibility.
- Optimize the MCP logic in order to start showing correct price from basis rack level data
- Optimize warehouse processing to ensure correct MRP batch picking

## Cost Absorption Logic

The Cost Absorption mechanism safeguards customers from price increases that occur between order placement and box verification. At the appropriate stage in the order flow, a **Price Lock Selling Price** is locked per item. Final prices at box verification are compared against this reference, and if increases fall within configured thresholds\*, the difference is absorbed via an item-level Additional Discount. This ensures customers never pay more than the locked price, highlights price drops as a positive experience, and provides full traceability through invoices, order status, and finance integration.

In short,

1. Lock the reference price at the right stage
2. Track changes item-wise 
3. Compare with box verification price
4. Apply Additional Discount if thresholds permit\* 
5. Show customer protection and finance traceability.

### Experimentation

This feature will be rolled out as an experiment with a total of **three variants**:

- **Variant A (Control):** 
    - No changes from the current implementation.
    - Serves as the default variant for portals.
    - Cost absorption will **not** be applicable.
- **Variant B (Full Implementation):** 
    - Cost absorption applied as per the defined logic.
    - Includes all **detailed UI changes**.
- **Variant C (Minimal UI):** 
    - Cost absorption applied as per the defined logic.
    - Only **bare minimum UI changes** will be made.

**Split: **A: 33%, B: 33%, C: 34%

The experiment variant should be considered at order level. Once a variant is assigned to an order at the time of placement, the same variant’s logic will apply throughout the lifecycle of that order—even if the customer is later moved to another experiment variant.

### Stages Where Price Can Change

Prices can fluctuate at multiple points in the order journey due to operational or substitution changes. These touchpoints include:

- Cart (Customer View)
- Order Summary
    - Order Summary on Android app, IOS app and Website
    - Pharmacist Type 1 call - Order page
    - Assisted Commerce - Order page
    - Create Order - Order page
    - Pill Reminder - Order page
    - Doctor Fraud - Order page
- Doctor call
- HA call
- Assigned to WH (Pricing do not change at this stage but it will be used for reference)
- CSR call (customer requests for order modification)
- Edit Order (to be considered for cost absorption for the changes made by the CSR team to the order)
- Picker Flow
- Checker Flow
- Box Verified *(final absorption logic applied here)*

Tracking price changes at each stage ensures that the locked reference price is clearly established and all subsequent differences can be measured accurately for absorption or customer delight.

Out of all these stages, Order Summary, Doctor Call, HA Call, CSR call, Assigned to WH and Box Verified are being considered for building the cost absorption logic.

### Locked Price Determination basis updates in an order on different stages

#### MRP & Base Discount Locking

##### Products added during Order placement

- Order summary refers to:
    - Order Summary on Android app, IOS app and Website
    - Pharmacist Type 1 call - Order page
    - Assisted Commerce - Order page
    - Create Order - Order page
    - Pill Reminder - Order page
    - Doctor Fraud - Order page
- Order placement refers to orders placed from all of the above platforms
- MRPs, Base discount, and Substitute discount  should get locked for the Products added (Original & Substitute both) at order summary
- The locked stage for all the products (both original & substitute) should be order summary
- If the exact products remain in the order at the time of box verified stage, it should be given at the exact same MRP and Base discount.

##### Products added during Doctor call

- During doctor call, the MRPs, Base discount, and Substitute discount  should not get updated for the Products added during order placement (both original & substitute)
    - If order delivery pin code is updated due to address change on the doctor call leading to assigned WH change,
        - The prices should get refreshed for all the products in the order real time basis the new pin code
        - Customer should be informed of the price update due to delivery pin code change *- will be part of doctor portal changes*
        - The lock stage for all the products (including both original & substitute) should be defined as Doctor call with reason as delivery pin code change
    - If order delivery pin code is not updated during doctor call, but Warehouse allocation changes (MFC to FC or FC to MFC as applicable) basis products addition, removal or quantity updates or Manual WH transfer for any reasons such as festivals or delivery challenges, 
        - The locked MRP and Base discount for the products added during order placement (both original & substitute) remains unimpacted
    - If the quantity is increased or decreased (not because of substitution - different pack-size), then the total price for the product should be considered basis the updated quantity
- If any new product gets added during doctor call which was not part of the order earlier (inclusive of “substitute in case if original is added” or “original in case if substitute is added”), 
    - The MRP and Base discount for such products should get locked at the doctor call stage.
    - The lock stage for the new added products at this stage (for both original & substitute) should be defined as Doctor call
    - If the exact products remain in the order at the time of box verified stage, it should be given at the exact same MRP and Base discount.
    - During product addition / quantity change for the new products (both original and substitute),, the prices should get updated real time subjected to any change in MCP, WH allocation and Manual WH transfer for any reasons such as festivals or delivery challenges and should get locked at the time when doctor clicks confirm order
- If doctor changes the pin code leading WH change and then further changes address to make it the same WH, the locking price remains unimpacted as per order summary.

##### Products removed during Doctor call

The locked MRP and Base Discount details of products disabled during doctor call for any already added product (during order placement) should not be removed from the logs and should be kept as reference if the same product is getting added in the later stage

##### Products added during HA call

- During Health advisor call, the MRPs, Base discount, and Substitute discount should not get updated for the Products added during order placement and doctor call (both original & substitute)
    - If order delivery pin code is updated due to address change on the HA call leading to assigned WH change,
        - The prices should get refreshed for all the products in the order real time basis the new pin code
        - Customer should be informed of the price update due to delivery pin code change *- will be part of doctor portal changes*
        - The lock stage for all the products (including both original & substitute) should be defined as HA call with reason as delivery pin code change
    - If order delivery pin code is not updated during doctor call, but Warehouse allocation changes (MFC to FC or FC to MFC as applicable) basis products addition, removal or quantity updates or Manual WH transfer for any reasons such as festivals or delivery challenges, 
        - The locked MRP, Base discount, and Substitute discount  for the products added during order placement (both original & substitute) remains unimpacted
    - If the quantity is increased or decreased (not because of substitution - different pack-size), then the order value gets updated basis the updated quantity for the product
- If any new product gets added during HA call which was not part of the order earlier (inclusive of “substitute in case if original is added” or “original in case if substitute is added”), 
    - The MRP, MRPs, Base discount, and Substitute discount for such products should get locked at the HA call stage.
    - The lock stage for the new added products at this stage (for both original & substitute) should be defined as HA call
    - If the exact products remain in the order at the time of box verified stage, it should be given at the exact same MRPs, Base discount, and Substitute discount .
    - During product addition / quantity change for the new products (both original and substitute), the prices should get updated real time subjected to any change in MCP, WH allocation and  or Manual WH transfer for any reasons such as festivals or delivery challenges should get locked at the time when HA clicks confirm order
- If HA changes the pin code leading WH change and then further changes address to make it the same WH, the locking price remains unimpacted as per order summary / Doctor call.

##### Products removed during HA call

The locked MRPs, Base discount, and Substitute discount  details of products disabled during HA call for any already added product (during order placement or doctor call) should not be removed from the logs and should be kept as reference if the same product is getting added in the later stage

##### Products added by the CSR team on customer request

- If customer requests the CSR team to add additional products (using CSR - Edit Order) for which locked price is not available, the MRPs, Base discount, and Substitute discount  should not get updated for the Products added during order placement and doctor call (both original & substitute)
    - If order delivery pin code is updated due to address change during this,
        - The prices should get refreshed for all the products in the order real time basis the new pin code
        - Customer should be informed of the price update due to delivery pin code change *- will be part of CSR portal changes*
        - The lock stage for all the products (including both original & substitute) should be defined as CSR with reason as delivery pin code change
    - If order delivery pin code is not updated during doctor call, but Warehouse allocation changes (MFC to FC or FC to MFC as applicable) basis products addition, removal or quantity updates or Manual WH transfer for any reasons such as festivals or delivery challenges, 
        - The locked MRP and Base discount for the products added during order placement or doctor / HA call as applicable (both original & substitute) remains unimpacted
    - If the quantity is increased or decreased (not because of substitution - different pack-size), then the order value gets updated basis the updated quantity for the product
- If any new product gets added during CSR call which was not part of the order earlier (inclusive of “substitute in case if original is added” or “original in case if substitute is added”), 
    - The MRP and Base discount for such products should get locked at the CSR call stage.
    - The lock stage for the new added products at this stage (for both original & substitute) should be defined as CSR
    - If the exact products remain in the order at the time of box verified stage, it should be given at the exact same MRP and Base discount.
    - During product addition / quantity change for the new products (both original and substitute), the prices should get updated real time subjected to any change in MCP,WH allocation and  or Manual WH transfer for any reasons such as festivals or delivery challenges and should get locked at the time when CSR updates the order

##### Products removed by the CSR team on customer request

The locked MRP and Base Discount details of products disabled during CSR call (CSR - Edit Order) for any already added product (during order placement or doctor call) should not be removed from the logs and should be kept as reference if the same product is getting added in the later stage

##### Examples

<https://docs.google.com/spreadsheets/d/1nBLn5hkfAdFYD5RFmmuuqsXJBFROsiJetm1kLo15E6w/edit?usp=sharing> 

#### Coupon Applicability Considerations on Doctor Call / HA Call / CSR Call

- Locked pricing details should be considered for the coupon applicability
- Coupon applicability (on order basis MOV constraint) logic remains as is in case of product addition, removal, quantity change or price update in case of delivery pin code change (i.e. coupon applicability should be recalculated in case of any of the above updates on the order)
- Coupon discount applicability (on individual item basis Item Type constraint) logic remains as is in case of substitution, product addition, removal, quantity change or price update in case of delivery pin code change
- Coupon discount value should be calculated (on individual item) basis updated quantity, Locked MRP and Base Discount
- In case of substitution (full or partial at item level) during Doctor / HA call, 
    - Selling Price basis Locked MRP & BD of the original product should be considered for MOV constraint validation.
    - Please note, coupon discount value will be calculated on the locked MRP of the substitute (and not the original) subjected to item type constraint.
    - This should be strictly considered only in case of substitution at doctor or HA call at item level. If customer opts for substitution (full, partial or OG with subs - at item level) at the time of order placement, then the MOV to be considered basis current implementation and changes will not be applicable
    - If customer has opted for subs for few items and remaining items are getting substituted at doctor or HA call, then the MOV consideration logic as defined in first point will be applicable only on the items substituted during doctor and HA call and will not apply on the items substituted by the customer during order placement.

##### Examples

[https://docs.google.com/spreadsheets/d/1XHM3jRh9Vtcb9zZlofqGhSBIDbclBtua14pKtb\_0xFM/edit?gid=0#gid=0](https://docs.google.com/spreadsheets/d/1XHM3jRh9Vtcb9zZlofqGhSBIDbclBtua14pKtb_0xFM/edit?gid=0#gid=0) 

#### Delivery Charge Applicability Considerations on Doctor Call / HA Call / CSR Call

- Locked pricing details should be considered for the delivery charge applicability
- Delivery charge applicability on order basis defined slabs logic remains as is in case of product addition, removal, quantity change or price update in case of delivery pin code change (i.e. coupon applicability should be recalculated in case of any of the above updates on the order)
- In case of substitution (full or partial at item level) during Doctor / HA call and if the substitute is branded or addition of the substitute does not change order category (from branded to generic) for delivery charge slab identification, 
    - Selling price basis locked MRP and BD of the original product should be considered for order value slab identification for branded.
    - This should be strictly considered only in case of substitution at doctor or HA call at item level. If customer opts for substitution (full or OG with subs - at item level) at the time of order placement, then the MOV to be considered basis current implementation and changes will not be applicable
    - If customer has opted subs for a few items and remaining items are getting substituted at doctor or HA call, then the MOV consideration logic as defined in first point will be applicable only on the items substituted during doctor and HA call and will not apply on the items substituted by the customer during order placement.
- In case of substitution (full or partial at item level) during Doctor / HA call and if the substitute is generic and addition of the substitute change order category (from branded to generic) for delivery charge slab identification, 
    - Delivery charges should be calculated with both the logics:
        - First: As per current implementation i.e. considering substitute selling price and generic delivery slabs
        - Second: As per the previous point i.e. considering OG selling price and branded generic delivery slabs
    - The minimum of both should be considered `min(First, Second)`
    - Every time the delivery charge gets re-calculated, this logic should be considered (for the orders substituted on doctor / HA call having generic substitutes added) 

##### Examples

[https://docs.google.com/spreadsheets/d/1XHM3jRh9Vtcb9zZlofqGhSBIDbclBtua14pKtb\_0xFM/edit?gid=0#gid=0](https://docs.google.com/spreadsheets/d/1XHM3jRh9Vtcb9zZlofqGhSBIDbclBtua14pKtb_0xFM/edit?gid=0#gid=0) 

#### Cash Handling Charge Applicability Considerations on Doctor Call / HA Call / CSR Call

- Locked pricing details should be considered for the cash handling charge applicability
- Cash handling charge applicability on order basis defined slabs logic remains as is in case of product addition, removal, quantity change or price update in case of delivery pin code change (i.e. coupon applicability should be recalculated in case of any of the above updates on the order)
- In case of substitution (full or partial at item level) during Doctor / HA call, 
    - Selling price basis locked MRP and BD of the original product should be considered for order value slab identification.
    - This should be strictly considered only in case of substitution at doctor or HA call at item level.
    - If customer opts for substitution (full or OG with subs - at item level) at the time of order placement, then the MOV to be considered basis current implementation and changes will not be applicable
    - If customer has opted subs for a few items and remaining items are getting substituted at doctor or HA call, then the MOV consideration logic as defined in first point will be applicable only on the items substituted during doctor and HA call and will not apply on the items substituted by the customer during order placement.

##### Examples

[https://docs.google.com/spreadsheets/d/1XHM3jRh9Vtcb9zZlofqGhSBIDbclBtua14pKtb\_0xFM/edit?gid=0#gid=0](https://docs.google.com/spreadsheets/d/1XHM3jRh9Vtcb9zZlofqGhSBIDbclBtua14pKtb_0xFM/edit?gid=0#gid=0) 

#### Locked Price Calculation

- Locked Price should get calculated at the WH assigned stage, in case if no further changes are made to the order by the CSR team using Edit Order functionality
- Locked Price gets calculated as   
\[Locked MRP - Locked BD - CD (as applicable)\] x Ordered Quantity as per WH assigned stage
- In case if the CSR team makes any changes to the order using Edit Order functionality, then locked prices, quantity and coupon discount should be considered as per logic defined at Edit Order 
- Locked Price in this case gets calculated as  
\[Locked MRP - Locked BD - CD (as applicable)\] x Ordered Quantity as per Edit Order stage

#### Return & Refunds

- Coupon MOV breach identification: During returns and refunds for items substituted during Doctor  / HA Call, MOV should be calculated basis Locked MRP of the original product 

##### Examples

Calculations to be considered similar to [MRP Considerations for Coupon MOV & Delivery Charge](https://docs.google.com/spreadsheets/d/1XHM3jRh9Vtcb9zZlofqGhSBIDbclBtua14pKtb_0xFM/edit?usp=sharing) 

### Tracking Data at Each Stage

To ensure full visibility and traceability, pricing information must be at **Item-Level** and **Order-level** across all critical stages of the order journey. 

#### Item Level Data Tracking

For each item at every stage, the system should record:

- **Stage Name**
    - Order Summary
        - App
        - Website
        - IOS
        -  Pharmacist Type 1 Call
        - Assisted Commerce
        - Create Order
        - Pill Reminder
        - Doctor Fraud
    - Doctor Call
    - HA Call
    - Box Verification
- **MRP** – MRP of the item at that stage.
- **Base Discount –** Base discount percentage of the item at that stage.
- **Coupon discount -** Coupon discount percentage of the item at that stage.
- **Selling Price** – Derived as *MRP – Base Discount – Coupon Discount* as applicable at that stage.
- **Quantity - **product quantity at that stage
- **Changes in the Item**–  Categorical identifier for the change as applicable at that stage (multiple can be applicable)
    - Item added
    - Item removed
    - Item substituted
    - Quantity increased
    - Quantity reduced
    - Pack Size Change 
    - Batch Change (MRP Difference)
    - SKU Variant Change (as part of pack-size change)
    - Substitute Replacement (B to C) 
    - Replace with OG

#### Order Level Data Tracking

At every stage, the system should record:

- Coupon Impact
    - Coupon code applied\*
    - MOV
    - Coupon Order value change 
        - Old order value - Order value at the current stage
    - Coupon applicability
        - Coupon Applied
        - Coupon Removed
    - MOV calculation basis OG MRP in case of substitution at that stage
    - MOV calculation basis Subs MRP in case of substitution at that stage
    - MOV Breach with OG MRP - True / False
    - MOV Breach with Subs MRP - True / False
    - MOV Breach due to Subs Item Type - True / False
- Delivery Charge Impact
    - Delivery charge value at current stage
    - Order value change 
        - Old order value - Order value at the current stage
    - Delivery charge category
        - Branded
        - Generics
    - Delivery charge category change
        - No change
        - Branded to Generics
        - Generics to Branded
    - Delivery Charge change
        - No change
        - Delivery charge applied
        - Delivery charge removed
        - Delivery charge reduced
        - Delivery charge increased
- Quantity Capping due to Prescription (Only at Doctor Stage)
    - Ordered quantity
    - Max allowed quantity
    - Prescribed Quantity
    - Quantity capped due to Max allowed quantity breach - True / False \[When Prescribed Quantity =  Max Allowed Quantity\]
    - Quantity capped due to Prescribed quantity breach - True / False \[When Prescribed Quantity \<  Max Allowed Quantity\]
    - Capped quantity

### Price Comparison & Discount Calculation logic

#### Item-Level Scenarios Triggering Price Changes

Price changes between the price lock stage and box verification can occur due to operational adjustments or substitution logic. Each scenario is described below:

1. **Pack Size Change**
    - Occurs when the ordered pack size is not available and a different pack size of the same medicine is provided.
    - Price recalculation is based on the new pack size’s MRP and applicable discount.
    - May lead to increase or decrease in per-unit and total item cost.
    - Cost absorption should be applied in this case
2. **Batch Change (MRP Difference)**
    - Happens when the originally picked batch is unavailable, and another batch with a different MRP is used.
    - Selling Price (SP) changes directly with the new batch MRP minus applicable base discount.
    - If new MRP results in higher SP, absorption rules apply.
3. **SKU Variant Change**
    - Item is replaced with another variant of the same molecule/brand (e.g., different packaging type, flavor, or dosage form).
    - The new SKU may carry a different MRP, base discount, or per-unit SP.
    - Price differences are handled under the same absorption logic, if thresholds permit.
    - If the changes are done as part of pack-size change, then cost absorption rules apply
    - If the changes are done as disabling a product and then adding new product, then cost absorption rules do not apply.
4. **Substitute Replacement (B to C)**
    - Customer originally shown and ordered substitute B, but is supplied with another substitute C due to updates.
    - If the substitute is costlier, the absorption rules determine whether the increase is absorbed.
5. **Replacement with OG**
    - The SKU was substituted during doctor / HA call, but the system or ops replaces it with the original medicine (OG) because of unavailability.
    - Since OG often has a higher MRP/SP than substitutes, this scenario frequently leads to a price increase.
    - Cost absorption should not be considered for this. 
    - SOP to be set at Ops level in order to remove the product from order instead
6. **Adding a new product**
    - Order value can increase if the new product gets added in the order
    - Cost absorption will not be applicable in this scenario

| **Product / MRP Change Reason** | **Details** | **Cost Absorption Applicable?** |
| --- | --- | --- |
| Same Product Pack Size Change - Same Unit Quantity | Product of the same salt + strength + drug type and manufacturer / brand, but different pack-size causing changes in total unit quantity and unit price. | Yes |
| Same Product Pack Size Change - Unit Quantity Increase \[Upper Bound\] | Product of the same salt + strength + drug type and manufacturer / brand, but different pack-size causing increase in total unit quantity and higher per unit price.Upper Bound Qty = CEIL(Original Pack-size X Quantity / New Pack-size) | Yes |
| Same Product Pack Size Change - Unit Quantity Decrease | Product of the same salt + strength + drug type and manufacturer / brand, but different pack-size causing decrease in total unit quantity and higher per unit price. | Yes |
| Same Product Batch Change | Product of the same salt + strength + drug type, manufacturer / brand, and pack-size but higher MRP. | Yes |
| Same Product Variant Change (as a part of pack-size change) with exact same composition\* | Product of the same salt + strength + drug type, pack-size and manufacturer / brand, but different variant with higher MRP | Yes |
| Same Product Variant & Pack-size Change (as a part of pack-size change) - same composition | Product of the same salt + strength + drug type, manufacturer / brand, but different variant and pack-size causing changes in total unit quantity and unit price. | Yes |
| Same Product Variant & Pack-size Change (Disable-Enable products or different composition) | Product of the same salt + strength + drug type, manufacturer / brand, but different variant and pack-size causing changes in total unit quantity and unit price. | No |
| Substitute Replacement (B to C) | Generic product of the same salt + strength + drug type and pack-size but different manufacturer / brand with higher MRP as per the substitution algorithm recommendation | Yes |
| Substitute Replacement & Pack-size Change (B to C) | Generic product of the same salt + strength + drug type but different manufacturer / brand and pack-size as per the substitution algorithm recommendation causing changes in total unit quantity and unit price. | Yes |
| Replace with OG with or without pack-size change | In case of doctor / HA substitution, if the substitute is not available, there is an option to give OG product to the customer during WH processing which leads to price increase (since substitute is always sold with more discounts as compared to the OG product). In this case, WH team should inform the customer and with consent either should add OG with customer paying additional amount or remove the product from the order. Cost absorption will not be done in this case. | No |
| Branded to Branded replacement (one product disabled and new product added) | Product of the same salt + strength + drug type, but different manufacturer / brand and both originally ordered and replaced products categorized as as Branded and is not a recommended substitute as per the substitution algorithm | No |
| Product Additions | New product added and is not an actual replacement of a product in the order as per any specified reasons with cost absorption applicable | No |
| Same Product - Manual quantity increase in the Edit Order | Product of the same salt + strength + drug type, manufacturer / brand, same or different MRP and pack-size and quantity is manually increased during Warehouse processing | Partial (per unit price level) |

**Base discount, Coupon applicability and Coupon discount can vary for the updated products and price delta because of this should also be considered for absorption**

**There should be no impact of manual WH transfer for any reasons such as festivals or delivery challenges etc in the locked prices.**

#### Absorption Logic at Box Verification

The Box Verification stage is the final authoritative stage where the order’s item-level details are confirmed against actual inventory before dispatch. This is the point where the system must compute whether cost absorption is required.

##### Key Variables

|  |  |
| --- | --- |
| `MRP` | MRP of the SKU |
| `Base Discount (BD)` | Base discount applicable for the SKU |
| `Coupon Discount (CD)` | Coupon discount on the SKU if applicable |
| `Selling Price (SP)` | MRP - BD - CD |
| `Price Lock Stage` | Order Summary / Pharmacist Call (Type 1) / Doctor Call / HA Call |
| `Final Stage` | Box Verified |
| `Price Lock Selling Price` (post coupon discount if applied\*) | Selling Price at the **price lock stage** (e.g., Order Summary / Digitization / Doctor / HA)= MRP - BD - CD |
| `Final Stage Selling Price` (post coupon discount if applied\*) | Selling Price at **box verified stage**= MRP - BD - CD |
| `Price Lock Discount` | Cost to be absorbed |
| `Price Threshold (X)` | Price change threshold (absolute ₹ value) |
| `Percentage Threshold (Y)` | Price change threshold (percentage %) |
| `Actual Value from Percenatage Threshold (YV)` | Price Lock SP x Y / 100 |
| `Final Threshold Value (T)` | MIN(X, YV) |
| `Final Threshold Value To Calculate Permissible MRP range (TP)` | MIN(X, YV) / (100%-Locked BD%+Locked CD%) |
| `Permissible MRP Range (PR)` | 0 to (Price Lock MRP + TP) |
| `Actual price increase` | Box Verified Selling Price - Price Lock Selling Price *(\*to be considered only if greater than 0)* |

> *Please note that Threshold and Permissible range is not being considered in current scope*

##### Step 1: Retrieve Price Lock Reference

- Identify the Price Lock Stage determined earlier for the order.
- For each item, fetch and store its Locked Selling Price (as recorded at the Price Lock stage).

##### Step 2: Compare Box Verified Price vs. Locked Price (Item-Level)

- At Box Verification, capture each item’s:
    - MRP (batch confirmed)
    - Final Selling Price (MRP – BD – CD at Box Verification)
    - Compute the Item-Level Price Change = (Box Verification Selling Price – Locked Selling Price).

###### Scenarios

Refer [https://docs.google.com/spreadsheets/d/1kk\_b7jYm1aHIpHwGWuReTvQMoz\_DLXADTssnVe5Vdhg/edit?gid=0#gid=0](https://docs.google.com/spreadsheets/d/1kk_b7jYm1aHIpHwGWuReTvQMoz_DLXADTssnVe5Vdhg/edit?gid=0#gid=0) for all the updated scenarios with proper examples

##### Step 3: Classify Price Change

For every item, assign a Price Change Reason (e.g., Pack Size Change, Batch Change, SKU Variant Change, Substitute Replacement, OG Replacement).

- If Final Selling Price \> Locked Selling Price → Customer is expected to pay more. Absorption logic may kick in.
- If Final Selling Price \< Locked Selling Price → Customer benefit, no absorption required.

##### Step 4: Apply Absorption Threshold Rules

- Absorption Threshold is defined as the maximum variance (absolute or %) that the platform agrees to absorb.
- For each item:
    - If `(Price Change > 0)` AND `(Price Change ≤ Threshold)` → Absorb the difference.
    - If `(Price Change > Threshold)` → ~~Item should be removed from the order.~~ Not to be absorbed
    - If `(Price Change < 0)` → No absorption required.
- Example:
    - Locked Price = ₹100, Box Verified Price = ₹110, Threshold = ₹15.
        - Price Change = +₹10 → Within threshold → Absorb ₹10.
    - Locked  Price = ₹100, Box Verified Price = ₹120, Threshold = ₹15.
        - Price Change = +₹20 → Item should be removed from the order.

##### Step 5: Price Lock Discount Application

- New discount type: `Price Lock Discount`
- Value:

```
Final Selling Price - Price Lock Selling Price
```
- Only applicable if the above value is greater than 0
- Applied as line item level discount
- GST calculation updated like coupon discount
- Refund and GST reversal should subtract this discount like existing coupon logic
- New GL ID to be configured in NetSuite for this discount type

##### **Example**

###### Price increase is below threshold

| Parameter | Value |
| --- | --- |
| Final Stage MRP | ₹150 |
| Final Stage BD (20%) | ₹30 |
| Final Stage CD (5%) | ₹7.5 |
| Final Stage Selling Price | ₹150 - 30 - 7.5 = 112.5 |
| Price Lock MRP | ₹145 |
| Price Lock BD (20%) | ₹29 |
| Price Lock CD (5%) | ₹7.25 |
| Price Lock Selling Price | ₹145 - 29 - 7.25 = 108.75 |
| X | ₹15 |
| Y | 10% |
| YV | = ₹108.75 × 10% = ₹10.88 |
| T | = MIN(₹15, ₹10.88) = ₹10.88 |
| TP (for permissible range) | = MIN(₹15, ₹10.88)/(100%-20%+5%)= ₹10.88 /(100%-20%+5%) = ₹14.32 |
| Permissible range | 0 to (145+14.32) = 0 to 159.32 |
| Actual price increase | ₹112.5 - ₹108.75 = ₹3.75 |
| Cost absorption decision | Since 3.75 \<= 14.32, additional cost (3.75) should be absorbed for the item |

###### Price increase is above threshold

| Parameter | Value |
| --- | --- |
| Final Stage MRP | ₹150 |
| Final Stage BD (20%) | ₹120 |
| Final Stage CD (5%) | ₹7.5 |
| Final Stage Selling Price | ₹112.5 |
| Price Lock MRP | ₹135 |
| Price Lock BD (20%) | ₹108 |
| Price Lock CD (5%) | ₹6.75 |
| Price Lock Selling Price | ₹101.25 |
| X | ₹15 |
| Y | 5% |
| YV | = ₹101.25 × 5% = ₹5.06 |
| T | = MIN(₹15, ₹5.06)  = ₹5.06 |
| TP (for permissible range) | = MIN(₹15, ₹5.06)/(100%-20%-5%)= ₹5.06/(100%-20%-5%) = ₹6.66 |
| Permissible range | 0 to (135+6.66) = 0 to 141.66 |
| Actual price increase | ₹112.5 - ₹101.25 = ₹11.25 |
| Cost absorption decision | Since 11.25 \> 5.06, additional cost (11.25) should not be absorbed for the item ~~and the item should get removed from the order during checker flow~~ |

## Netsuite Changes

### **Netsuite Invoicing & Returns Flow**

#### **Invoicing Flow**

1. Customer places order → Order reaches Box Verified stage.
2. Backend system:
    - Calculates Locked Price (post base + coupon discount) for each SKU × total quantity.
    - Calculates Box Verified Selling Price (increased MRP post-discount).
    - Passes both to Netsuite via Invoice API.
3. Netsuite ERP:
    - Consumes MRP, Discounts, and Locked Price.
    - Compares Locked Price vs Box Verified Selling Price.
    - If difference \> 0 → applies Pricelock Savings as a line item.
    - GST slab same as SKU is applied on savings.
4. Invoice Response:
    - Returns applied Pricelock Savings per SKU and total Pricelock Savings.
    - Backend stores this in DB for future reference.
5. Invoice Output:
    - Shows line item “Price Lock Savings” at both SKU level and order level.

#### **Returns Flow**

##### **Full Return**

1. Customer initiates full return for SKU.
2. Backend → Netsuite Return API with SKU + Qty.
3. Netsuite:
    - Recovers entire pricelock savings applied on SKU.
    - GST reversal same as coupon discount GST reversal.
4. Response to Backend:
    - Returns recovered savings amount.
    - Backend updates DB.

Example:

- SKU had `₹60 pricelock savings` (4 qty).
- Full return → `₹60` recovered.

##### **Partial Return**

1. Customer initiates partial return for SKU (e.g., 2 of 4 qty).
2. Backend → Netsuite Return API with SKU + Qty.
3. Netsuite:
    - Proportionately recovers savings.
    - Formula: `(Total Savings ÷ Total Qty) × Returned Qty`.
4. Response to Backend:
    - Returns recovered savings + updated remaining savings.
    - Backend updates DB.

Example:

- Total savings `₹60` for 4 qty.
- 2 qty returned → `(60 ÷ 4 × 2) = ₹30` recovered.
- Remaining savings = `₹30` still applicable on retained 2 qty.

#### **Key Data Captured**

- At Invoicing:
    - Locked Price (SKU × Qty).
    - Pricelock Savings applied.
- At Returns:
    - Savings recovered.
    - Savings still applicable.

### User Stories

#### Changes at Invoice Generation

|  |  |
| --- | --- |
| As a **System** | I want to calculate and pass locked price values at SKU level in the invoice API |
| So that | Netsuite can compute pricelock savings correctly, reflect them in the invoice, and return them back for storage |
| Pre-condition | 1. The order has passed box verification and has final selling prices per SKU. 2. Locked price per SKU (post base discount and coupon discount) is calculated by backend as per defined logic. 3. Netsuite Invoice API supports an input parameter for locked price at SKU level. |
| Trigger | Invoice API is called from backend to Netsuite at the invoicing stage. |
| Post-condition | 1. Netsuite compares locked price with box verified selling price. 2. Netsuite calculates box verified selling price (post discount) \> locked price → savings = difference. 3. Savings are added as “Pricelock Savings” line item(s) in the invoice (both SKU level & total). 4. Netsuite returns savings back in response. Backend persists these for future use. |
| Acceptance Criteria | - Locked price must be passed at SKU level *considering total ordered quantity*.     - Backend calculates locked price = (MRP – base discount – coupon discount) × total quantity. - Netsuite must compute the difference between locked price and box verified (post discount) selling price.     - If difference \> 0, treat as pricelock savings.     - If difference ≤ 0, no savings applied. - Savings should be GST-compliant: GST rate applied same as SKU GST (similar to coupon discount logic). - Backend must receive the computed savings in the response at line item level and store these values for use in returns, refunds, and audit trail. - Total pricelock savings should get calculated for the order (sum of pricelock savings for all the SKUs in the order where pricelock savings are applied)  - **Example**:     - Locked MRP: ₹100     - Locked Base Discount: 20% → ₹20     - Locked Coupon Discount: 5% → ₹5     - Locked SKU Quantity = 4     - Locked Price: ₹100 – ₹20 – ₹5 = ₹75 × 4 qty = ₹300     - Box verified MRP: ₹120     - Box verified Base discount: 20% → ₹24     - Box verified Base discount: 5% → ₹6     - Payable per qty (post-discounts): ₹120 – 20% – 5% = ₹90     - Box verified SKU Quantity = 4     - For 4 qty = ₹360     - Price Lock Savings (to be calculated by Netsuite) = ₹360 – ₹300 = ₹60     - Bill reflects for the respective SKU:         - MRP: ₹480         - Base discount (20%): -₹96         - Coupon discount (5%): -₹24         - Price Lock Savings: –₹60         - Final payable (excluding TM rewards / credits):             ₹480 -  ₹96 - ₹24 - ₹60 = ₹300 |

#### User Story: Changes on Return

|  |  |
| --- | --- |
| As a **System** | I want to recover pricelock savings during returns (fully or proportionately) |
| So that | Refunds are accurate and GST reversals happen correctly. |
| Pre-condition | 1. Order invoice is already generated with pricelock savings captured at SKU level. 2. Backend has stored total savings per SKU from the invoicing stage. 3. Netsuite API supports return requests and saving recovery. |
| Trigger | 1. Customer initiates a return request (full or partial) for that SKU. 2. Backend calls Netsuite with SKU details and Qty returned. |
| Post-condition | 1. Netsuite computes price lock savings recovery based on returned quantities. 2. Refund is adjusted after recovering price lock savings first. 3. GST reversal for recovered price lock savings applied same as coupon GST reversal. 4. Netsuite response contains: recovered price lock savings amount, updated remaining savings on order. Backend stores these updated values. |
| Acceptance Criteria | 1. Full Return     - 100% of savings for that SKU must be recovered before any refund.     - Refund = MRP - base discount – Price lock savings - Coupon discount\*.     - GST reversal applied on recovered savings as per SKU GST rate.     - Example:         - Invoiced SKU Quantity: 4 qty,          - Invoiced MRP=120 x 4 = 480         - Invoiced Base Discount (20%) = 96         - Invoiced Coupon Discount (5%) = 24         - Invoiced Pricelock Savings = ₹60.         - Customer returns all 4 qty.         - Entire ₹60 recovered before refund.         - Refund = 480 − 96 - 60 - 24 = 300         - API response includes: `Recovered Savings = ₹60`, `Remaining Savings = ₹0`. 2. Partial Return     - Savings recovery should be proportional to returned quantity.     - Formula = (Total SKU savings ÷ Total Qty) × Returned Qty.     - Remaining savings stay valid for balance quantities.     - Refund = Paid amount for returned units – recovered savings portion.     - Example:         - Invoiced SKU Quantity: 4 qty,          - Invoiced MRP=120 x 4 = 480         - Invoiced Base Discount (20%) = 96         - Invoiced Coupon Discount (5%) = 24         - Invoiced Pricelock Savings = ₹60.         - Case 1: Customer returns only 1 qty             - Invoiced Pricelock savings (for 4 qty) = 60             - Pricelock savings for 1 qty = 60 x 1 / 4 = 15             - Recovered pricelock savings = 15             - Retained pricelock savings for remaining 3 qty = (60 - 15) or (60 x 3 / 4) = 45          - Case 2: Customer returns only 2 qty             - Invoiced Pricelock savings (for 4 qty) = 60             - Pricelock savings for 2 qty = 60 x 2 / 4 = 30             - Recovered pricelock savings = 30             - Retained pricelock savings for remaining 2 qty = (60 - 30) or (60 x 2 / 4) = 45          - Case 3: Customer returns 3 qty             - Invoiced Pricelock savings (for 4 qty) = 60             - Pricelock savings for 3 qty = 60 x 3 / 4 = 45             - Recovered pricelock savings = 45             - Retained pricelock savings for remaining 1 qty = (60 - 45) or (60 x 1 / 4) = 15  3. Mixed Case (multiple SKUs with savings)     - Each SKU treated independently.     - Recovery calculated SKU-wise, qty-wise. 4. GST Reversal     - GST on recovered savings reversed proportionately.     - Same slab logic as coupon GST reversal. 5. DB to store the recovered and remaining savings. |

## Consumer Facing Changes

### Terms & Definitions

| **Term** | **Definition** |
| --- | --- |
| Savings Amount | - Total savings on the order (for all the applicable items for their respective quantities) due to price reduction (batch MRP change, pack-size change or substitute change) - If the term is being used for the item level component, then the savings amount to be considered at the item level (for total quantity) - The calculations can be referred in the [https://docs.google.com/spreadsheets/d/1kk\_b7jYm1aHIpHwGWuReTvQMoz\_DLXADTssnVe5Vdhg/edit?gid=0#gid=0](https://docs.google.com/spreadsheets/d/1kk_b7jYm1aHIpHwGWuReTvQMoz_DLXADTssnVe5Vdhg/edit?gid=0#gid=0)      - Customer Delight in terms of lowered price for an item     - Sum of customer delight in terms of lowered price for all the applicable items in an order to be considered as Savings Amount at order level |
| Absorption Amount | - Total cost absorbed on the order (for all the applicable items for their respective quantities) due to price increase as per defined absorption logic - If the term is being used for the item level component, then the absorption amount to be considered at the item level (for total quantity) - The calculations can be referred in the [https://docs.google.com/spreadsheets/d/1kk\_b7jYm1aHIpHwGWuReTvQMoz\_DLXADTssnVe5Vdhg/edit?gid=0#gid=0](https://docs.google.com/spreadsheets/d/1kk_b7jYm1aHIpHwGWuReTvQMoz_DLXADTssnVe5Vdhg/edit?gid=0#gid=0)      - Cost absorbed for an item     - Sum of cost absorbed for all the applicable items in an order to be considered as Absorption Amount at order level |
| Y1 | - Savings Amount Threshold (Minimum) - Configurable from BE |
| Y2 | - Absorption Amount Threshold (Minimum) - Configurable from BE |

### User Journey: Cost Absorption & PriceLock Experience

#### Variant A (Control)

- **Experience:** No changes from the current system.
- **Why:** This serves as a baseline control group to measure impact of the feature.
- **Impact Area:** Customer continues to see the existing order summary, bill details, and order modification logs without PriceLock interventions.

#### Variant B (Full Implementation with UI Enhancements)

Variant B provides the complete PriceLock journey with banners, trust markers, bottom sheets, and savings summaries.

##### **Pre-Order Placement – Order Summary (Order Type 2 & 3)**

- New Bill Details UI is visible.
- Customers see a PriceLock animation banner and trust markers on Order Summary & PSP → View Bill.
- Order placed animation also highlights PriceLock.
- Experiment variant tagging is done at this stage.

##### **Pre-Order Placement – Order Summary (Order Type 1)**

- New Bill Details UI shown.
- No PriceLock UI displayed.
- ~~Variant tagging deferred → tagged later at pharmacist portal → Type 1 order digitization. ~~Experiment variant tagging is done at this stage.

##### Post-Order Placement – Pre-Invoice Generation (Order Status Page)

- New Bill Details UI shown.
- No real-time WH operation changes reflected (except CSR-driven edits)
    - **Doctor, HA and CSR edits to be considered with pricing displayed as per price locking logic**

##### Post-Invoice Generation (Order Status Page)

- New Bill Details UI shown.
- If absorption/savings cross thresholds → Savings Bottom Sheet shown once per order.
- Savings component displayed on Order Status page.
- Price Change Summary bottom sheet available.
- Order modification logs conditionally visible.
- Bill details enriched with:
    - PriceLock savings discount line item,
    - Tooltips for absorbed costs and MRP updates.
- Invoice (download) reflects new PriceLock line items.

##### Order Modification Logs

- PriceLock strip shown at the top.
- For each modification, if price increased (absorbed) or decreased (savings) → corresponding component displayed above log entry.

#### **Variant C (Minimal UI Implementation)**

Variant C introduces the new bill details UI but limits additional UI elements, showing only the essentials.

##### **Pre-Order Placement – Order Summary (Order Type 1, 2 & 3)**

- New Bill Details UI visible.
- No PriceLock banners or trust markers shown.

##### **Post-Order Placement – Pre-Invoice Generation (Order Status Page)**

- New Bill Details UI visible.
- No real-time WH operation changes reflected (except CSR-driven edits).

##### **Post-Invoice Generation (Order Status Page)**

- New Bill Details UI visible.
- If absorption is applicable, Additional Savings line item appears in Bill Details.
- Invoice (download) reflects PriceLock changes as “Additional Savings.”

##### **Order Modification Logs Page**

- If savings/absorption applies → Savings/Absorption strip shown at the top.

##### **Call-outs / Implementation Notes**

- Backward App Version Compatibility
    - If a customer is assigned Variant B or C (from supported app version or website) but later installs a lower app version that does not support cost absorption:
        - Invoice PDF: Will continue to accurately tag Price Lock / Additional Savings as per the assigned variant.
        - UI on older app versions: Will not display Price Lock / Additional Savings due to unsupported functionality.
    - This ensures backend consistency of tagging and financial calculations, but UI exposure will be version-dependent.

### Order Summary - PriceLock Animation Banner

|  |  |
| --- | --- |
| As a **Customer** | I want to see an engaging animation banner when viewing the order summary, |
| So that | My attention is drawn to the Price Lock Guarantee at the right time. |
| Pre-condition | 1. User is in Variant B experiment group. 2. User is on an eligible app version / Dweb / Mweb. 3. Order Summary page is loaded for the order. |
| Trigger | 1. Dweb:     - If Bill details \>90% visible → show animation immediately after shimmer load.     - If Bill details \<90% visible → show animation once 90% of the bill comes into view. 2. App/Mweb:     - Show animation once 90% of bill is in view. |
| Post-condition | User is visually made aware of the Price Lock Guarantee before engaging with bill details. |
| Acceptance Criteria | 1. Animation plays once per order ID (In case of website, it is to be maintained at session as per confirmation from the FE & product teams) . 2. Animation should merge into the trust marker component on the bottom of the bill section as user scrolls. 3. Animation does not replay if user revisits the page for the same order. 4. Animation triggers only after shimmer loading completes. 5. For ineligible variants → No animation shown. |
| Figma Link | <https://www.figma.com/design/GKbd0W5kgaeNOSVfBBQhc6/%F0%9F%92%B3-App-%7C-Upfront-Payment?node-id=1127-57832&t=6BzOGkFd17t4uH2A-0> |

### Order Summary - Trust Marker: Price Lock Guarantee

|  |  |
| --- | --- |
| As a **Customer** | I want to see a trust marker at the end of the bill on order summary page and PSP → View Bill bottom sheet, |
| So that | I feel reassured that prices are locked and transparent. |
| Pre-condition | 1. User is in Variant B experiment group. 2. User is above the eligible app version / Dweb / Mweb. 3. Order Summary page is loaded. |
| Trigger | User scrolls down to the end of Bill section. |
| Post-condition | 1. Trust marker is displayed consistently for eligible users. 2. Clicking the trust marker chevron CTA opens the Info Bottom Sheet. |
| Acceptance Criteria | 1. Trust marker should be displayed towards the end of the bill section. 2. UI Elements must include:     - Title: *Protected by Price Lock Guarantee*     - Subtext: *No surprises - what you see is what you pay! Zero extra payment if the MRP increases.*     - Chevron CTA: right-aligned clickable chevron. 3. Clicking on the chevron CTA must open the Price Lock Info Bottom Sheet (covered in the next story). 4. If the user is not on Variant B or an ineligible app version → Trust marker should not be visible. 5. Trust marker should follow the same in-line styling as the price lock indicators shown on Order Summary. |
| Figma Link |  |

### Order Summary - Price Lock Guarantee info bottom sheet

|  |  |
| --- | --- |
| As a **Customer** | I want to see detailed information about the Price Lock Guarantee in a bottom sheet |
| So that | I understand how price lock works, when it applies, and its exclusions. |
| Pre-condition | 1. User is in Variant B experiment group. 2. User is above the eligible app version / Dweb / Mweb. 3. Order Summary page is loaded. |
| Trigger | User clicks the chevron CTA on the Trust Marker. |
| Post-condition | User views detailed information in a bottom sheet and can close it easily. |
| Acceptance Criteria | 1. Bottom sheet should open with the following content sections:     - Page Title: *Price Lock Trust Marker*     - Highlights of Scenarios:         - *Price Increase* (explains zero extra payment due to price lock)         - *Price Decrease* (explains user benefits from reduced pricing)     - Possible Reasons for Price Changes:         - Manufacturer updates         - Pack size changes     - Exclusions from Price Lock (explicitly listed).     - Additional Info:         - From what stage Price Lock is applicable         - Disclaimer around Price Lock Guarantee             - Read more → expand disclaimer view             - If disclaimer text \> 90% viewport height → make bottom sheet scrollable             - Disclaimer text: *"The Price Lock Guarantee is offered at the sole discretion of Truemeds and may be modified, suspended, or withdrawn at any time without prior notice and liability and without assigning any reason whatsoever. The Price Lock Guarantee is available for 7 days from the time of placing the order and will be valid only for orders placed and confirmed on the Truemeds platform, subject to product availability and applicable regulations."*     - The content should be dynamically configurable from the backend 2. Closing options:     - Swipe down     - Tap outside the bottom sheet     - Click Close CTA 3. The bottom sheet should not overlap with the order modification logs or price change summary flows. 4. Bottom sheet must be consistent with the UI/UX design system (same padding, typography, and CTA styles). |
| Figma Link |  |

### Order Placed Animation - Trust Marker: Price Lock Guarantee

|  |  |
| --- | --- |
| As a **Customer** | I want to see the Price Lock trust marker immediately after placing my order, |
| So that | I am reassured at the moment of purchase that prices are locked. |
| Pre-condition | 1. User is in Variant B experiment group. 2. User is above the eligible app version. 3. Order placement is successful, and placed animation is being displayed. |
| Trigger | Order placed animation sequence plays on the Order Confirmation screen. |
| Post-condition | User is reassured immediately at order placement that their prices are protected by Price Lock. |
| Acceptance Criteria | 1. Display Price Lock Trust Marker alongside the order placed animation. 2. Visibility logic: Only for eligible app versions. 3. Design & text consistent with trust marker on Order Summary page. 4. Trust marker appears once per order placement → not shown again on revisit. |
| Figma Link |  |

### Order Status - Savings bottom sheet

|  |  |
| --- | --- |
| As a **Customer** | I want to see a clear communication on my order summary about savings or avoided extra cost (cost absorption) after the ~~box verification stage~~ invoice generation stage, |
| So that | I can trust that I’m being protected from price changes and feel assured of value from my purchase. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B**. 3. Backend has calculated applicable savings/cost absorption values and the corresponding reason text. 4. Savings Amount ≥Y1 OR Absorption Amount ≥ Y2 |
| Trigger | User opens the Order Status Page for the first time after invoice generation |
| Post-condition | 1. User sees a bottom sheet with savings / cost absorption details (if eligible). 2. Bottom sheet is shown once per order ID. 3. User can interact with it by closing or navigating to “View Details” for price changes summary. |
| Acceptance Criteria | **Visibility** - The feature is enabled only for Variant B. - Bottom sheet is displayed only once per order ID (on first eligible open). - Bottom sheet is shown when      - Savings Amount ≥ Y1 or Absorption Amount ≥ Y2     - The order status is: Invoice Generated, In transit, Delivered, and Partially Returned (with recalculation on the available items) - Bottom sheet is **not** shown when the order status is: Cancelled (including RTO), Returned, ~~Partially returned~~. **General** - Bottom sheet has:     - Title     - Subtitle line 1     - Subtitle line 2     - View Details CTA: Opens price changes summary     - Trust Marker: Protected by Price Lock Guarantee     - Close CTA - Title, Subtitle line 1 and Subtitle line 2 texts will be backend driven basis different conditions as elaborated in savings bottom sheet content user stories - Bottom sheet can be closed by:     - Swiping down,     - Clicking the “Close” CTA, or     - Tapping outside the bottom sheet. |
| Figma Link | <https://www.figma.com/design/GKbd0W5kgaeNOSVfBBQhc6/%F0%9F%92%B3-App-%7C-Upfront-Payment?node-id=1127-58584> <https://www.figma.com/design/CCdZqYSiZYcRx4o7Y6PsdG/%F0%9F%8C%90--Web-%7C-Upfront-Payment?node-id=99-72798&t=vnNTghJ2BheDebhR-11> |

### Order Status - Savings bottom sheet content in case of only cost absorbed

|  |  |
| --- | --- |
| As a **Customer** | I want to see that extra cost due to a price increase has been absorbed |
| So that | I know I’m protected and not paying more than expected. |
| Pre-condition | 1. Order in **Variant B**. 2. Order passed **Invoice Generated** stage. 3. Savings Amount \< Y1 AND Absorption Amount≥ Y2 |
| Trigger | User opens the Order Status Page for the first time after invoice generation |
| Post-condition | 1. User sees a bottom sheet with savings / cost absorption details (if eligible). 2. Bottom sheet is shown once per order ID. 3. User can interact with it by closing or navigating to “View Details” for price changes summary. |
| Acceptance Criteria | - Title → “₹`<Absorption Amount>` extra cost avoided” - Subtitle Line 1 → “The Price had increased due to `<Reason>`”  - Subtitle Line 2 → “Since you are our valued customer, you pay ₹0 extra!” - Reason logic:     - Order has modifications under batch change with MRP difference but not substitute switch (B to C) or pack size change for any of the items `<Reason>` = "updates from the manufacturer"     - Order has modifications under only pack size change but not MRP batch change, or substitute switch (B to C) for any of the items `<Reason>` = "pack size changes"     - Order has modifications under only substitute switch (B to C)         but not MRP batch change, or pack size change for any of the items `<Reason>` = "similar medicine from a different brand being added"     - Order has modifications under both batch MRP changes, and pack size changes but not substitute switch (B to C) for any of the items `<Reason>` = “updates from the manufacturer and pack size changes"     - Order has modifications under both batch MRP changes, and substitute switch (B to C) but not pack size change for any of the items `<Reason>` = "updates from the manufacturer and similar medicine from a different brand being added"     - Order has modifications under both batch MRP changes and substitute switch (B to C) but not pack size change for any of the items        `<Reason>` = "updates from the manufacturer and similar medicine from a different brand being added"     - Order has modifications under both pack size changes and substitute switch (B to C) but not MRP batch change for any of the items        `<Reason>` = "pack size changes and similar medicine from a different brand being added"     - Order has modifications under all batch MRP changes, pack size changes and substitute switch (B to C) `<Reason>` = "updates from the manufacturer, pack size changes and similar medicine from a different brand being added" |
| Figma Link | <https://www.figma.com/design/GKbd0W5kgaeNOSVfBBQhc6/%F0%9F%92%B3-App-%7C-Upfront-Payment?node-id=1127-59292&t=hXnt1QWPYkVVKVhp-11> <https://www.figma.com/design/CCdZqYSiZYcRx4o7Y6PsdG/%F0%9F%8C%90--Web-%7C-Upfront-Payment?node-id=99-72798&t=vnNTghJ2BheDebhR-11> |

### Order Status - Savings bottom sheet content in case of savings

|  |  |
| --- | --- |
| As a **Customer** | I want to see that extra cost due to a price increase has been absorbed |
| So that | I know I’m protected and not paying more than expected. |
| Pre-condition | 1. Order in **Variant B**. 2. Order passed **Invoice Generated** stage. 3. Savings Amount ≥ Y1 (Absorption Amount not to be considered) |
| Trigger | User opens the Order Status Page for the first time after invoice generation |
| Post-condition | 1. User sees a bottom sheet with savings / cost absorption details (if eligible). 2. Bottom sheet is shown once per order ID. 3. User can interact with it by closing or navigating to “View Details” for price changes summary. |
| Acceptance Criteria | - Title → “₹`<Absorption>` extra saved on this order” - Subtitle Line 1 → “The Price had decreased due to `<Reason>`“ - Subtitle Line 2 → “Your final bill amount is lesser than before.” - Reason logic:     - Order has modifications under batch change with MRP difference but not substitute switch (B to C) or pack size change for any of the items `<Reason>` = "updates from the manufacturer"     - Order has modifications under only pack size change but not MRP batch change, or substitute switch (B to C) for any of the items `<Reason>` = "pack size changes"     - Order has modifications under only substitute switch (B to C)         but not MRP batch change, or pack size change for any of the items `<Reason>` = "similar medicine from a different brand being added"     - Order has modifications under both batch MRP changes, and pack size changes but not substitute switch (B to C) for any of the items `<Reason>` = “updates from the manufacturer and pack size changes"     - Order has modifications under both batch MRP changes, and substitute switch (B to C) but not pack size change for any of the items `<Reason>` = "updates from the manufacturer and similar medicine from a different brand being added"     - Order has modifications under both batch MRP changes and substitute switch (B to C) but not pack size change for any of the items        `<Reason>` = "updates from the manufacturer and similar medicine from a different brand being added"     - Order has modifications under both pack size changes and substitute switch (B to C) but not MRP batch change for any of the items        `<Reason>` = "pack size changes and similar medicine from a different brand being added"     - Order has modifications under all batch MRP changes, pack size changes and substitute switch (B to C) `<Reason>` = "updates from the manufacturer, pack size changes and similar medicine from a different brand being added" |
| Figma Link | <https://www.figma.com/design/GKbd0W5kgaeNOSVfBBQhc6/%F0%9F%92%B3-App-%7C-Upfront-Payment?node-id=1127-58584> <https://www.figma.com/design/CCdZqYSiZYcRx4o7Y6PsdG/%F0%9F%8C%90--Web-%7C-Upfront-Payment?node-id=99-72798&t=vnNTghJ2BheDebhR-11> |

### Order Status - Price Change Summary bottom sheet

|  |  |
| --- | --- |
| As a **Customer** | I want to to view a summary of all cost absorption and savings applied to my order, |
| So that | I can clearly understand where the final order value came from and trust the fairness of billing. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B**. 3. Price changes exist in the order (absorptions, savings, pack size updates, subs-to-subs replacements). |
| Trigger | 1. User taps on **“View Details”** from the savings/cost absorption bottom sheet 2. User taps on Price Lock guarantee component on order status page 3. User taps on Price Lock guarantee component on order modifications page |
| Post-condition | 1. User sees a bottom sheet (Price Change Summary) summarizing price changes. 2. User can expand accordions to view item-level details. 3. User can close the bottom sheet using swipe down, close CTA, or tapping outside. |
| Acceptance Criteria | **General Bottom Sheet Behavior** - Bottom sheet max height is **90% of screen size**. - If content exceeds 90% height, bottom sheet becomes scrollable while maintaining 90% size limit. - User can close bottom sheet by swiping down, tapping outside, or clicking close CTA. - The bottom sheet will have two tabs basis Savings and Absorption     - Savings tab:          - Title - Price Decrease         - Represents all the items where price decreased due to batch change     - Absorption tab:         - Title - Pricelock Savings         - Represents all the items for which cost absorption is applied     - If ~~any tab~~ one of the tab is not applicable, then the other tab is shown as the main content of price change summary bottom sheet and tabs not shown  **Summary Information (Collapsed State)** - Bottom sheet shows all modifications as **accordion sections**:     - Price Increase     - Price Decrease     - Pack Size Updates     - Substitution → Substitution replacements - Each accordion displays the **modification-level summary value** (e.g., total cost absorbed, total savings). - Total value of all **absorptions and savings** shown at the top, along with action outcome on the order:     - “No extra payment” when cost absorption (Y1) is applied.     - “Bill amount reduced by ₹Y2” when savings delight is applied. **Expanded View** - Clicking an accordion expands it to show **item-level details**:     - Initial Price vs Final Price.     - Savings/Absorption applied per item. - CTA label changes from **“View x items” → “View Less”** when expanded. - Clicking **“View Less”** collapses the item-level view. - Item-level changes must sum up to the **modification-level summary value**. **Edge Cases** - If no applicable changes (Savings Amount \< Y1 & Absorption Amount \< Y2), bottom sheet should not appear. - UI dynamically adjusts to handle single or multiple modification categories. - Reason text for changes fetched from BE and displayed correctly for each case. |
| Figma Link | <https://www.figma.com/design/GKbd0W5kgaeNOSVfBBQhc6/%F0%9F%92%B3-App-%7C-Upfront-Payment?node-id=1135-66738&t=AajljGewmdz1AM6T-0> <https://www.figma.com/design/CCdZqYSiZYcRx4o7Y6PsdG/%F0%9F%8C%90--Web-%7C-Upfront-Payment?node-id=391-58574&t=Y1NXb9Lv1RYFNeAL-0> |

### Order Status - Price Change Summary bottom sheet - Price Decrease tab

|  |  |
| --- | --- |
| As a **Customer** | I want to see how much my bill reduced because of a price drop, |
| So that | I feel happy about saving extra. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B**. 3. Order has modifications basis **only price decrease**. |
| Trigger | 1. User taps on **“View Details”** from the savings/cost absorption bottom sheet 2. User taps on Price Lock guarantee component on order status page 3. User taps on Price Lock guarantee component on order modifications page |
| Post-condition | 1. Savings Delight summary is displayed in the Price Change Summary bottom sheet. 2. User sees modification-level summary + item-level breakdown. |
| Acceptance Criteria | The tab will have: 1. Bill difference component:     - Title     - Savings Amount 2. Price change components:     - Price decreased     - Pack size updated     - Replaced with similar medicine |
| Figma Link | <https://www.figma.com/design/GKbd0W5kgaeNOSVfBBQhc6/%F0%9F%92%B3-App-%7C-Upfront-Payment?node-id=1135-66738&t=AajljGewmdz1AM6T-0> <https://www.figma.com/design/CCdZqYSiZYcRx4o7Y6PsdG/%F0%9F%8C%90--Web-%7C-Upfront-Payment?node-id=391-58574&t=Y1NXb9Lv1RYFNeAL-0> |

### Order Status - Price Change Summary bottom sheet - Pricelock Savings tab

|  |  |
| --- | --- |
| As a **Customer** | I want to see how much extra cost I avoided because of PriceLock Savings, |
| So that | I know I am protected from price increases and trust the fairness of billing. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B**. 3. Order has modifications basis** price increase**. |
| Trigger | 1. User taps on **“View Details”** from the savings/cost absorption bottom sheet 2. User taps on Price Lock guarantee component on order status page 3. User taps on Price Lock guarantee component on order modifications page |
| Post-condition | 1. Savings Delight summary is displayed in the Price Change Summary bottom sheet. 2. User sees modification-level summary + item-level breakdown. |
| Acceptance Criteria | The tab will have: 1. Bill difference component:     - Title 1: Total Price Increased by     - Absorption Amount     - Title 2: No extra payment     - Absorption Amount slasher value     - Extra payment Amount (0)     - Price lock icon 2. Price change components:     - Price decreased     - Pack size updated     - Replaced with similar medicine (B to C) |
| Figma Link | <https://www.figma.com/design/GKbd0W5kgaeNOSVfBBQhc6/%F0%9F%92%B3-App-%7C-Upfront-Payment?node-id=1135-66738&t=AajljGewmdz1AM6T-0> <https://www.figma.com/design/CCdZqYSiZYcRx4o7Y6PsdG/%F0%9F%8C%90--Web-%7C-Upfront-Payment?node-id=391-58574&t=Y1NXb9Lv1RYFNeAL-0> |

### Order Status - Price Change Summary bottom sheet - Pack size updated component

|  |  |
| --- | --- |
| As a **Customer** | I want to see the detailed impact of pack size updates on my order, |
| So that | I understand how quantity changes have affected my bill and feel reassured about the transparency of price adjustments. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B**. 3. Price change is present due to **pack size update** (can be part of PriceLock Savings for price increase absorption, or Savings Delight for price decrease). 4. Backend provides item-level details including:     - Old pack size × quantity,     - New pack size × quantity,     - Change value,     - Indicator (increase or decrease). |
| Trigger | 1. User visits price summary change bottom sheet |
| Post-condition | 1. Pack Size Updated (View x items) accordion expands to show all item-level details. 2. User can collapse it back with **“View Less”**. |
| Acceptance Criteria | **Collapsed State** - Title: “Pack Size Updated”. - Total amount change for all items due to pack size updates for specific type (increase or decrease)     - Increased category          - Will be displayed under pricelock savings tab         - Upward arrow/red (increase) displayed with the total amount change     - Decreased category         - Will be displayed under price decreased tab         - Downward arrow/green (decrease) displayed with the total amount change - CTA: “View x items” (where x = number of impacted items). **Expanded state** - On tapping “View x items”, accordion expands to list all impacted items. - Each item row displays:     - Item name.     - Pointer icon showing direction of change:         - Upward arrow/red (increase) - to be grouped together and displayed under pricelock savings tab         - Downward arrow/green (decrease) - to be grouped together and displayed under price decrease tab     - Change value at item level      - Old pack size × quantity (e.g., *10tablets × Qty3*).     - New pack size × quantity (e.g. *15tablets × Qty2*). - Accordion CTA changes to “View Less”. **Collapse Behavior** - On tapping “View Less”, accordion collapses back to the previous (collapsed) state. - Component again shows total pack size update amount with “View x items” CTA. **Multi-batch handling**In case if there are multiple batches added with different pricing then: - All batches in an order should be grouped together by their respective MRP. - Each group shows MRP, quantity, and impact (absorption/saving/none). - Price Increase → Absorption Tab     - If a batch group’s price has increased and absorption is applicable:         - Show the group under Price Lock Savings tab.         - Display total quantity, old vs. new price, and absorbed difference. - Price Decrease → Price Decrease Tab     - If a batch group’s price has decreased:         - Show the group under Price Decrease tab.         - Display total quantity, old vs. new price, and saved difference. - No Price Change → Not Shown     - If a batch group’s price remains the same OR no absorption/savings applies:         - Do not display the group in either tab. - UI Consistency     - Grouped batches must not appear multiple times across tabs.     - Totals (absorbed or saved amount) should reflect aggregated values at the batch group level. |
| Figma Link | <https://www.figma.com/design/GKbd0W5kgaeNOSVfBBQhc6/%F0%9F%92%B3-App-%7C-Upfront-Payment?node-id=1135-66738&t=AajljGewmdz1AM6T-0> <https://www.figma.com/design/CCdZqYSiZYcRx4o7Y6PsdG/%F0%9F%8C%90--Web-%7C-Upfront-Payment?node-id=391-58574&t=Y1NXb9Lv1RYFNeAL-0> |

### Order Status - Price Change Summary bottom sheet - Replaced with similar medicine component

|  |  |
| --- | --- |
| As a **Customer** | I want to see the detailed impact of substitute switch on my order, |
| So that | I understand how this has affected my bill and feel reassured about the transparency of price adjustments. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B**. 3. Price change is present due to **substitute switch B to C** (can be part of PriceLock Savings for price increase absorption, or Savings Delight for price decrease). 4. Backend provides item-level details including:     - Old substitute name     - Old substitute pack size × quantity,     - New substitute name     - New substitute pack size × quantity,     - Locked price (post coupon)     - Box verified Price (post coupon)     - Change value (Absorption / Savings Amount at item level),     - Indicator (increase or decrease). |
| Trigger | 1. User visits price summary change bottom sheet |
| Post-condition | 1. Pack Size Updated (View x items) accordion expands to show all item-level details. 2. User can collapse it back with **“View Less”**. |
| Acceptance Criteria | **Collapsed State** - Title: “Replaced with similar medicine”. - Total amount change for all items due to substitute switch (B to C) for specific type (increase or decrease)     - Increased category          - Will be displayed under pricelock savings tab         - Upward arrow/red (increase) displayed with the total amount change     - Decreased category         - Will be displayed under price decreased tab         - Downward arrow/green (decrease) displayed with the total amount change - CTA: “View x items” (where x = number of impacted items). **Expanded state** - On tapping “View x items”, accordion expands to list all impacted items. - Each item row displays:     - Old substitute name (slashed).     - Old substitute packsize x qty slashed (e.g., *~~10tablets × Qty3~~*).     - Box verified Price (post coupon) slashed     - Locked price (post coupon)     - Pointer icon showing direction of change:         - Upward arrow/red (increase) - to be grouped together and displayed under pricelock savings tab         - Downward arrow/green (decrease) - to be grouped together and displayed under price decrease tab     - Change value at item level  - Accordion CTA changes to “View Less”. **Collapse Behavior** - On tapping “View Less”, accordion collapses back to the previous (collapsed) state. - Component again shows total substitute switch change amount with “View x items” CTA. **Multi-batch handling**In case if there are multiple batches added with different pricing then: - All batches in an order should be grouped together by their respective MRP. - Each group shows MRP, quantity, and impact (absorption/saving/none). - Price Increase → Absorption Tab     - If a batch group’s price has increased and absorption is applicable:         - Show the group under Price Lock Savings tab.         - Display total quantity, old vs. new price, and absorbed difference. - Price Decrease → Price Decrease Tab     - If a batch group’s price has decreased:         - Show the group under Price Decrease tab.         - Display total quantity, old vs. new price, and saved difference. - No Price Change → Not Shown     - If a batch group’s price remains the same OR no absorption/savings applies:         - Do not display the group in either tab. - UI Consistency     - Grouped batches must not appear multiple times across tabs.     - Totals (absorbed or saved amount) should reflect aggregated values at the batch group level. |
| Figma Link | <https://www.figma.com/design/GKbd0W5kgaeNOSVfBBQhc6/%F0%9F%92%B3-App-%7C-Upfront-Payment?node-id=1135-66738&t=AajljGewmdz1AM6T-0> <https://www.figma.com/design/CCdZqYSiZYcRx4o7Y6PsdG/%F0%9F%8C%90--Web-%7C-Upfront-Payment?node-id=391-58574&t=Y1NXb9Lv1RYFNeAL-0> |

### Order Status - Price Change Summary bottom sheet - Batch MRP increase

|  |  |
| --- | --- |
| As a **Customer** | I want to see the detailed impact of batch MRP increase on my order, |
| So that | I understand how this has affected my bill and feel reassured about the transparency of price adjustments. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B**. 3. Price change is present due to **batch MRP change** (can be part of PriceLock Savings for price increase absorption, or Savings Delight for price decrease). 4. Backend provides item-level details including:     - Item name     - Item quantity     - Locked price (post coupon)     - Box verified Price (post coupon)     - Change value (Absorption Amount at item level),     - Indicator (increase). |
| Trigger | 1. User visits price summary change bottom sheet |
| Post-condition | 1. Price increased (View x items) accordion expands to show all item-level details. 2. User can collapse it back with **“View Less”**. |
| Acceptance Criteria | **Collapsed State** - Title: “Price increased”. - Total amount change for all items due to substitute switch (B to C) for specific type i.e. increase      - Will be displayed under pricelock savings tab     - Upward arrow/red (increase) displayed with the total amount change     - CTA: “View x items” (where x = number of impacted items). **Expanded state** - On tapping “View x items”, accordion expands to list all impacted items. - Each item row displays:     - Item name     - Quantity     - Box verified Price (post coupon) slashed     - Locked price (post coupon)     - Upward arrow/red (increase) - to be grouped together and displayed under pricelock savings tab     - Change value at item level  - Accordion CTA changes to “View Less”. **Collapse Behavior** - On tapping “View Less”, accordion collapses back to the previous (collapsed) state. - Component again shows total increase change amount with “View x items” CTA. **Multi-batch handling**In case if there are multiple batches added with different pricing then: - All batches in an order should be grouped together by their respective MRP. - Each group shows MRP, quantity, and impact (absorption/saving/none). - Price Increase → Absorption Tab     - If a batch group’s price has increased and absorption is applicable:         - Show the group under Price Lock Savings tab.         - Display total quantity, old vs. new price, and absorbed difference. - Price Decrease → Should be shown in Price Decrease Tab and not here     - If a batch group’s price has decreased:         - Show the group under Price Decrease tab.         - Display total quantity, old vs. new price, and saved difference. - No Price Change → Not Shown     - If a batch group’s price remains the same OR no absorption/savings applies:         - Do not display the group in either tab. - UI Consistency     - Grouped batches must not appear multiple times across tabs.     - Totals (absorbed or saved amount) should reflect aggregated values at the batch group level. |
| Figma Link | <https://www.figma.com/design/GKbd0W5kgaeNOSVfBBQhc6/%F0%9F%92%B3-App-%7C-Upfront-Payment?node-id=1135-66738&t=AajljGewmdz1AM6T-0> <https://www.figma.com/design/CCdZqYSiZYcRx4o7Y6PsdG/%F0%9F%8C%90--Web-%7C-Upfront-Payment?node-id=391-58574&t=Y1NXb9Lv1RYFNeAL-0> |

### Order Status - Price Change Summary bottom sheet - Batch MRP decrease

|  |  |
| --- | --- |
| As a **Customer** | I want to see the detailed impact of batch MRP decrease on my order, |
| So that | I understand how this has affected my bill and feel reassured about the transparency of price adjustments. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B**. 3. Price change is present due to **batch MRP change** (can be part of PriceLock Savings for price increase absorption, or Savings Delight for price decrease). 4. Backend provides item-level details including:     - Item name     - Item quantity     - Locked price (post coupon)     - Box verified Price (post coupon)     - Change value (Savings Amount at item level),     - Indicator (decrease). |
| Trigger | User visits price summary change bottom sheet |
| Post-condition | 1. Price increased (View x items) accordion expands to show all item-level details. 2. User can collapse it back with **“View Less”**. |
| Acceptance Criteria | **Collapsed State** - Title: “Price decreased”. - Total amount change for all items due to substitute switch (B to C) for specific type i.e. decrease      - Will be displayed under price decrease tab     - Downward arrow/green (decrease) displayed with the total amount change     - CTA: “View x items” (where x = number of impacted items). **Expanded state** - On tapping “View x items”, accordion expands to list all impacted items. - Each item row displays:     - Item name     - Quantity     - Locked price (post coupon) slashed     - Box verified Price (post coupon)     - Upward arrow/red (increase) - to be grouped together and displayed under pricelock savings tab     - Change value at item level  - Accordion CTA changes to “View Less”. **Collapse Behavior** - On tapping “View Less”, accordion collapses back to the previous (collapsed) state. - Component again shows total decrease change amount with “View x items” CTA. **Multi-batch handling**In case if there are multiple batches added with different pricing then: - All batches in an order should be grouped together by their respective MRP. - Each group shows MRP, quantity, and impact (absorption/saving/none). - Price Increase → Absorption Tab     - If a batch group’s price has increased and absorption is applicable:         - Show the group under Price Lock Savings tab.         - Display total quantity, old vs. new price, and absorbed difference. - Price Decrease → Should be shown in Price Decrease Tab and not here     - If a batch group’s price has decreased:         - Show the group under Price Decrease tab.         - Display total quantity, old vs. new price, and saved difference. - No Price Change → Not Shown     - If a batch group’s price remains the same OR no absorption/savings applies:         - Do not display the group in either tab. - UI Consistency     - Grouped batches must not appear multiple times across tabs.     - Totals (absorbed or saved amount) should reflect aggregated values at the batch group level. |
| Figma Link | <https://www.figma.com/design/GKbd0W5kgaeNOSVfBBQhc6/%F0%9F%92%B3-App-%7C-Upfront-Payment?node-id=1135-66738&t=AajljGewmdz1AM6T-0><https://www.figma.com/design/CCdZqYSiZYcRx4o7Y6PsdG/%F0%9F%8C%90--Web-%7C-Upfront-Payment?node-id=391-58574&t=Y1NXb9Lv1RYFNeAL-0> |

### Order Modification Logs - Visibility & Inclusion / Exclusion

|  |  |
| --- | --- |
| As a **Customer** | I want to see order modification logs only for significant changes (removals, replacements, or price increases), |
| So that | I am not overwhelmed by price reduction updates that are already summarized in the Price Change Summary bottom sheet. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B**. 3. System has captured modification events such as:     - Item removed     - Item replaced (substitute → original only)     - Quantity reduction     - Pack-size change with price reduction     - Pack-size change with same or increased price     - Batch Price increase     - Batch Price decrease 4. Price Change Summary bottom sheet is available to display absorptions and savings delight. |
| Trigger | Order is modified due to one or more events listed above. |
| Post-condition | 1. **UI:** Order Modification Logs are displayed only if the modifications meet the inclusion rules. 2. **Communication:** SMS, WhatsApp, and Push notifications are sent only if Order Modification Logs are applicable. |
| Acceptance Criteria | **Inclusion Rules (Logs Visible + Communication Sent)** - Order modification logs should be shown if the order has at least one of the following events:     - Item removed.     - Item replaced (substitute → original).     - Quantity reduction     - Pack-size change      - ~~that leads to a price increase.~~     - ~~Pack-size change that leads to a price decrease~~     - ~~Batch change that leads to a price increase.~~ **Exclusion Rules (Logs Not Visible + Communication Suppressed)** - If the order only has the following events:     - Price change due to batch change, OR     - Price change due to substitute switch (B to C) - as per current implementation - Then →      - Order modification logs should not be shown in the portal/app.     - No SMS, WhatsApp, or Push notification should be triggered.     - These changes will instead be reflected in the Price Change Summary bottom sheet. **Mixed Scenario Rules** - If an order has a **combination** of included and excluded modification events:     - Logs should be shown (since at least one included event is present).     - Communication should be sent.     - Price decreases (batch) will still appear in both Price Change Summary, and order modification logs. **General Rules** - All included modification events should continue to be captured in backend logs for internal audit purposes. - Frontend display and communication should strictly follow the updated inclusion/exclusion rules. |

### Order Status - Savings strip when order mods is not shown

|  |  |
| --- | --- |
| As a **Customer** | I want to see a simple “Savings strip” when my order only has price changes (batch/MRP changes), |
| So that | I can quickly understand how PriceLock has protected or reduced my cost without unnecessary modification logs. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B**. 3. Order has modifications but modification log is not visible |
| Trigger | User opens Order Status page after invoice generation. |
| Post-condition | User is aware of savings due to PriceLock in a concise manner. |
| Acceptance Criteria | 1. Show **Savings strip** above Bill details. 2. Strip text logic:     - Price Increase Only → “₹`<Absorption Amount>` protected with PRICELOCK”     - Price Decrease Only OR Both Price Increase + Decrease → “₹`<Savings Amount>` saved with PRICELOCK” 3. Visibility conditions:     - `<Absorption Amount>` \>=  Y2 (Price increase only).     - `<Savings Amount>` \>=  Y1 (Price decrease only or mixed).     - If `<Absorption Amount>` \>=  Y2 but `<Savings Amount>` \<  Y1, then consider it as Price increase only case  4. CTA: Clicking strip opens **Price Change Bottom Sheet**. |
| Figma Link |  |

### Order Status - Savings strip when order mods is also shown

|  |  |
| --- | --- |
| As a **Customer** | I want to see PriceLock savings info even when there are other order modifications, |
| So that | I clearly know which savings are from PriceLock along with my order changes. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B**. 3. Order has modifications with modification log visible |
| Trigger | User opens Order Status page after invoice generation. |
| Post-condition | User sees both order modifications and PriceLock savings clearly separated. |
| Acceptance Criteria | 1. **Price Lock Marker** shown only if cost absorbed or price reduction is applicable. 2. **Savings Strip with Item Update text** shown:     - Price Increase Only → “₹`<Absorption Amount>` protected with PRICELOCK”     - Price Decrease Only OR Price Decrease and Increase both→ “        `<Savings Amount>` saved with PRICELOCK” 3. Visibility conditions:     - `<Absorption Amount>` \>=  Y2 (Price increase only).     - `<Savings Amount>` \>=  Y1 (Price decrease only or mixed).     - If `<Absorption Amount>` \>=  Y2 but `<Savings Amount>` \<  Y1, then consider it as Price increase only case  4. CTA: Clicking Savings opens **Order mods page**. |
| Figma Link |  |

### Order Status - Price lock discount in bill details

|  |  |
| --- | --- |
| As a **Customer** | I want PriceLock savings reflected directly in my Bill details, |
| So that | I can see how much I saved at checkout level. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B**. 3. PriceLock savings i.e. `<Absorption Amount>` \> 0 applicable. |
| Trigger | User opens Order Status page after invoice generation. |
| Post-condition | User can map actual bill impact with PriceLock protection/savings. |
| Acceptance Criteria | 1. Show additional line item: “PriceLock Savings” **= **`<Absorption Amount>` (total absorbed). 2. Always visible if `<Absorption Amount>` \> 0. 3. CTA behavior:     - PriceLock Savings row → Click shows tooltip (only for Price Increase only / Mixed scenarios).     - In case of only price decrease, do not show a separate “PriceLock Savings” line item. |
| Figma Link |  |

### Order Status - Price lock discount tool tip

|  |  |
| --- | --- |
| As a **Customer** | I want tooltips explaining how the PriceLock worked, |
| So that | I understand the breakdown of savings or absorbed cost. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B**. 3. PriceLock savings i.e. `<Absorption Amount>` \> 0 applicable and visible in the bill details section. |
| Trigger | User clicks on PriceLock Savings row |
| Post-condition | User gets a transparent explanation of how PriceLock worked for their order. |
| Acceptance Criteria | 1. Pricelock savings tool-tip is opened 2. Title: *“Savings with PriceLock Guarantee”* 3. Row 1: “Price Increase `<Locked Price Amount>` ↑ `<Box verified SP post coupon discount>`” 4. Row 2: “PriceLock Savings - `<Absorption Amount>`” 5. Last line: *“You don’t pay anything extra”* |
| Figma Link | <https://www.figma.com/design/GKbd0W5kgaeNOSVfBBQhc6/%F0%9F%92%B3-App-%7C-Upfront-Payment?node-id=2806-98499&t=7XLzCsxEY1X1Xr6v-1> |

### Order Status - MRP tool tip

|  |  |
| --- | --- |
| As a **Customer** | I want tooltips explaining how the PriceLock worked, |
| So that | I understand the breakdown of savings or absorbed cost. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B**. 3. `<Savings Amount>` \>= Y1 applicable AND \<Absorption Amount\> = 0 |
| Trigger | User clicks on **MRP row** (if price decrease is available for at least one item) |
| Post-condition | User gets a transparent explanation of how PriceLock worked for their order. |
| Acceptance Criteria | 1. Pricelock savings tool-tip is opened 2. Title: *“MRP update”* 3. Row 1: “Price Decrease `<Locked Price Amount>` ↓ `<Box verified SP post coupon discount>`” 4. Last line: *“*You pay a reduced final amount*”* 5. Not to be shown in case if the absorption is applicable |
| Figma Link | <https://www.figma.com/design/GKbd0W5kgaeNOSVfBBQhc6/%F0%9F%92%B3-App-%7C-Upfront-Payment?node-id=2034-36600&t=7XLzCsxEY1X1Xr6v-1> |

### Order Modification Logs - Savings / Absorption strip on top

|  |  |
| --- | --- |
| As a **Customer** | I want to see a clear summary of savings or absorbed costs at the top of the Order Modification Logs page, |
| So that | I understand how PriceLock protected me or reduced my bill amount without needing to go through each modification individually. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B**. 3. Order has undergone modifications due to **batch change** or **pack size change**. 4. Absorption Amount \> 0 (in case of price increase) **or** Savings Amount \> 0 (in case of price decrease). |
| Trigger | User opens the Order Modification Logs page. |
| Post-condition | - Users always see a clear, top-level summary of savings/absorption whenever price changes occurred. - Users can drill down into details via the bottom sheet to understand the breakdown. |
| Acceptance Criteria | **General:** - A Savings/Absorption component / strip is displayed at the top of the page above the item update strip(s). - Banner information is calculated at the order level (aggregate across all modifications). - Price Lock Guarantee Trust Marker shown on the top, followed by sub text and amount - CTA: Chevron → Clicking opens the Price Change Summary Bottom Sheet with detailed information. **Case 1: Price Increase Absorbed:** - Sub text: *“Protected from ₹\<Absorption Amount\> price increase.”* - Value: *“~~₹\<Absorption Amount\>~~ ₹0”* **Case 2: Price Decrease:** - Text: *“Your bill has reduced due to updates in your order.”* - Value: *“₹\<Savings Amount\>”* **Case 3: Both Price Increase & Decrease:** - Text: *“Your bill amount has reduced due to updates in your order.”* - Value: *“₹\<Savings Amount\>”* (only savings due to reduced price). |
| Figma Link |  |

### Order Modification Logs - Modification Log Component Changes

|  |  |
| --- | --- |
| As a **Customer** | I want to see savings or absorption information directly within order modification logs, |
| So that | I clearly understand how PriceLock protected me from extra cost or reduced my bill in case of price decreases. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B**. 3. Order has undergone modifications due to **batch change** or **pack size change**. 4. Absorption Amount \> 0 (in case of price increase) **or** Savings Amount \> 0 (in case of price decrease). |
| Trigger | User opens the Order Status page and navigates to the Order Modification Logs section. |
| Post-condition | - Users are able to associate price changes with PriceLock protections/savings directly inside the modification logs. - The communication is transparent and contextual to the exact modification. |
| Acceptance Criteria | 1. For each applicable modification log (batch/pack size price changes), show a strip above the modification entry. 2. Strip logic:     - **Price Increase** → Show:         - *“*↑ *Price increased  ₹~~\<Absorption Amount\>~~ ₹0”*         - Display PriceLock icon.     - **Price Decrease** → Show:         - *“*↓ *Price decreased by ₹\<Savings Amount\>”*         - Display PriceLock icon.     - **Multibatch scenario:**         - If One of the New batch have a higher price, and the other has a lower price compared to locked price, then Price decrease message should be shown with the savings for the price decrease quantity 3. Calculation at **item level**: Absorption/Savings to be computed per item and aggregated for that modification. 4. If Absorption Amount = 0 and Savings Amount = 0 → No strip shown. 5. Consistent placement: strip always appears above the corresponding modification log. |
| Figma Link |  |

### Invoice Changes to Accommodate Price Lock Discount Type

|  |  |
| --- | --- |
| As a **Customer** | I want to see PriceLock savings to be transparently reflected in my invoice, |
| So that | I clearly see how much cost was absorbed on my behalf and how it impacts my final payable amount. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B or C**. 3. Order has price absorption (**Absorption Amount \> 0**). |
| Trigger | System generates the invoice for the order. |
| Post-condition | - Invoice correctly shows PriceLock as a transparent savings line item. - Customer sees total payable reduced by the absorption amount. - GST changes applicable on the Price lock savings as per the same logic as that of coupon discount, ensuring compliance with tax logic. |
| Acceptance Criteria | **Order-Level Changes** - Add a new **line item** under “Savings/Discounts” section of the invoice.     - Text (Variant B): *“Price Lock Savings”*     - Text (Variant C): *“Additional Savings”*     - Value: `Absorption Amount (order-level total)` - Placement consistent with existing coupon/discount line items. **Item-Level Changes** - Line item–level discount value must be inclusive of absorption amount applicable to that item. **GST / Tax Handling** - GST calculation on Price Lock Savings must follow the same logic as coupon discounts (tax recalculated on reduced taxable amount). - Ensure GST line item on invoice reflects adjusted taxable value post absorption. **UI / Format** - “Price Lock Savings” should be displayed in the same style/format as other discount items for consistency. |
| Figma Link | <https://www.figma.com/design/GKbd0W5kgaeNOSVfBBQhc6/%F0%9F%92%B3-App-%7C-Upfront-Payment?node-id=2973-101298&m=dev> |

### Order Status - Additional Line Item in Bill Details (Variant C)

|  |  |
| --- | --- |
| As a **Customer** | I want to see a simple “PriceLock Savings” line item in my bill details, |
| So that | I understand that my extra cost was absorbed without additional UI complexity. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant C**. 3. Cost absorption is applicable (**Absorption Amount \> 0**). |
| Trigger | User views Bill Details on Order Status page after invoice generation. |
| Post-condition | Customer sees PriceLock benefit directly in the bill with no extra interactions required. |
| Acceptance Criteria | 1. An additional line item is shown in Bill Details when cost absorption \> 0.     - Text: *“Additional Savings”*     - Value: `Absorption Amount` (order-level). 2. ~~Line item is not clickable (no tooltip or drill-down).~~ This will be clickable and handling will be similar to the Variant B except for the Trust Marker. Refer Designs for the same. 3. Position: directly below coupon/discount line items (consistent invoice hierarchy). 4. If Absorption Amount = 0 → Line item not displayed. |
| Figma Link |  |

### Order Modification Logs - Savings/Absorption Strip (Variant C)

|  |  |
| --- | --- |
| As a **Customer** | I want a simple strip showing my savings or absorbed costs, |
| So that | Price increase or decrease components in the modification logs do not confuse me |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant C**.  3. **Savings Amount \> 0 **or **Absorption Amount \> 0** |
| Trigger | User opens the Order Status page. |
| Post-condition | Customer sees savings/absorption without bottom sheets or tooltips. |
| Acceptance Criteria | **General:** - A Savings/Absorption strip is displayed at the top of the page above the item update strip(s). - Banner information is calculated at the order level (aggregate across all modifications). - Price Lock Guarantee Trust Marker is **NOT** shown on the top unlike Variant B,  - Sub text and amount to be displayed. **Case 1: Price Increase Absorbed:** - Sub text: *“You Pay ₹0 extra on this order”* - Value: *“~~₹\<Absorption Amount\>~~ ₹0”* **Case 2: Price Decrease:** - Text: *“Your bill has reduced due to updates in your order.”* - Value: *“₹\<Savings Amount\>”* **Case 3: Both Price Increase & Decrease:** - Text: *“Your bill amount has reduced due to updates in order.”* - Value: *“₹\<Savings Amount\>”* (only savings due to reduced price). |
| Figma Link |  |

### Static Order Status from Assigned to WH till Invoice Generated

|  |  |
| --- | --- |
| As a **Customer** | I want my order details (savings, pricing, discounts, products, and quantities) to remain static once my order is assigned to the warehouse, |
| So that | I don’t see intermediate updates caused by backend warehouse operations and only see the final, accurate bill after invoice generation. |
| Pre-condition | 1. The order has passed the Assigned to Warehouse stage and before **Invoice Generation** stage. 2. The order is part of **Experiment Variant B or C**.  3. **Savings Amount \> 0 **or **Absorption Amount \> 0** |
| Trigger | User visits order status page after WH assigned and before invoice generation |
| Post-condition | - The customer continues to see the **static snapshot** of their order (as it was when “Assigned to WH”) until the invoice is generated. - After invoice generation, the order updates with revised details as per the locked price logic. |
| Acceptance Criteria | 1. **Scope**     - The logic is applicable **only for Variant B and Variant C users**.     - For Variant A users, existing flow continues unchanged. 2. **Order Status Behavior**     - Once the order status changes to **“Assigned to WH”**, the following details **must not update for the user in real-time** until the invoice is generated:         - Savings         - Pricing         - Discounts         - Products and quantities 3. **Warehouse Operations**     - Any WH operations should not reflect real-time for the customer such as:         - Bulk update         - Edit order         - Temp edits         - Price changes 4. **Invoice Generation**     - Only after invoice generation and **cost absorption logic execution**, the updated bill should be visible to the customer with:         - Final pricing         - Discounts (including price lock savings)         - Products and quantities         - Savings / absorption applied as per revised logic. 5. **CSR Edits**     - If the CSR team modifies the order at the request of the customer, then:         - These edits must reflect real-time in the customer’s order.         - Locked pricing logic must be applied in real-time for these CSR edits. |
| Figma Link | Not applicable |

## Portal Changes

### Order placement & digitization portal changes

|  |  |
| --- | --- |
| As an **Agent** | I want to see whether Cost Absorption / Price Lock Guarantee is applicable for the customer, |
| So that | I can accurately answer customer queries and guide them during interactions. |
| Pre-condition | Customer has **Experiment Variant B or C** |
| Trigger | Agent creates / opens order for the customer on - Pharmacist Portal → Create Order - Pharmacist Portal → Pill Reminder - Pharmacist Portal → Type 1 Order - Assisted Portal (order/customer lookup) - Doctor Portal → Doctor Fraud |
| Post-condition | A Price Lock Guarantee Trust Marker is displayed based on customer variant |
| Acceptance Criteria | 1. The indicator must always be visible at the top of the order/customer view for quick recognition. 2. A flag/indicator is displayed based on customer variant:     - Variant B or C → *“Price Lock Guarantee Applicable”* with lock/shield icon. 3. For Pharmacist Type 1 Order flow → indicator is derived from customer variant, not order-level variant. 4. Text + icon must be uniform across portals. |
| Figma Link |  |

### Doctor / CSR - Edit Order portal - Address change logic

|  |  |
| --- | --- |
| As a **Doctor / Health Advisor  / CSR Agent** | I want to be shown a confirmation prompt when address change (as per customer’s request) impacts warehouse allocation and item-level prices |
| So that | I can inform the customer about price updates before the address change is applied |
| Pre-condition | 1. Customer has **Experiment Variant B or C** 2. Customer has an existing order with items priced based on current warehouse allocation. 3. Address change request is initiated (via Doctor / HA / CSR call). 4. New address maps to a different warehouse, causing MRP/discount/delivery charge recalculation. |
| Trigger | User (Doctor/HA/CSR agent on behalf of user) selects a new address or edits current address during the call. |
| Post-condition | 1. If user selects **Confirm** → Address is updated, prices refreshed as per new warehouse. 2. If user selects **Cancel** → Address change action is aborted, original address retained. |
| Acceptance Criteria | 1. System calculates total price change: 2. Item-level impact = `(Last MRP – Last BD – Last CD) × Qty – (New MRP – New BD – New CD) × Qty` (summed across items). 3. Add delivery charge difference = `Old Delivery Charge – New Delivery Charge`. 4. Confirmation prompt is displayed with condition-based messaging. 5. **Prompt Details**     - **Title:** `"Confirm address change"`     - Subtitle line 1 ~~(to be defined basis total price change)~~ Changing the address may update the prices of items in your cart.     - **Subtitle line 2 :** `"Would you like to proceed?"`     - **CTA:**         - Primary: **Confirm** → apply address & price updates         - Secondary: **Cancel** → abort address update 6. ~~Subtitle Line 1 Text Logic~~     - ~~Only Increase (all items + delivery net result is positive, no item decreases):~~ ~~"Changing the address will increase the total amount payable by: +₹\<Total Increased Amount\>"~~     - ~~Only Decrease (all items + delivery net result is negative, no item increases):~~ ~~"Changing the address will decrease the total amount payable by: -₹\<Total Decreased Amount\>"~~     - ~~Mixed (some items up, some down):~~         - ~~If Total Price Change \> 0 →~~ ~~"Changing the address will impact the item level prices and increase the total amount payable by: +₹\<Total Increased Amount\>"~~         - ~~If Total Price Change \< 0 →~~ ~~"Changing the address will impact the item level prices and decrease the total amount payable by: -₹\<Total Decreased Amount\>"~~         - ~~If Total Price Change = 0 →~~ ~~"Changing the address will cause changes in the item prices while the overall order value is unimpacted."~~ 7. Prompt must always be shown **only when warehouse changes and item-level price recalculation occurs**. 8. Price change calculation must strictly follow formula given. 9. CTA flow must respect user choice (Confirm = apply, Cancel = revert). 10. Messaging must reflect correct condition (increase/decrease/mixed/neutral). 11. Display values must always be **rounded to 2 decimals** and prefixed with ₹ symbol. |
| Figma Link | <https://www.figma.com/design/CCdZqYSiZYcRx4o7Y6PsdG/%F0%9F%8C%90--Web-%7C-Upfront-Payment?node-id=478-45978&t=slLkwkQV7BaGEa4y-1> |

### CSR - Post order - Bill details changes & comparative view

|  |  |
| --- | --- |
| As a **CSR agent** | I want to view Price Lock Savings, MRP changes on the bill details along with a comparative view in the order post-invoice stage |
| So that | I can effectively address customer queries related to order changes under Price Lock Guarantee. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B or C**. 3. Absorption Amount \> 0 (in case of price increase) **or** Savings Amount \> 0 (in case of price decrease). |
| Trigger | User opens the CSR - Post Order page for the respective order and navigates to the bill details section. |
| Post-condition | - CSR agents can clearly explain Price Lock savings and MRP updates to the customer. - Customer queries about final billed amount vs. protected amount are resolved with clarity. |
| Acceptance Criteria | 1. Bill Details Section     - An additional column is displayed:          - “Price Lock Savings” in case of Variant B.         - “Additional Savings“ in case of Variant C.     - Value = absorption amount at order level     - Visible only when cost absorption is applied and value \> 0. 2. MRP Field     - Clickable MRP row in the bill details.     - On click → tooltip opens showing MRP updates (original MRP vs updated MRP). 3. Bill Details Comparative View     - Clicking on “Bill Details” opens a comparative view:         - Pre Price Lock Bill i.e. at Box verified before cost absorption.         - Post Price Lock Bill i.e. Invoice generated with absorption applied.     - Clear labels to indicate before vs after impact. 4. Visibility Rules     - Feature only enabled for orders where Price Lock and Cost absorption are applicable.     - If no absorption, additional column and comparative view are not displayed. |
| Reference Wireframes |  |
| Figma Link | <https://www.figma.com/design/CCdZqYSiZYcRx4o7Y6PsdG/%F0%9F%8C%90--Web-%7C-Upfront-Payment?node-id=91-66395&t=ot9VixxK0pLN0Edx-1> |

### CSR - Post order - Item level view changes

|  |  |
| --- | --- |
| As a **CSR agent** | I want to view Price Lock Savings on the bill details on item level view for in the order for the post-invoice stages (once the invoice is generated) |
| So that | I can effectively address customer queries related to order changes under Price Lock savings. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B or C**. 3. Absorption Amount \> 0 (in case of price increase). |
| Trigger | User opens the CSR - Post Order page for the respective order and navigates to the bill details section. |
| Post-condition | - CSR agents can clearly explain Price Lock savings to the customer. |
| Acceptance Criteria | 1. An additional Line item for price lock savings to be added in Item level view     1. In case of variant B: Pricelock savings     2. In case of variant C: Additional savings 2. For all the stages, prices and discounts should reflect as per locked pricing logic on item level and bill |
| Reference Wireframes |  |
| Figma Link | <https://www.figma.com/design/CCdZqYSiZYcRx4o7Y6PsdG/%F0%9F%8C%90--Web-%7C-Upfront-Payment?node-id=484-41259&t=ot9VixxK0pLN0Edx-1> |

### CSR - Post order - Modification logs - Savings / Absorption strip

|  |  |
| --- | --- |
| As a **CSR agent** | I want to see savings or absorption information directly within order modification logs, |
| So that | I clearly communicate the customer how PriceLock protected them from extra cost or reduced their bill in case of price decreases. |
| Pre-condition | 1. The order has passed the **Invoice Generation** stage. 2. The order is part of **Experiment Variant B or C**. 3. Order has undergone modifications due to **batch change** or **pack size change**. 4. Absorption Amount \> 0 (in case of price increase) **or** Savings Amount \> 0 (in case of price decrease). |
| Trigger | User opens the CSR - Post Order page for the respective order and navigates to the Order Modification Logs section. |
| Post-condition | - Users are able to associate price changes with PriceLock protections/savings directly inside the modification logs. - The communication is transparent and contextual to the exact modification. |
| Acceptance Criteria | 1. For each applicable modification log (batch/pack size price changes), show a strip above the modification entry. 2. Strip logic:     - Reason:          - Pack size updated (in case of increased price)             - On click: open summary log component i.e. pack size updated from pricelock savings tab as per price change summary bottom sheet         - Pack size updated (in case of decreased price)             - On click: open summary log component i.e. pack size updated from price decreased tab as per price change summary bottom sheet         - Item replaced (in case of B to C i.e. substitute switch with increased price)             - On click: open summary log component i.e. replaced with similar medicine from pricelock savings tab as per price change summary bottom sheet         - Item replaced (in case of B to C i.e. substitute switch with decreased price)             - On click: open summary log component i.e. replaced with similar medicine from price decreased tab as per price change summary bottom sheet         - Price increased (in case of batch change with increased price)              - On click: open summary log component i.e. Price increase from pricelock savings tab as per price change summary bottom sheet         - Price decreased (in case of batch change with decreased price)              - On click: open summary log component i.e. Price decrease from price decrease tab as per price change summary bottom sheet         - The reason is clickable and opens respective type change summary log for all the applicable items     - **Price Increase** → *“*↑ *Price increased  ₹~~\<Absorption Amount\>~~ ₹0”*     - **Price Decrease** → *“~~₹\<Locked Selling Price\>~~ *↓* ₹\<Billed Selling Price\>”*     - **Multi batch scenario **→          - All batches in an order should be grouped together by their respective MRP.         - Each group shows MRP, quantity, and impact (absorption/saving/none).         - Two strips should be shown on top if some batches have price increase and some have price decrease in the same order         - If a batch group’s price has increased and absorption is applicable:             - Price Increase strip to be shown → open summary log component i.e. Price decrease from price decrease tab as per price change summary bottom sheet             - Display total quantity, old vs. new price, and absorbed difference.         - If a batch group’s price has decreased:             - Price Increase strip to be shown → open summary log component i.e. Price decrease from price decrease tab as per price change summary bottom sheet             - Display total quantity, old vs. new price, and saved difference.         - No Price Change → Not Shown             - If a batch group’s price remains the same OR no absorption/savings applies:                 - Do not display the strip for this group         - Refer wireframes at the end.     - (SP to be considered post coupon discount) 3. Calculation at **item level**: Absorption/Savings to be computed per item and aggregated for that modification. 4. If Absorption Amount = 0 and Savings Amount = 0 → No strip shown. 5. Consistent placement: strip always appears above the corresponding modification log. |
| Reference Wireframes |  |
| Figma Link | <https://www.figma.com/design/CCdZqYSiZYcRx4o7Y6PsdG/%F0%9F%8C%90--Web-%7C-Upfront-Payment?node-id=91-66395&t=ot9VixxK0pLN0Edx-1> |

### Call-outs 

- Order Placement & Digitization Portals
    - Price Lock Guarantee flag to be displayed.
    - Product team to prepare SOP and training material for agents, enabling them to effectively communicate Price Lock benefits to customers.
- Doctor Portal – Address Change Scenario
    - Product/Strategy teams to prepare and share the Doctor SOP covering address change flows.
    - Training sessions to be conducted before feature go-live to ensure doctors are aware of the new process.
- CSR Portal – Post-order Changes
    - SOP to be prepared for CSR agents on handling post-order changes under Price Lock Guarantee.
    - Product/Strategy teams to ensure agent training is completed before rollout.

## MCP Logic Change

[Most Common Price](<https://truemeds.atlassian.net/wiki/spaces/FRD/pages/1137442817/Most+Common+Price#Phase-2-(Updated-During-Cost-Absorption)>)

## Ops changes

<https://truemeds.atlassian.net/wiki/x/AoDVQw> 

## Additional Report

**Cost Absorption Daily Report**

Daily reporting of Amount of absorption, refund and type of change with system to assign cases to relevant POCs (summary + base data) -

1. Batch price change \<20% - Assigned to WH for proper picking
2. Batch price change \>20% - Assigned to procurement to ensure inward price correction
3. Pack size change - Assigned to Catalogue + Procurement team to identify duplicate codes/switching off availability of older/discontinued pack size
4. SKU change - Only to be done post CX confirmation, to be assigned to Warehouse

**Last Inward & CMT Reports for Incorrect Pricing**

*Strategy team to align it with the analytics team *

Reference document:<https://truemeds.atlassian.net/wiki/x/AQDWQw>

## Search Changes

*To be picked for refinement….*
