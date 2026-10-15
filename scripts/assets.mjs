import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { importAsset,readAssets } from './lib/assets-store.mjs';
const [command,file,...flags]=process.argv.slice(2),root=process.cwd();
try{
  if(command==='list')console.log(JSON.stringify(readAssets(root),null,2));
  else if(command==='validate'){
    const assets=readAssets(root),ids=new Set();
    for(const asset of assets){if(ids.has(asset.id))throw Error('Duplicate asset id');ids.add(asset.id);for(const v of asset.variants){if(!existsSync(resolve(root,'public'+v.src)))throw Error('Missing image variant: '+v.src);}}
    console.log('Validated '+assets.length+' shared image assets.');
  }else if(command==='import'){
    const options={};for(let i=0;i<flags.length;i+=2){if(!flags[i].startsWith('--')||flags[i+1]===undefined)throw Error('Use --key value');options[flags[i].slice(2)]=flags[i+1];}
    const asset=await importAsset(root,resolve(file),options);
    console.log(JSON.stringify({assetId:asset.id,src:asset.src,markdown:'!['+asset.alt+'](asset:'+asset.id+')',variants:asset.variants.length},null,2));
  }else console.log('npm run assets -- import <local-image> --id stable-id --alt "图片说明" [--title "标题"] [--x 50 --y 50 --fit contain]\nnpm run assets -- list\nnpm run assets -- validate\nImages are auto-oriented, resized and stripped of source metadata. Original files are not copied into the public site.');
}catch(error){console.error(error.message);process.exitCode=1;}
