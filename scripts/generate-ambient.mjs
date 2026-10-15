// Two original synthesized ambient loops. No samples or remote audio dependencies.
import { mkdirSync, writeFileSync } from 'node:fs';
const rate=22050,seconds=24,samples=rate*seconds;
mkdirSync('public/audio',{recursive:true});
for(const [filename,chords] of [
  ['quiet-pages',[[130.813,164.814,196,246.942],[110,130.813,164.814,196],[87.307,110,130.813,164.814],[97.999,123.471,146.832,196]]],
  ['small-orbit',[[146.832,174.614,220,261.626],[130.813,164.814,196,246.942],[110,146.832,174.614,220],[130.813,164.814,196,261.626]]],
]){
  const pcm=Buffer.alloc(samples*2);
  for(let i=0;i<samples;i++){
    const t=i/rate,fade=Math.min(1,t/2,(seconds-t)/3);
    let value=0;
    for(let c=0;c<chords.length;c++){
      const start=c*5.5,local=t-start;
      if(local<0||local>9)continue;
      const env=Math.min(1,local/2)*Math.max(0,1-Math.max(0,local-4)/5);
      chords[c].forEach((f,n)=>{
        const vibrato=1+0.0007*Math.sin(t*1.3+n);
        value+=env*(Math.sin(2*Math.PI*f*vibrato*t)+0.15*Math.sin(2*Math.PI*f*2*t))/chords[c].length;
      });
    }
    pcm.writeInt16LE(Math.round(Math.max(-1,Math.min(1,value*0.12*fade))*32767),i*2);
  }
  const header=Buffer.alloc(44);header.write('RIFF',0);header.writeUInt32LE(36+pcm.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(rate,24);header.writeUInt32LE(rate*2,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
  writeFileSync('public/audio/'+filename+'.wav',Buffer.concat([header,pcm]));
}
console.log('Generated two original ambient audio files.');
