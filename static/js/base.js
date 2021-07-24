function select(dom) {
    return document.querySelector(dom);
}

function selectAll(dom) {
    return document.querySelectorAll(dom);
}

function edit(tag, company, user, text) {
    let link = document.createElement('a');
    let route = tag.id.split('-')[1];
    if (route == 'accounts') {
        if (user.auth === '高') {
            link.href = `/${company.company}/${route}`;
        } else {
            link.href = `/${company.company}/${route}?name=${user.name}`;
        }
    } else {
        link.href = `/${company.company}/${route}`;
    }
    link.textContent = text;
    tag.appendChild(link);
}

function logout(logout) {
    logout.textContent = '登出';
    logout.addEventListener('click', () => {
        fetch('/api/status', {
            method: 'DELETE'
        }).then(res => res.json()).then(result => {
            if (result.success) {
                window.location = '/';
            }
        });
    });
}
let nowUser;
fetch('/api/status').then(res => res.json())
    .then(user => {
        nowUser = user;
        console.log('status', user);
        let loginCompany = select('#login-company');
        let welcome = select('#welcome');
        let manageAccount = select('#manage-accounts');
        let manageProduct = select('#manage-products');
        let manageShow = select('#manage-shows');
        let log = select('#log');
        if (Object.keys(user).length === 0) {
            console.log(window.location);

            if (window.location.pathname !== '/') {
                window.location = '/';
            }
        } else {
            loginCompany.textContent = user.company.company;
            welcome.textContent = `Hello, ${user.user.name}`;
            let menu = [manageAccount, manageProduct, manageShow];
            let menuText = ['帳號', '產品', '展覽'];
            for (let i = 0; i < menu.length; i++) {
                edit(menu[i], user.company, user.user, menuText[i]);
            }
            logout(log);
            let expandImg = select('#expand img');
            expandImg.src = '/static/img/expand.png';
        }
    });

//expend menu
let img = select('img');
img.addEventListener('click', () => {
    let right2 = select('.right-2');
    console.log(right2)
    if (right2.style.display == 'flex') {
        right2.style.display = 'none';
    } else {
        right2.style.display = 'flex';
    }
});