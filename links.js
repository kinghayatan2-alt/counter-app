import {LINK_KEY,normalizeURL,readLinks,fallbackName,exchange,createRequestGuard,siteName} from './links-model.js';
const $=id=>document.getElementById(id),guard=createRequestGuard();
let storage;try{storage=localStorage;}catch{}
let links=readLinks(storage),editing=false,selected=null,slot=null,controller=null;
function save(){try{storage.setItem(LINK_KEY,JSON.stringify(links));$('links-status').textContent='';}catch{$('links-status').textContent='保存できません。この画面を閉じるとリンクが失われる場合があります。';}}
function button(text,action,className=''){const b=document.createElement('button');b.type='button';b.textContent=text;b.className=className;b.addEventListener('click',action);return b;}
function icon(item){const box=document.createElement('span');box.className='link-icon';box.setAttribute('aria-hidden','true');box.textContent='🌐';if(item){const img=document.createElement('img');img.alt='';img.referrerPolicy='no-referrer';img.addEventListener('load',()=>box.replaceChildren(img));img.addEventListener('error',()=>{box.textContent='🌐';});img.src=new URL('/favicon.ico',item.url).href;}return box;}
function render(){
 $('links-grid').replaceChildren();$('links-edit').textContent=editing?'完了':'編集';$('links-edit').setAttribute('aria-pressed',String(editing));
 $('links-hint').textContent=editing?(selected===null?'枠をタップして登録・編集。「交換」を押してから交換先の枠をタップします。':'交換先の枠をタップしてください。同じ枠で取り消します。'):'登録したリンクをタップして開きます。';
 links.forEach((item,i)=>{const card=document.createElement('article');card.className='link-slot'+(item?'':' link-empty')+(selected===i?' selected':'');
 let main;if(editing){main=button('',()=>{if(selected!==null){if(selected!==i){links=exchange(links,selected,i);save();}selected=null;render();}else openEditor(i);},'link-main');}else if(item){main=document.createElement('a');main.className='link-open';main.href=item.url;main.target='_blank';main.rel='noopener noreferrer';}else{main=document.createElement('div');main.className='link-main';}
 const label=document.createElement('span');label.className='link-label';label.textContent=item?(item.name||fallbackName(item.url)):(editing?'＋ 登録':'未登録');main.append(icon(item),label);card.append(main);
 if(editing&&item){const actions=document.createElement('div');actions.className='link-actions';actions.append(button(selected===i?'取消':'交換',()=>{selected=selected===i?null:i;render();}),button('削除',()=>{links[i]=null;selected=null;save();render();},'link-delete'));card.append(actions);}
 $('links-grid').append(card);});
}
function invalidate(){guard.next();controller?.abort();controller=null;}
function openEditor(i){invalidate();slot=i;$('link-url').value=links[i]?.url||'';$('link-name').value=links[i]?.name||'';$('link-dialog-title').textContent=links[i]?'リンクを編集':'リンクを登録';$('link-form-error').textContent='';$('link-dialog').showModal();$('link-url').focus();}
$('links-edit').addEventListener('click',()=>{editing=!editing;selected=null;render();});
$('link-cancel').addEventListener('click',()=>$('link-dialog').close());
$('link-dialog').addEventListener('close',()=>{invalidate();slot=null;});
$('link-url').addEventListener('input',invalidate);
$('link-url').addEventListener('change',async()=>{
 invalidate();const token=guard.next(),target=slot;let url;try{url=normalizeURL($('link-url').value);}catch{return;}
 controller=new AbortController();const requestController=controller;const timer=setTimeout(()=>requestController.abort(),3500);
 try{const name=await siteName(url,requestController.signal);if(guard.current(token)&&slot===target&&$('link-dialog').open&&!$('link-name').value.trim())$('link-name').value=name;}catch{}finally{clearTimeout(timer);}
});
$('link-form').addEventListener('submit',e=>{e.preventDefault();if(slot===null)return;let url;try{url=normalizeURL($('link-url').value);}catch{$('link-form-error').textContent='有効な http または https のURLを入力してください。';return;}links[slot]={url,name:$('link-name').value.trim().slice(0,80)||fallbackName(url)};save();$('link-dialog').close();render();});
render();
