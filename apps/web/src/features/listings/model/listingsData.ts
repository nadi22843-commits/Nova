/**
 * Витринные примеры (старый формат, до перехода на каталог категорий).
 *
 * Цена хранится числом и в рублях (эти объявления не привязаны к стране),
 * а показывается через formatMoney — так же, как и весь остальной каталог,
 * без жёсткого символа валюты в тексте.
 */
export type Listing={id:string,title:string,price:number,location:string,category:string,image:string};
export const listings:Listing[]=[
{id:'9',title:'BMW 5 серия, 2018',price:1850000,location:'Москва',category:'Авто',image:'/assets/car.jpg'},
{id:'4',title:'Квартира студия, 28 м²',price:45000,location:'Сочи',category:'Недвижимость',image:'/assets/apartment.jpg'},
{id:'2',title:'iPhone 14 Pro, 256 ГБ',price:89000,location:'Москва',category:'Электроника',image:'/assets/phone.jpg'},
{id:'3',title:'MacBook Air M2, 256 ГБ',price:129000,location:'Москва',category:'Электроника',image:'/assets/laptop.jpg'},
{id:'10',title:'Nike Air Force 1',price:6500,location:'Санкт-Петербург',category:'Одежда',image:'/assets/shoes.jpg'},
{id:'5',title:'Дом 120 м² с участком',price:12000000,location:'Казань',category:'Недвижимость',image:'/assets/house.jpg'},
];
