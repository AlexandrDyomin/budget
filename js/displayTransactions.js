import { toMonetaryFormat } from "./toMonetaryFormat.js";

export function displayTransactions(categories) {
    return (e) => {
        let result = e.target.result;
        let data = result.filter((transaction) => transaction.categoryId in categories)
            .map((transaction) => {
                return { category: categories[transaction.categoryId], ...transaction }
            });
        data.sort((a, b) => a.date - b.date);
        
        // отобразим сумму расходов/доходов за период
        document.querySelector('.sum')
            .textContent = toMonetaryFormat(calcSum(data)) || 0;
        
        // отобразим транзакции за период
        display('.transactions', data);
    }

    function display(targetClassName, data) {
        let transactionTemplate = document.querySelector('#transaction');
        let transactions = [];
        let currentDate;
        data.forEach((transaction) => {
            if (currentDate !== transaction.date) {
                var templateClone = transactionTemplate.content.cloneNode(true);
                currentDate = transaction.date;
                let date = templateClone.querySelector('.date');
                let [year, month, day] = currentDate.split('-');
                date.textContent = `${day}.${month}.${year}`;
            } 
            
            let rowSecond = document.querySelector('#row-second');
            let rowSecondClone = rowSecond.content.cloneNode(true);
            let tr = rowSecondClone.querySelector('.second');
            tr.dataset.id = transaction.id;
            let category = rowSecondClone.querySelector('.category');
            let amount = rowSecondClone.querySelector('.amount');
            let comment = rowSecondClone.querySelector('.comment');

            category.textContent = transaction.category;
            amount.textContent = toMonetaryFormat(transaction.amount);
            comment.textContent = transaction.comment;
            if(templateClone) {
                templateClone.querySelector('.transaction').append(rowSecondClone)
                transactions.push(templateClone);
            } else {
                transactions.at(-1).querySelector('.transaction').append(rowSecondClone)
            }
        });
        document.querySelector(targetClassName)
            .replaceChildren(...transactions);
    }

    function calcSum(data) {
        return data.reduce((acc, item) => {
            return acc + item.amount;
        }, 0);
    }
}
