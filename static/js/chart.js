async function loadData() {
    let f = await fetch('/api/orders');
    let response = await f.json();
    let sum = sumQuantity(response);
    return sum;
}

function sumQuantity(array) {
    let pqobj = {};

    for (let i = 0; i < array.length; i++) {
        let products = array[i].products;
        let quantities = array[i].quantities;
        // console.log(products)
        // console.log(quantities)
        for (let j = 0; j < products.length; j++) {
            if (pqobj[products[j]] === undefined) {
                pqobj[products[j]] = quantities[j];
            } else {
                pqobj[products[j]] += quantities[j];
            }
        }
    }
    // console.log(pqobj);
    return pqobj;
}

function pieChart(pqarray) {
    let pieArray = [
        ['品項', '數量']
    ];
    for (let i in pqarray) {
        pieArray.push([i, pqarray[i]]);
    }
    console.log(pieArray);
    let data = google.visualization.arrayToDataTable(pieArray);

    let options = {
        title: '各品項數量(%)',
        titleTextStyle: {
            fontSize: 16
        },
        height: 500,
        pieSliceText: 'value-and-percentage',
        legend: {
            position: 'right',
            alignment: 'center',
        },
        // colors: ['#e0440e', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6', 'rgb(0,0,255)'],
    };

    let chart = new google.visualization.PieChart(document.getElementById('piechart'));

    chart.draw(data, options);
}

function barChart(pqarray) {
    let barArray = [
        ['品項', '數量']
    ];
    for (let i in pqarray) {
        barArray.push([i, pqarray[i]]);
    }
    let data = google.visualization.arrayToDataTable(barArray);

    // let view = new google.visualization.DataView(data);
    // view.setColumns([0, 1,
    //     {
    //         calc: "stringify",
    //         sourceColumn: 1,
    //         type: "string",
    //         role: "annotation"
    //     },
    //     2
    // ]);

    let options = {
        title: "各品項數量",
        height: 500,
        bar: {
            groupWidth: "95%"
        },
        // legend: {
        //     position: "none"
        // },
    };
    let chart = new google.visualization.ColumnChart(document.getElementById("barchart"));
    chart.draw(data, options);
}

let sumPQ = loadData();
sumPQ.then(pq => {
    // console.log(pq);

    google.charts.load('current', {
        'packages': ['corechart']
    });
    google.charts.setOnLoadCallback(() => {
        pieChart(pq);
    });
    google.charts.setOnLoadCallback(() => {
        barChart(pq);
    });
    window.addEventListener('resize', () => {
        pieChart(pq);
        barChart(pq);


    });
});