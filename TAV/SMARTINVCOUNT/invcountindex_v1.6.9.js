//--------------------------------------------------------------RAWss FUNCTIONS-----------------------------------------
var validate = (cell) => {
    console.log('cell.getData()', cell.getData());
    return true;
}

//------------------------------------------------FORMAT DATES CALCULATED--------------------------------------------------------

const formatDate = (date) => {
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let year = date.getFullYear();
    return `${year}-${month}-${day}`;
}
//------------------------------------------------FORMAT NUMBERS CALCULATED--------------------------------------------------------

const formatNumber = (num) => {
    const roundedNum = Math.round(num * 100) / 100;
    const [integerPart, decimalPart] = roundedNum.toString().split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const formattedDecimal = decimalPart ? decimalPart.padEnd(2, '0') : '00';
    return `${formattedInteger},${formattedDecimal}`;
}

//----------------------------------------------DEFAULT DATES------------------------------------------------
const setDefaultDates = () => {
    let today = new Date();
    let startDateInput = document.getElementById('start-date');
    let endDateInput = document.getElementById('end-date');

    if (!startDateInput.value) { startDateInput.value = formatDate(today); }
    if (!endDateInput.value) { endDateInput.value = formatDate(today); }
}

const binTypes = ['PROD', 'MAG', 'SPED', 'KARDEX'];
var multiSelectHeaderFilter = (cell) => {
    var values = binTypes;
    const filterFunc = (rowData) => {
        return values.includes(rowData['bin']);
    }
    const getSelectedValues = (multiSelect) => {
        var result = [];
        var options = multiSelect && multiSelect.options;
        var opt;
        for (var i = 0, iLen = options.length; i < iLen; i++) {
            opt = options[i];
            if (opt.selected) { result.push(opt.value || opt.text); }
        }
        return result;
    }
    const onChange = () => {
        var editor = document.getElementById('binSelector');
        values = getSelectedValues(editor);
        console.log("values: " + values);
        cell.getColumn().getTable().removeFilter(filterFunc);
        cell.getColumn().getTable().addFilter(filterFunc);
    }
    var select = document.createElement("select");
    select.multiple = "multiple";
    select.id = 'binSelector';
    select.class = "chosen-select";
    select.style = 'width: 100%';
    binTypes.forEach(bins => {
        select.innerHTML += "<option id='" + bins + "' value='" + bins + "' selected='selected'>" + bins + "</option>";
    });
    cell.getColumn().getTable().addFilter(filterFunc);
    select.addEventListener('change', onChange);
    return select;
}

var editCheck = (cell) => {
    return !cell.getRow().getData().hold;
}

var linkFormatter = (cell, formatterParams) => {
    let value = cell.getValue();
    let url = 'https://example.com/' + encodeURIComponent(value);
    cell.getElement().style.backgroundColor = "#ffffbf";
    return `<a href="${url}" target="_blank">${value}</a>`;
};

var stdFormatter = (cell, formatterParams) => {
    let value = cell.getValue();
    cell.getElement().style.backgroundColor = "#ffffbf";
    return value;
};

var stdBoldFormatter = (cell, formatterParams) => {
    let value = cell.getValue();
    cell.getElement().style.backgroundColor = "#ffffbf";
    return `<strong>${value}</strong>`;
};

var detailFormatter = (cell, formatterParams) => {
    let value = cell.getValue();
    cell.getElement().style.backgroundColor = "#ffffbf";
    let button = '<button id="opensss" class="sexy-button" onclick="openWind(event, \'' + value + '\')">Apri Transazione</button>';
    return button;
};

var recordtypeFormatter = (cell, formatterParams) => {
    let value = cell.getValue();
    cell.getElement().style.backgroundColor = "#ffffbf";
    return '<u>' + value + '</u>';
};

var inventoryValueFormatter = (cell, formatterParams) => {
    let value = cell.getValue();
    cell.getElement().style.backgroundColor = "#ffffbf";
    return parseFloat(value).toFixed(2);
};

var openWind = (event, url) => {
    event.preventDefault();
    window.open(url, '_blank');
}
var dataFilter = (headerValue, rowValue, rowData, filterParams) => { return rowData.name == filterParams.name && rowValue < headerValue; }
var createLoadingIcon = () => {
    const loadingIcon = document.createElement('div');
    loadingIcon.id = 'loading-icon';
    loadingIcon.style.cssText = `
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
  `;
    const spinner = document.createElement('div');
    spinner.style.cssText = `
    border: 7px solid #f3f3f3;
    border-top: 7px solid #39ff14; 
    border-radius: 50%;
    width: 75px;
    height: 75px;
    animation: spin 1s linear infinite;
  `;
    loadingIcon.appendChild(spinner);
    document.body.appendChild(loadingIcon);

    const style = document.createElement('style');
    style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }`;
    document.head.appendChild(style);
    return loadingIcon;
};
//----------------------------------------------------------------TABULATOR-----------------------------------------------------
const table = new Tabulator("#report-wip", {
    movableRows: false,
    dataTree: true,
    groupBy: "account",
    groupStartOpen: false,
    groupToggleElement: "header",
    groupHeader: "",
    tabulatorId: "report-wip-table",
    ajaxURL: '',
    ajaxParams: {},
    ajaxFiltering: false,
    rowHeader: {
        resizable: true,
        frozen: true,
        width: 70,
        formatter: (cell) => { cell.getRow().getPosition(); },
        hozAlign: "center"
    },
    columnDefaults: { headerSort: true, resizable: "header" },
    dataLoaderLoading: "Loading data...",
    placeholder: "No DATA Found...",
    pagination: "local",
    paginationSize: 150,
    ajaxProgressiveLoad: "scroll",
    rowFormatter: (row) => {
        let data = row.getData();
        if (data.item_value == 0) {
            let cells = row.getCells();
            cells.forEach(cell => {
                cell.getElement().style.color = "red";
                cell.getElement().style.fontWeight = "bold";
            });
        }
    }
});
document.getElementById('report-wip').style.display = 'none';
document.getElementById('table-title').style.display = 'none';
let bin = {
    title: "Bin",
    field: "bin",
    headerFilter: "input",
    formatter: stdBoldFormatter,
    width: 130,
    headerFilterPlaceholder: "Filter Bin"
};
table.addColumn(bin);
let item = {
    title: "Articolo",
    field: "item",
    headerFilter: "input",
    formatter: stdFormatter,
    width: 250,
    headerFilterPlaceholder: "Filter Article"
};
table.addColumn(item);

let shelfnetsuite = {
    title: "Shelf NetSuite",
    field: "shelfnetsuite",
    headerFilter: "input",
    formatter: stdFormatter,
    width: 200,
    headerFilterPlaceholder: "Filter Shelf"
};
table.addColumn(shelfnetsuite);

let shelfkardex = {
    title: "Shelf Kardex",
    field: "shelfkardex",
    headerFilter: "input",
    formatter: stdFormatter,
    width: 200,
    headerFilterPlaceholder: "Filter Shelf"
};
table.addColumn(shelfkardex);

let qtynetsuite = {
    title: "Quantity NetSuite",
    field: "qtynetsuite",
    formatter: stdFormatter,
    width: 200,
    validator: ["numeric", "min:0"]
};
table.addColumn(qtynetsuite);

let qtykardex = {
    title: "Quantity Kardex",
    field: "qtykardex",
    formatter: stdFormatter,
    width: 200,
    validator: ["numeric", "min:0"]
};
table.addColumn(qtykardex);
let quantity = {
    title: "Quantity Contata",
    field: "qty",
    editor: "input",
    formatter: stdFormatter,
    width: 200,
    validator: ["numeric", "min:0"],
    editorParams: {
        selectContents: true
    }
};
table.addColumn(quantity);

let binColumns = {
    title: "Valore Differenza",
    field: "valuedifference",
    formatter: inventoryValueFormatter,
    bottomCalc: 'sum',
    bottomCalcParams: { precision: 2 },
    width: 260,
    validator: "numeric"
}
table.addColumn(binColumns);

let inventoryValueColumns = {
    title: "Valore al Costo Medio", field: "item_value", editor: "textarea", validator: '', width: 260, minWidth: 150, maxWidth: 300, editable: false, formatter: inventoryValueFormatter,
    bottomCalc: 'sum', tooltip: 'Valore al Costo Medio', bottomCalcParams: { precision: 2 },
};
table.addColumn(inventoryValueColumns);

const loadingIcon = createLoadingIcon();
const reportWIP = document.getElementById('report-wip');
const tableTitle = document.getElementById('table-title');
loadingIcon.style.display = 'block';
reportWIP.style.display = 'none';
tableTitle.style.display = 'none';


//---------------------------------------------------APPLY FILTER EVENT DATA---------------------------------------------------
document.getElementById('apply-load-inventorycount').addEventListener('click', (event) => {
    event.preventDefault();

    let startDateInput = document.getElementById('start-date');
    let endDateInput = document.getElementById('end-date');
    let startDate = startDateInput.value;
    let endDate = endDateInput.value;

    let params = {};
    if (!startDate) {
        startDate = formatDate(new Date());
        startDateInput.value = startDate;
    }
    if (!endDate) {
        endDate = formatDate(new Date());
        endDateInput.value = endDate;
    }

    const loadingIcon = createLoadingIcon();
    loadingIcon.style.display = 'block';
    document.getElementById('report-wip').style.display = 'none';
    document.getElementById('table-title').style.display = 'none';

    require(['N/https', 'N/url', 'N/search'], (https, url, search) => {
        let resourcesUrl = url.resolveScript({
            scriptId: 'customscript_gn_rl_reportwip_data',
            deploymentId: 'customdeploy_gn_rl_reportwip_data',
            params: {}
        });

        params.startDate = startDate;
        params.endDate = endDate;

        https.post.promise({
            url: resourcesUrl,
            body: JSON.stringify(params),
            headers: { 'Content-Type': 'application/json' }
        })
            .then((response) => {
                let data = JSON.parse(response.body);
                table.setData(data.data);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                loadingIcon.style.display = 'none';
                document.getElementById('report-wip').style.display = 'block';
                document.getElementById('table-title').style.display = 'block';
            });
    });
});


