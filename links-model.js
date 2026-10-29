export const LINK_KEY='count-compare-links-v5';
export function normalizeURL(raw){
 const value=String(raw).trim();
 const url=new URL(/^[a-z][a-z\d+.-]*:/i.test(value)?value:'https://'+value);
 if(!['http:','https:'].includes(url.protocol)||!url.hostname||url.username||url.password)throw Error('http または https のURLを入力してください。');
 return url.href;
}
export function readLinks(storage){
 let data;try{data=JSON.parse(storage.getItem(LINK_KEY)||'null');}catch{}
 return Array.from({length:6},(_,i)=>{const item=data?.[i];try{return item&&typeof item.url==='string'?{url:normalizeURL(item.url),name:typeof item.name==='string'?item.name.slice(0,80):''}:null;}catch{return null;}});
}
export function fallbackName(url){return new URL(url).hostname.replace(/^www\./,'');}
export function exchange(links,from,to){const next=links.slice(0,6);[next[from],next[to]]=[next[to],next[from]];return next;}
// Only the most recently opened/edited dialog may receive metadata.
export function createRequestGuard(){let generation=0;return {next:()=>++generation,current:token=>token===generation};}
export async function siteName(url,signal){
 const response=await fetch(url,{mode:'cors',credentials:'omit',referrerPolicy:'no-referrer',signal});
 if(!response.ok)throw Error('取得できません');
 const doc=new DOMParser().parseFromString((await response.text()).slice(0,300000),'text/html');
 return (doc.querySelector('meta[property="og:site_name"]')?.content||doc.title||'').trim().slice(0,80);
}
