// import bcrypt from "bcrypt"

// const pwd = "Ser1234"
// const salt = await bcrypt.genSalt();
// const hash = await bcrypt.hash(pwd, salt)

// //console.log(hash, valid);
// const hashArray = [
// '$2b$10$8bx8zoC8dKcvf3mlTkj9EOFaseY68UNIBIxC1b5ogynCirnkdEMNe',
// '$2b$10$InMjVT9qw5sL1LXK2tE2gujuemNSuYbE5qcxMlOsLRuGYyKyyIURK',
// "$2b$10$VKG/DJT0CJ71eU2pMqjMl.Trgd2T0SKIFRHXWaAaqqY5exycwIAVS",
// "$2b$10$TiHOzfsWDcVbk0Z.ANbzWei4yElB1feEWA8ojZcNSkWH3m04TxfoO"
// ];

// // for (let index = 0; index < 20; index++) {
// //     const pwd = "Ser1234"
// //     const salt = await bcrypt.genSalt();
// //     const hash = await bcrypt.hash(pwd, salt)
// //     hashArray.push(hash)
// //     const letsSee = await bcrypt.compare(pwd, hashArray[index --])
// //     console.log("is it true.... ", letsSee);
// // }
// const valid = await bcrypt.compare(pwd, hash)
// console.log(valid, hash);


// const hour = new Date().getHours()
// const min = new Date().getMinutes()
// const time = `${hour}${min}` 
// console.log(2340 == time);


// const info = {
//     name: "Somcha",
//     age: 29,
//     addrerss: ""
// }
// const {name, age, addrerss} = info
// const onlyIfInfo = {
//     ...(name && {name}),
//     ...(age && {age}),
//     ...(addrerss && {addrerss}),
// }

// console.log(onlyIfInfo);

// const array = ["a", 1, 2,3 ]

// const copyArray = [...array]
// const computed = () =>{
//     const baseArray = [
//         1, 2, 3, 4, 5 
//     ]
//     if(bool){
//         baseArray.push(6)
//     }
//     return baseArray
// }

// let bool = false;
// console.log(computed());
// bool = true;
// console.log(computed());




const monthly = [
    {
        amount_id: 2,
        user: 8,
        amount: 134,
        currency: 'eur',
        method: 'charity',
        charity_method: null,
        integrity: 1,
        description: 'yad lachim',
        heb_date: null,
        created_at: "2024-12-07T22:07:56.000Z",
        deleted_at: null
    },
    {
        amount_id: 3,
        user: 8,
        amount: 120,
        currency: 'eur',
        method: 'charity',
        charity_method: null,
        integrity: 0,
        description: 'Ichud Gur',
        heb_date: null,
        created_at: "2024-12-07T22:07:56.000Z",
        deleted_at: null
    },
    {
        amount_id: 4,
        user: 8,
        amount: 120,
        currency: 'eur',
        method: 'income',
        charity_method: null,
        integrity: 0,
        description: null,
        heb_date: null,
        created_at: "2024-12-07T22:07:56.000Z",
        deleted_at: null
    },
    {
        amount_id: 5,
        user: 8,
        amount: 120,
        currency: 'eur',
        method: 'charity',
        charity_method: null,
        integrity: 5,
        description: 'Mesivta Antwerp',
        heb_date: null,
        created_at: "2024-12-07T22:07:56.000Z",
        deleted_at: null
    },
    {
        amount_id: 6,
        user: 8,
        amount: 2300,
        currency: 'eur',
        method: 'charity',
        charity_method: 'Family',
        integrity: 3,
        description: 'ruvi chasuna',
        heb_date: null,
        created_at: "2024-12-07T22:07:56.000Z",
        deleted_at: null
    },
    {
        amount_id: 7,
        user: 8,
        amount: 150,
        currency: 'eur',
        method: 'charity',
        charity_method: 'Anei irchu',
        integrity: 2,
        description: 'tzadaka',
        heb_date: null,
        created_at: "2024-12-07T22:07:56.000Z",
        deleted_at: null
    },
    {
        amount_id: 8,
        user: 8,
        amount: 2300,
        currency: 'eur',
        method: 'charity',
        charity_method: 'Chasidus',
        integrity: 5,
        description: 'shtibel',
        heb_date: null,
        created_at: "2024-12-07T22:07:56.000Z",
        deleted_at: null
    },
    {
        amount_id: 9,
        user: 8,
        amount: 123,
        currency: 'eur',
        method: 'charity',
        charity_method: 'Other',
        integrity: 0,
        description: 'tzdaka',
        heb_date: null,
        created_at: "2024-12-07T22:07:56.000Z",
        deleted_at: null
    },
    {
        amount_id: 10,
        user: 8,
        amount: 345,
        currency: 'eur',
        method: 'charity',
        charity_method: 'Chasidus',
        integrity: 1,
        description: 'ichud',
        heb_date: null,
        created_at: "2024-12-07T22:07:56.000Z",
        deleted_at: null
    },
    {
        amount_id: 11,
        user: 8,
        amount: 1200,
        currency: 'eur',
        method: 'charity',
        charity_method: 'Chasidus',
        integrity: 4,
        description: 'Ichud',
        heb_date: null,
        created_at: "2024-12-08T19:19:43.000Z",
        deleted_at: null
    },
    {
        amount_id: 12,
        user: 8,
        amount: 120,
        currency: 'ils',
        method: 'charity',
        charity_method: 'Chasidus',
        integrity: 5,
        description: 'gamach bais yisroel',
        heb_date: null,
        created_at: "2024-12-09T22:35:30.000Z",
        deleted_at: null
    },
    {
        amount_id: 13,
        user: 8,
        amount: 1200,
        currency: 'usd',
        method: 'charity',
        charity_method: 'Anei irchu',
        integrity: 5,
        description: 'tikvatanu',
        heb_date: null,
        created_at: "2024-12-09T23:59:25.000Z",
        deleted_at: null
    },
    {
        amount_id: 14,
        user: 8,
        amount: 1200,
        currency: 'usd',
        method: 'charity',
        charity_method: 'Anei irchu',
        integrity: 5,
        description: 'tikvatanu',
        heb_date: null,
        created_at: "2024-12-09T23:59:27.000Z",
        deleted_at: null
    },
    {
        amount_id: 15,
        user: 8,
        amount: 455,
        currency: 'eur',
        method: 'charity',
        charity_method: 'Anei irchu',
        integrity: 5,
        description: 'tikvatainu',
        heb_date: null,
        created_at: "2024-12-10T00:00:58.000Z",
        deleted_at: null
    }
]

const sumCalc = (methodToSum) => monthly.filter(amount => amount.method === methodToSum && isSameMonthYear(date(), date(monthly.created_at))).map(charity => charity.amount)

const date = (day) => (day ? new Date(day) : new Date());
const isSameMonthYear = (date1, date2) => date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear()

const sumArray = (array) => array.reduce((total, value) => total + value, 0)
console.log(sumArray(sumCalc('charity')));

const obj = {}
//console.log("obj true?", obj);

const num = 180.5
//console.log("round", Math.round(num));

const integrities = [1, 2,4, 5,2, 3, 1, 4, 4, 5, 1, 2, 3, 4, 5, null, null, 1, 2, 3, ,3 ,3 ,3]
for (let index = 1; index < 6; index++) {
   console.log("integrity", index, integrities.filter(amount => amount === index).length)
}

console.log("22", + "33");

const stringy = "number three"
// stringy.forEach(element => {
    
// });
// console.log("stringy", stringy.split(""));

let myFirstArray = ["simcha", "yanky", "chaim", "duvi", "yochonon"];
console.log("my arrray", myFirstArray[1, 2]);
