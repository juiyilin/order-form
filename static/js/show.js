//calendar
let datalist = document.querySelector('form datalist');
let showArray = ['aaa', 'bbb', 'ccc', 'bxx'];
showArray.forEach(show => {
    let option = document.createElement('option');
    option.value = show;
    option.textContent = show;
    datalist.appendChild(option);
});

//http://www.daterangepicker.com/#example1
$('input[name="dates"]').daterangepicker();

//create show submit
let create = document.querySelector('#create-show');
create.addEventListener('submit', (event) => {
    event.preventDefault();
    let showData = document.querySelectorAll('#create-show input');
    showData.forEach(show => {
        console.log(show.value);
    });
    //TODO:session 資料庫
    window.location = `${showData[2].value}/order`;
});


//choose show submit
let choose = document.querySelector('#choose-show');
choose.addEventListener('submit', (event) => {
    event.preventDefault();
    let chooseData = choose.querySelector('#choose').value;
    console.log(chooseData);
    // TODO:資料庫
    window.location = `${chooseData}/order`;
});