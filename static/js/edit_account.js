let inputs;
let selectValue;
let urlParams = new URLSearchParams(window.location.search);
name = urlParams.get('name');
console.log(window.location);
fetch(`/api/content?name=${name}`).then(res => res.json())
    .then(user => {
        console.log(user);
        if (user.result === 'error') {
            window.location = `${window.location.pathname}?name=${nowUser.user.name}`;
        } else {
            inputs = selectAll('input');
            for (let i = 0; i < 2; i++) {
                inputs[i].value = user[i];
            }
            let auth = select('#auth');
            auth.textContent = user[2];
        }
    });



let editAccount = select('#edit-account');
editAccount.addEventListener('submit', (event) => {
    event.preventDefault();

    editData = {
        originName: name,
        name: inputs[0].value,
        email: inputs[1].value,
        oldPassword: inputs[2].value,
        newPassword: inputs[3].value,

    };
    fetch('/api/content', {
        method: 'PATCH',
        body: JSON.stringify(editData),
        headers: {
            'content-type': 'application/json'
        },
    }).then(res => res.json()).then(result => {
        if (result.result === 'success') {
            alert('修改成功');
            window.location = `
                $ {
                    window.location.pathname
                } ? name = $ {
                    editData.name
                }
                `;
        } else {
            alert(result.message);
        }
    });
});