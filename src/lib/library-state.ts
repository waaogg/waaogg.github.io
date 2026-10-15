export interface ReadingPosition { progress:number; scroll:number; anchor:string; delta:number; updatedAt:number; complete:boolean; }
export interface LibraryState { version:1; saved:Record<string,number>; reading:Record<string,ReadingPosition>; }
export const emptyLibrary=():LibraryState=>({version:1,saved:{},reading:{}});
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
export function parseLibrary(raw:string|null):LibraryState{
  try{
    const data=JSON.parse(raw||'null');if(!data||data.version!==1)return emptyLibrary();
    const result=emptyLibrary();
    for(const [id,time] of Object.entries(data.saved||{})){if(id.length<200&&finite(time)&&time>0)Object.defineProperty(result.saved,id,{value:time,enumerable:true,writable:true,configurable:true});}
    for(const [id,value] of Object.entries(data.reading||{})){
      const p=value as ReadingPosition;
      if(id.length<200&&p&&finite(p.progress)&&finite(p.scroll)&&finite(p.updatedAt)&&p.updatedAt>0&&typeof p.anchor==='string'&&finite(p.delta))Object.defineProperty(result.reading,id,{value:{progress:Math.max(0,Math.min(100,p.progress)),scroll:Math.max(0,p.scroll),anchor:p.anchor.slice(0,300),delta:p.delta,updatedAt:p.updatedAt,complete:p.complete===true},enumerable:true,writable:true,configurable:true});
    }return result;
  }catch{return emptyLibrary();}
}
export function limitReading(state:LibraryState){
  const entries=Object.entries(state.reading).sort((a,b)=>b[1].updatedAt-a[1].updatedAt).slice(0,100);
  return {...state,reading:Object.fromEntries(entries)};
}
