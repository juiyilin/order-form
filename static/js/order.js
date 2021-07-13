function caculate(qArray, pArray, amtArray, ttl) {
    for (let i = 0; i < qArray.length; i++) {
        qArray[i].addEventListener('change', () => {
            let q = parseInt(qArray[i].value);
            let p = parseInt(pArray[i].textContent);
            amtArray[i].textContent = q * p;
            console.log(amtArray[i].textContent);
            let total = 0;

            amtArray.forEach(amt => {
                total += parseInt(amt.textContent);
            });
            ttl.textContent = '總計 $' + total;
        });
    }

}


let showName = document.querySelectorAll('.show-name');
showName.forEach(showname => {
    // console.log(window.location.pathname.split('/'))
    showname.textContent = decodeURIComponent(window.location.pathname.split('/')[3]);
});

//load products
let sum = 0;
window.addEventListener('load', () => {
    fetch('/api/products').then(res => res.json())
        .then(products => {
            console.log(products);
            let productsList = select('#products-list');

            if (products.length == 0) {
                let text = document.createElement('a');
                text.textContent = '點此新增產品';
                text.href = '../products';
                productsList.appendChild(text);
            } else {
                let quantityArray = [];
                let priceArray = [];
                let amountArray = [];
                products.forEach(product => {
                    let div = document.createElement('div');
                    let itemNumber = document.createElement('div');
                    itemNumber.className = 'item-number';
                    itemNumber.textContent = product[0];
                    let price = document.createElement('div');
                    price.className = 'price';
                    price.textContent = product[1];
                    priceArray.push(price);

                    let quantity = document.createElement('input');
                    quantity.type = 'number';
                    quantity.className = 'quantity';
                    quantity.value = 0;
                    quantity.min = 0;
                    quantityArray.push(quantity);

                    let amount = document.createElement('div');
                    amount.className = 'amount';
                    amount.textContent = 0;
                    amountArray.push(amount);

                    itemNumber.appendChild(quantity);
                    div.appendChild(itemNumber);
                    div.appendChild(price);
                    div.appendChild(quantity);
                    div.appendChild(amount);
                    productsList.appendChild(div);
                });
                let total = document.createElement('div');
                total.id = 'total';
                total.textContent = '總計 $0'; //TODO:
                caculate(quantityArray, priceArray, amountArray, total);

                productsList.appendChild(total);
            }
        });
});



//search post code
let search = select('#search');
search.addEventListener('click', (event) => {
    event.preventDefault();
    let address = select('#address');
    fetch(`http://zip5.5432.tw/zip5json.py?adrs=${address.value}`).then(res => res.json())
        .then(data => {
            console.log(data);
            if (data.zipcode === '' || data.zipcode6 === '') {
                alert('請確認\n1. 住址是否填寫完整\n2. 巷、弄、號是否用半形數字輸入');
            } else {
                address.value = data.new_adrs;
                console.log(data.new_adrs);
            }
        });

});

// create order
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