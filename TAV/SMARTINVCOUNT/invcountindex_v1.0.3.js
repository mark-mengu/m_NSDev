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
const table = new Tabulator("#inventorycount-table", {
    movableRows: false,
    dataTree: true,
    groupBy: "account",
    groupStartOpen: false,
    groupToggleElement: "header",
    groupHeader: (value, count, data, group) => {
        let totalValue = data.reduce((sum, row) => Number(sum) + Number(row.item_value), 0);
        return value +
            `<span style='color:#007bff; margin-left:10px;'>"` + count + `" risultati"</span>` +
            `<span style='margin-left:20px; padding: 5px; border: 2px solid #ffcc00; background-color: #ffeb3b; font-weight: bold;'>` +
            `TOTALE CONTO: ` + totalValue.toLocaleString('it-IT', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + ` </span>`;
    },
    tabulatorId: "inventorycount-table",
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
    paginationSize: 500,
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

document.getElementById('report-inventorycount').style.display = 'none';
document.getElementById('table-title').style.display = 'none';
require(['N/https', 'N/url', 'N/search'], (https, url, search) => {
    let resourcesUrl = url.resolveScript({
        scriptId: 'customscript_gn_rl_inventory_count_data',
        deploymentId: 'customdeploy_gn_rl_inventory_count_data',
        params: {}
    });

    let accountColumns = {
        title: "Bin", field: "bin", editor: "textarea", headerFilterPlaceholder: "Filtra per BIN...", validator: '', width: 130, minWidth: 100, maxWidth: 150, editable: false, headerFilter: "input", formatter: stdBoldFormatter, tooltip: ''
    };
    table.addColumn(accountColumns);

    let itemColumns = {
        title: "Articolo", field: "item", editor: "textarea", headerFilterPlaceholder: "Filtra per Articolo...", validator: '', editable: false, width: 500, minWidth: 300, maxWidth: 600, headerFilter: "input", formatter: stdFormatter, tooltip: 'Articolo'
    };
    table.addColumn(itemColumns);
    let trxColumns = {
        title: "Shelf", field: "shelf", editor: "textarea", validator: '', headerFilterPlaceholder: "Filtra per Shelf...", editable: false, width: 200, minWidth: 150, maxWidth: 300, headerFilter: "input", formatter: stdFormatter, tooltip: 'Articolo'
    };
    table.addColumn(trxColumns);

    let quantitynetsuiteColumns = {
        title: "Quantity", field: "quantityn", editor: "textarea", validator: '', editable: false, width: 130, minWidth: 80, maxWidth: 140, formatter: stdFormatter,
        tooltip: 'Quantità',
    };
    table.addColumn(quantitynetsuiteColumns);

    let quantitykardexColumns = {
        title: "Quantity", field: "quantityk", editor: "textarea", validator: '', editable: false, width: 130, minWidth: 80, maxWidth: 140, formatter: stdFormatter,
        tooltip: 'Quantità',
    };
    table.addColumn(quantitykardexColumns);

    let inventoryValueColumns = {
        title: "Valore al Costo Medio", field: "valuedifference", editor: "textarea", validator: '', width: 260, minWidth: 150, maxWidth: 300, editable: false, formatter: inventoryValueFormatter,
        bottomCalc: 'sum', tooltip: 'Valore al Costo Medio', bottomCalcParams: { precision: 2 },
    };
    table.addColumn(inventoryValueColumns);

    let quantityColumns = {
        title: "Quantity Effettiva Contata", field: "quantity", editor: "textarea", validator: '', editable: true, width: 130, minWidth: 80, maxWidth: 140, formatter: stdFormatter,
        tooltip: 'Quantità',
    };
    table.addColumn(quantityColumns);

    const loadingIcon = createLoadingIcon();
    const reportWIP = document.getElementById('report-wip');
    const tableTitle = document.getElementById('table-title');
    loadingIcon.style.display = 'block';
    reportWIP.style.display = 'none';
    tableTitle.style.display = 'none';

});

//---------------------------------------------------APPLY FILTER EVENT DATA---------------------------------------------------
document.getElementById('apply-load-inventorycount').addEventListener('click', (event) => {
    event.preventDefault();

    let sessione = document.getElementById('start-invcount-header');
    let sessionevalue = sessione.value;

    if (!sessionevalue) {
        //------errore
    }
    
    const loadingIcon = createLoadingIcon();
    loadingIcon.style.display = 'block';
    document.getElementById('report-wip').style.display = 'none';
    document.getElementById('table-title').style.display = 'none';

    require(['N/https', 'N/url', 'N/search'], (https, url, search) => {
        let resourcesUrl = url.resolveScript({
            scriptId: 'customscript_gn_rl_inventory_count_data',
            deploymentId: 'customdeploy_gn_rl_inventory_count_data',
            params: {}
        });
        let params = {};

        https.get.promise({
            url: resourcesUrl,
            body: JSON.stringify(params),
            headers: { 'Content-Type': 'application/json' }
        }).then((response) => {
            let data = JSON.parse(response.body);
            table.setData(data.data);
        }).catch((error) => {
            console.error(error);
        }).finally(() => {
            loadingIcon.style.display = 'none';
            document.getElementById('report-wip').style.display = 'block';
            document.getElementById('table-title').style.display = 'block';
        });
    });
});

//-----------------------------------------------------------------PRINT PDF-------------------------------------------------------------------------------

document.getElementById('print-pdf').addEventListener('click', (event) => {
    table.download("pdf", "report_wip.pdf", { title: "Report WIP" });
    event.preventDefault();
}, false);

//---------------------------------------------------------MOUSE OVER---------------------------------------------------------------------------

const button = document.getElementById('apply-filters-data-empty');
const tooltip = document.getElementById('tooltip');
button.addEventListener('mouseover', (e) => {
    tooltip.style.display = 'block';
    tooltip.style.left = e.pageX + 'px';
    tooltip.style.top = (e.pageY - 3) + 'px';
});
button.addEventListener('mouseout', () => { tooltip.style.display = 'none'; });
button.addEventListener('mousemove', (e) => {
    tooltip.style.left = e.pageX + 'px';
    tooltip.style.top = (e.pageY - 3) + 'px';
});
//-----------------------------------------------------------------PRINT XLS-------------------------------------------------------------------------------

document.getElementById('print-xls').addEventListener('click', (event) => {
    const columnsToHide = ["to"];
    columnsToHide.forEach(column => table.hideColumn(column));
    table.download("xlsx", "report_WIP.xlsx", { sheetName: "Report WIP", bom: true });

    columnsToHide.forEach(column => table.showColumn(column));
    event.preventDefault();
}, false);

//-----------------------------------------------------------------EXPAND-------------------------------------------------------------------------------

document.getElementById('expande-groups').addEventListener('click', (event) => {
    event.preventDefault();
    table.blockRedraw();
    table.getGroups().forEach((g) => { g.show(); });
    table.restoreRedraw();

}, false);
//-----------------------------------------------------------------COLLAPSE-------------------------------------------------------------------------------

document.getElementById('collapse-groups').addEventListener('click', (event) => {
    event.preventDefault();
    table.blockRedraw();
    table.getGroups().forEach((g) => { g.hide(); });
    table.restoreRedraw();

}, false);
