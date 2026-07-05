import { connectDB, 
    deleteTransaction, 
    changeTransaction,
    uploadData,
    getTransactionsByPeriod
} from './db.js';

import { displayTransactions } from './js/displayTransactions.js';
import { selectCurrentMonth } from './js/selectCurrentMonth.js';
import { callContextMenu } from './js/callContextMenu.js';


selectCurrentMonth();

let calendarStart = document.querySelector('.period input[name=start]');
let calendarEnd = document.querySelector('.period input[name=end]');
let period = document.querySelector('.period');
period.addEventListener('change', (e) => {
    let start = calendarStart.value;
    let end = calendarEnd.value;
    getTransactionsByPeriod('Расход', start, end, displayTransactions);
});

// отобразим расход за текущий месяц
period.dispatchEvent(new Event('change'));

// вызов меню 
let table = document.querySelector('.transactions');
table.addEventListener('contextmenu', (e) => callContextMenu(e, 'transactions'));
