export function prepareDataTransactionFromForm(form) {
    let data = Object.fromEntries(new FormData(form));
    let { type, category: categoryId, ...rest } = data; 
    return { categoryId: +categoryId, ...rest, amount: +rest.amount };
}