let forms = selectAll('form');
forms.forEach(form => {
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        // login
        if (form.id === 'login-form') {
            let input = selectAll('#login-form input');
            let data = {
                company: input[0].value,
                email: input[1].value,
                password: input[2].value
            };
            fetch('/api/status', {
                method: 'PATCH',
                body: JSON.stringify(data),
                headers: {
                    'content-type': 'application/json'
                },
            }).then(res => res.json()).then(result => {
                // console.log(result);
                if (result.user) {
                    window.location = `/${result.user.company}/menu`;

                } else {
                    alert(result.message);
                }
            });
        } else {
            let processing = select('#processing');
            processing.style.display = 'block';
            processing.textContent = '註冊中...';
            // signup
            let input = selectAll('#signup-form input');

            let formData = new FormData();
            for (let i = 0; i < input.length; i++) {
                let keys = ['company', 'logo', 'name', 'email', 'password'];
                if (i == 1) {
                    if (input[i].files[0] === undefined) {
                        formData.append(keys[i], '');

                    } else {
                        formData.append(keys[i], input[i].files[0]);
                    }

                } else {
                    formData.append(keys[i], input[i].value);
                }

            }

            fetch('/api/content', {
                    method: 'POST',
                    body: formData,
                }).then(res => res.json())
                .then(result => {
                    // console.log(result);
                    if (result.success) {
                        window.location = `/${formData.get('company')}/menu`;
                    } else {
                        alert(result.message);
                        processing.style.display = 'none';
                    }
                });
        }
    });
});
let switches = selectAll('.switch');
for (let i = 0; i < switches.length; i++) {
    switches[i].addEventListener('click', () => {
        if (switches[i].parentNode.style.display === '' || switches[i].parentNode.style.display === 'flex') {
            switches[i].parentNode.style.display = 'none';
            switches[switches.length - i - 1].parentNode.style.display = 'flex';
        }

    });
}

//upload logo
let label = select('label');
let uploadImg = label.querySelector('#upload-img');
let view = label.querySelector('#view');
uploadImg.addEventListener('change', () => {
    let img = uploadImg.files[0];

    if (img) {
        if (img.size / 1024 / 1024 < 2) {
            view.textContent = '';
            let image = document.createElement('img');
            image.src = URL.createObjectURL(img);
            view.appendChild(image);
        } else {
            alert('檔案請勿超過2MB');
        }
    }
});