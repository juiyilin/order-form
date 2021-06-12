console.log('start')
let submitBtn = document.getElementById('btn');
// console.log(submitBtn)
submitBtn.addEventListener('click', function () {
    const orderNum = document.getElementsByName('order-number').values;
    const endForm = document.getElementsByTagName('form');
    const tag = document.createElement('p');
    const content = document.createTextNode(`${orderNum}已建立`);
    tag.appendChild(content);
    console.log(orderNum);
    endForm.appendChild(tag);

})