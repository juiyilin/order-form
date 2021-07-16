function caculate(qArray, pArray, amtArray, ttl) {
    for (let i = 0; i < qArray.length; i++) {
        qArray[i].addEventListener('change', () => {
            let q;
            if (qArray[i].value === '') {
                qArray[i].value = 0;
                q = 0;
            } else {
                q = parseInt(qArray[i].value);
            }
            let p = parseInt(pArray[i].textContent);
            amtArray[i].textContent = q * p;
            let total = 0;

            amtArray.forEach(amt => {
                total += parseInt(amt.textContent);
            });
            ttl.textContent = '總計 $' + total;
        });
    }

}

function searchPostCode(search, address) {
    search.addEventListener('click', (event) => {
        event.preventDefault();

        if (address.value !== '') {
            fetch(`http://zip5.5432.tw/zip5json.py?adrs=${address.value}`).then(res => res.json())
                .then(data => {
                    // console.log(data)
                    if (data.zipcode === '' && data.zipcode6 === '') {
                        alert('請確認\n1. 住址是否填寫完整\n2. 巷、弄、號是否用半形數字輸入');
                    } else {
                        address.value = data.new_adrs;
                    }
                });

        }
    });

}
//back

let backPath = window.location.pathname.split('/').slice(0, 4).join('/');
select('#back').href = `${backPath}`;

//load data


let sum = 0;
window.addEventListener('load', () => {
    fetch('/api/products').then(res => res.json())
        .then(products => {
            // console.log(products);
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
                    let row = document.createElement('div');
                    row.className = 'row';
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
                    row.appendChild(itemNumber);
                    row.appendChild(price);
                    row.appendChild(quantity);
                    row.appendChild(amount);
                    productsList.appendChild(row);
                });
                let total = document.createElement('div');
                total.id = 'total';
                total.textContent = '總計 $0';
                caculate(quantityArray, priceArray, amountArray, total);

                productsList.appendChild(total);
            }
        });
    // let orderNum = window.location.pathname.split('/')[4];
    // fetch(`/api/order/${orderNum}`).then(res => res.json()).then(data => {
    //     console.log(data);

    //     select('#customer').value = data.customer;
    //     select('#phone').value = data.phone;
    //     select('#email').value = data.email;
    //     select('#address').value = data.address;
    //     select('#tax-id').value = data.tax_id;
    //     select('#comment').value = data.comment;
    //     select('#submitter').textContent = data.submitter;

    //     console.log(selectAll('#products-list .quantity'))
    // });
});

window.addEventListener('load', () => {
    let orderNum = window.location.pathname.split('/')[4];
    fetch(`/api/order/${orderNum}`).then(res => res.json()).then(data => {
        console.log(data);

        select('#customer').value = data.customer;
        select('#phone').value = data.phone;
        select('#email').value = data.email;
        select('#address').value = data.address;
        select('#tax-id').value = data.tax_id;
        select('#comment').value = data.comment;
        select('#submitter').textContent = data.submitter;

        //#products-list 
        let priceList = selectAll('#products-list .price');
        let quantitiesList = selectAll('#products-list .quantity');
        let amountList = selectAll('#products-list .amount');
        for (let i = 0; i < data.products.length; i++) {
            quantitiesList[i].value = data.quantities[i];
            amountList[i].textContent = parseInt(priceList[i].textContent) * data.quantities[i];
        }
        select('#total').textContent = `總計 $${data.total}`;
    });
});

//search post code
let search = select('#search');
let address = select('#address');
searchPostCode(search, address);