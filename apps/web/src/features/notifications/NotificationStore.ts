export type NovaNotification={id:string;title:string;body:string;createdAt:string;read:boolean;href?:string};
const KEY='nova.notifications.v1';
export function readNotifications():NovaNotification[]{try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
export function pushNotification(title:string,body:string,href?:string){const next=[{id:`n-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,title,body,createdAt:new Date().toISOString(),read:false,href},...readNotifications()].slice(0,100);try{localStorage.setItem(KEY,JSON.stringify(next))}catch{} window.dispatchEvent(new Event('nova:notifications'))}
export function markAllRead(){try{localStorage.setItem(KEY,JSON.stringify(readNotifications().map(x=>({...x,read:true}))))}catch{} window.dispatchEvent(new Event('nova:notifications'))}
