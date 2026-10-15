// Original vector illustrations used only as clearly labelled starter content.
import { importAsset } from './lib/assets-store.mjs';
import { mkdtempSync,writeFileSync,rmSync,existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const examples=[
  ['window-light','窗边微光','一幅窗边阳光与植物的示例插画','#e9e5da','<rect x="230" y="100" width="450" height="500" rx="220" fill="#eeeae1" stroke="#929d8b" stroke-width="3"/><path d="M455 110v480M240 340h430" stroke="#a2a996" stroke-width="3"/><circle cx="520" cy="260" r="80" fill="#d6ad8d"/><path d="M0 650Q450 390 1200 610V900H0" fill="#c8cbbd"/><path d="M840 750V400M840 550Q670 510 740 390Q890 420 840 550M840 610Q1020 560 950 460Q800 470 840 610" fill="#7b8c76" stroke="#65735f" stroke-width="6"/><path d="M740 700h210l-30 130H770z" fill="#b18a72"/>'],
  ['quiet-hills','山间留白','一幅远山与小路的示例插画','#e7e8de','<circle cx="890" cy="230" r="100" fill="#d9b795"/><path d="M0 530L300 220L690 600L1000 350L1200 500V900H0" fill="#acb6a1"/><path d="M0 640L360 420L670 680L1040 470L1200 630V900H0" fill="#84957f"/><path d="M0 770Q400 530 1200 730V900H0" fill="#667d67"/><path d="M600 900Q420 730 670 670Q800 620 720 570" fill="none" stroke="#ded5bc" stroke-width="42"/>'],
  ['reading-table','阅读时分','一幅书本、茶杯与桌面的示例插画','#ece4d7','<rect y="560" width="1200" height="340" fill="#c9b19a"/><path d="M170 370Q360 330 550 420L530 720Q320 620 130 660z" fill="#f8f5e9" stroke="#a9957e" stroke-width="3"/><path d="M550 420Q740 320 900 370L940 660Q710 640 530 720z" fill="#f0ecdc" stroke="#a9957e" stroke-width="3"/><path d="M530 720L550 420M230 440l230 40M220 500l230 40M210 560l230 40M630 440l170-30M620 500l180-30M610 560l190-30" stroke="#b1b3a2" stroke-width="5"/><ellipse cx="980" cy="710" rx="110" ry="25" fill="#ad9785"/><path d="M910 570h130v100a65 30 0 0 1-130 0z" fill="#e1e3d6"/><path d="M1040 590q100 0 0 65" fill="none" stroke="#e1e3d6" stroke-width="16"/><ellipse cx="975" cy="570" rx="65" ry="22" fill="#8c7865"/><path d="M960 510q-30-50 0-90M1000 510q-30-50 0-90" stroke="#c5baa7" stroke-width="7" fill="none"/>'],
];
const dir=mkdtempSync(join(tmpdir(),'journal-illustrations-'));
try{
  for(const [id,title,alt,color,art] of examples){
    if(existsSync('src/data/assets.json')&&JSON.parse((await import('node:fs')).readFileSync('src/data/assets.json','utf8')).some(a=>a.id===id))continue;
    const file=join(dir,id+'.svg');writeFileSync(file,'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><rect width="1200" height="900" fill="'+color+'"/>'+art+'</svg>');
    await importAsset(process.cwd(),file,{id,title,alt,caption:'本站绘制的示例插画，可替换为自己的照片。'});
  }
}finally{rmSync(dir,{recursive:true});}
