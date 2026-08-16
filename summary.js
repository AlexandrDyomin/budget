import { connectDB, readAll } from "./db.js";
import { toMonetaryFormat } from "./js/toMonetaryFormat.js";
import { selectCurrentMonth } from "./js/selectCurrentMonth.js";
import { toggleMont } from "./js/toggleMonth.js";


let dom = {
    tbody: document.querySelector('.year-summary tbody'),
    result: document.querySelector('.result .amount'),
    balance: document.querySelector('.balance .amount'),
    expenses: document.querySelector('.expenses .amount'),
    year: document.querySelector('input[name="year"]'),
    prevYear: document.querySelector('.prevYear'),
    nextYear: document.querySelector('.nextYear'),
    period:  document.querySelector('.period'),
    calendarStart: document.querySelector('.period input[name=start]'),
    calendarEnd: document.querySelector('.period input[name=end]')
}

dom.prevYear.addEventListener('click', (e) => {
    dom.year.value = +dom.year.value - 1;
    dom.year.dispatchEvent(new Event('change'));
});

dom.nextYear.addEventListener('click', (e) => {
    dom.year.value = +dom.year.value + 1;
    dom.year.dispatchEvent(new Event('change'));
});

let today = new Date();
dom.year.value = today.getFullYear();

dom.year.addEventListener('change', () => {
    connectDB((e) => {
        readAll(e, {
            storeName: 'transactions',
            indexName: 'date',
            query: IDBKeyRange.bound(dom.year.value + '-01-01', dom.year.value + '-12-31')
        }, (transactions) => {
            connectDB((e) => readAll(e, {
                storeName: 'categories',
                indexName: 'type',
                query: 'Доход'
            }, (res) => {
                let incomesId = res.reduce((acc, item) => {
                    acc[item.name] = item.id;
                    return acc;
                }, {});

                let incomesValues = Object.values(incomesId);
                let incomes = transactions.filter((item) => {
                    return incomesValues.includes(item.categoryId);
                });
                let incomesKeys = Object.keys(incomesId);
                let totalIncomes = incomes.reduce((acc, item) => {
                    let key = incomesKeys.find((key) => incomesId[key] === item.categoryId);
                    acc[key] = (acc[key] || 0) + item.amount;
                    return acc;
                }, {});

                let records = [];
                for (let key in totalIncomes) {
                    let incomeTempl = document.querySelector('#income');
                    let incomeClone = incomeTempl.content.cloneNode(true);
                    let category = incomeClone.querySelector('.category');
                    let amount = incomeClone.querySelector('.amount');
                    category.textContent = key;
                    amount.textContent = toMonetaryFormat(totalIncomes[key]);
                    records.push(incomeClone);
                }

                dom.tbody.replaceChildren();
                dom.tbody.append(...records);

                let amountIncomes = Object.values(totalIncomes).reduce((acc, item) => acc + item, 0);
                dom.result.textContent = toMonetaryFormat(amountIncomes);

                let expenses = transactions.filter((item) => !incomesValues.includes(item.categoryId));
                let totalExpenses = expenses.reduce((acc, item) => acc + item.amount, 0);
                dom.expenses.textContent = toMonetaryFormat(totalExpenses);

                dom.balance.textContent = toMonetaryFormat(amountIncomes - totalExpenses);
            }));
        });
    });
});

dom.year.dispatchEvent(new Event('change'));

dom.period.addEventListener('change', (e) => {
    let start = calendarStart.value;
    let end = calendarEnd.value;

    
    // let monthSelected = month.value + '.' + year.value;
    let storeParams = { 
        storeName: 'categories', 
        indexName: 'type', 
        query: 'Расход' 
    };
        
    connectDB((e) => readAll(e, storeParams, (res) => {
        table.replaceChildren();
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
                        let category = templClone.querySelector('.category');
                        category.textContent = data.name;
                        let plan = category.nextElementChild;
                        plan.textContent = data.limit
                        rows.push(templClone);
                        if (i === length - 1) {
                            table.append(...rows);  
                        }
                    });
                });
            }));
        })
    }));
});

dom.period.dispatchEvent(new Event('change'));


selectCurrentMonth();
dom.period.addEventListener('click', toggleMont);




