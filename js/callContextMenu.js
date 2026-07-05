import { 
    connectDB,
    getStore,
    deleteTransaction,
    changeTransaction 
} from "../db.js";
import { displayCategories } from "./displayCategories.js";
import { toggleButton } from "./toggleButton.js";
import { prepareDataTransactionFromForm } from './prepareDataTransactionFromForm.js';

export function callContextMenu(e, storeName) {
    e.preventDefault();
    let target = e.target.closest('tr.second');
    if (!target) return;
    let modal = document.querySelector('.modal');
   

    // заполним форму
    // заполним select категориями транзакций
    let typeTransaction = document.querySelector('.transaction .type');
    typeTransaction.addEventListener('change', displayCategories);
    typeTransaction.dispatchEvent(new Event('change'));
    let date = modal.querySelector('input[name=date]');
    let amount = modal.querySelector('input[name=amount]');
    let comment = modal.querySelector('input[name=comment');
    let category = modal.querySelector('.transaction select[name=category]')
    connectDB((e) => {
        let store = getStore(e, storeName, 'readwrite');
        let request = store.get(+target.dataset.id);
        request.onsuccess = (e) => {
            let data = e.target.result;
            date.value = data.date;
            amount.value = data.amount;
            comment.value = data.comment;
            category.value = data.categoryId;
        }
    });
    modal.showModal();

    // добавим отключение/включение кнопки сохранить
    let form = document.forms.transaction;
    form.addEventListener('change', tgBtn);

    modal.querySelector('.edit').
        addEventListener('click', () => {
        let data = prepareDataTransactionFromForm(form);
        data.id = +target.dataset.id;
        editRecordInDb(data, () => {
            updatePage();
            closeModal();
        });
    }, { once: true });

    modal.querySelector('.delete')
        .addEventListener('click', () => {
            delRecordFromDB(+target.dataset.id, () => {
                updatePage();
                closeModal();
            });
    }, { once: true });

    modal.querySelector('.cancel')
        .addEventListener('click', closeModal, { once: true });

    function tgBtn(e) {
        toggleButton(e, 'edit');
    }

    function closeModal() {
        modal.close();
        form.reset();
        form.removeEventListener('change', tgBtn);
    }

    function editRecordInDb(data, f) {
        connectDB((e) => changeTransaction(e, storeName, data, f));
    }

    function updatePage() {
        let period = document.querySelector('.period');
        period.dispatchEvent(new Event('change'));
    }

    function delRecordFromDB(key, f) {
        connectDB((e) => deleteTransaction(e, storeName, key, f));
    }
}