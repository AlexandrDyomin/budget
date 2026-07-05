import { 
    connectDB,
    readAll,
    read
} from './db.js';
import { changeTransaction as changeLimit } from './db.js';
import { toMonetaryFormat } from "/js/toMonetaryFormat.js";

// выбор бюджета за текущий месяц
let period = document.querySelector('.period');
let [month, year] = period.children;
let today = new Date();
month.value = (today.getMonth() + 1).toString().padStart(2, '0'); 
year.value = today.getFullYear();

// отобразим данные за месяц
period.addEventListener('change', displayBudget);
period.dispatchEvent(new Event('change'));

let table = document.querySelector('.budget');
let sum = document.querySelector('.sum');

table.addEventListener('change', save);
table.addEventListener('focusin', (e) => e.target.select());

function displayBudget() {
    let monthSelected = month.value + '.' + year.value;
    let storeParams = { 
        storeName: 'categories', 
        indexName: 'type', 
        query: 'Расход' 
    };

    connectDB((e) => readAll(e, storeParams, (res) => {
        table.replaceChildren();
        sum.textContent = 0;
        let templ = document.querySelector('#tr');
        let length = res.length;
        let rows = [];
        res.forEach((item, i) => {
            connectDB((e) => read(e, { storeName: 'budgets', query: [monthSelected, item.id] }, (res) => {
                if (!res) {
                    res = {
                        month: monthSelected,
                        category: item.id,
                        limit: 0
                    };
                }
                connectDB((e) => {
                    read(e, { storeName: 'categories', query: item.id }, (data) => {
                        let templClone = templ.content.cloneNode(true);
                        let tr = templClone.querySelector('.category');
                        tr.dataset.category = item.id;
                        tr.textContent = data.name;
                        templClone.querySelector('input[name="limit"]').value = res.limit;
                        rows.push(templClone);
                        if (i === length - 1) {
                            table.append(...rows);  
                            sum.textContent = toMonetaryFormat(calcSum());
                        }
                    });
                });
            }));
        })
    }));
}

function save(e) {
    let data = {
        month: month.value + '.' + year.value,
        category: +e.target.closest('.record').querySelector('.category').dataset.category,
        limit: +e.target.value
    }

    connectDB((e) => {
        changeLimit(e, 'budgets', data);
        sum.textContent = toMonetaryFormat(calcSum());
    });
}

function calcSum() {
    let limits = [...table.querySelectorAll('input[name="limit"]')];
    return limits.reduce((acc, item) => {
        return acc + (+item.value);
    }, 0);
}
