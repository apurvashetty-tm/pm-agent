(function(){
window.__mockBase = window.__mockBase || window.__mock.route;
const base = window.__mockBase;
const T1 = [
 {orderId:7005201,date:"08-10-2026 10:12",mobileNo:"9999900011",customerName:"Ananya Kulkarni",customerId:880101,pincode:"400076",status:"PENDING VERIFICATION",orderColor:"#e67e22",paymentName:"COD",paymentId:17,numOfCallsAttempted:1,unreachable:false,assigneeName:"Prototype Pharmacist",orderType:52,warehouseId:14},
 {orderId:7005202,date:"08-10-2026 09:40",mobileNo:"9999900012",customerName:"Rohit Menon",customerId:880102,pincode:"400053",status:"INVALID ORDER",orderColor:"#c0392b",paymentName:"COD",paymentId:17,numOfCallsAttempted:0,unreachable:false,assigneeName:null,orderType:52,warehouseId:14},
 {orderId:7005203,date:"08-10-2026 09:05",mobileNo:"9999900013",customerName:"Priya Raghavan",customerId:880103,pincode:"560034",status:"ORDER PLACED",orderColor:"#2980b9",paymentName:"ONLINE",paymentId:16,numOfCallsAttempted:3,unreachable:true,assigneeName:"Prototype Pharmacist",orderType:52,warehouseId:12}
];
window.__T1 = T1;
const log = window.__ovlLog = [];
window.__mock.route = function(method, href, body){
  const url = new URL(href, "https://api.mock"); const p = url.pathname; const q = Object.fromEntries(url.searchParams);
  const o = q.orderId && T1.find(x=>String(x.orderId)===String(q.orderId).split('-')[0]);
  log.push(method+' '+p+(url.search||''));
  const raw = b => ({status:200, body:b, source:'ovl'});
  if (/getneworderlist$/.test(p)) return raw({newOrderList:T1, totalCount:T1.length, count:T1.length});
  if (/fetchAllPharmacist$/.test(p)) return raw({pharmacistList:[{userId:90001,firstName:"Prototype",lastName:"Pharmacist"},{userId:90002,firstName:"Meera",lastName:"Iyer"}]});
  if (o && /getOrderDetailsById$/.test(p)) return raw({OrderDetailsDTO:{...o, age:34, genderName:"Female", emailAddress:"x@example.com", orderValue:0}, Proceed:true, Hold:false, packagingCharge:0, AddressDetails:{addressline1:"Hiranandani Gardens, Powai", city:"Mumbai", state:"Maharashtra", pincode:o.pincode, landmark:"Near Galleria"}});

  if (o && /getAllRxMedicines$/.test(p)) {
    const addr = {addressId:5001, addressline:"Flat 1202, Hiranandani Gardens, Powai", addressline1:"Flat 1202, Hiranandani Gardens", landmark:"Near Galleria", pincode:o.pincode, pincodeId:4001, city:"Mumbai", state:"Maharashtra", selected:true};
    return raw({
      DigitizeDtoList: o.status==="PENDING VERIFICATION" ? [
        {orderId:o.orderId, subOrderId:o.orderId*10+1, productCode:"TM-TACR1-017951", productName:"Glycomet Gp 1 Tablet 15", quantity:2, requestedQuantity:2, productDetailsId:1, status:1},
        {orderId:o.orderId, subOrderId:o.orderId*10+1, productCode:"TM-CACR1-001589", productName:"Ecosprin Av 75 Capsule 15", quantity:1, requestedQuantity:1, productDetailsId:2, status:1}
      ] : [],
      patientList:[{patientId:o.customerId*10+1, patientName:o.customerName, age:34, gender:2, genderName:"Female", relation:"SELF", prescriptionInfo:[{imageId:1, imageUrl:"", rxId:1}]}],
      GenderList:[{serialId:1,value:"Male"},{serialId:2,value:"Female"}],
      PaymentList:[{serialId:16,value:"ONLINE"},{serialId:17,value:"COD"}],
      PaymentType:o.paymentName,
      AddressList:[addr], OrderAddress:addr, edd:"10-10-2026", unreachable:o.unreachable, notes:"",
      doctorDetails:{doctorName:"Dr. Amit Verma", regNo:"MMC-12345"}, reasonList:[]
    });
  }
  if (/fetchFromElasticSearch$/.test(p)) {
    const cat = [
      ["TM-TACR1-017951","Glycomet Gp 1 Tablet 15","Usv Pvt Ltd",123.28],
      ["TM-CACR1-001589","Ecosprin Av 75 Capsule 15","Usv Pvt Ltd",65.5],
      ["TM-TAET1-002001","Glynux M 1 Tablet 10","Nicholas Healthcare Limited",96.56]];
    const hits = cat.map(c=>({_id:c[0], _source:{original_product_code:c[0], original_sku_name:c[1], original_company_nm:c[2], original_mrp:c[3], original_supplied_bytm:true, org_cold_storage:false, max_capped_qty:10, original_drug_type:"RX", org_is_returnable:true}}));
    return raw({hits:{hits, total:{value:hits.length}}, responseData:hits});
  }

  if (o && /fetchrximage$/.test(p)) {
    const b = base('POST','https://api.mock/OrderManagementService/fetchrximage?orderId=7004101',null).body;
    const img = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="520"><rect width="400" height="520" fill="#fff" stroke="#999"/><text x="20" y="40" font-size="22" font-family="Arial">HealthCare Clinic - Rx</text><text x="20" y="90" font-size="16" font-family="Arial">Patient: '+o.customerName+'</text><text x="20" y="140" font-size="16" font-family="Arial">1. Glycomet GP 1  - 1-0-1 x 30d</text><text x="20" y="170" font-size="16" font-family="Arial">2. Ecosprin AV 75 - 0-0-1 x 30d</text><text x="20" y="200" font-size="16" font-family="Arial">3. Rosuvas 10 - 0-0-1 x 30d</text><text x="220" y="480" font-size="14" font-family="Arial">Dr. Amit Verma</text></svg>');
    return raw(Object.assign({}, b, {SubOrderDto:{patientId:o.customerId*10+1, patientName:o.customerName}, ImageMasterDto:[{imageId:1, imageUrl:img, imagePath:img, url:img}], genderList:[{serialId:1,value:"Male"},{serialId:2,value:"Female"}], relationList:[{serialId:1,value:"SELF"},{serialId:2,value:"MOTHER"},{serialId:3,value:"FATHER"}]}));
  }
  if (o && /fetchMultipleRxImages$/.test(p)) return raw({imageList:[], responseData:[]});

  if (/fetchAllCxOffers$/.test(p)) return raw({statusCode:200, responseData:[
    {offerId:101, promoCode:"FEST25", title:"Flat 23% + 2% cashback", description:"On medicines. Min order Rs 799", expiryDate:"2026-10-31", termsAndConditions:["Valid once per customer"], stripeMessage:"Add Rs 412 more to apply", couponApplyFlag:false, offersVisible:true},
    {offerId:102, promoCode:"TMFIRST", title:"Extra 10% on first order", description:"New customers only", expiryDate:"2026-12-31", termsAndConditions:[], stripeMessage:"Not applicable: not a first order", couponApplyFlag:false, offersVisible:true},
    {offerId:103, promoCode:"SAVE15", title:"Flat 15% off", description:"On all Rx medicines", expiryDate:"2026-10-15", termsAndConditions:[], stripeMessage:null, couponApplyFlag:true, offersVisible:true}
  ]});
  return base.apply(this, arguments);
};
return 'ok';
})()
