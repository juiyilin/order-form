let forms = selectAll('form');
forms.forEach(form => {
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        console.log(form);

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
                console.log(result);
                if (result.user) {
                    window.location = `/${result.user.company}/menu`;

                } else {
                    alert(result.message);
                }
            });
        } else {
            // signup
            let input = selectAll('#signup-form input');
            let data = {
                company: input[0].value,
                name: input[1].value,
                email: input[2].value,
                password: input[3].value
            };
            fetch('/api/content', {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'content-type': 'application/json'
                    },
                }).then(res => res.json())
                .then(result => {
                    console.log(result);
                    if (result.success) {

                        // window.location = '/show';
                        window.location = `/${data.company}/accounts`;
                    } else {
                        alert(result.message);
                    }
                });
        }
    });
});