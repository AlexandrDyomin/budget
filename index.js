import { 
    connectDB, 
    addTransaction
} from './db.js';
import { displayCategories } from './js/displayCategories.js';
import { toggleButton } from './js/toggleButton.js';
import { prepareDataTransactionFromForm } from './js/prepareDataTransactionFromForm.js';

// подключим воркер
navigator.serviceWorker.register('./sw.js')
    .then(() => navigator.serviceWorker.ready)
    .then((worker) => {
        worker.sync.register('syncdata');
    })
    .catch((err) => console.log(err));

// найдем нужные элементы
let form = document.forms.transaction;
let dataInput = form.querySelector('input[name=date]');
let typeTransaction = form.querySelector('.type');
let saveBtn = form.querySelector('button[name=save]');

// поставим актуальную дату в поле даты
let today = new Date().toISOString().split('T')[0];
dataInput.value = today;

// заполним select категориями транзакций
typeTransaction.addEventListener('change', displayCategories);
typeTransaction.dispatchEvent(new Event('change'));

// добавим отключение/включение кнопки сохранить
form.addEventListener('change', (e) => {
    toggleButton(e, 'save');
});

// сохраним транзакцию в БД
saveBtn.addEventListener('click', (e) => {
    let data = prepareDataTransactionFromForm(form);
    connectDB((e) => addTransaction(e, 'transactions', data, () => {
        let radioCheked = typeTransaction.querySelector(`.type input:checked`);
        form.reset();
        radioCheked.setAttribute('checked', '');
        dataInput.value = today;
        saveBtn.setAttribute('disabled', '');
    }));
});