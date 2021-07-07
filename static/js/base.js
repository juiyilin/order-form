function select(dom) {
    return document.querySelector(dom);
}

function selectAll(dom) {
    return document.querySelectorAll(dom);
}

function edit(tag, user) {
    let link = document.createElement('a');
    if (user.auth === '高') {
        link.href = `/${user.company}/accounts`;
    } else {
        link.href = `/${user.company}/accounts?name=${user.name}`;
    }
    link.textContent = '管理帳號';
    tag.appendChild(link);
}

function logout(logout) {
    logout.textContent = '登出';
    logout.addEventListener('click', () => {
        fetch('/api/status', {
            method: 'DELETE'
        }).then(res => res.json()).then(result => {
            console.log(result);
            window.location.reload();
        });
    });
}
let nowUser;
fetch('/api/status').then(res => res.json())
    .then(user => {
        nowUser = user;
        console.log('status', user);
        let welcome = select('#welcome');
        let manage = select('#manage');
        let show = select('#show');
        let log = select('#log');
        if (user.user === null) {
            console.log(window.location);

            if (window.location.pathname !== '/') {
                window.location = '/';

            }
        } else {
            welcome.textContent = `Hello, ${user.user.name}`;
            edit(manage, user.user);
            logout(log);
        }
    });