
export function connectDB(f = () => console.log('Соединение с БД установлено')) {
    
    const DB_NAME = 'budget';
    const DB_VERSION = 1;
    let request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = initDB;
    request.onsuccess = f;
    request.onerror = logerr;
    
    function initDB(e) {
        let db = e.target.result;
        db.createObjectStore('budgets', { keyPath: ['month', 'category'] });
        let categories = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
        categories.createIndex('type', 'type', { unique: false });
        let transactions = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true});
        transactions.createIndex('date', 'date', { unique: false });
        transactions.createIndex('categoryId', 'categoryId', { unique: false });
        
        // Заполним таблицу categories
        import('./js/categories.js')
            .then((res) => uploadData(e,res.categories));
    }

    function logerr(e) {
        console.error("Error", e.target.error);
    }
}

export function getStore(e, store, type) {
    let db = e.target.result;
    let transaction = db.transaction(store, type);
    return transaction.objectStore(store);
}

export function addTransaction(e, storeName, data,  f = () => console.log('Добавлена новая запись')) {
    let store = getStore(e, storeName, 'readwrite');
    let request = store.add(data);
    request.onsuccess = f;
}

export function deleteTransaction(e, storeName, key, f = () => console.log('Запись удалена')) {
    let store = getStore(e, storeName, 'readwrite');
    let request = store.delete(key);
    request.onsuccess = f;
}

export function changeTransaction(e, storeName, data, f = () => console.log('Запись изменена')){
    let store = getStore(e, storeName, 'readwrite');
    let request = store.put(data);
    request.onsuccess = f;
}

export function read(e, { storeName, query }, f = () => console.log('Чтение завершено')) {
    let store = getStore(e, storeName, 'readonly');
    let request = store.get(query);
    request.onsuccess = (e) => {
        let result = e.target.result;
        f(result);
    }
}

export function readAll(e, { storeName, indexName, query }, f = () => console.log('Чтение завершено')) {
    let store = getStore(e, storeName, 'readonly');
    let index;
    if (indexName) {
        index = store.index(indexName);
    }
    let request = index?.getAll(query) || store.getAll();
    request.onsuccess = (e) => {
        let result = e.target.result;
        f(result);
    }
}

export function getTransactionsByPeriod(typeTransaction, startPeriod, endPeriod, f = console.log) {
    connectDB((e) => {
        let db = e.target.result;
        let transaction = db.transaction(['transactions', 'categories'], 'readonly');
        let categoriesIndex = transaction.objectStore('categories')
            .index('type');
        let categories = {};
        categoriesIndex.openCursor(typeTransaction)
            .onsuccess = (e) => {
                let cursor = e.target.result;
                if (cursor) {
                    let category = cursor.value;
                    categories[category.id] = category.name;
                    cursor.continue();
                } else {
                    let transactionsStore = transaction.objectStore('transactions');
                    let dateIndex = transactionsStore.index('date');
                    dateIndex.getAll(IDBKeyRange.bound(startPeriod, endPeriod))
                        .onsuccess = f(categories);
                }
            }
    });
}

export function uploadData(e, data) {
    for (let [key, value] of Object.entries(data)) {
        let store = getStore(e, key, 'readwrite');
        value.forEach((item) => store.add(item));
    }
}


export function clearStore(req, ...storeNames) {
    storeNames.forEach((name) => {
        let store = getStore(req, name, 'readwrite');
        store.clear();
    });
}

export async function readAllStores(req) {
    let db = req.target.result;
    let storeNames = [...db.objectStoreNames];
    let promises = storeNames.map((name) => {
        return new Promise((resolve, reject) => {
            let store = getStore(req, name, 'readonly');
            let data = store.getAll();
            data.onsuccess = () => {
                resolve({[name]: data.result})
            };
            data.onerror = reject;
        });
    });
    return Promise.all(promises)
        .then((res) => {
            return res.reduce((acc, item) => {
                let storeName = Object.keys(item)[0];
                acc[storeName] = item[storeName];
                return acc;
            }, {});
        });
}