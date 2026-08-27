# Cost Absorption

|  |  |
| --- | --- |
| **Feature Name:** | Cost Absorption |
| **Endpoint Name:** |  |
| **Service Name:** | admin,customer,doctor,pharmacist,master,order management,third party,tracking service,webhook,warehouse mumbai,webhook |
| **Description:** |  |
| **Solution Doc Link: ** |  |
| **Developed By:** |  |
| **Notes: ** |  |
| **Pre Deployment Changes:** |  |

Design Link - <https://www.figma.com/design/GKbd0W5kgaeNOSVfBBQhc6/%F0%9F%92%B3-App-%7C-Upfront-Payment?node-id=1135-66738> 

FRD Link - [Cost Absorption](https://truemeds.atlassian.net/wiki/spaces/FRD/pages/1054539777/Cost+Absorption#Consumer-Facing-Changes)

**Git Branches :**

| **Service Name** | **Branch Name** |
| --- | --- |
| admin | cab\_feature |
| customer | cab\_feature |
| doctor | cab\_feature |
| pharmacist | cab\_feature |
| master | cab\_feature |
| order management | cab\_feature |
| third party | cab\_feature |
| tracking service | cab\_feature |
| webhook | cab\_feature |
| warehouse mumbai | cab\_feature |
| webhook | cab\_feature |

**Database Changes :**

| **Table Name Description** | **New/Existing** | **Table Description** | **Index’s** |
| --- | --- | --- | --- |
|  |  |  |  |

**Endpoint Details : **/CustomerService/fetchPriceLockModal

| **Description** | **Authentication Required ** | **Controller Details** | **Request Body** | **Success & Error Responses** |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |
|  |  |  |  |  |


{  
    "priceUpdateOption": \[  
        {  
            "type": "INCREASE",  
            "title": "MRP Increase",  
            "description": "You don't pay anything extra",  
            "icon": "ic\_price\_down"  
        },  
        {  
            "type": "DECREASE",  
            "title": "MRP Decrease",  
            "description": "You pay the reduced amount",  
            "icon": "ic\_price\_down"  
        }  
    \],  
    "included": \[  
        {  
            "icon": "ic\_manufacture",  
            "text": "Manufacturer updates the MRP"  
        },  
        {  
            "icon": "ic\_box\_size",  
            "text": "Size of the pack changes"  
        }  
    \],  
    "notIncluded": \[  
        {  
            "icon": "ic\_price\_update",  
            "text": "Items are replaced or brands are switched after order is placed"  
        }  
    \],  
    "footer": "We lock the price after you place the order",  
    "disclaimer": "The Price Lock Guarantee is offered at the sole discretion of Truemeds and may be modified, suspended, or withdrawn at any time without prior notice and liability and without assigning any reason whatsoever. The Price Lock Guarantee is available for 7 days from the time of placing the order and will be valid only for orders placed and confirmed on the Truemeds platform, subject to product availability and applicable regulations."  
}


**Endpoint Details : **/CustomerService/updateBannerViewed

param - orderId, type(PriceLockAnimation, DelightBottomSheet) any of the come


**Endpoint Details : **/CustomerService/getOrderModificationLog

{  
    "message": "Data Fetched successfully",  
    "statusValue": "OK",  
    "statusCode": 200,  
    "timeTakenInMs": 12,  
    "responseData": {  
        "priceLock": {  
            "message": "Your bill has reduced due to updates in your order",  
            "showIcon": true,  
            "savingText": {  
                "text": "-₹21",  
                "textStyle": {  
                    "textColor": "#111",  
                    "bgColor": "#fff",  
                    "strikeThrough": true  
                }  
            },  
            "additionalPayableText": {  
                "text": "₹0",  
                "textStyle": {  
                    "textColor": "#111",  
                    "bgColor": "#fff",  
                    "strikeThrough": false  
                }  
            }  
        },  
        "medicinesList": \[  
            {  
                "type": "productReplaced",  
                "header": {  
                    "leftIcon": "",  
                    "rightIcon": "",  
                    "htmlMessage": "Price increased by"  
                }  
            }  
        \]  
    }  
}

**Endpoint Details : **/CustomerService/getCostAbsorptionDetails

{  
    "priceUpdateOptions": \[  
        {  
            "title": "Price Decrease",  
            "subTotal": \[  
                {  
                    "label": "",  
                    "labelValue": {  
                        "showIcon": true,  
                        "labelText": {  
                            "text": "₹₹8",  
                            "textStyle": {  
                                "textColor": "#111",  
                                "bgColor": "#fff",  
                                "strikeThrough": false  
                            }  
                        },  
                        "descText": null  
                    }  
                },  
                {  
                    "label": "No extra payment",  
                    "labelValue": {  
                        "icon": "price\_lock",  
                        "labelText": {  
                            "text": "₹0",  
                            "textStyle": {  
                                "textColor": "#111",  
                                "bgColor": "#fff",  
                                "strikeThrough": false  
                            }  
                        },  
                        "descText": {  
                            "text": "₹21",  
                            "textStyle": {  
                                "textColor": "#111",  
                                "bgColor": "",  
                                "strikeThrough": false  
                            }  
                        }  
                    }  
                }  
            \],  
            "itemsGroup": \[  
                {  
                    "header": "",  
                    "value": "",  
                    "items": \[  
                        {  
                            "product": {  
                                "name": "Britnlin Du Deux Blue Light Spf 50",  
                                "qty": 3,  
                                "unit": "10gm",  
                                "mrp": "₹7.00"  
                            },  
                            "replacedProduct": {  
                                "name": "Britnlin Du Deux Blue Light Spf 50",  
                                "qty": 3,  
                                "unit": "10gm",  
                                "mrp": "₹7.00"  
                            },  
                            "priceDifference": {  
                                "qty": "1",  
                                "originalPrice": "174",  
                                "updatedPrice": "184",  
                                "differenceValue": "7"  
                            }  
                        }  
                    \]  
                }  
            \]  
        }  
    \]  
}


**Endpoint Details : **/CustomerService`/calculateBillDetailsforApp`

{  
    "showPriceLockAnimation": true,  
    "showPriceLockImage": true,  
    "additionalSavings": 500,  
    "priceLockSavings": 500,  
    "mrpDiscount": 10,  
    "priceLockFooterMessage": "No surprises - what you see is what you pay! Zero extra payment if the MRP increases.\*",

"delightInfo": {  
            "saving": 49,  
            "title": "extra cost avoided",  
            "desc": \[  
                "The price had increased due to updates from the manufacturer.",  
                "Since you are our valued customer, you pay ##₹0 extra!##"  
            \]  
        },

"priceLockSaving": {  
            "headerMsg": "₹21 saved with ",  
            "desc": "You pay a reduced amount",  
            "showIcon": true  
        }  
    "tooltips": {  
        "mrp": {  
            "header": "MRP update",  
            "message": "MRPs have been revised due to new GST norms.",  
            "oldMRP": 20,  
            "newMRP": 10,  
            "updateType": "up",

           "label": "Price increase/decrease"  
        },  
        "additionalSavings": {  
            "header": "Additional savings",  
            "message": "You pay ₹0 extra on this order",  
            "oldMRP": 20,  
            "newMRP": 10,  
            "updateType": "null",

            "label": "Price increase/decrease"  
        },  
        "priceLockSavings": {  
            "header": "Price Lock Savings",  
            "message": "You pay ₹0 extra on this order",  
            "oldMRP": 20,  
            "newMRP": 10,  
            "updateType": "null",

          "label": "Price increase/decrease"  
        },  
        "estimatedPayable": {  
            "header": "Note",  
            "message": "The prices may change based on availability. Final prices will be shown once the order is invoiced at our warehouse.",  
            "oldMRP": null,  
            "newMRP": null,  
            "updateType": "null",

            "label": "Price increase/decrease"  
        },  
        "discount": {  
            "header": "Total discount breakup",  
            "headerChip": "28%",  
            "message": null,  
            "oldMRP": null,  
            "newMRP": null,  
            "updateType": "null",

           "label": "Price increase/decrease"  
        },  
    }  
}

  
**Endpoint Details **: /DoctorService/checkIfWhChangeEligible

Description: Check if wh change is eligible for an order and new pincode

Request Method : GET

Request Param: `Long orderId, String pincode`

Success Response:

{  
  "message": "`Successfully Checked Wh Change Eligibility`",  
  "statusValue": "OK",  
  "statusCode": 200,  
  "timeTakenInMs": 10,  
  "responseData": {  
    "`eligibleForWhChange`": true  
   }  
}
