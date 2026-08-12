const R=Math.PI/180;
function doy(d:Date){const s=Date.UTC(d.getUTCFullYear(),0,0),n=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());return Math.floor((n-s)/86400000)}
function event(date:Date,lat:number,lon:number,z:number,rise:boolean){
 const N=doy(date),lng=lon/15,t=N+((rise?6:18)-lng)/24,M=.9856*t-3.289;
 let L=(M+1.916*Math.sin(M*R)+.02*Math.sin(2*M*R)+282.634+360)%360;
 let RA=Math.atan(.91764*Math.tan(L*R))/R;RA=(RA+360)%360;RA+=(Math.floor(L/90)*90)-(Math.floor(RA/90)*90);RA/=15;
 const sd=.39782*Math.sin(L*R),cd=Math.cos(Math.asin(sd)),ch=(Math.cos(z*R)-sd*Math.sin(lat*R))/(cd*Math.cos(lat*R));
 if(ch>1||ch<-1)return null;
 const H=(rise?360-Math.acos(ch)/R:Math.acos(ch)/R)/15;
 let u=(H+RA-.06571*t-6.622-lng)%24;if(u<0)u+=24;
 return new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate(),Math.floor(u),Math.round((u%1)*60)));
}
export function getLightTimes(d:Date,lat:number,lon:number){
 return {firstLight:event(d,lat,lon,96,true),sunrise:event(d,lat,lon,90.833,true),sunset:event(d,lat,lon,90.833,false),lastLight:event(d,lat,lon,96,false)};
}