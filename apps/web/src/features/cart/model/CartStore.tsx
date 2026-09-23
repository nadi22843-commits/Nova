import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
type Ctx={ids:string[];toggle:(id:string)=>void};
const CartContext=createContext<Ctx|null>(null);
const KEY='nova.cart';
function readIds(){try{const v=JSON.parse(localStorage.getItem(KEY)??'[]');return Array.isArray(v)?v.filter((x):x is string=>typeof x==='string'):[]}catch{return []}}
export function CartProvider({children}:{children:ReactNode}){const [ids,setIds]=useState<string[]>(readIds);useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(ids))}catch{}},[ids]);const value=useMemo(()=>({ids,toggle:(id:string)=>setIds(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])}),[ids]);return <CartContext.Provider value={value}>{children}</CartContext.Provider>}
export function useCart(){const c=useContext(CartContext);if(!c)throw new Error('CartProvider missing');return c}
