const CACHE_NAME = 'cache-only-v1';
const URLS_TO_CASH = [
    // главные файлы
    './',
    'manifest.json',
    'index.html',
    'style.css',
    'index.js',
    'expenses.html',
    'expenses.css',
    'expenses.js',
    'incomes.html',
    'incomes.css',
    'incomes.js',
    'budget.html',
    'budget.css',
    'budget.js',
    'settings.html',
    'settings.js',
    'settings.css',


    // импорты css
    'css/base.css',
    'css/modal.css',
    'css/navigation.css',
    'css/sum.css',
    'css/transactionForm.css',
    'css/transactions.css',

    // импорты js
    'js/callContextMenu.js',
    'js/categories.js',
    'js/displayCategories.js',
    'js/displaySummary.js',
    'js/displayTransactions.js',
    'js/selectCurrentMonth.js',
    'js/toggleButton.js',
    'js/prepareDataTransactionFromForm.js',
    'js/toMonetaryFormat.js',
]

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