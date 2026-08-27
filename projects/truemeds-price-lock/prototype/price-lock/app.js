(function(){
  var GST=0.05, CAP_RATIO=1.20, FLOOR_RATIO=0.85;
  var coupon=false, count=1;
  var MRPOPTS=[{v:100,l:'Same · ₹100'},{v:115,l:'Higher · ₹115'},{v:140,l:'Over cap · ₹140'},{v:90,l:'Lower · ₹90'},{v:78,l:'Under threshold · ₹78'}];
  var batchMRP=[90,115,78];                 // per-batch MRP, persists
  var DIST={1:[3],2:[2,1],3:[1,1,1]};       // qty split of ordered 3
  var CARD={name:'Cardvas 10', mfr:'Sun Pharma Laboratories Ltd.', hsn:'30049099', exp:'06/28', quoted:100};
  var DUMMIES=[
    {name:'Glyco 500', mfr:'USV Private Ltd.', hsn:'30049099', exp:'10/27', quoted:50, qty:2, batch:'GLY2207'},
    {name:'Telma 40', mfr:'Glenmark Pharma Ltd.', hsn:'30049099', exp:'08/28', quoted:120, qty:1, batch:'TLM5140'}
  ];
  var r2=function(x){return Math.round((x+Number.EPSILON)*100)/100;};
  var inr=function(x){return "₹"+x.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});};
  var $=function(id){return document.getElementById(id);};
  function rate(){return coupon?0.23:0.20;}
  function fspU(q){return r2(q*(1-rate()));}

  function calc(quoted, mrp, qty){
    var rt=rate(), FSPu=fspU(quoted), FSPl=r2(FSPu*qty), mrpL=r2(mrp*qty);
    var box=r2(mrpL*(1-rt)), today=Math.min(box,FSPl);
    var cap=quoted*CAP_RATIO, floor=quoted*FLOOR_RATIO;
    var higher=mrp>cap+1e-9, lower=mrp<floor-1e-9, exc=higher||lower;
    return {mrp:mrp,quoted:quoted,qty:qty,FSPl:FSPl,mrpL:mrpL,today:today,higher:higher,lower:lower,exc:exc,
      pl:r2(Math.max(0,box-FSPl)), ret:r2(Math.max(0,FSPl-today)),
      tDisc:r2(mrpL-today), tTax:r2(today/(1+GST)), tGst:r2(today-r2(today/(1+GST))),
      mDisc:r2(mrpL-FSPl), mTax:r2(FSPl/(1+GST)), mGst:r2(FSPl-r2(FSPl/(1+GST)))};
  }
  var ARROW_UP='<svg viewBox="0 0 12 12" width="11" height="11"><path d="M6 10V2M3 5L6 2L9 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ARROW_DOWN='<svg viewBox="0 0 12 12" width="11" height="11"><path d="M6 2V10M3 7L6 10L9 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function arrow(delta){
    if(Math.abs(delta)<0.005) return '';
    return '<span class="delta '+(delta>0?'up':'down')+'">'+(delta>0?ARROW_UP:ARROW_DOWN)+'</span> ';
  }
  function tag(c){
    if(!c.higher&&!c.lower) return {t:'no change',cls:'none'};
    if(c.higher&&!c.exc) return {t:'higher · absorbed',cls:'absorb'};
    if(c.higher&&c.exc) return {t:'higher · over cap',cls:'exc'};
    if(c.lower&&!c.exc) return {t:'lower · held',cls:'held'};
    return {t:'lower · under threshold',cls:'exc'};
  }

  function renderControls(){
    Array.prototype.forEach.call(document.querySelectorAll('#batchseg button'),function(b){b.classList.toggle('on',+b.dataset.n===count);});
    var qtys=DIST[count], html='';
    for(var i=0;i<count;i++){
      var opts='';
      MRPOPTS.forEach(function(o){ opts+='<option value="'+o.v+'"'+(batchMRP[i]===o.v?' selected':'')+'>'+o.l+'</option>'; });
      html+='<div class="batch-row"><span class="bx">Batch '+(i+1)+'</span>'
        +'<div class="fld">MRP <select class="mrpsel" data-i="'+i+'">'+opts+'</select></div>'
        +'<div class="fld">Qty <b class="mono">'+qtys[i]+'</b></div></div>';
    }
    $('batchlist').innerHTML=html;
    Array.prototype.forEach.call(document.querySelectorAll('.mrpsel'),function(s){ s.addEventListener('change',function(){ batchMRP[+s.dataset.i]=+s.value; render(); }); });
  }

  function renderCart(){
    var rt=rate();
    $('ct_card').textContent=inr(r2(300*(1-rt)));
    $('ct_gly').textContent=inr(r2(100*(1-rt)));
    $('ct_tel').textContent=inr(r2(120*(1-rt)));
    var off=coupon?'23% OFF':'20% OFF'; $('off_card').textContent=off; $('off_gly').textContent=off; $('off_tel').textContent=off;
    var disc=r2(520*rt), pay=r2(520-disc);
    $('disc_l').textContent='Discount · '+(coupon?'23%':'20%'); $('disc_v').textContent='−'+inr(disc); $('pay_v').textContent=inr(pay);
    $('fsp_tag').textContent='FSP '+inr(fspU(100))+'/unit'; $('promise').textContent=inr(pay);
    var b=$('coupon');
    if(coupon){ b.classList.add('on'); b.setAttribute('aria-pressed','true'); $('coupon_l').innerHTML='<span>Coupon FIRST23 applied</span><small>Flat 23% off MRP · whole order</small>'; $('coupon_r').innerHTML='<span class="tick">✓</span>'; }
    else{ b.classList.remove('on'); b.setAttribute('aria-pressed','false'); $('coupon_l').innerHTML='<span>Apply coupon FIRST23</span><small>Flat 23% off MRP · whole order</small>'; $('coupon_r').innerHTML='›'; }
  }

  function todayRow(sr,it,batch,c,hot,tagObj){
    var name='<div class="iname">'+it.name+'</div>'+(tagObj?'<span class="rtag '+tagObj.cls+'">'+tagObj.t+'</span>':'');
    var mrpChg=Math.abs(c.mrp-c.quoted)>=0.005, retChg=c.ret>=0.005;
    var mrpCell='<td'+(mrpChg?' class="chg"':'')+'>'+(mrpChg?arrow(c.mrp-c.quoted):'')+inr(c.mrp)+'</td>';
    var discCell='<td'+(mrpChg?' class="chg"':'')+'>−'+inr(c.tDisc)+'</td>';
    var totCell='<td class="tot-col'+(retChg?' chg':'')+'">'+(retChg?arrow(-c.ret):'')+inr(c.today)+'</td>';
    return '<tr'+(hot?' class="hot"':'')+'><td>'+sr+'</td><td class="item l">'+name+'</td><td class="mfr l">'+it.mfr+'</td><td>'+it.hsn+'</td><td>'+batch+'</td><td>'+it.exp+'</td>'
      +'<td class="dash">-</td>'+mrpCell+'<td>'+c.qty+'</td><td>'+inr(c.mrpL)+'</td>'+discCell+'<td class="mut">'+inr(c.tTax)+'</td><td class="mut">5%</td><td class="mut">'+inr(c.tGst)+'</td>'+totCell+'</tr>';
  }
  function tomRow(sr,it,batch,c,hot,tagObj){
    var name='<div class="iname">'+it.name+'</div>'+(tagObj?'<span class="rtag '+tagObj.cls+'">'+tagObj.t+'</span>':'');
    var mrpChg=Math.abs(c.mrp-c.quoted)>=0.005;
    var mrpCell='<td'+(mrpChg?' class="chg"':'')+'>'+(mrpChg?arrow(c.mrp-c.quoted):'')+inr(c.mrp)+'</td>';
    if(c.exc){
      return '<tr class="exc"><td>'+sr+'</td><td class="item l">'+name+'</td><td class="mfr l">'+it.mfr+'</td><td>'+it.hsn+'</td><td>'+batch+'</td><td>'+it.exp+'</td>'
        +mrpCell+'<td>'+c.qty+'</td><td>'+inr(c.mrpL)+'</td><td>—</td><td class="mut">—</td><td class="mut">5%</td><td class="mut">—</td><td class="tot-col" style="color:var(--red);font-weight:800">exception</td></tr>';
    }
    var totChg=Math.abs(c.FSPl-c.today)>=0.005;
    var discCell='<td'+(mrpChg?' class="chg"':'')+'>−'+inr(c.mDisc)+'</td>';
    var totCell='<td class="tot-col'+(totChg?' chg':'')+'">'+(totChg?arrow(c.FSPl-c.today):'')+inr(c.FSPl)+'</td>';
    return '<tr'+(hot?' class="hot"':'')+'><td>'+sr+'</td><td class="item l">'+name+'</td><td class="mfr l">'+it.mfr+'</td><td>'+it.hsn+'</td><td>'+batch+'</td><td>'+it.exp+'</td>'
      +mrpCell+'<td>'+c.qty+'</td><td>'+inr(c.mrpL)+'</td>'+discCell+'<td class="mut">'+inr(c.mTax)+'</td><td class="mut">5%</td><td class="mut">'+inr(c.mGst)+'</td>'+totCell+'</tr>';
  }

  function render(){
    renderCart(); renderControls();
    var qtys=DIST[count], tBody='', mBody='', sr=1;
    var cardCells=[], cats={held:0,absorb:0,none:0,exc:0};
    var tMrpSum=0,tDiscSum=0,tTot=0, mMrpSum=0,mDiscSum=0,mTot=0, cardTodayTot=0, cardTomTot=0, absorbSum=0, retainSum=0, excCount=0;

    // Cardvas rows
    for(var i=0;i<count;i++){
      var c=calc(CARD.quoted, batchMRP[i], qtys[i]); cardCells.push(c);
      var ti=tag(c); cats[ti.cls]++;
      var batch='CVS-'+(101+i);
      tBody+=todayRow(sr,CARD,batch,c,true,ti);
      mBody+=tomRow(sr,CARD,batch,c,true,ti);
      tMrpSum+=c.mrpL; tDiscSum+=c.tDisc; tTot+=c.today;
      mMrpSum+=c.mrpL; cardTodayTot+=c.today;
      if(!c.exc){ mDiscSum+=c.mDisc; mTot+=c.FSPl; cardTomTot+=c.FSPl; retainSum+=c.ret; } else excCount++;
      absorbSum+=c.pl;
      sr++;
    }
    // dummy rows (no variance: batch mrp = quoted)
    DUMMIES.forEach(function(d){
      var c=calc(d.quoted, d.quoted, d.qty);
      tBody+=todayRow(sr,d,d.batch,c,false,null);
      mBody+=tomRow(sr,d,d.batch,c,false,null);
      tMrpSum+=c.mrpL; tDiscSum+=c.tDisc; tTot+=c.today;
      mMrpSum+=c.mrpL; mDiscSum+=c.mDisc; mTot+=c.FSPl;
      sr++;
    });

    $('today_body').innerHTML=tBody; $('tom_body').innerHTML=mBody;
    $('t_mrp').textContent=inr(r2(tMrpSum)); $('t_disc').textContent='−'+inr(r2(tDiscSum)); $('today_total').textContent=inr(r2(tTot));
    $('m_mrp').textContent=inr(r2(mMrpSum)); $('m_disc').textContent='−'+inr(r2(mDiscSum)); $('tom_total').textContent=(excCount>0?inr(r2(mTot))+' + review':inr(r2(mTot)));

    absorbSum=r2(absorbSum); retainSum=r2(retainSum);
    $('pl_absorb').textContent=(absorbSum>0?'+':'')+inr(absorbSum);
    $('pl_retain').textContent=inr(retainSum);
    $('pl_totals').textContent=inr(r2(cardTodayTot))+' → '+inr(r2(cardTomTot))+(excCount>0?' + review':'');

    // narration for Cardvas
    var sc=$('scenario'), name, td, tm, F=fspU(100);
    if(count===1){
      var c0=cardCells[0], Fl=c0.FSPl;
      if(!c0.higher&&!c0.lower){ name='No variance — batch MRP = quoted';
        td='Fulfilled Batch MRP equals the Quoted MRP ('+inr(c0.mrp)+'). Cardvas bills the <b>FSP '+inr(Fl)+'</b>.';
        tm='<b>FSP held</b> at '+inr(Fl)+'. No Price Lock discount — nothing to absorb or retain.'; }
      else if(c0.higher&&!c0.exc){ name='Higher batch — within the absorption cap';
        td='<b>Cost absorption</b> protects the customer: a <b>Price Lock discount of '+inr(c0.pl)+'</b> holds the price at the FSP '+inr(Fl)+'.';
        tm='<b>FSP held.</b> The Price Lock discount (+'+inr(c0.pl)+') is within the higher-MRP absorption cap — same price, one blended discount.'; }
      else if(c0.higher&&c0.exc){ name='Higher batch — over the absorption cap';
        td='<b>Cost absorption</b> still absorbs the full increase (the threshold is switched off today), so the customer pays the FSP.';
        tm='<b>Exception.</b> The Price Lock discount needed is over the cap → routed to <b>Problem Solver</b>, not silently absorbed.'; }
      else if(c0.lower&&!c0.exc){ name='Lower batch — within the threshold';
        td='<b>Cost absorption</b> re-applies the discount to the lower Fulfilled Batch MRP: the selling price mutates down to <b>'+inr(c0.today)+'</b>, and the difference is refunded.';
        tm='<b>FSP held</b> at '+inr(Fl)+'. The <b>'+inr(c0.ret)+' is retained</b>, not passed down — lower-price delight is delivered upstream (MCP / correct-batch picking), not here.'; }
      else { name='Lower batch — under the lower-MRP threshold';
        td='<b>Cost absorption</b> drops the selling price to '+inr(c0.today)+' (no floor today).';
        tm='<b>Exception.</b> Batch MRP is more than 15% below Quoted MRP → routed to <b>Problem Solver</b>.'; }
      sc.className='scenario'+(c0.exc?' exc':'');
    } else {
      name='Cardvas fulfilled from '+count+' batches (qty '+DIST[count].join('+')+')';
      var parts=[]; if(cats.absorb)parts.push(cats.absorb+' absorbed'); if(cats.held)parts.push(cats.held+' held'); if(cats.none)parts.push(cats.none+' no-change'); if(cats.exc)parts.push(cats.exc+' exception');
      td='<b>Cost absorption</b> treats each batch on its own MRP — higher batches are absorbed to the FSP, lower batches drop and refund. Rows: '+parts.join(', ')+'.';
      tm='<b>FSP held</b> for every batch at '+inr(F)+'/unit'+(cats.exc? ' — except the '+cats.exc+' over/under a guardrail, which route to <b>Problem Solver</b>.' : '. Same price on every row, whatever the batch.');
      sc.className='scenario'+(cats.exc?' exc':'');
    }
    $('sc_name').textContent=name; $('sc_today').innerHTML=td; $('sc_tom').innerHTML=tm;
  }

  $('coupon').addEventListener('click',function(){ coupon=!coupon; render(); });
  Array.prototype.forEach.call(document.querySelectorAll('#batchseg button'),function(b){ b.addEventListener('click',function(){ count=+b.dataset.n; render(); }); });
  render();
})();
