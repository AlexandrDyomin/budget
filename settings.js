import { 
    connectDB, 
    readAll, 
    addTransaction as add, 
    changeTransaction as editCategory,
    readAllStores,
    uploadData,
    clearStore 
} from "./db.js";

let template = document.querySelector('#category');
let incomesList = document.querySelector('.incomes ul');
let expensesList = document.querySelector('.expenses ul');

connectDB((e) => readAll(e, { storeName: 'categories'}, (res) => {
    let incomes = [];
    let expenses = [];
    res.forEach((item) => {
        let clone = template.content.cloneNode(true);
        let input = clone.querySelector('input');
        input.value = item.name;
        input.dataset.type = item.type;
        input.dataset.id = item.id;
        if (item.type === "Доход") {
            incomes.push(clone);
        } else {
            expenses.push(clone);
        }
    });
    incomesList.append(...incomes);
    expensesList.append(...expenses);
}));


let newCategoryBtn = document.querySelector('.add-сategory');
let newCategory = document.querySelector('.new-category');
newCategory.addEventListener('input', (e) => {
    if (e.target.value) {
        newCategoryBtn.removeAttribute('disabled');
    } else {
        newCategoryBtn.setAttribute('disabled', '');
    }
})

newCategoryBtn.addEventListener('click', addNewCategory);
function addNewCategory() {
    let type = newCategory.querySelector('input[type="radio"]:checked').value;
    let input = newCategory.querySelector('input');
    let value = input.value.toLocaleLowerCase().trim();
    value = value[0].toUpperCase() + value.slice(1);
    connectDB((e) => add(e, 'categories', { name: value, type}, (e) => {
        input.value = '';
        let clone = template.content.cloneNode(true);
        let inputClone = clone.querySelector('input');
        inputClone.value = value;
        inputClone.dataset.id = e.target.result;
        if (type === 'Доход') {
            incomesList.append(clone);
        } else {
            expensesList.append(clone);
        }
    }));
}

let list = document.querySelector('.list');
list.addEventListener('focusin', (e) => e.target.select());
list.addEventListener('change', edit);
function edit(e) {
    let data = {
        name: e.target.value,
        type: e.target.dataset.type,
        id: +e.target.dataset.id
    };

    connectDB((e) => {
        editCategory(e, 'categories', data);
    });
}

let downloadBtn = document.querySelector('.download');
connectDB(async (req) => {
    URL.revokeObjectURL(downloadBtn.href);
    downloadBtn.download = 'budget(' + new Date().toLocaleDateString() +  ').json';
    downloadBtn.href = URL.createObjectURL(await prepareData(req));
    downloadBtn.addEventListener('click', saveDb);
    
    async function prepareData(req) {
        let result = await readAllStores(req);
        result = JSON.stringify(result);
        return new Blob([result], { type: 'application/json' });
    }
    
    function saveDb(e) {
        connectDB(async (req) => {
            downloadBtn.href = URL.createObjectURL(await prepareData(req));
        });
    }
});


let uploadBtn = document.querySelector('.upload');
uploadBtn.addEventListener('click', () => uploadBtn.children[0].click());
uploadBtn.addEventListener('change', handleClickUploadBtn);
function handleClickUploadBtn(e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => { 
        let data = JSON.parse(reader.result); 
        connectDB((req) => {
            clearStore(req, 'budgets', 'categories', 'transactions');
            uploadData(req, data);
            document.location.reload();
        });
    }
    reader.onerror = () => console.log(reader.error);
}