export function toggleMont(e) {
    if (e.target.tagName !== 'BUTTON') return;

    let target = e.target;
    let calendarStart = document.querySelector('.period input[name=start]');
    let startDate = new Date(calendarStart.value);
    let calendarEnd = document.querySelector('.period input[name=end]');
    let endDate = new Date(calendarEnd.value);

    if (target.className === 'prev') {
        startDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1);
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    }
    
    if (target.className === 'next') {
         startDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1);
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    }

    calendarStart.value = new Intl.DateTimeFormat('sv-SE').format(startDate);
    calendarEnd.value = new Intl.DateTimeFormat('sv-SE').format(endDate);
    
    let period = document.querySelector('.period');
    period.dispatchEvent(new Event('change'));
}