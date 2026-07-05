
function displaySummary(categories) {
    return (e) => {
        let result = e.target.result;
        let data = result.filter((transaction) => transaction.categoryId in categories);
        let sumDate = {};
        data.forEach((transaction) => {
            let categoryId = transaction.categoryId;
            if (sumDate[categories[categoryId]]) {
                sumDate[categories[categoryId]] += transaction.amount;
            } else {
                sumDate[categories[categoryId]] = transaction.amount;
            }
        });
    }
}