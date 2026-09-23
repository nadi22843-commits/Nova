import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
type Ctx={ids:string[];toggle:(id:string)=>void};
const FavoritesContext=createContext<Ctx|null>(null);
const KEY='nova.favorites';
function readIds(){try{const v=JSON.parse(localStorage.getItem(KEY)??'[]');return Array.isArray(v)?v.filter((x):x is string=>typeof x==='string'):[]}catch{return []}}
export function FavoritesProvider({children}:{children:ReactNode}){const [ids,setIds]=useState<string[]>(readIds);useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(ids))}catch{}},[ids]);const value=useMemo(()=>({ids,toggle:(id:string)=>setIds(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])}),[ids]);return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>}
export function useFavorites(){const c=useContext(FavoritesContext);if(!c)throw new Error('FavoritesProvider missing');return c}
