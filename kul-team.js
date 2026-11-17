(function(){
'use strict';var auth=KUL_AUTH,teams=[],openId='',busy=false,request=0,layer;
function node(tag,text){var e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;}
function clean(s){return String(s||'').normalize('NFC').toLowerCase().replace(/\s+/g,' ').trim();}
function rpc(name,args,ok,fail){var run=google.script.run.withSuccessHandler(ok).withFailureHandler(fail);run[name].apply(run,args);}
function init(){
 var style=node('style');style.textContent='#kul-team-overlay{position:fixed;inset:0;background:#0009;z-index:2147483647;display:none;align-items:center;justify-content:center;padding:12px}#kul-team-box{font:15px system-ui,sans-serif;color:#19364b;background:#fff;border-radius:14px;max-width:560px;width:100%;max-height:90vh;overflow:auto;padding:20px;box-shadow:0 16px 60px #0005}#kul-team-box h2{font-size:21px;margin:4px 0 8px}#kul-team-box button{font:inherit;border:1px solid #ccd4dc;padding:9px 12px;margin:4px;border-radius:7px;background:#f3f6f8;color:#183249;cursor:pointer}#kul-team-box .kul-line{padding:10px 0;border-bottom:1px solid #edf0f3}#kul-team-box .kul-warn{background:#fff1d5;padding:10px;border-radius:7px}#kul-team-box small{color:#657889}.kul-ct-badge{display:inline-block;margin:2px 0 2px 6px;padding:2px 8px;border-radius:999px;font:700 12px system-ui,sans-serif;white-space:nowrap;cursor:pointer;vertical-align:middle}.kul-ct-badge.ok{background:#e3f5e8;color:#1e8a3a}.kul-ct-badge.warn{background:#fff2cc;color:#8a5a00}.kul-ct-badge.bad{background:#fde7ea;color:#c4001a}';document.head.appendChild(style);
 layer=node('div');layer.id='kul-team-overlay';layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','Thông tin đội bóng');layer.addEventListener('click',function(e){if(e.target===layer)close();});document.body.appendChild(layer);
 document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
 document.addEventListener('click',function(e){if(layer.contains(e.target))return;var t=e.target;if(t.closest('input,select,textarea'))return;
  var hit=t.closest('[data-kul-team-id],[data-team-id]'),ids=[];
  if(hit){var id=hit.getAttribute('data-kul-team-id')||hit.getAttribute('data-team-id');if(teams.some(function(x){return x.id===id;}))ids=[id];}
  if(!ids.length){for(var cur=t,depth=0;cur&&cur!==document.body&&depth<4;cur=cur.parentElement,depth++){var name=clean(cur.textContent);if(name.length>180)continue;ids=teams.filter(function(x){return clean(x.name)===name;}).map(function(x){return x.id;});if(ids.length)break;}}
  if(!ids.length)return;if(t.closest('a'))e.preventDefault();if(ids.length===1)show(ids[0]);else choose(ids);
 },true);
 document.addEventListener('keydown',function(e){var b=e.target;if((e.key==='Enter'||e.key===' ')&&b.classList&&b.classList.contains('kul-ct-badge')){e.preventDefault();show(b.getAttribute('data-kul-team-id'));}});
 if(auth.role==='referee'&&window.MutationObserver)new MutationObserver(henVe).observe(document.body,{childList:true,subtree:true,characterData:true});
 setTimeout(refreshIndex,2500);   /* để trang chính tải trước */
 setInterval(function(){if(!document.hidden){if(openId)refresh();else refreshIndex();}},60000);
 var focusT=0;window.addEventListener('focus',function(){if(Date.now()-focusT<30000)return;focusT=Date.now();refreshIndex();if(openId)refresh();});
 window.KUL_OPEN_TEAM=function(id){show(id);};
}
function refreshIndex(){rpc('kulDanhMucDoi',[auth],function(r){teams=r.teams||[];loadBadges();},function(e){console.warn('KUL thông tin đội: '+e.message);});}
/* Nhãn cầu thủ cạnh MỖI tên đội (trang trọng tài): 👥 tổng · ✅ đã duyệt · ⏳ chờ · ❌ từ chối — bấm nhãn mở danh sách chi tiết */
var tomTat={},hen=0;
function loadBadges(){if(auth.role!=='referee')return;rpc('kulTomTatCauThu',[auth],function(r){tomTat=r||{};decorate();},function(e){console.warn('KUL cầu thủ: '+e.message);});}
function badgeText(s){if(!s||!s.tong)return ['👥 Chưa nộp DS cầu thủ','bad'];return ['👥 '+s.tong+' · ✅ '+s.duyet+(s.cho?' · ⏳ '+s.cho:'')+(s.tuChoi?' · ❌ '+s.tuChoi:''),s.tuChoi?'bad':s.cho?'warn':'ok'];}
function decorate(){if(auth.role!=='referee'||!teams.length)return;var names={};teams.forEach(function(x){var k=clean(x.name);(names[k]=names[k]||[]).push(x.id);});
 var els=document.body.getElementsByTagName('*');for(var i=0;i<els.length;i++){var el=els[i];
  if(el.childElementCount||layer.contains(el)||(el.closest&&el.closest('.kul-pick'))||(el.classList&&el.classList.contains('kul-ct-badge'))||/^(SCRIPT|STYLE|OPTION|SELECT|TEXTAREA|INPUT|TITLE|BUTTON)$/.test(el.tagName))continue;
  var ids=names[clean(el.textContent)];if(!ids)continue;
  var id=el.getAttribute('data-kul-team-id')||el.getAttribute('data-team-id')||(ids.length===1?ids[0]:'');if(!id)continue;
  var bt=badgeText(tomTat[id]),b=el.nextElementSibling;
  if(!(b&&b.classList.contains('kul-ct-badge'))){b=node('span');b.className='kul-ct-badge';b.setAttribute('role','button');b.setAttribute('tabindex','0');el.parentNode.insertBefore(b,el.nextSibling);}
  if(b.textContent!==bt[0])b.textContent=bt[0];if(b.className!=='kul-ct-badge '+bt[1])b.className='kul-ct-badge '+bt[1];if(b.getAttribute('data-kul-team-id')!==id)b.setAttribute('data-kul-team-id',id);
 }}
function henVe(){clearTimeout(hen);hen=setTimeout(decorate,30);}
function box(){layer.replaceChildren();var b=node('div');b.id='kul-team-box';var closeBtn=node('button','Đóng');closeBtn.style.float='right';closeBtn.onclick=close;b.appendChild(closeBtn);layer.appendChild(b);layer.style.display='flex';return b;}
function close(){request++;openId='';busy=false;layer.style.display='none';}
function choose(ids){openId='';request++;var b=box();b.appendChild(node('h2','Chọn đúng nhóm của đội'));ids.forEach(function(id){var t=teams.find(function(x){return x.id===id;});var bt=node('button',t.nhom+' · '+t.name);bt.onclick=function(){show(id);};b.appendChild(bt);});}
function show(id){request++;busy=false;openId=id;box().appendChild(node('p','Đang đọc thông tin mới nhất…'));refresh();}
function refresh(){if(!openId||busy)return;busy=true;var id=openId,seq=++request;
 rpc('kulChiTietDoi',[auth,id],function(t){if(seq!==request||id!==openId)return;busy=false;render(t);},function(e){if(seq!==request||id!==openId)return;busy=false;var b=box();b.appendChild(node('p',e.message));var retry=node('button','Thử lại');retry.onclick=refresh;b.appendChild(retry);});}
function render(t){var b=box();b.appendChild(node('h2',t.name));b.appendChild(node('p','Nhóm '+t.nhom));
 function line(label,value){var p=node('div');p.className='kul-line';p.appendChild(node('strong',label+': '));p.appendChild(node('span',value));b.appendChild(p);}
 line('Trang phục',t.trangPhuc||'Chưa ghi nhận');
 line('Thuê đồ',t.thue.coThue?(t.thue.soBo?t.thue.soBo+' bộ':'Có khoản thuê nhập trong danh sách'):'Chưa ghi nhận đơn thuê đang hiệu lực');
 t.thue.don.forEach(function(d){line('Mẫu / màu',d.soBo+' bộ · '+(d.mau||'Chưa ghi mẫu')+' · '+(d.mauSac||'Chưa ghi màu'));});
 line('Thẻ vàng',String(t.the.vang));line('Thẻ đỏ',String(t.the.do));
 if(t.the.tran.length){var details=node('details');details.appendChild(node('summary','Xem thẻ theo trận'));t.the.tran.forEach(function(r){details.appendChild(node('p',r.ma+': '+r.vang+' vàng, '+r.do+' đỏ'));});b.appendChild(details);}
 if(t.cauThu&&!t.cauThu.length&&auth.role==='referee'){var kc=node('p','👥 Đội chưa nộp danh sách cầu thủ cho BTC.');kc.className='kul-warn';b.appendChild(kc);}
 if(t.cauThu&&t.cauThu.length){var ANH=window.KUL_ANH||(window.KUL_ANH={}),soOk=t.cauThu.filter(function(c){return c.trangThai==='Đã duyệt';}).length,sec=node('div');sec.className='kul-line';
  var soCho=t.cauThu.filter(function(c){return c.trangThai==='Chờ duyệt';}).length,soTc=t.cauThu.filter(function(c){return c.trangThai==='Từ chối';}).length;
  sec.appendChild(node('strong','Cầu thủ đăng ký: '+t.cauThu.length));
  sec.appendChild(node('div','✅ '+soOk+' đã duyệt'+(soCho?' · ⏳ '+soCho+' chờ duyệt':'')+(soTc?' · ❌ '+soTc+' bị từ chối':'')));
  var chua=t.cauThu.filter(function(c){return c.trangThai!=='Đã duyệt';});
  if(chua.length){var cb=node('p','⚠ Chưa được BTC duyệt: '+chua.map(function(c){return ((c.soAo===''||c.soAo==null)?'':'#'+c.soAo+' ')+c.ten;}).join(', '));cb.className='kul-warn';cb.style.cssText='background:#fde7ea;color:#c4001a;font-weight:700';sec.appendChild(cb);}
  var grid=node('div');grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-top:8px';
  t.cauThu.forEach(function(c){var it=node('div');it.style.cssText='border:1px solid #e3e7ee;border-radius:9px;padding:6px;font-size:13px;'+(c.trangThai==='Đã duyệt'?'':'background:#fde7ea');
   var im=node('img');im.alt='';im.setAttribute('data-ct',c.id);im.style.cssText='width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:6px;background:#eef1f4;display:'+(ANH[c.id]?'block':'none');if(ANH[c.id])im.src=ANH[c.id];it.appendChild(im);
   var dong=node('div',((c.soAo===''||c.soAo==null)?'–':c.soAo)+' · '+c.ten);dong.style.fontWeight='700';it.appendChild(dong);
   it.appendChild(node('small',c.namSinh+' · '+(c.trangThai==='Đã duyệt'?'✅ đã duyệt':c.trangThai==='Từ chối'?'❌ từ chối':'⏳ chưa duyệt')+(c.dungTuoi===false?' · ⚠ sai lứa tuổi':'')+(c.vang?' · 🟨'+c.vang:'')+(c.do?' · 🟥'+c.do:'')));
   if(c.do){var dd=node('div','⛔ Có thẻ đỏ — kiểm tra treo giò');dd.style.cssText='color:#c4001a;font-weight:800;font-size:12px';it.appendChild(dd);it.style.borderColor='#c4001a';}grid.appendChild(it);});
  sec.appendChild(grid);
  if(!t.cauThu.every(function(c){return ANH[c.id];})){var nut=node('button','Xem ảnh cầu thủ');nut.onclick=function(){nut.disabled=true;nut.textContent='Đang tải ảnh…';
   rpc('kulAnhCauThu',[auth,t.id],function(ds){ds.forEach(function(x){if(!x.anh)return;ANH[x.id]=x.anh;var im=b.querySelector('img[data-ct="'+x.id+'"]');if(im){im.src=x.anh;im.style.display='block';}});nut.style.display='none';},function(e){nut.disabled=false;nut.textContent='Thử lại';});};sec.appendChild(nut);}
  b.appendChild(sec);}
 if(t.duLieuThieu){var warning=node('p','Đội có trong lịch nhưng chưa có dòng khớp nhóm + tên tại Danh sách đội. BTC cần bổ sung để tính đúng tiền giải.');warning.className='kul-warn';b.appendChild(warning);}
 b.appendChild(node('small','Cập nhật '+new Date(t.capNhat).toLocaleTimeString('vi-VN')+' · tự làm mới mỗi 15 giây khi đang mở'));
 var refreshButton=node('button','Làm mới');refreshButton.onclick=refresh;b.appendChild(refreshButton);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
