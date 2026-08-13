export enum MaterialUnit { m2='m2', kg='kg', meter='meter', ml='ml', unit='unit', pcs='pcs', gram='gram', liter='liter' }
export function convertMaterialQuantity(v:number,f:MaterialUnit,t:MaterialUnit,o?:{rollWidthMeters?:number}):number{
 if(f===t) return v;
 if(f===MaterialUnit.gram&&t===MaterialUnit.kg) return v/1000;
 if(f===MaterialUnit.kg&&t===MaterialUnit.gram) return v*1000;
 if(f===MaterialUnit.ml&&t===MaterialUnit.liter) return v/1000;
 if(f===MaterialUnit.liter&&t===MaterialUnit.ml) return v*1000;
 if(f===MaterialUnit.m2&&t===MaterialUnit.meter){const w=o?.rollWidthMeters; if(!w||w<=0) throw new Error('rollWidthMeters required'); return v/w;}
 if(f===MaterialUnit.meter&&t===MaterialUnit.m2){const w=o?.rollWidthMeters; if(!w||w<=0) throw new Error('rollWidthMeters required'); return v*w;}
 const counts=new Set([MaterialUnit.unit,MaterialUnit.pcs]); if(counts.has(f)&&counts.has(t)) return v;
 throw new Error(Incompatible conversion ->);
}
export function getAllowedUnitsForMaterialType(t:string){switch(t){case 'liquid':return [MaterialUnit.ml,MaterialUnit.liter,MaterialUnit.unit,MaterialUnit.pcs];case 'roll':return [MaterialUnit.m2,MaterialUnit.meter];case 'solid':return [MaterialUnit.kg,MaterialUnit.gram,MaterialUnit.unit,MaterialUnit.pcs];case 'consumable':return [MaterialUnit.unit,MaterialUnit.pcs,MaterialUnit.ml,MaterialUnit.liter];default:return Object.values(MaterialUnit);} }
