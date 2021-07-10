let showName = document.querySelectorAll('.show-name');
showName.forEach(showname => {
    // console.log(window.location.pathname.split('/'))
    showname.textContent = decodeURIComponent(window.location.pathname.split('/')[3]);
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

//search post code
let search = select('#search');
search.addEventListener('click', (event) => {
    event.preventDefault();
    let address = select('#address');
    fetch(`http://zip5.5432.tw/zip5json.py?adrs=${address.value}`).then(res => res.json())
        .then(data => {
            console.log(data)
            if (data.zipcode === '' || data.zipcode6 === '') {
                alert('請確認\n1. 住址是否填寫完整\n2. 巷、弄、號是否用半形數字輸入')
            } else {
                address.value = data.new_adrs;
                console.log(data.new_adrs)
            }
        })

})