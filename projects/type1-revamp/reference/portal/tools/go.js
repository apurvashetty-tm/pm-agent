window.__go = async function(rowIdx){
  await new Promise(r=>{const s=document.createElement('script');s.src='/overlay.js?'+Date.now();s.onload=r;document.head.appendChild(s)});
  document.getElementById('pk-panel').hidden=true;
  window.__appHistory.push('/dashboard/orderType1');
  await new Promise(r=>setTimeout(r,2500));
  if (rowIdx==null) return 'list';
  document.querySelectorAll('.newOrdersTable tbody tr')[rowIdx].click();
  await new Promise(r=>setTimeout(r,6000));
  return window.__appHistory.location.pathname;
};
