import raw from '../data/assets.json';
import { assetSchema } from './schemas';
export const assets = raw.map(item => assetSchema.parse(item));
export function getAsset(id:string) {
  const asset=assets.find(item=>item.id===id);
  if(!asset)throw new Error('Unknown image asset: '+id);
  return asset;
}
