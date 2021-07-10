let products = select('#products');
products.addEventListener('submit', (event) => {
    event.preventDefault();
    let inputs = products.querySelectorAll('input');
    let itemNumber = inputs[0].value;
    let price = inputs[1].value;
    fetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({
            itemNumber: itemNumber,
            price: price
        }),
        headers: {
            'content-type': 'application/json'
        }
    }).then(res => res.json()).then(result => {
        console.log(result);
    });
});

window.addEventListener('load', () => {
    fetch('/api/products').then(res => res.json()).then(result => {
        console.log(result);
    });
});