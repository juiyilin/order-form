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
    let region = document.createElement('p');
    if (tag.id === 'domestic') {
        region.textContent = '國內';
    } else {
        region.textContent = '國外';
    }
    tag.appendChild(region);
    let head = ['選取', '名稱', '期間', '動作'];
    let row = document.createElement('div');
    row.className = 'row';
    head.forEach(h => {

        let column = document.createElement('div');
        column.className = 'col';
        column.textContent = h;
        row.appendChild(column);
    });
    tag.appendChild(row);

    array.forEach(arr => {
        let label = document.createElement('label');
        label.className = 'row';

        let div = document.createElement('div');
        let input = document.createElement('input');
        input.type = 'radio';
        input.name = 'show';
        input.value = arr[1];
        div.appendChild(input);

        let showName = document.createElement('div');
        showName.textContent = arr[1];
        showName.className = 'show-name';

        let period = document.createElement('div');
        period.textContent = `${arr[2]}-${arr[3]}`;
        period.className = 'period';

        let action = document.createElement('div');
        action.className = 'action';
        let img = document.createElement('img');
        img.className = 'delete';
        img.title = '刪除';
        img.src = '/static/img/icon_delete.png';
        img.width = 20;
        deleteBtn(img);
        action.appendChild(img);


        label.appendChild(div);
        label.appendChild(showName);
        label.appendChild(period);
        label.appendChild(action);

        tag.appendChild(label);
    });
}




function deleteBtn(btn) {
    btn.addEventListener('click', (event) => {
        event.preventDefault();
        let check = confirm('確認後將刪除所有消費者資訊，確定刪除？');
        if (check) {
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
        alert('開始日期必須小於或等於結束日期');
    } else {
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
                if (!result.success) {
                    alert(result.message);
                } else {
                    console.log(result);
                    window.location = `/${nowUser.company.company}/shows/${showData.showName}`;
                }
            });
    }
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
            fetch(`/api/show/${input.value}`).then(res => res.json()).then(result => {
                if (result.success) {
                    window.location = `/${nowUser.company.company}/shows/${input.value}`;
                }
            });

        }
    });
});