window.addEventListener('load', () => {
    let urlParams = new URLSearchParams(window.location.search);
    company = urlParams.get('company');
    fetch('/api/content').then(res => res.json())
        .then(data => {
            console.log(data);
            if (nowUser.user.auth === '一般') {
                // console.log(nowUser)
                // alert(data.message)
                window.location = `${window.location.pathname}?name=${nowUser.user.name}`;
            } else {
                let listAccounts = select('#list-accounts');
                for (let i = 0; i < data.length; i++) {
                    // console.log(data[i]);
                    let row = document.createElement('div');
                    row.className = 'row';
                    for (let j = 0; j < 5; j++) {
                        let col = document.createElement('div');
                        col.className = 'col';
                        if (j == 0) {
                            //號碼
                            col.textContent = i + 1;
                        } else if (j == 4) {
                            if (i == 0) {
                                let button = document.createElement('button');
                                button.textContent = '修改';
                                button.className = 'edit';
                                col.appendChild(button);
                            } else {
                                for (let b = 0; b < 2; b++) {
                                    let button = document.createElement('button');
                                    if (b == 0) {
                                        button.textContent = '修改';
                                        button.className = 'edit';
                                    } else {
                                        button.textContent = '刪除';
                                        button.className = 'delete';
                                    }
                                    col.appendChild(button);
                                }
                            }
                        } else {
                            //name,email,authority
                            col.textContent = data[i][j - 1];
                        }
                        row.appendChild(col);
                    }
                    listAccounts.appendChild(row);
                }
                editButton();
                deleteButton();
            }
        });

});

// create new accounts
let createAccount = document.querySelector('#create-account');
createAccount.addEventListener('submit', (event) => {
    event.preventDefault();
    let values = createAccount.querySelectorAll('input');
    let selects = createAccount.querySelectorAll('select option');
    let auth;
    selects.forEach(select => {
        if (select.selected) {
            auth = select.value;
        }
    });
    let account = {
        name: values[0].value,
        email: values[1].value,
        password: values[2].value,
        authority: auth
    };
    // console.log(account);

    fetch('/api/content', {
        method: 'POST',
        body: JSON.stringify(account),
        headers: {
            'content-type': 'application/json'
        },
    }).then(resp => resp.json()).then(res => {
        if (res.success) {
            alert('新增成功');
            window.location.reload();
        } else {
            alert(res.message);
        }
    });
});

// edit account
function editButton() {
    let edits = selectAll('.edit');
    edits.forEach(edit => {
        edit.addEventListener('click', () => {
            let name = edit.parentNode.parentNode.querySelectorAll('.col')[1].textContent;
            window.location = `${window.location}?name=${name}`;
        });
    });
}

//delete button
function deleteButton() {
    let deletes = selectAll('.delete');
    deletes.forEach(del => {
        del.addEventListener('click', () => {
            let name = del.parentNode.parentNode.querySelectorAll('.col')[1].textContent;
            let email = del.parentNode.parentNode.querySelectorAll('.col')[2].textContent;

            let account = {
                name: name,
                email: email
            };
            fetch('/api/content', {
                    method: 'DELETE',
                    body: JSON.stringify(account),
                    headers: {
                        'content-type': 'application/json'
                    }
                }).then(res => res.json())
                .then(result => {
                    console.log(result);
                    if (result.success) {
                        alert('帳號已刪除');
                        window.location.reload();
                    } else {
                        alert('刪除失敗');
                    }
                });
        });
    });
}