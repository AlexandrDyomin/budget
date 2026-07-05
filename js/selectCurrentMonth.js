export function selectCurrentMonth() {
    let today = new Date();
    // 'sv-SE' форматирует дату как YYYY-MM-DD по местному времени
    let firstDayMonth = new Date(today.getFullYear(), today.getMonth());
    let lastDayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    let start = new Intl.DateTimeFormat('sv-SE').format(firstDayMonth);
    let end = new Intl.DateTimeFormat('sv-SE').format(lastDayMonth);
    document.querySelector('.period input[name=start]').value = start;
    document.querySelector('.period input[name=end]').value = end;
}