function listProducts(data) {
    let listProducts = select('#list-products');

    for (let j = 0; j < data.length; j++) {
        let row = document.createElement('div');
        row.className = 'row';
        for (let i = 0; i <= data[j].length + 1; i++) {
            let col = document.createElement('div');
            col.className = 'col';
            if (i == 0) {
                col.textContent = j + 1;

            } else if (i == data[j].length + 1) {
                let delBtn = document.createElement('button');
                delBtn.textContent = '刪除';
                delProduct(delBtn);
                col.appendChild(delBtn);
            } else {
                col.textContent = data[j][i - 1];
            }
            row.appendChild(col);
        }
        listProducts.appendChild(row);
    }

}

function delProduct(btn) {
    btn.addEventListener('click', () => {
        let row = btn.parentNode.parentNode.querySelectorAll('.col');
        let itemNumber = row[1].textContent;
        let price = row[2].textContent;
        fetch('/api/products', {
            method: 'DELETE',
            body: JSON.stringify({
                itemNumber: itemNumber,
                price: price
            }),
            headers: {
                'content-type': 'application/json'
            }
        }).then(res => res.json()).then(result => {
            if (result.success) {
                alert('刪除成功');
                window.location.reload();
            }
        });
    });
}

let createPoducts = select('#create-products');
createPoducts.addEventListener('submit', (event) => {
    event.preventDefault();
    let inputs = createPoducts.querySelectorAll('input');
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
        if (result.success) {
            alert('新增成功');
            window.location.reload();
        } else {
            alert(result.message);
        }
    });
});

window.addEventListener('load', () => {
    fetch('/api/products').then(res => res.json())
        .then(result => {
            listProducts(result);
        });
});