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

// async function loadData() {
//     let productsList = await loadProducts(sum);

// }

async function loadProducts(sum) {
    let response = await fetch('/api/products');
    let products = await response.json();

    console.log(products);
    let productsList = select('#list-products');
    let quantityArray = [];
    let priceArray = [];
    let amountArray = [];

    let titles = ['名稱', '單價', '數量', '金額'];
    let row = document.createElement('div');
    row.className = 'row';
    titles.forEach(title => {
        let col = document.createElement('div');
        col.className = 'col';
        col.textContent = title;
        row.appendChild(col);
    });

    productsList.appendChild(row);

    products.forEach(product => {
        let row = document.createElement('div');
        row.className = 'row';
        let itemNumber = document.createElement('div');
        itemNumber.className = 'item-number';
        itemNumber.textContent = product[0];
        let price = document.createElement('div');
        price.className = 'price';
        priceArray.push(price);
        price.textContent = `$ ${product[1]}`;

        let quantityDiv = document.createElement('div');
        let quantity = document.createElement('input');
        quantity.type = 'number';
        quantity.className = 'quantity';
        quantity.value = 0;
        quantity.min = 0;
        quantityDiv.appendChild(quantity);
        quantityArray.push(quantity);

        let amount = document.createElement('div');
        amount.className = 'amount';
        amount.textContent = 0;
        amountArray.push(amount);

        itemNumber.appendChild(quantityDiv);
        row.appendChild(itemNumber);
        row.appendChild(price);
        row.appendChild(quantityDiv);
        row.appendChild(amount);
        productsList.appendChild(row);
    });
    row = document.createElement('row');
    row.className = 'row';
    let total = document.createElement('div');
    total.id = 'total';
    total.textContent = '總計 $0';
    row.appendChild(total);
    caculate(quantityArray, priceArray, amountArray, total);


    productsList.appendChild(row);
    return productsList;

}


let showName = selectAll('.show-name');
let pathname = window.location.pathname;
showName.forEach(showname => {
    // console.log(window.location.pathname.split('/'))
    showname.textContent = decodeURIComponent(pathname.split('/')[3]);
});
let chart = select('#chart');
chart.href = `${pathname}/charts`;

//load data
let sum = 0;
loadProducts(sum);

// load orders
window.addEventListener('load', () => {
    fetch('/api/orders').then(res => res.json()).then(data => {
            console.log(data);
            let listOrders = select('#list-orders');
            if (data.length === 0) {
                let row = document.createElement('div');
                row.className = 'row';
                row.textContent = '沒有資料';
                row.id = 'no-data';
                listOrders.appendChild(row);
            } else {
                for (let i = 0; i < data.length; i++) {
                    let row = document.createElement('div');
                    row.className = 'row';

                    let no = document.createElement('div');
                    no.className = 'no';
                    no.textContent = i + 1;

                    let customer = document.createElement('div');
                    customer.className = 'customer';
                    customer.textContent = data[i].customer;

                    let products = document.createElement('div');
                    productsNum = data[i].products.length;
                    let content = '';
                    for (let j = 0; j < productsNum; j++) {
                        if (data[i].quantities[j] !== 0) {
                            content += `${data[i].products[j]} * ${data[i].quantities[j]}<br>`;
                        }

                    }
                    products.className = 'products';
                    products.innerHTML = content;

                    let total = document.createElement('div');
                    total.className = 'total';
                    if (data[i].total === 0) {
                        total.textContent = '-';
                    } else {
                        total.textContent = `$ ${data[i].total}`;
                    }

                    let name = document.createElement('div');
                    name.className = 'name';
                    name.textContent = data[i].name;

                    let action = document.createElement('div');
                    action.className = 'action';
                    let hyperlink = document.createElement('a');
                    hyperlink.href = `${nowUser.show.name}/${i+1}`;
                    hyperlink.textContent = '詳細資料';
                    hyperlink.className = 'more';

                    action.appendChild(hyperlink);


                    row.appendChild(no);
                    row.appendChild(customer);
                    row.appendChild(products);
                    row.appendChild(total);
                    row.appendChild(name);
                    row.appendChild(action);

                    listOrders.appendChild(row);

                }
            }
        }

    );
});

//search post code
let search = select('#search');
let address = select('#address');
searchPostCode(search, address);



// create order
let orderForm = document.querySelector('#order-form');
orderForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let products = orderForm.querySelectorAll('#products-list .item-number');
    let productsArr = [];
    products.forEach(product => {
        productsArr.push(product.textContent);
    });

    let quantities = orderForm.querySelectorAll('#products-list .quantity');
    let quantityArr = [];
    quantities.forEach(quantity => {
        quantityArr.push(parseInt(quantity.value));
    });
    let total = parseInt(select('#order-form #total').textContent.split('$')[1]);


    let postOrder = {
        customer: select('#order-form #customer').value,
        products: productsArr,
        quantities: quantityArr,
        total: total,
        phone: select('#order-form #phone').value,
        email: select('#order-form #email').value,
        address: select('#order-form #address').value,
        taxId: select('#order-form #tax-id').value,
        comment: select('#order-form textarea').value,

    };
    console.log(postOrder);
    fetch('/api/orders', {
        method: "POST",
        body: JSON.stringify(postOrder),
        headers: {
            'content-type': 'application/json'
        }
    }).then(res => res.json()).then(result => {
        console.log(result);
        if (result.success) {
            window.location.reload();
        }
    });
});