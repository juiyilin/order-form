let showName = document.querySelectorAll('.show-name');
showName.forEach(showname => {
    showname.textContent = decodeURIComponent(window.location.pathname.split('/').join(' '));
});

let orderForm = document.querySelector('#order-form');
orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let inputs = orderForm.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.value !== '') {
            console.log(input.value);
        }
    });
    let textArea = orderForm.querySelector('textarea');
    console.log(textArea.value);
});