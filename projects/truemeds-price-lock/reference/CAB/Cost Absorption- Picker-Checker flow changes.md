# Cost Absorption: Picker\-Checker flow changes

## Document History

| 1.   | Document Version | V1.0 |
| --- | --- | --- |
| 1.   | Document Date | 16-Sep-2025 |
| 1.   | Prepared By | @Advait Kelapure |
| 1.   | Reviewed By |   |
| 1.   | Approved By |   |

### Picker Flow Changes

For every SKU picker is picking (only in case of batch change, pack-size change and replace with OG) :

#### Exact MRP

The exact MRP should get calculated as 

- If pack-size is not changed and NOT replaced with OG then  
`Exact MRP = Price Lock MRP`
- If pack-size is changed and NOT replaced with OG then  
`Exact MRP = Price Lock MRP / Price Lock Pack-size x New Pack-size`
- In case of replace with OG and OG pack-size is not changed  
`Exact MRP = Order Summary MRP of the OG product`
- In case of replace with OG and OG pack-size is ~~not~~ changed  
`Exact MRP = Order Summary MRP of the OG product / Order Summary pack-size of the OG product x New pack-size`

In case if the SKU batch has old (printed) and new MRPs defined because of the GST change, the old MRP should be considered i.e. printed MRP as Exact MRP while the actual MRP that will get billed will be the new MRP. Locked MRP should not get updated with the printed MRP at any given point. 

#### Changes on new WMS (FCs & MFCs)

The inventory data should be checked at rack level:

- All the available batches for the specific SKU should be checked in the JIT & Urgent racks
    - If there is only one MRP batch available in the JIT and urgent racks i.e. if all the available batches in the JIT & urgent racks have same MRP, then there are no changes in the picker flow i.e. no MRP to be shown to the picker
    - If there are more than one MRP batches available in the JIT and urgent
        - If no batch has the exact MRP, then there are no changes in the picker flow i.e. no MRP to be shown to the picker
        - If at least one available batch has exact MRP 
            - If total available quantity of the MRP batch group for the Exact MRP in Urgent & JIT racks is greater than or equal to the SKU quantity ordered by the user, then Exact MRP and total available quantity at rack level for the Exact MRP batch groups should be shown to the picker as a recommended MRP for picking
            - If total available quantity of the MRP batch group for the Exact MRP in Urgent & JIT racks is less than the SKU quantity ordered by the user, then there are no changes in the picker flow i.e. no MRP to be shown to the picker
- In case if there is no inventory in JIT and urgent racks, all the available batches for the specific SKU should be checked in the Bulk rack
    - If there is only one MRP batch available in the bulk rack i.e. if all the available batches in the bulk rack have same MRP, then there are no changes in the picker flow i.e. no MRP to be shown to the picker
    - If at least one available batch has exact MRP in Bulk rack
        - If no batch has the exact MRP, then there are no changes in the picker flow i.e. no MRP to be shown to the picker
        - If there are more than one MRP batches available in the bulk rack
            - If total available quantity of the MRP batch group for the Exact MRP in Bulk rack is greater than or equal to the SKU quantity ordered by the user, then Exact MRP and total available quantity at rack level for the Exact MRP batch groups should be shown to the picker as a recommended MRP for picking
            - If total available quantity of the MRP batch group for the Exact MRP in Bulk rack is less than the SKU quantity ordered by the user, then there are no changes in the picker flow i.e. no MRP to be shown to the picker
- In case if there is no inventory in JIT, urgent or bulk, then there are no changes in the picker flow i.e. no MRP to be shown to the picker
- The changes should be applicable for all the warehouses (FCs and MFCs)

**Wireframes:**

The component should be placed above the batch level data shown to the picker

#### Changes on old WMS (FCs)

In case of FCs where new WMS is not deployed, 

- Available MRP batches and quantities should be considered from the total inventory as available in Netsuite and not at the rack level
    - If there is only one MRP for all the available inventory batches i.e. if all the available batches in the inventory have same MRP, then there are no changes in the picker flow i.e. no MRP to be shown to the picker
    - If no SKU batch has the Exact MRP, then there are no changes in the picker flow i.e. no MRP to be shown to the picker
    - If at least one available batch has exact MRP 
        - If total available quantity of the MRP batch group for the Exact MRP in the total inventory is greater than or equal to the SKU quantity ordered by the user, then Exact MRP and total available quantity for the Exact MRP batch groups should be shown to the picker as a recommended MRP for picking 
        - If total available quantity of the MRP batch group for the Exact MRP in total inventory is less than the SKU quantity ordered by the user, then there are no changes in the picker flow i.e. no MRP to be shown to the picker

**Wireframes:**

The component should be placed above the batch level data shown to the picker

#### Call-outs

- Even after showing the exact MRP, the picker can still select any other MRP batch and proceed since there will be no enforced batch / MRP picking and it has to be executed and adhered at the ground level by the Ops team with setting up SOPs
- Cost absorption will be applicable only in case of batch or pack-size change. 
- In case of replace with OG, we just want to ensure correct MRP batch picking attempt. Cost will not get absorbed in replace with OG if higher MRP batch is picked.

### Checker Flow Changes

1. There will be no system level forced re-picking of the same / permissible range MRP batch and it has to be executed and adhered at the ground level by the Ops team with setting up SOPs
2. Following log should be maintained for every SKU once the box is verified
    - Order ID
    - WH ID
    - Cost absorption variant
    - Product code
    - Price lock MRP
    - Price lock quantity
    - Cost absorption Threshold (value derived basis X and Y)
    - Permissible range MRP (Upper Bound)
    - Rack shown to the picker
    - Actual Picked MRP
    - Actual Picked quantity
    - Actual Picked Batch Rack
    - Actual Batch Picked - Price Lock Batch / Permissible Batch / Threshold Breach
    - Cost Absorption Required? - True / False
    - Cost Absorption Value
    - Was MRP Batch Available? - True / False
    - Price Lock MRP Available Quantity
    - Price Lock MRP Batch Racks
    - Was Permissible MRP Range Batch Available? - True / False
    - Permissible MRP Range Batch Quantity
    - Permissible MRP Range Batch Racks
    - Picker user ID
    - Picker user name\*
    - Picked date time
    - Checker user ID
    - Checker user name\*
    - Checked date time
3. The changes should be applicable for all the warehouses (FCs and MFCs)
4. In case of FCs where new WMS is not deployed, available MRP batches should be considered from the total inventory
5. Metabase report should be created to access this table data
6. The feasibility check needs to be done for the impact and performance for the logs in order to conclude what all data points can be logged.
