/**
 * Цена хранится числом (не строкой с «₽»), поэтому экраны форматируют её
 * через formatMoney/Intl.NumberFormat под текущую страну и язык — как и
 * остальные денежные значения в приложении.
 */
export type NovaShort={id:string;title:string;price:number;priceFrom?:boolean;seller:string;duration:string;image:string};
export const shortsDemo:NovaShort[]=[
{id:'short-1',title:'Диван Skandi Modern',price:25990,seller:'@interior.house',duration:'0:15',image:'/assets/short-sofa.jpg'},
{id:'short-2',title:'iPhone 14 Pro',price:89000,seller:'@apple.store',duration:'0:15',image:'/assets/short-phone.jpg'},
{id:'short-3',title:'BMW 5 серия',price:1850000,seller:'@auto_ger',duration:'0:15',image:'/assets/short-car.jpg'},
{id:'short-4',title:'Nike Air Force 1',price:6500,seller:'@sneakershop',duration:'0:15',image:'/assets/short-shoes.jpg'},
{id:'short-5',title:'MacBook Air M2',price:129000,seller:'@techno.zone',duration:'0:15',image:'/assets/short-laptop.jpg'},
{id:'short-6',title:'Кухня на заказ',price:45000,priceFrom:true,seller:'@kuhni.top',duration:'0:15',image:'/assets/short-kitchen.jpg'},
{id:'short-7',title:'Горный велосипед',price:18900,seller:'@velo_market',duration:'0:15',image:'/assets/short-bike.jpg'},
{id:'short-8',title:'Сумка кожаная',price:7900,seller:'@bag.style',duration:'0:15',image:'/assets/short-bag.jpg'},
];
