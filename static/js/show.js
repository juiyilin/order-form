//calendar
// let datalist = select('form datalist');
// let showArray = ['aaa', 'bbb', 'ccc', 'bxx'];
// showArray.forEach(show => {
//     let option = document.createElement('option');
//     option.value = show;
//     option.textContent = show;
//     datalist.appendChild(option);
// });

//http://www.daterangepicker.com/#example1
// $('input[name="dates"]').daterangepicker();

function listShow(tag, array) {
    let region = document.createElement('div');
    region.textContent = tag.id;
    tag.appendChild(region);

    array.forEach(arr => {
        let label = document.createElement('label');
        label.className = 'row';

        let input = document.createElement('input');
        input.type = 'radio';
        input.name = 'show';
        input.value = arr[0];

        let showName = document.createElement('div');
        showName.textContent = arr[0];
        showName.className = 'show-name';

        let period = document.createElement('div');
        period.textContent = `${arr[1]}-${arr[2]}`;
        period.className = 'period';

        let action = document.createElement('div');
        action.className = 'action';
        let button = document.createElement('button');
        button.className = 'delete';
        button.textContent = '刪除';
        deleteBtn(button);
        action.appendChild(button);


        label.appendChild(input);
        label.appendChild(showName);
        label.appendChild(period);
        label.appendChild(action);

        tag.appendChild(label);
    });
}




function deleteBtn(btn) {
    btn.addEventListener('click', (event) => {
        event.preventDefault();
        let input = btn.parentNode.parentNode.querySelector('input');
        input.checked = true;

        if (input.checked) {
            console.log(input.value);
            fetch('/api/shows', {
                    method: 'DELETE',
                    body: JSON.stringify({
                        showName: input.value
                    }),
                    headers: {
                        'content-type': 'application/json'
                    }
                }).then(res => res.json())
                .then(result => {
                    console.log(result);
                    if (result.success) {
                        window.location.reload();
                    } else {
                        alert(result.message);
                    }
                });

        }
    });
}




//create show 
let create = select('#create-show');
create.addEventListener('submit', (event) => {
    event.preventDefault();
    let showRegion = create.querySelectorAll('input[type=radio]');
    let region;
    showRegion.forEach(showregion => {
        if (showregion.checked) {
            region = showregion.value;
        }
    });
    let start = create.querySelectorAll('input[type=date]')[0].value;
    let end = create.querySelectorAll('input[type=date]')[1].value;
    if (new Date(start) > new Date(end)) {
        alert('開始日期必須大於或等於結束日期');
    }

    let showData = {
        region: region,
        showName: create.querySelector('input[type=text]').value,
        start: start,
        end: end,
    };
    console.log(showData);

    fetch('/api/shows', {
            method: 'POST',
            body: JSON.stringify(showData),
            headers: {
                'content-type': 'application/json'
            }
        }).then(res => res.json())
        .then(result => {
            if (result.result === 'error') {
                alert(result.message);
            } else {
                console.log(result);
                window.location = `/${nowUser.user.company}/show/${showData.showName}`;
            }
        });
});


//load show 
window.addEventListener('load', () => {
    fetch('/api/shows').then(res => res.json())
        .then(result => {
            console.log(result);
            let domestic = select('#domestic');
            let foreign = select('#foreign');
            listShow(domestic, result.domestic);
            listShow(foreign, result.foreign);
        });


});

//choose show
let choose = select('#choose-show');
choose.addEventListener('submit', (event) => {
    event.preventDefault();
    let inputs = choose.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.checked) {
            console.log(input.value);
            window.location = `/${nowUser.user.company}/shows/${input.value}`;

        }
    });
});