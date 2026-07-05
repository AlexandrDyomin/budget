export function toMonetaryFormat(number) {
    return new Intl.NumberFormat('ru-RU').format(number);
}