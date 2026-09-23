import { setUserItems, type CatalogItem } from '../../../categories/core/catalogData';
import type { DealType } from '../../../categories/core/types';
const KEY='nova.userListings.v1';
export type UserListing=CatalogItem&{owner:true;status:'active'|'paused';updatedAt:string};
function read():UserListing[]{try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x.filter((i:any)=>i&&typeof i.id==='string'&&typeof i.title==='string'&&typeof i.price==='number'&&i.seller&&i.attrs):[]}catch{return[]}}
function commit(items:UserListing[]){try{localStorage.setItem(KEY,JSON.stringify(items))}catch{} setUserItems(items.filter(x=>x.status==='active'));window.dispatchEvent(new Event('nova:user-listings'))}
export const loadUserListings=read;
export function initUserListings(){setUserItems(read().filter(x=>x.status==='active'))}
export function createUserListing(input:{categoryId:string;subcategoryId:string;deal:DealType;title:string;price:number;currency:string;countryCode:string;placeId:string;lat?:number;lon?:number;attrs:Record<string,string>;image?:string}){const now=new Date().toISOString();const item:UserListing={id:`user-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,...input,image:input.image||'/assets/placeholder.jpg',publishedAt:now.slice(0,10),seller:{name:localStorage.getItem('nova.profile.name')||'Пользователь Nova',kind:'owner',verified:false},owner:true,status:'active',updatedAt:now};commit([item,...read()]);return item}
export function updateUserListing(id:string,patch:Partial<Pick<UserListing,'title'|'price'|'attrs'|'status'>>){commit(read().map(x=>x.id===id?{...x,...patch,updatedAt:new Date().toISOString()}:x))}
export function deleteUserListing(id:string){commit(read().filter(x=>x.id!==id))}
