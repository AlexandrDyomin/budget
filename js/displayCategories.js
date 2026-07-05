import { 
    connectDB, 
    readAll 
} from "../db.js";

export function displayCategories(e) {
    e.stopPropagation();
    let target = e.target;
    if (target.tagName !== 'INPUT') {
        let typeTransaction = document.querySelector('.transaction .type');
        target = typeTransaction.querySelector('input[checked]');
    }
    let categorySelect = document.querySelector('.transaction select[name=category]');
    connectDB((e) => {
        let storeParams = { 
            storeName: 'categories', 
            indexName: 'type', 
            query: target.value };
        readAll(e, storeParams, (res) => {
            categorySelect.replaceChildren();
            fillSelect([{ name: 'Категория' }, ...res]);
        } );
    });

    function fillSelect(data) {
        let options = [];
        data.forEach((item) => {
            let option = document.createElement('option');
            option.value = item.id || '';
            option.textContent = item.name;
            options.push(option);
        });
        categorySelect.append(...options);
        categorySelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
}