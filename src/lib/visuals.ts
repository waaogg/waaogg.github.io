interface VisualOptions { signal:AbortSignal; openDialog:(dialog:HTMLDialogElement)=>void; }
export function setupVisuals({signal,openDialog}:VisualOptions){
  document.querySelectorAll<HTMLElement>('[data-moment-deck]').forEach(deck=>{
    const cards=Array.from(deck.querySelectorAll<HTMLElement>('[data-moment-card]')),surface=deck.querySelector<HTMLElement>('[data-deck-surface]')!;
    let current=0,startX=0,startY=0,dx=0,pointer:number|undefined,horizontal=false,suppressClick=false;
    const show=(index:number)=>{
      current=(index+cards.length)%cards.length;
      cards.forEach((card,i)=>{const distance=(i-current+cards.length)%cards.length;card.dataset.position=['front','behind-one','behind-two'][distance]||'away';card.inert=distance!==0;card.setAttribute('aria-hidden',String(distance!==0));card.style.removeProperty('--drag');card.style.removeProperty('--tilt');});
      const status=deck.querySelector('[data-deck-status]');if(status)status.textContent=String(current+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
    };
    deck.querySelector<HTMLElement>('[data-deck-controls]')?.removeAttribute('hidden');
    deck.querySelector('[data-deck-prev]')?.addEventListener('click',()=>show(current-1),{signal});
    deck.querySelectorAll('[data-deck-next]').forEach(button=>button.addEventListener('click',()=>show(current+1),{signal}));
    // Behind cards are inert. A separate surface hit-test keeps them visible without
    // exposing inactive controls to keyboard or screen-reader users.
    surface.addEventListener('pointerdown',e=>{
      if(cards.length<2||e.button!==0||(e.target as Element).closest('a'))return;
      startX=e.clientX;startY=e.clientY;dx=0;horizontal=false;pointer=e.pointerId;
    },{signal});
    surface.addEventListener('pointermove',e=>{
      if(pointer!==e.pointerId)return;
      dx=e.clientX-startX;const dy=e.clientY-startY;
      if(!horizontal&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>10){pointer=undefined;return;}
      if(!horizontal&&Math.abs(dx)>10){horizontal=true;surface.setPointerCapture(e.pointerId);surface.classList.add('is-dragging');}
      if(horizontal){e.preventDefault();cards[current].style.setProperty('--drag',Math.max(-180,Math.min(180,dx))+'px');cards[current].style.setProperty('--tilt',Math.max(-12,Math.min(12,dx/16))+'deg');}
    },{signal});
    const finish=(e:PointerEvent,cancel=false)=>{
      if(pointer!==e.pointerId)return;
      if(horizontal){suppressClick=true;if(!cancel&&Math.abs(dx)>Math.min(70,surface.clientWidth*.2))show(current+(dx<0?1:-1));else show(current);}
      surface.classList.remove('is-dragging');if(surface.hasPointerCapture(e.pointerId))surface.releasePointerCapture(e.pointerId);pointer=undefined;horizontal=false;
    };
    surface.addEventListener('pointerup',e=>finish(e),{signal});
    surface.addEventListener('pointercancel',e=>finish(e,true),{signal});
    surface.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopPropagation();suppressClick=false;}},{capture:true,signal});
    // A new pointer gesture clears suppression if the preceding drag produced no click.
    surface.addEventListener('pointerdown',()=>{suppressClick=false;},{capture:true,signal});
    deck.addEventListener('keydown',e=>{if((e.key==='ArrowLeft'||e.key==='ArrowRight')&&cards.length>1){e.preventDefault();show(current+(e.key==='ArrowRight'?1:-1));}},{signal});
    show(0);
  });
  const dialog=document.querySelector<HTMLDialogElement>('#image-dialog');if(!dialog)return;
  const image=dialog.querySelector('img')!,caption=dialog.querySelector<HTMLElement>('[data-image-caption]')!,error=dialog.querySelector<HTMLElement>('[data-image-error]')!,position=dialog.querySelector<HTMLElement>('[data-image-position]')!;
  let group:HTMLElement[]=[],active=0;
  const showImage=(index:number)=>{
    if(!group.length)return;active=(index+group.length)%group.length;
    const source=group[active],img=source instanceof HTMLImageElement?source:source.querySelector('img');if(!img)return;
    error.hidden=true;image.hidden=false;image.alt=img.alt;image.src=img.dataset.fullSrc||img.currentSrc||img.src;
    caption.textContent=source.dataset.caption||img.alt;position.textContent=(active+1)+' / '+group.length;
    dialog.querySelectorAll<HTMLButtonElement>('[data-image-prev],[data-image-next]').forEach(b=>b.hidden=group.length<2);
  };
  image.addEventListener('error',()=>{error.hidden=false;image.hidden=true;},{signal});
  image.addEventListener('load',()=>{error.hidden=true;image.hidden=false;},{signal});
  document.addEventListener('click',e=>{
    const target=e.target as Element;
    const explicit=target.closest<HTMLElement>('[data-image-open]');
    const inline=target instanceof HTMLImageElement&&target.closest('#article-content, .memo-gallery, .memo-content')?target:null;
    const source=explicit||inline;if(!source)return;
    e.preventDefault();
    if(explicit){group=Array.from(document.querySelectorAll<HTMLElement>('[data-image-open]')).filter(el=>el.dataset.imageGroup===explicit.dataset.imageGroup&&!el.closest('[hidden]'));}
    else {const container=source.closest('#article-content,.memo-gallery,.memo-content')!;group=Array.from(container.querySelectorAll<HTMLImageElement>('img'));}
    active=Math.max(0,group.indexOf(source));showImage(active);openDialog(dialog);
  },{signal});
  dialog.querySelector('[data-image-prev]')?.addEventListener('click',()=>showImage(active-1),{signal});
  dialog.querySelector('[data-image-next]')?.addEventListener('click',()=>showImage(active+1),{signal});
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();showImage(active+(e.key==='ArrowRight'?1:-1));}},{signal});
  dialog.addEventListener('close',()=>{image.removeAttribute('src');group=[];},{signal});
}
