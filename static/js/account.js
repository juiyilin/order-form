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
                                let img = document.createElement('img');
                                img.src = '/static/img/edit_24dp.png';
                                img.width = '20';
                                img.className = 'edit';
                                img.title = '修改';
                                col.appendChild(img);
                            } else {
                                for (let b = 0; b < 2; b++) {
                                    let img = document.createElement('img');
                                    if (b == 0) {
                                        img.src = '/static/img/edit_24dp.png';
                                        img.width = '20';
                                        img.className = 'edit';
                                        img.title = '修改';
                                    } else {
                                        img.src = '/static/img/icon_delete.png';
                                        img.width = '20';
                                        img.className = 'delete';
                                        img.title = '刪除';

                                    }
                                    col.appendChild(img);
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
let values = createAccount.querySelectorAll('input');
let selectTag = createAccount.querySelector('select');
selectTag.addEventListener('change', () => {

    console.log(selectTag.value);
    let sub = createAccount.querySelector('sub');
    if (selectTag.value === '高') {
        sub.textContent = '可管理所有帳號資料';
    } else if (selectTag.value === '一般') {
        sub.textContent = '僅可修改自己帳號資料';
    } else {
        sub.textContent = '';
    }

});
createAccount.addEventListener('submit', (event) => {
    event.preventDefault();
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
    if (account.authority === '---') {
        alert('請選擇帳號權限');
    } else {
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
    }
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
            let check = confirm('確定刪除嗎');
            if (check) {
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
            }
        });
    });
}