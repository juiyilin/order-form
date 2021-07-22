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

async function loadData() {
    let productsList = await loadProducts(sum);
    loadOrder(productsList);

}

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
        price.textContent = product[1];
        priceArray.push(price);

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
    // console.log(productsList);
    return productsList;

}

function loadOrder(productsList) {
    let orderNum = window.location.pathname.split('/')[4];
    fetch(`/api/order/${orderNum}`).then(res => res.json()).then(data => {
        // console.log(data);

        select('#customer').value = data.customer;
        select('#phone').value = data.phone;
        select('#email').value = data.email;
        select('#address').value = data.address;
        select('#tax-id').value = data.tax_id;
        select('#comment').value = data.comment;
        select('#submitter').textContent = data.submitter;

        //#list-products 
        let priceList = productsList.querySelectorAll('.price');
        let quantitiesList = productsList.querySelectorAll('.quantity');
        let amountList = productsList.querySelectorAll('.amount');
        for (let i = 0; i < data.products.length; i++) {
            quantitiesList[i].value = data.quantities[i];
            amountList[i].textContent = parseInt(priceList[i].textContent) * data.quantities[i];
        }
        select('#total').textContent = `總計 $${data.total}`;
    });
}


//back
let backPath = window.location.pathname.split('/').slice(0, 4).join('/');
select('#back').href = `${backPath}`;

//load data
let sum = 0;
loadData();




//search post code
let search = select('#search');
let address = select('#address');
searchPostCode(search, address);

// edit order
let orderForm = document.querySelector('#order-form');
orderForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let products = orderForm.querySelectorAll('#list-products .item-number');
    let productsArr = [];
    products.forEach(product => {
        productsArr.push(product.textContent);
    });

    let quantities = orderForm.querySelectorAll('#list-products .quantity');
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
    let orderNum = window.location.pathname.split('/')[4];

    fetch(`/api/order/${orderNum}`, {
        method: "PATCH",
        body: JSON.stringify(postOrder),
        headers: {
            'content-type': 'application/json'
        }
    }).then(res => res.json()).then(result => {
        console.log(result);
        if (result.success) {
            alert('修改成功');
            window.location.reload();
        } else {
            alert(result.message);
        }
    });
});