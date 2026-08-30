const CACHE_NAME = 'cache-only-v1';
const URLS_TO_CASH = [
    // главные файлы
    '/budget/',
    '/budget/manifest.json',
    '/budget/index.html',
    '/budget/style.css',
    '/budget/index.js',
    '/budget/expenses.html',
    '/budget/expenses.css',
    '/budget/expenses.js',
    '/budget/incomes.html',
    '/budget/incomes.css',
    '/budget/incomes.js',
    '/budget/budget.html',
    '/budget/budget.css',
    '/budget/budget.js',
    '/budget/settings.html',
    '/budget/settings.js',
    '/budget/settings.css',
    '/budget/summary.html',
    '/budget/summary.js',
    '/budget/summary.css',


    // импорты css
    '/budget/css/base.css',
    '/budget/css/modal.css',
    '/budget/css/navigation.css',
    '/budget/css/sum.css',
    '/budget/css/transactionForm.css',
    '/budget/css/transactions.css',

    // импорты js
    '/budget/js/callContextMenu.js',
    '/budget/js/categories.js',
    '/budget/js/displayCategories.js',
    '/budget/js/displayTransactions.js',
    '/budget/js/selectCurrentMonth.js',
    '/budget/js/toggleButton.js',
    '/budget/js/prepareDataTransactionFromForm.js',
    '/budget/js/toMonetaryFormat.js',
    '/budget/js/toggleMonth.js',
];

// При установке воркера мы должны закешировать часть данных (статику).
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(URLS_TO_CASH))
    );
});

// при событии fetch, мы используем кэш, и только потом обновляем его данным с сервера
self.addEventListener('fetch', (event) => {
    // Мы используем `respondWith()`, чтобы мгновенно ответить без ожидания ответа с сервера.
    event.respondWith(fromCache(event.request));
    // `waitUntil()` нужен, чтобы предотвратить прекращение работы worker'a до того как кэш обновиться.
    event.waitUntil(update(event.request));
});

// Активация и удаление старого кэша при обнвлении приложения
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys?.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
});

function fromCache(request) {
    return caches.open(CACHE_NAME).then((cache) =>
      cache.match(request)
          .then((matching) => matching || Promise.reject('no-match'))
    );
}

function update(request) {
    return caches.open(CACHE_NAME).then((cache) =>
        fetch(request).then((response) =>
            cache.put(request, response)
        )
    );
}