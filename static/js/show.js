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
    let region = document.createElement('div')
    region.textContent = tag.id;
    tag.appendChild(region)

    array.forEach(a => {
        let row = document.createElement('div');
        row.className = 'row'
        let showName = document.createElement('div')
        showName.textContent = a[0]
        showName.className = 'show-name'
        let period = document.createElement('div')
        period.textContent = `${a[1]}-${a[2]}`
        period.className = 'period'
        row.appendChild(showName)
        row.appendChild(period)
        tag.appendChild(row)
    })
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

    //TODO:session 資料庫
    fetch('/api/shows', {
            method: 'POST',
            body: JSON.stringify(showData),
            headers: {
                'content-type': 'application/json'
            }
        }).then(res => res.json())
        .then(result => {
            if (result.result === 'error') {
                alert(result.message)
            } else {
                console.log(result)
                window.location = `/${nowUser.user.company}/show/${showData.showName}`;
            }
        });
});


//choose show 
window.addEventListener('load', () => {
    fetch('/api/shows').then(res => res.json())
        .then(result => {
            console.log(result)
            let domestic = select('#domestic');
            let foreign = select('#foreign');
            listShow(domestic, result.domestic)
            listShow(foreign, result.foreign)
        })

    // TODO:資料庫
    // window.location = `/${nowUser.user.company}/${chooseData}/order`;
});