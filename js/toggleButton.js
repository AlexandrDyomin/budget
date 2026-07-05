export function toggleButton(e, nameButton) {
    let dataInput = document.querySelector('input[name=date]');
    let typeTransaction = document.querySelector('.type input:checked');
    let amount = document.querySelector('input[name=amount]');
    let categorySelect = document.querySelector('select[name=category]');
    let btn = document.querySelector(`.transaction button[name="${nameButton}"]`);
    let values = [dataInput.value, typeTransaction.value, amount.value, categorySelect.value]; 
    if (values.includes('')) {
        btn.setAttribute('disabled', '');
    } else {
        btn.removeAttribute('disabled');
    }
}