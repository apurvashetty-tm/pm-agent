# Cost Absorption Solution

| **Document Owner** |  |
| --- | --- |
| **Document Status** | DRAFTREVIEWCOMPLETE |
| **Goal/Target** |  |
| **FRD** | [Cost Absorption](https://truemeds.atlassian.net/wiki/spaces/FRD/pages/1054539777/Cost+Absorption) |
| **Epic** |  |
| **Related Documents** | PRD - <https://docs.google.com/document/d/1V6Z0pHLlXBXyfm7szzlVQXnJvIueh64EH1Czz4airh8/edit?tab=t.0#heading=h.nw9092fy1djl> Figma - <https://www.figma.com/design/GKbd0W5kgaeNOSVfBBQhc6/%F0%9F%92%B3-Upfront-Payment?node-id=1127-57591&t=7QaO7LJORncl3tdK-4> Website and portal: [Figma web](https://www.figma.com/design/CCdZqYSiZYcRx4o7Y6PsdG/%F0%9F%8C%90--Web-%7C-Upfront-Payment?node-id=91-66395&p=f&t=87cQItSwaIJZLova-0) |

# Requirement Analysis

---

##  Scope

The scope refers to the boundaries and extent of the system or application being designed. It defines what features, functionalities, and components are included in the system and what is excluded.

**In Scope:**

- Price lock changes on order summary, order status and order details page.
- WMS changes required for Price Lock (TBD)
- MCP

**Out of Scope:**

- Changes will not go live for FCs other than Mumbai and for MFCs.
- There is no threshhold logic implementation for now.

##  Assumptions/Risk

**Assumptions: **  
1\] If a customer adds an item to the cart based on the currently displayed price, that price will remain fixed in the cart—even if the MCP (Most Common Price) changes later due to any reason. The cart price will only be updated if:

- The customer removes and re-adds the item, or
- The customer modifies the quantity of the item in the cart.

2\] If a pickable rack has only 1 quantity (MRP 110) and no-pickable rack has 50q quantities (MRP 120), then according to MCP logic customers will place order with 110 MRP. Suppose customer orders 10 qty then cost of 9 quantities will have to absorbed. 

**Risks:**  
1\] Since threshold logic is not yet implemented, the cost absorbed on certain orders may be significantly higher than expected.

## Technical Specifications & Feasibility

| **Type** | INFRASTRUCTUREPERFORMANCESECURITYAUTOMATIONPROCESS & UPSKILLINGUPGRADATIONMONITORINGFEATURE |
| --- | --- |
| **Technology Stack** | `JavaScript` |
| **Engineers** | List down number of engineers needed from department3 engineers |
| **Estimate in Days** |  Engineer's Bifurcation: Ballpark Bifurcation: |

## Non-Functional Requirements

Requirements define the qualities, characteristics, and constraints of a system or product. They specify how the system should behave in terms of performance, security, usability, reliability, and other aspects that are not directly related to the system's functionality.

|  |  |
| --- | --- |
| **Deliverables** | **Steps to achieve Deliverables** |
|  |  |

## Time Line

# System Design

---

| ### Current System Overview | Cost absorption is designed to address the issues of fluctuating prices between order placement and order invoicing which often results in customer dissatisfaction.  Currently, our pricing model does not lock medicine prices at the time of order placement. This results in frequent price fluctuations between the initial order and final invoicing. Consequently, customers are often charged a higher amount than initially shown, leading to poor customer experience and a higher rate of order cancellations.  #### Operational Gaps - **Picker Flow**: The current picker flow does not support MRP-level picking. This prevents us from ensuring price consistency across the order lifecycle. - **MCP Logic**: The existing Most Common Price (MCP) logic is derived based on the total available inventory in the assigned warehouse, rather than at a batch or MRP level from the pickable racks. This causes mismatches between the expected and actual prices at fulfillment. |
| --- | --- |
| ### Proposed System Overview | **System Overview:**We will be covering below points in the proposed system: 1. MCP: Most common price based on categorized pickable and non-pickable racks instead of considering the total available inventory. 2. Picking checking improvements (Ops Improvements): TBD 3. Price lock and cost absorption logic: Logic for absorbing and not absorbing the cost based on the prices and lock stage and box verification stage 4. UI changes to show customer delight factor: Changes in Order summary, Order status and My Order Details to show delight factors to the customer. 1. **MCP Logic:** - SKU with inventory logic:     - Retrieve MRP level grouped with the total quantities for each group from the table `wp_bin_product_batch_mapping` where `mrp > 0` and `available_qty > 0`.     - First consider pickable racks data and if no qty is available in pickable racks, then select from non-pickable racks.     - New index to be created for `wp_bin_product_batch_mapping` table, covering columns `product_code`, `warehouse_id`, `active`, `mrp`, `available_qty` - For non inventory     - If no data is found in `wp_bin_product_batch_mapping` then it is a non-inventory item.     - For non-inventory items, the system will:         1. Query the **inward\_product\_details** table to retrieve the last inwarded price from the current warehouse.         2. If no data is available for the current warehouse, retrieve the price from the HUB warehouse.         3. If the HUB also has no data, retrieve the last inwarded price from any available warehouse.         4. If no inwarded price is found from any warehouse, retain the price as per the latest update in the **medicine\_warehouse** table (where SKU MRP is updated from CMT).(This is handled in the query itself using CASE query) - Touch-points:     - BIN to BIN     - Inventory adjustment     - Putaway     - Invoice update - webhook from NS is received then MCP calculation is triggered - Tables:     - `wp_bin_product_batch_mapping` Stores MRP at batch level     - Rack type tagging master: `wp_bin_type_master`,      - Below are rack types, for MCP only pickable and non-pickable racks will be considered         - pickable         - non-pickable         - not to be considered 1. **Price lock and cost absorption logic:** - The Price Lock calculation should be implemented within the `ThirdPartyService`, as the invoice generation process is handled there. - All logic prior to the box verification will remain unchanged. - Every stage data (item level modifications in the order) is already maintained in the Mongo collection `order_footprint_tracking`. (For every modification in the order a new collection document is maintained) - At box verification stage the locked stage will be decided.     - On this stage item level data of every line item will be fetched from the table.     - If HA consultation was made HA will be the price lock stage     - If no HA call was made and Doctor consultation was made, doctor consultation will be the price lock stage.     - If no Doctor or HA call was made, Order place will be the price lock stage.     - `((HA CALL \|\| DOC CALL \|\| Order placed) && orderId) orderby createdOn Descending` - Every line item’s box verified stage data will be compared with the price lock stage data and cost absorption calculation will be done. - Every line item’s Final Threshold value (T) will be calculated using MIN(X, YV) and permissible range (0 to (Price Lock MRP + T)) will be calculated. - If the delta is within the permissible range cost absorption will be allowed - x & y will be stored in `m_system_value_master` - New `gl-id` will be created in net suite for BD for cost absorption (Medicine level). - `X = Threshold value Y = percentage value YV = Y * Price Lock MRP of line item T = MIN(X, YV) Permissible Range = o to (Price Lock MRP + T)) Actual price increase = Final / Box verified stage SP - PL SP Cost absorption decision = Actual price increase <= T` - Entry will be made in `cost_absorption_details` table. Below are the fields maintained - `{   orderId,   promisedProductCode,   promisedMrp   promisedMrpWithQty,   promisedSellingPrice,   promisedQty,   boxVerifiedProductCode,   boxVerifiedMrp,   boxVerifiedMrpWithQty,   boxVerifiedSellingPrice,   boxVerifiedQty,   priceIncreased = false,   priceDecreased = false,   costAbsorption = false,   diffAmt }` 1. **UI changes to show customer delight factor: ** - Below are the list of changes on m-web and d-web:     - Summary         - New Bill details component         - Price lock animation         - Price lock details popup         - Order placed popup     - Order status & Order details          - Price lock saving popup         - Bill details component         - Order Modification CTA with price lock tag?         - Pay button positioning         - Order Modification Popup:             - Price lock guarantee header & on click of it a popup will open, with all the changes affecting the pricing             - Order mod med cards - The following changes are focused on enhancing the user experience (UX) and displaying the customer delight factor on key pages. These changes will be applied to the `Cart` `Reorder Summary` `Order Summary`, `Order Status`, and `My Order Details` pages - After login, if variant is not assigned for the user for cost absorption module then we need to set it. Below mentioned points will be valid only for users with the cost absorption test and control variant (B & C). **Bill Details changes:**  - New Bill Details component:     - Bill details will be modified across three pages: `cart`, `Order Summary`, `reorder-summary`, `Order Status`, and `My Order Details`.      - New component `NewBillDetails` needs to be added for new bill in `src\components\molecules\NewBillDetails\index.tsx`     - In `middlewares/orderMiddleware` add a new case for variant B and C.         - If the user has variant A call old bill api.         - If the user has variant B or C call new bill api.     - In the `OrderBillWrapper` needs to put condition to render old bill or new bill based on variant.          - If the user has **variant A**, show the **BillDetails**.         - If the user has **variant B**, show the **NewBillDetails**.         - If the user has **variant C**, show the **NewBillDetails**.     - The new bill detail API structure remains the same as the old API. The new tooltips will be included under a new key inside the object.     - If we get the object which has details of tooltip of line items of bill details including images and colors then we will show it otherwise we can skip it.     - New key added in the bill detail that is `priceLockSavings` , if we get value in that key then we will show it.     - Select Payment mode/Place order section is above the bill for B and C variant and its below the bill for A variant.     - Change in `PlaceOrderModal` component in `src\components\elements\Button\PlaceOrderButton\PlaceOrderModal.tsx`- here we need to add price lock badge. - Bill detail animation:     - Create a `PriceLockTrustMark` component to show the trust mark card.     - Create a `PriceLockAnimation` component to show animation on the bill details         - If `priceLockAnimationPlayed` key is not present in the session storage animation will be played.         - Make use of `useIntersectionObserver` if the 90% of the bill is in view trigger the animation.         - Once the animation is triggered, store a `priceLockAnimationPlayed` in the session storage.         - Once the order is placed remove this key from Session Storage. -  Order Place Animation:     - in `PlaceOrderModal` component render a new lottie file with PriceLock saving.     - In `PlaceOrderModal` component add a new PriceLock icon below green tick (If lottie is not provided) - Price Lock saving details Modal:     - On click of `PriceLockTrustMark` a new Popup will open `PriceLockInfoModal`.     - The text in the modal is going to come from popup **Order Status Page changes**In the proposed system We aim to improve MCP and Ops in order to reduce the price changes scenarios - Order Modification Log -     1. UI changes to be done in `OrderModification` component in `src\components\molecules\OrderModification`     2. Create new component `PriceLockHeader` in           `src\components\molecules\PriceLockHeader\index.tsx` in which we will show the reduced value which we will get from `/getOrderModificationLog` API in `priceLockSavingsData` key     3. On click of `PriceLockHeader` we will open a modal which will be a new component `PriceLockLogModal`in          `src\components\molecules\PriceLockLogModal\index.tsx` in which we will create new UI and display all the logs by mapping the data we get from the new API     4. Add strip UI to display MRP increased & decreased in `ModificationProductCard` in `src\components\elements\OrderStatusElements\OrderModification\ModificationProductCard\index.tsx` & will get these values from the same API in `modificationInfo` key which is in same level with `currentProduct` and `previousProduct` - Order Status page -     - Once the order reaches the Box Verified stage, an API call should be made to determine whether the Price Lock modal needs to be displayed or not. Based on the API response, the modal (`PriceLockSavingsModal` in `src\components\molecules\PriceLockSavingsModal\index.tsx`) will be triggered if required.         - In case of cost absorption - Modal shows details about the **price increase** of the order.         - In case of cost reduction - Modal shows details about the **price reduction** of the order     - when the user clicks on **“**View Details**”**, the `PriceLockLogModal`will be displayed.     - If an order contains multiple line items and some items have a price reduction while others have a price increase, the Price Lock modal will display the savings only from the reduced items, and not from the items with a cost absorption (price increase). |
| ### Proposed Page/End-Point URLs: |  |
| ### Data Flow Diagram | An explanation of how User and Data will flow through the proposed system. This includes the sources of data, data processing steps, storage mechanisms, and data outputs. It may highlight any changes or improvements in the data flow compared to the current system. |
| ### Component Diagram | A detailed connection of each major component in the proposed system. This includes information on the purpose, functionality, and responsibilities of each component. It may also cover any external dependencies or integrations. |
| ### Interfaces and Integration Points | Details about the interfaces or APIs to be used by the proposed system to interact with external systems, services, or databases. This includes information on the protocols, data formats, and integration mechanisms to be employed. Any changes or enhancements to existing interfaces should be mentioned. |
| ### Scalability and Flexibility | This involves assessing the ability of the proposed system to accommodate future growth and changes. It includes considerations for scalability, extensibility, and adaptability to evolving business requirements. The system's architecture and design should support easy integration of new features and functionalities. |

## API Contract

| **Status** | **Link** |
| --- | --- |
| DRAFTREVIEWSIGNED | Link of API Contract Document |
| DRAFTREVIEWSIGNED | Link of API Contract Document |

# Development Plan

---

## Implementation Plan

|  |  |
| --- | --- |
| **Milestone** | `Product/Tech Goal (cf[10190]) = Goal-Name` |
| Created Date  ### Technical Feasibility Tentative Target Date: Tentative Date |  |
| Created Date  ### Milestone Title Tentative Target Date: Tentative Date |  |
| ### Additional Task |  |

## Issues

Issue Title - ACTIVERESOLVEDNOT RESOLVED

|  |
| --- |
| ### Issue Title Add discussions here...- Date, Timeline |

## Decision

## Meeting Minutes

### Date, time -\> Meeting title

Add list of attendees

Add MOM list here

# Maintenance and Support

---

## Tech Debt

\- Add debt here...

## Analytics and Reporting

## Maintenance and Support

## Questions

| **Question** | **Answer** |
| --- | --- |
| Ask Your question here | Answer to the question Answered By - Date |
|   |   |
