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
                
                let totalIncomesSorted = Object.fromEntries(
                    Object.entries(totalIncomes).sort(([, val1], [, val2]) => val2  - val1)
                );

                let records = [];
                for (let key in totalIncomesSorted) {
                    let incomeTempl = document.querySelector('#income');
                    let incomeClone = incomeTempl.content.cloneNode(true);
                    let category = incomeClone.querySelector('.category');
                    let amount = incomeClone.querySelector('.amount');
                    category.textContent = key;
                    amount.textContent = toMonetaryFormat(totalIncomesSorted[key]);
                    records.push(incomeClone);
                }

                dom.tbody.replaceChildren();
                dom.tbody.append(...records);

                let amountIncomes = Object.values(totalIncomesSorted).reduce((acc, item) => acc + item, 0);
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
selectCurrentMonth();

dom.period.addEventListener('change', (e) => {
    let start = dom.calendarStart.value;
    let end = dom.calendarEnd.value;
    let tbody = document.querySelector('.month-summary tbody');
    tbody.replaceChildren();
    connectDB((e) => {
        // читаем бюджет за период
        readAll(e, {
            storeName: 'budgets',
            indexName: 'month',
            query: IDBKeyRange.bound(`${start.slice(5,7)}.${start.slice(0, 4)}`, `${end.slice(5,7)}.${end.slice(0, 4)}`)
        }, (budget) => {
            // читаем транзакции за период
            readAll(e, {
                storeName: 'transactions',
                indexName: 'date',
                query: IDBKeyRange.bound(start, end)
            }, (transactions) => {
                // читаем существующие категории трат
                readAll(e, {
                    storeName: 'categories',
                    indexName: 'type',
                    query: 'Расход'
                }, (categories) => {
                    let categoriesId = categories.reduce((acc, item) => {
                        acc[item.id] = item.name;
                        return acc;
                    }, {});

                    // суммируем фактические расходы
                    let fact = transactions.reduce((acc, item) => {
                        if (!categoriesId[item.categoryId]) return acc;
                        if (acc[item.categoryId]) {
                            acc[item.categoryId] += item.amount;
                        } else {
                            acc[item.categoryId] = item.amount;
                        }
                        return acc;
                    }, {});

                    // суммируем планируемые расходы по одинаковым категориям
                    let plan = budget.reduce((acc, item) => {
                        if (acc[item.category]) {
                            acc[item.category] += item.limit;
                        } else {
                            acc[item.category] = item.limit;
                        }
                        return acc;
                    }, {});
                  
                    // заполним таблицу
                    let rowTmpl = document.querySelector('#tr');
                    let rows = [];
                    for (let [key, val] of Object.entries(fact)) {
                        let rowTemplClone = rowTmpl.content.cloneNode(true);
                        let [categoryCell, planCell, factCell] = rowTemplClone.querySelector('.record').children;
                        categoryCell.textContent = categoriesId[key];
                        planCell.textContent = plan[key] || 0;
                        factCell.textContent = val;
                        rows.push(rowTemplClone);
                    }
                    tbody.append(...rows);
                });
            });
        });
    });
});

dom.period.dispatchEvent(new Event('change'));
dom.period.addEventListener('click', toggleMont);




