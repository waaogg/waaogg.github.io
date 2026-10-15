export function setupCollectionFilters(signal:AbortSignal){
  document.querySelectorAll<HTMLFormElement>('[data-collection-filters]').forEach(form=>{
    const name=form.dataset.results,rows=Array.from(document.querySelectorAll<HTMLElement>('[data-filter-row="'+name+'"]'));
    const inputs=Array.from(form.querySelectorAll<HTMLSelectElement>('select[name]'));
    const read=()=>{const params=new URLSearchParams(location.search);inputs.forEach(input=>{input.value=params.get(input.name)||'';if(input.selectedIndex<0)input.value='';});};
    const render=(write=true)=>{
      let count=0;rows.forEach(row=>{const match=inputs.every(input=>{if(!input.value)return true;const raw=row.dataset[input.name]||'';return raw.startsWith('[')?JSON.parse(raw).includes(input.value):raw===input.value;});row.hidden=!match;if(match)count++;});
      const empty=document.querySelector<HTMLElement>('[data-filter-empty="'+name+'"]');if(empty)empty.hidden=count>0;
      form.querySelector('[data-filter-count]')!.textContent='展示 '+count+' 项';
      if(write){const params=new URLSearchParams(location.search);inputs.forEach(input=>input.value?params.set(input.name,input.value):params.delete(input.name));history.replaceState(history.state,'',location.pathname+(params.size?'?'+params:'')+location.hash);}
    };
    form.addEventListener('change',()=>render(),{signal});form.addEventListener('submit',e=>e.preventDefault(),{signal});
    form.addEventListener('reset',e=>{e.preventDefault();inputs.forEach(input=>input.value='');render();},{signal});
    window.addEventListener('popstate',()=>{read();render(false);},{signal});read();render(false);
  });
}
