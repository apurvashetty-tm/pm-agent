# PRD — High Governance Salts: Phase 1

**Document Owner:** Product — Apurva Shetty  
**Status:** Phase 1 — Live  
**Last Updated:** June 2026

---

1.  What Is This Document About?
Certain medicines are tightly regulated — either because they require specialist doctor consultation, carry a high risk of misuse, or can cause serious harm if taken in excess. These are currently classified as Not-for-Sale (NFS) on our platform and are not sold to customers. For the scope of this PRD, they are called High Governance Salts.
This document defines the complete system and operational requirements for how orders containing High Governance Salts should be handled — from the moment a customer adds a product to their cart, through dispensing, warehousing, and returns. It is written as a reference for engineers, product designers, and operations teams who will implement Phase 1.

### 1.1  Key Terms
High Governance Salts
GLP-1 Injectables, Rybelsus, Pregabalin, Sildenafil, Urimax [Analysis WIP to include other feasible NFS salts]
Non High governance salts
Defined as Category P salts in this document. Default category for all salts that are NOT classified as High Governance. Orders with only Category P salts do not require specialized doctor consultation or cumulative quantity capping
TM Rx
A Truemeds-generated prescription created by a TM doctor. Stored in customer history; used to determine dispensable quantity within a defined time period.
Cx Uploaded Rx
A prescription a customer uploads from their own external doctor. Not automatically valid — must be reviewed.
Max Allowed Quantity
Order-level cap:  Maximum units of a Salt (Molecule + Strength + Drug Type) dispensable in a single order. Auto-calculated from Max dosage unit × Max dosage × Max duration. Set in the CMT portal.
Available Prescribed Qty
Units of a salt remaining on a customer's valid TM Rx not yet dispensed. Updated on every order — at doctor call, HA call, WH modifications, order cancellations and discards.
Note: For phase 1 - this quantity will only be utilized to determine whether an order can be auto-confirmed or not. In phase 2 - this shall be utilized at a salt level to determine the quantity of salt that can be dispensed
Type 1 Order
Customer uploads Rx only — no medicines added to cart. Pharmacist digitizes.
Type 2 Order
Customer uploads Rx AND adds medicines to cart. Follows the same flow as Type 3.
Type 3 Order
Customer adds medicines to cart only. No Rx uploaded. Standard app order.
Auto-Confirm
Order confirmed without a doctor call — when a single valid TM Rx covers all ordered salts with sufficient available qty.
Salt
Molecule + strength + drug type. E.g. &quot;Pregabalin 75mg Capsule.&quot;
Super Doctor
A senior doctor with elevated portal permissions. Can manually assign orders, rank-up orders, and intervene when orders are stuck.
2.  Business Impact
Why are we doing this?
Resume the sale of certain NFS salts on our platform — GLP-1, Rybelsus, Pregabalin, Urimax, Sildenafil and others.
At peak, each of these product categories combined contributed ~INR 2 crores in revenue before their sale was halted.
This project builds the compliance and operational infrastructure needed to sell these medicines safely and legally.

## 3.  Summary of Long-Term System Changes
Note: The following are the full set of system changes required across all phases which we intend to do over a long term. For current flow, please refer to the Phase 1 section (Section 4 onwards)
Phase 1
• Define and categorise salts/SKUs currently classified as NFS but feasible to sell
• Identify and define doctor categories eligible for each salt category (e.g. Endocrinologist for GLP-1)
• Define max quantity that can be dispensed — per order and per customer within a defined timeframe (to ensure prevention of over-use of salts by the customer)
• Build guardrails for quality doctor consultation and fraud prevention
• Define and validate a correct prescription format per salt (e.g. GLP requires a specific Advice section, all high governance salts require a diagnosis section)
Phase 2
• Introduce a pharmacist layer for uploaded-Rx orders to reduce unnecessary specialist consultations
• Enable digitization of customer-uploaded prescriptions and functionality to attach multiple prescriptions per order
Phase 3
• Introduce further intelligence and checks beyond Customer level - to identify checks across addresses, multiple ids from the same customer, etc.
• Introduce doctor consultation charge for specific salt categories
• Introduce broader molecule level capping if required
Ideal order flow for orders with a high governance salt (to be built across 3 phases)

## 4.  Phase 1 — What We Are Building currently
Phase 1 establishes the foundational order processing flow for High Governance Salts. It covers all system setup, the complete order journey, and doctor consultation guardrails. The diagram below shows the end-to-end flow.
Phase 1 Scope
All changes listed in this document are Phase 1 unless explicitly labelled Phase 2 or Phase 3.
Phase 1 does not include: pharmacist Rx validation layer, multiple prescriptions per order, customer Rx upload digitization, or doctor consultation charges or other high intelligence identification logics.

## 5.  System Setup — Required Before Go-Live
The following configurations must be completed before Phase 1 can go live.
5.1  Salt Categorisation
Systems impacted: None - to be done directly from DB
System change Requirement
Status
Notes / Detail
Categorization of all salts into different salt categories at the backend
New addition
Categorization to be done basis the specialization of doctor required to prescribed the salt
Context - Today, orders of all salts are treated similarly and any doctor can take consultation for any order. We would want to restrict certain orders which contain a high governance salt to be taken by a separate set of doctors - these would mostly be specialists needed for prescribing those medicines based on compliance.
To enable that -&gt; we need to detect when such orders are digitized in the system. This shall be done via salt categorization where each High Governance salt is tagged with a category on the backend using which they can be identified.Where to build this
• Salt categorization to be maintained at the backend on DB.
Backend Storage
The following fields must be stored in the backend Salt Categorisation table and made visible in Metabase:
• Salt ID, Molecule, Strength, Drug Type, Salt Category
The metabase data should be stored in Medicine Molecule as well
• Depending on the specialization of doctor required for consultation, two or more salts can share the same category (e.g. GLP-1 and Rybelsus would both be Category A)
• All non-High Governance salts are assigned a Category P
5.2  Order Categorisation
System impacted - Backend change in logic when order digitized
Every order must be assigned a category on digitisation depending on the category of salts present in the order. This category governs the doctor category it is routed to and the order processing journey it follows.

#### How Order Category Is Determined?
System change Requirement
Status
Notes / Detail
Order with a single High Governance salt → order category = that salt's defined category
New addition
E.g. an order containing only Pregabalin (Category B) + OTC items → Order Category B
Order with multiple salts, but one High Governance → order category = High Governance salt's category
New addition
Category P salts never override a High Governance salt category
Order with no High Governance salt → order category = P
New addition
Doesn't require a specialist doctor call/cumulative quantity capping
Order with two or more distinct High Governance salts → tagged &quot;High governance - Multiple categories&quot;
New addition
&lt;2% of orders historically. Routed to Super Doctor. The customer called the Dr team to split the order. (covered later in Dr Portal changes)
The splitting of order means current order is cancelled or certain items from current orders are cancelled and a new order placed from New Order Placement feature on CSR portals. This already has all capping, etc. checks built in. Also, once orders split the 2 orders are independent now. Each order is treated separately and all other flows like refunds, ETA, etc. to be rerun with normal logics.
Example
Order contains: Telma 40 (Telmisartan — Category P) + Pregabalin 300mg (Category B) + Crocin 650mg (Category P)
→ Order Category = B (the High Governance salt governs)
→ Assigned only to doctors eligible for Category B orders

### 5.3  Order flow (Defined to form a base level understanding of how the system should work)
The following sections define each stage of the order journey for orders containing High Governance Salts.
5.3.1  Pre-Order — PD, Cart, Summary
Requirement
Status
Notes / Detail
No visible changes to PD, Cart, and Summary pages
Present as-is
Phase 1: No customer-facing changes at these stages
Max Allowed Quantity logic at order level
Present as-is
Caps quantity per salt in a single order. No change required.
Molecule Capping Master — cumulative cap enforced silently at cart for select salts (Salts to be added in the table)
Present as-is
If a customer adds more than the cumulative cap for the defined period, quantity is silently reduced on moving to cart. No change required. (Refer to note below)
Note: In case the customer is trying to add any salt which has been specified in the Molecule_capping_master table, the cumulative max capping (as defined in the molecule_capping_master table) to override order level capping and silently reduce quantity to ensure duration capping at Sub group + Drug type level in case customer has added a high quantity than what is defined.  [Currently exists, No change required]
Note: The molecule capping is a rolling X day window. If we define for a Molecule+Drug Type that we can only dispense X qty in the last 30 days, the system will check T-X days and cap additions, even on app / other digitisation modes. For example, if Pregabalin Tablet is capped at 3000mg for 30 day window and customer done following purchases -
Day
Tablet
Qty
Cap used in order
1
Pregabynyl 30 Tablet 10
2
30*10*2 = 600
15
Pregabynyl 30 Tablet 10
4
1200
Now, if a customer tries to order on any day from Day 16 to Day 30 -&gt; the max allowed qty for Pregabynyl 30 Tablet 10 will be 4. However, on Day 31, the allowed qty will be 6 (if no other order placed from Day 16 to Day 30).
Also, the quantity capping calculations take all orders that are placed but not cancelled/discarded/returned in the last X days. So, even new order placements affect the calculations, which is netted by discards/cancellations.

### 5.3.2  Order Placement — Order Categorisation
On order placement, every order must be assigned a category based on the salts it contains (check section 5.2 for specific cases). This category governs which doctor category the order is routed to.

### 5.3.3  Auto-Confirm Check
No change to the auto-confirm logic. The rules below apply as previously defined (Refer here - Auto-confirmation logic)
Auto-confirm check is done for All order categories (even those containing High Governance Salts)
Also, for the edge case where an order has some available prescribed quantity but the molecule capping has hit - in that case additional quantity can&#x2019;t even be added on order placement. If that still happens, autoconfirm check fails as molecule capping supersedes it.

### 5.3.4  Specialist Doctor Assignment
Orders that are not auto-confirmed must be assigned to a doctor from the eligible pool of doctors assigned for that order category.
(Detailed functionalities of assigning categories to doctors and then matching orders to correct corresponding doctors are covered later in the Dr portal changes section 5.4)

### 5.3.5  Order Assessment on doctor portal
The doctor assigned shall assess the salts ordered, max allowed quantity against each salt, cases of duplicate salts/molecules and accordingly call the customer.

### 5.3.6  Doctor consultation and Rx generation
The doctor shall call the customer, diagnose the customer for the respective high governance salt ordered (to be added in training) and generate the Rx. Doctors should be trained to reduce quantity / dosage if required basis the consultation.
Further, showcasing &#x2018;Dr notes&#x2019; on these order prescriptions is required - this is a new prescription section addition that is covered below in prescription changes.

### 5.3.7  HA call
Define salts from the high governance salt categories that are to be kept substitutable - this is done via the correct recommendation functionalities of &#x2018;Consider product&#x2019; and &#x2018;Keep Original&#x2019;. Once defined, these orders post Dr Call should flow through the normal HA flow of valuemeds.
In case of any case of quantity change, All calculations run as per previously intended -  Quantity change HA call

### 5.3.8  Warehousing
In case of any case of quantity change, All calculations run as per previously intended -  Quantity change warehousing

### 5.3.9  Returns and refunds
System change Requirement
Status
Notes / Detail
High Governance salts marked as non-returnable
New addition
Customers must be informed on the App/website that the SKU is non-returnable.
The current comms on any SKU marked non-returnable to be shown with current functionality - marking SKU non-returnable on CMT.

### 5.3.10  Changes to customer ETA
In phase 1 - no changes to customer ETA to be done -
For live orders, we will add X hours for Dr processing time - to be configurable
For backlog orders, we will add Y hours from start of day to dr processing time for ETA
5.4  Changes to Doctor Portal
This section defines every change required on the Doctor Portal for Phase 1. Changes are split into two views: what are the changes for a doctor, and what are the changes for a Super Doctor
5.4.1. For the doctor
This sub-section covers all changes a doctor will see and interact with on the doctor portal when handling orders
Doctor Categorisation
Each doctor must be assigned a single category that matches the salt category they are eligible to prescribe. This determines the orders they are allotted. The assignment of a particular category to a doctor will be done by a Super Doctor (covered in the Super Doctor section) based on the specialization of the doctor. However, once a category is assigned -
Specialist doctors shall be tagged order categories which they are eligible to take (for e.g., if GLP is assigned category A in the salt categorization table, An endocrinologist who is eligible to prescribe GLP shall also be assigned category A).
All other doctors who are not assigned to any high governance salt category shall be assigned to category P (orders with no high governance salt)
Requirement
Status
Notes / Detail
New section — &quot;Doctor Special Category&quot; — added to the doctor's profile on the Doctor Portal
New addition
Shows the category (A, B, etc.) the doctor is assigned to. Pulled from Truemeds Doctor table. Read-only for the doctor.
Doctor can see only orders belonging to their assigned category
New addition
Category A doctor sees only Category A orders in their queue. Category P doctors see only Category P orders.
In Phase 1 — each doctor can hold only one category.
New addition
Order Assignment logic
Note: Changes in new ETA logic
For all orders that don't have any high governance salt i.e., Category P orders -&gt; They shall follow the existing new ETA logic while checking the doctor pool of just Category P doctors (non specialist doctors are assigned a Category P).
In the new ETA logic, we would need to add a filter that only consider Category P doctors&#x2019; capacity in capacity calculation
In the new ETA logic, we would need to add a filter that only consider Category P orders in past order calculations
For orders with at least 1 high governance salt -&gt; These orders shall not follow the new ETA logic. Also, the additional feature developed in the new ETA logic like getting doctor availability when doctor logs in is not needed here. They shall be allotted to the respective specialist doctor basis the below logic -
When a doctor mapped to an order category clicks on assign order on the doctor portal, the system shall check the orders for that order category to which the doctor is mapped. If there are orders available, the doctor shall be assigned an order on a FIFO basis.
However, Hold order logic must hold true for these orders if they are ever put on hold. So, whenever a doctor clicks on an Assign order, the oldest order that is eligible (not in cool off period) must be assigned.
In case no order is available there, the system shall show a &#x201C;No order available&#x201D; message to the doctor.
Hold order logic:
Event
Trigger
System Behavior
Missed Call
Leg 1 connected and Leg 2 not connected (customer did not pick up or call not completed)
Order moved to Hold Pool; system records failed attempt count.
Hold Entry Condition
Post every unassignment post doctor call done and not successful - only max 2 attempts to be possible in each assignment
Order to be marked &#x201C;On Hold&#x201D;
Max Attempts Limit
Doctor = variable (default 20 holds - Global max across all doctor attempts)
When order hits max cap, routed to &#x201C;Max Attempt Team&#x201D; Queue for manual intervention (Super Doctor/ CRM escalation).
Variable Configurations
Max attempts limit
Stored in system-level configuration and adjustable by the backend team.
Note:
The system shall lock the order row before assigning so that if 2 doctors click on assign order at the same time, both of them don't get assigned the same order.
Once an order is assigned to a doctor, the system shall give M mins to the doctor to attempt a call on the order. In case the doctor doesn't attempt any call up to M mins, the order gets unassigned and moves back to the Hold order pool. (M = 4 mins in the current ETA logic, shall be configurable)
An order can be put on hold for a maximum of X (currently at 20 times) (globally across all doctors assigned) after which the order shall be assigned the pool status of &#x201C;Max attempts reached&#x201D; and shall then not be assigned to any doctor. This shall be routed to the max attempt team. [Max attempt count should be configurable]
If an order is not confirmed by T+1 day (T being the date of digitisation) for Live orders and T+2 days for Backlog orders, then they should move to the max attempt team pool, irrespective of whether they have complete their max allowed attempts

### Order Assessment — What the Doctor Sees related to an Order
When a doctor opens an assigned order, they see a detailed assessment screen. The following elements must be present -
Requirement
Status
Notes / Detail
A.
High Governance salt orders/SKUs shown with different background on doctor portal
New addition
High visibility differentiation
from normal orders.
B.
List of all medicines, salt details, and quantities ordered
Present as-is
No change.
C.
Flagging of items breaching max qty
Doctors must reduce the quantity to meet capping. Updated message format required (see below) as current format if confusing (covered in detailed section below)
D.
Flag: multiple SKUs from same salt (same molecule + strength + drug type)
Present as-is
Already flagged. No change.
E.
Flag: multiple SKUs from same molecule + drug type but different strengths
New addition
Currently does not exist. Doctor to be shown a flag and to take a conscious call on quantity basis consultation. Salt-level capping still applies.
F.
Past Orders Summary section for all High Governance salts in the order
New addition
Shows last 5 orders per salt (at Sub Group + Drug Type level). See below for fields.
All orders with High Governance Salt SKUs to have a different background when opened on Dr portal to ensure high visibility and differentiation
List of all medicines, salt details, and quantities ordered - No change required
Flagging of items breaching max qty - For cases where ordered quantity breaches the max allowed qty
Current view -&gt;
In this case - the doctor has to reduce the quantity of medicine such that it meets the capping. However, the Current communication is confusing - max allowed qty is in # of tablets or ml -&gt; but this is not clear -&gt; need to add drug type as well
New format (of flagging the quantity cap)
For Salt Domeridone (30mg) + Rabeprazole (20mg) Tablet - Max allowed qty: 360 tablets | Ordered qty: 540 tablets | Please reduce the cumulative salt quantity below 360 tablets
Flagging of items - multiple SKUs same salt - exists currently and is flagged, the doctor will have to reduce the quantity basis the max allowed quantity for the salt
Flag: multiple SKUs from same molecule + drug type but different strengths - New addition
In case a customer has ordered multiple SKUs of same molecule and drug type but different strength, the doctor shall be flagged
This will only be applicable for salts which are not specified in the molecule capping master table.
If the doctor is flagged,  the doctor can take a conscious call on the consultation call whether to process all medicines in the order
Past Orders Summary section for all High Governance salts in the order
To ensure a doctor is able to do a good consultation, it is important to show past orders for all High governance salts added. Here, salts means only Sub group + strength.
There will be a section of &#x201C;Past orders&#x201D; on the doctor portal order assessment window
Here, we will show the last 5 orders for each High governance salt added in the order. If &lt;5 orders exist, show whatever orders there are
The past orders for each Sub group + Drug type to include -
Order ID
SKU Name
Qty
Date of order
# of days since current order
Order status
This shall provide the doctor a comprehensive view of whether the customer is a genuine patient or is abusing the salt and can accordingly take a call to reduce the quantity basis the consultation with customer

### Prescription (Rx) Format — Changes
The following changes apply to the TM Rx generated by the doctor. These are visible on the printed and digital prescription
Requirement
Status
Notes / Detail
Doctor qualification on Rx
Changed
Currently hardcoded as &quot;MBBS&quot; for all doctors regardless of actual qualification. Must pull actual value from Tmdoctor_qualifications, qualification_master table.
Doctor specialisation on Rx
New addition
Must be pulled from tmdoctor_specialists, practice_master table. Not currently shown on Rx.
Patient name, age, date on Rx
Present as-is
No change.
Doctor Notes — compulsory for HighGovernance orders
[To be added below patient details]
New addition
Free text entered by doctor on Doctor portal (Doctor Notes). Appears as a distinct &quot;Dr Notes&quot; section on the Rx.
Validation check to ensure that all orders with at least one high governance category salt have a filled diagnosis section. In case the order is categorized as a high governance category order, and if the doctor has not filled the diagnosis section, when the doctor places an order, it shall show an error - &#x201C;Dr notes missing&#x201D;
For all other category P orders (with no high governance category salt) - the diagnosis section from the Rx to be removed.
We should add a standard spell check functionality if available.
Salt composition, dosage, duration on Rx
Present as-is
No change.
Advice section — additional notes for special salts (e.g. Semaglutide tapering)
Changed
Advice notes to be defined per salt in the &quot;Salt Dosage Master Data Mapping&quot; table. Automatically pulled onto the Rx for the relevant salt. The Salt Dosage Master Data Mapping  table already exists. New advice to be added in that by Dr Sachin.
Disclaimer added at the bottom of every Rx
New addition
&quot;The patient should not reduce or increase the medicine dosage without a physical consultation with his/her doctor.&quot;

### Communication to be sent to doctor to ensure faster ETAs
Doctor notification — order pending
All specialist doctors mapped to a category receive SMS/WhatsApp notifications:
(1) Every 2 hours when orders are pending in their category pool
(2) When 5+ orders accumulate in their category pool
Message: &quot;Orders pending — please login and process orders&quot;
The frequency and message should be configurable. Currently don't need the front end for the configurations/changes. However, will need backend support to do the changes when required.
5.4.2. For the super-doctor
This sub-section covers all changes a super doctor will see and interact with on the doctor portal for admin related tasks for order processing
Doctor categorization - ability to assess and manage categories
Category assignment to be provided by the Super Doctor / Admin for all the doctors (to be added to DB)
System change Requirement
Status
Notes / Detail
Doctor categorisation column to be added in DB. The column should be changeable from the back end. Need validation -
Only categories defined for salts should be valid values for this column. Any other value should not ever go in the column.
For e.g. if all Semaglutide salts are marked &#x201C;GLP1&#x201D; category and all Pregabalin salts are marked &#x201C;Pregab&#x201D; category and these are the only 2 categories that exist in the system, then
For doctors, the only eligible values to put in the categorisation columns should be - GLP1, Pregab and P (P by default)
New addition
Categorization to be done basis the specialization of doctor
Where to build this
List of categories against doctor: The list provided by super-doctor shall be added to the DB
It shall be visible in the Truemeds Doctor table -&gt; Add additional columns as below
• Doctor Special Category
• Doctor Specialisation: pulled live from tmdoctor_specialists, practice_master table
• Doctor Qualification: pulled live from tmdoctor_qualifications, qualification_master table

#### Summary View dashboard [Analytics requirement]
A summary panel must be visible showing the count of doctors tagged against each salt category — to ensure every category is covered before go-live.
Category
Example Salts
# Doctors Tagged
A
Semaglutide, Tirzepatide (sub groups shown)
3
B
Pregabalin
10
Special Order Handling — High Governance Tags
Certain High Governance orders require Super Doctor intervention. Three distinct tags are used, each with a different root cause and resolution path.

#### &quot;High Governance Order Tag&quot; column on Doctor Portal
Requirement
Status
Notes / Detail
&quot;High Governance Order Tag&quot; column added to the order list view on the Doctor Portal
New addition
New column visible to Super Doctor (and to regular doctors for their own orders). Shows one of the below three tags or is blank.
Tag: &quot;High governance - Multiple categories&quot;
New addition
Order contains two or more distinct High Governance salt categories. Cannot be assigned to a single specialist. Routed to Super Doctor.
Superdoctor passes to the CSR team. The customer called. Order split into single-category orders via CSR portal.
Tag: &quot;High governance - Dr not defined&quot;
New addition
The order category has no doctor assigned. Routed to Super Doctor. Super Doctor must first assign a doctor to the category, then manually route the order.
Tag: &quot;High governance - Not confirmed&quot;
New addition
Order not confirmed by T+1 (for live), T+2 (for backlog) from digitisation date or those going to Max Attempt. Routed to Max Attempt Team. Date of digitisation and attempt count visible on order.
Note: Functionality of assigning orders directly to Super Doctor exists today in case of &#x2018;Max attempt logic&#x2019;. Same functionality to be used for assigning orders with different filter criteria for orders to flow in.
Current View:
New view with additional columns:
Manual Assign and order Rank-up
Manual assign - A superdoctor shall be able to manually assign an order in specific cases. In the manual assign feature the superdoctor shall be able to search an order ID and assign it to any doctor belonging to that salt category (ideally should get a dropdown of list of doctors).
Manual assignment to also be restricted to doctor category that is eligible for the order in question
Order rank-up - A superdoctor shall be able to rank-up an order in specific cases when the order is stuck or needs to be processed on priority. Similarly, a customer should also be able to rank-up (from app directly or through CSR). For each rank-up, the order moves to the top of the pool (even before LIFO live order). The intent is that rank-up is done by the customer when he is available and order should be processed on priority. So, this is primarily used when customer signals availability, either directly or through CSR &amp; super doctor reachout.