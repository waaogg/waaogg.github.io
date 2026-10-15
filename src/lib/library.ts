import {parseLibrary,limitReading,type LibraryState} from './library-state';
const key='journal-library-v1';
type CatalogItem={id:string;path:string;title:string;kind:string;label:string};
function read(){try{return parseLibrary(localStorage.getItem(key));}catch{return parseLibrary(null);}}
function write(state:LibraryState){try{localStorage.setItem(key,JSON.stringify(limitReading(state)));return true;}catch{return false;}}
function notify(message:string){const el=document.querySelector<HTMLElement>('[data-library-toast]');if(el){el.hidden=false;el.textContent=message;}}
export function setupLibrary(signal:AbortSignal){
  const catalog:CatalogItem[]=JSON.parse(document.getElementById('library-catalog')?.textContent||'[]');
  const known=new Map(catalog.map(item=>[item.id,item]));
  let tab=new URLSearchParams(location.search).get('view')==='reading'?'reading':'saved';
  let toastTimer:ReturnType<typeof setTimeout>|undefined;
  signal.addEventListener('abort',()=>{if(toastTimer)clearTimeout(toastTimer);},{once:true});
  const render=()=>{
    const state=read();
    document.querySelectorAll<HTMLButtonElement>('[data-save-id]').forEach(button=>{const saved=Object.hasOwn(state.saved,button.dataset.saveId!);button.setAttribute('aria-pressed',String(saved));button.querySelector('[data-save-label]')!.textContent=saved?'已收藏':'收藏';});
    document.querySelectorAll<HTMLElement>('[data-topic-progress]').forEach(el=>{const ids:string[]=JSON.parse(el.dataset.topicProgress||'[]');el.textContent=ids.filter(id=>state.reading[id]?.complete).length+' / '+ids.length+' 篇已读';});
    document.querySelectorAll<HTMLElement>('[data-read-status]').forEach(el=>{const p=state.reading[el.dataset.readStatus!];el.textContent=p?(p.complete?'已读完':'读到 '+Math.round(p.progress)+'%'):'未读';});
    const resume=Object.entries(state.reading).filter(([id,p])=>known.has(id)&&!p.complete&&p.progress>1).sort((a,b)=>b[1].updatedAt-a[1].updatedAt)[0];
    const banner=document.querySelector<HTMLElement>('[data-resume-banner]');if(banner){banner.hidden=!resume;if(resume){const [id,p]=resume,item=known.get(id)!,link=banner.querySelector<HTMLAnchorElement>('[data-resume-link]')!;link.href=item.path+'?resume=1';link.textContent='继续读：'+item.title;banner.querySelector('[data-resume-progress]')!.textContent='已读 '+Math.round(p.progress)+'%';}}
    const rows=Array.from(document.querySelectorAll<HTMLElement>('[data-library-id]'));let count=0;
    rows.sort((a,b)=>(tab==='saved'?(state.saved[b.dataset.libraryId!]||0)-(state.saved[a.dataset.libraryId!]||0):(state.reading[b.dataset.libraryId!]?.updatedAt||0)-(state.reading[a.dataset.libraryId!]?.updatedAt||0))).forEach(row=>{
      const id=row.dataset.libraryId!,p=state.reading[id],time=state.saved[id];row.hidden=tab==='saved'?!Object.hasOwn(state.saved,id):!p;if(!row.hidden)count++;
      const link=row.querySelector<HTMLAnchorElement>('[data-library-link]')!;link.href=known.get(id)!.path+(tab==='reading'&&!p?.complete?'?resume=1':'');
      row.querySelector<HTMLElement>('[data-library-position]')!.textContent=tab==='saved'?(time?'收藏于 '+new Date(time).toLocaleDateString('zh-CN'):''):(p?(p.complete?'已读完':'已读 '+Math.round(p.progress)+'%')+' · '+new Date(p.updatedAt).toLocaleDateString('zh-CN'):'');
      row.querySelector<HTMLButtonElement>('[data-library-remove]')!.hidden=tab!=='reading';row.parentElement?.append(row);
    });
    document.querySelectorAll<HTMLElement>('[data-library-tab]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.libraryTab===tab)));
    const summary=document.querySelector('[data-library-summary]');if(summary)summary.textContent=(tab==='saved'?'收藏':'阅读记录')+' · '+count+' 项';
    const empty=document.querySelector<HTMLElement>('[data-library-empty]');if(empty){empty.hidden=count>0;empty.textContent=tab==='saved'?'还没有收藏。遇到喜欢的内容，点一下“收藏”就能留在这里。':'还没有阅读记录。打开一篇文章，阅读进度会自动记录。';}
    const clear=document.querySelector<HTMLButtonElement>('[data-library-clear]');if(clear)clear.disabled=count===0;
  };
  document.addEventListener('click',event=>{
    const button=(event.target as Element).closest<HTMLButtonElement>('button');if(!button)return;
    if(button.dataset.libraryTab){tab=button.dataset.libraryTab;const params=new URLSearchParams(location.search);params.set('view',tab);history.replaceState(history.state,'',location.pathname+'?'+params);render();return;}
    const state=read();let changed=false;
    if(button.dataset.saveId&&known.has(button.dataset.saveId)){const id=button.dataset.saveId;if(Object.hasOwn(state.saved,id))delete state.saved[id];else Object.defineProperty(state.saved,id,{value:Date.now(),enumerable:true,writable:true,configurable:true});changed=true;}
    else if(button.dataset.libraryRemove){delete state.reading[button.dataset.libraryRemove];changed=true;}
    else if(button.matches('[data-library-clear]')){if(tab==='saved')state.saved={};else state.reading={};changed=true;}
    if(changed){const ok=write(state);notify(ok?'本地记录已更新。':'此浏览器无法保存本地记录，请检查浏览器存储设置。');if(toastTimer)clearTimeout(toastTimer);toastTimer=setTimeout(()=>{document.querySelector<HTMLElement>('[data-library-toast]')?.setAttribute('hidden','');},4000);render();}
  },{signal});
  window.addEventListener('storage',e=>{if(e.key===key)render();},{signal});
  window.addEventListener('popstate',()=>{tab=new URLSearchParams(location.search).get('view')==='reading'?'reading':'saved';render();},{signal});
  render();
  const article=document.querySelector<HTMLElement>('[data-reading-id]');if(!article)return ()=>{};
  const id=article.dataset.readingId!;let timer:ReturnType<typeof setTimeout>|undefined,restoring=false,touched=false;
  const previous=read().reading[id],resumeButton=document.querySelector<HTMLButtonElement>('[data-reading-resume]');
  if(resumeButton)resumeButton.hidden=!previous||previous.progress<1||previous.complete;
  const resume=()=>{
    const p=read().reading[id];if(!p)return;
    restoring=true;const anchor=p.anchor?document.getElementById(p.anchor):null;
    window.scrollTo({top:anchor?scrollY+anchor.getBoundingClientRect().top-p.delta:p.scroll,behavior:'instant'});
    requestAnimationFrame(()=>{restoring=false;touched=true;});if(resumeButton)resumeButton.hidden=true;
  };
  resumeButton?.addEventListener('click',resume,{signal});
  if(new URLSearchParams(location.search).get('resume')==='1')requestAnimationFrame(()=>{if(!signal.aborted)resume();});
  const save=()=>{
    if(restoring||!touched||!article.isConnected)return;
    const rect=article.getBoundingClientRect(),total=Math.max(1,article.offsetHeight-innerHeight+140),progress=Math.min(100,Math.max(0,(140-rect.top)/total*100));
    if(progress<1)return;
    const anchor=Array.from(article.querySelectorAll<HTMLElement>('h2[id],h3[id]')).reverse().find(h=>h.getBoundingClientRect().top<=150);
    const state=read();Object.defineProperty(state.reading,id,{value:{progress,scroll:scrollY,anchor:anchor?.id||'',delta:anchor?.getBoundingClientRect().top||0,updatedAt:Date.now(),complete:state.reading[id]?.complete||progress>=95},enumerable:true,writable:true,configurable:true});
    write(state);
  };
  window.addEventListener('scroll',()=>{if(restoring)return;touched=true;if(timer===undefined)timer=setTimeout(()=>{timer=undefined;save();},700);},{passive:true,signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)save();},{signal});window.addEventListener('pagehide',save,{signal});
  return ()=>{if(timer!==undefined)clearTimeout(timer);save();};
}
