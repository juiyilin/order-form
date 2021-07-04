let before;
let urlParams = new URLSearchParams(window.location.search);
name = urlParams.get('name');
console.log(window.location);
fetch(`/api/content?name=${name}`).then(res => res.json())
    .then(user => {
        console.log(user);
        if (user.result === 'error') {
            // alert(user.message)
            window.location = `${window.location.pathname}?name=${nowUser.user.name}`;
        } else {
            before = selectAll('#before span');
            for (let i = 0; i < 2; i++) {
                before[i].textContent = user[i];
            }

        }
    });



let editAccount = select('#edit-account');
editAccount.addEventListener('submit', (event) => {
    event.preventDefault();
    inputs = selectAll('#edit-account input');

    editData = {
        oldName: before[0].textContent,
        oldEmail: before[1].textContent,
        oldPassword: inputs[0].value,
        newName: inputs[1].value,
        newEail: inputs[2].value,
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
            window.location = `${window.location.pathname}?name=${editData.newName}`;
        } else {
            alert(result.message);
        }
    });
});