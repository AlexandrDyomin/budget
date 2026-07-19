import { connectDB, readAll } from "./db.js";
import { toMonetaryFormat } from "./js/toMonetaryFormat.js";


let dom = {
    salary: document.querySelector('.salary .amount'),
    advance: document.querySelector('.advance .amount'),
    truck: document.querySelector('.truck .amount'),
    delivery: document.querySelector('.delivery .amount'),
    gifts: document.querySelector('.gifts .amount'),
    result: document.querySelector('.result .amount'),
    balance: document.querySelector('.balance .amount'),
    expenses: document.querySelector('.expenses .amount'),
    year: document.querySelector('input[name="year"]'),
    prevYear: document.querySelector('.prevYear'),
    nextYear: document.querySelector('.nextYear')
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
                let incomesId = {
                    salary: res.find((item) => item.name === 'Зарплата').id,
                    advance: res.find((item) => item.name === 'Аванс').id,
                    truck: res.find((item) => item.name === 'Фура').id,
                    delivery: res.find((item) => item.name === 'Доставка').id,
                    gifts: res.find((item) => item.name === 'Подарок').id,
                    loan: res.find((item) => item.name === 'Заём').id
                };

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

                for (let key in totalIncomes) {
                    dom[key].textContent = toMonetaryFormat(totalIncomes[key]);
                }

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
