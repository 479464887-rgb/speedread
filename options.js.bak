// SpeedRead - Options
const DEFAULTS={wpm:400,fontSize:42};
document.addEventListener('DOMContentLoaded',async()=>{
  const{settings}=await chrome.runtime.sendMessage({type:'GET_SETTINGS'});
  const s=settings||DEFAULTS;
  document.getElementById('wpm').value=s.wpm||400;
  document.getElementById('font-size').value=s.fontSize||42;
  document.getElementById('save').addEventListener('click',async()=>{
    const btn=document.getElementById('save');btn.disabled=true;btn.textContent='保存中...';
    await chrome.runtime.sendMessage({type:'SAVE_SETTINGS',settings:{
      wpm:parseInt(document.getElementById('wpm').value)||400,
      fontSize:parseInt(document.getElementById('font-size').value)||42
    }});
    btn.disabled=false;btn.textContent='保存设置';
    const el=document.getElementById('status');el.textContent='✓ 已保存!';el.style.display='inline';
    setTimeout(()=>el.style.display='none',2000);
  });
});
