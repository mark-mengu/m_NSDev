//--------------------------------------------------------------RAWss FUNCTIONS-----------------------------------------
var validate = (cell) => {
    let q = cell.getValue();
    console.log('cell.getData()', cell.getData());
    return true;
}

var editCheck = (cell) => {
    return !cell.getRow().getData().hold;
}

var printIcon = (cell, formatterParams) => {
    return "<i class='fa fa-print'></i>";
};

var linkFormatter = (cell, formatterParams) => {
    let value = cell.getValue();
    let url = 'https://example.com/' + encodeURIComponent(value);
    cell.getElement().style.backgroundColor = "#d0afae";
    return `<a href="${url}" target="_blank">${value}</a>`;
};

var stdFormatter = (cell, formatterParams) => {
    let value = cell.getValue();
    cell.getElement().style.backgroundColor = "#d0afae";
    return value;
};

var transferorderFormatter = (cell, formatterParams) => {
    let value = cell.getValue();
    cell.getElement().style.backgroundColor = "#d0afae";
    let button = '<button id="opensss" class="sexy-button" onclick="openWind(event, \'' + value + '\')">Apri Transazione</button>';
    return button;
};

var customerFormatter = (cell, formatterParams) => {
    let value = cell.getValue();
    cell.getElement().style.backgroundColor = "#d0afae";
    return '<u>' + value + '</u>';
};

var inventoryValueFormatter = (cell, formatterParams) => {
    let value = cell.getValue();
    cell.getElement().style.backgroundColor = "#d0afae";
    return parseFloat(value).toFixed(2);
};

var openWind = (event, url) => {
    event.preventDefault();
    window.open(url, '_blank');
}
var dataFilter = (headerValue, rowValue, rowData, filterParams) => {
    //headerValue - the value of the header filter element
    //rowValue - the value of the column in this row
    //rowData - the data for the row being filtered
    //filterParams - params object passed to the headerFilterFuncParams property
    return rowData.name == filterParams.name && rowValue < headerValue;
}
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
    groupToggleElement: true,
    tabulatorId: "report-wip-table",
    rowHeader: {
        resizable: true,
        frozen: true,
        width: 70,
        formatter: (cell) => {
            let rowNumber = cell.getRow().getPosition();
            return '<div class="row-index">' + rowNumber + '</div>';
        },
        hozAlign: "center"
    },
    selectableRangeRows: false,
    columnDefaults: { headerSort: true, resizable: "header" },
    dataLoaderLoading: "Loading data...",
    placeholder: "No DATA Found...",
    pagination: "local",
    paginationSize: 50,
    ajaxProgressiveLoad: "scroll",
    printFooter: "",
    printHeader: "<center><h1>WIP Overview</h1></center>",
    rowFormatter: (row) => {
        let data = row.getData();
        if (data.inv_text == ' ') {
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
require(['N/https', 'N/url', 'N/search'], (https, url) => {
    let resourcesUrl = url.resolveScript({
        scriptId: 'customscript_gn_rl_reportwip_data',
        deploymentId: 'customdeploy_gn_rl_reportwip_data',
        params: {}
    });
    let docValueColumns = {
        title: " ", field: "seeitem", editor: "textarea", validator: '', editable: false, headerFilter: "", width: 200, minWidth: 150, maxWidth: 300, formatter: transferorderFormatter, tooltip: 'Vedi Dettaglio Articolo'
    };
    table.addColumn(docValueColumns);

    let trxColumns = {
        title: "Tipo Transazione", field: "recordtype", editor: "textarea", validator: '', editable: false, width: 200, minWidth: 150, maxWidth: 300, headerFilter: "input", formatter: stdFormatter, tooltip: 'Articolo'
    };
    table.addColumn(trxColumns);

    let itemColumns = {
        title: "Articolo", field: "item", editor: "textarea", validator: '', editable: false, width: 150, minWidth: 100, maxWidth: 200, headerFilter: "input", formatter: stdFormatter, tooltip: 'Articolo'
    };
    table.addColumn(itemColumns);

    let displaynameColumns = {
        title: "Descrizione Articolo", field: "displayname", editor: "textarea", validator: '', width: 300, minWidth: 200, maxWidth: 400, editable: false, headerFilter: "input",
        formatter: stdFormatter,
        tooltip: 'Descrizione Articolo'
    };
    table.addColumn(displaynameColumns);

    let locationColumns = {
        title: "Location", field: "location", editor: "textarea", validator: '', editable: false, width: 150, minWidth: 100, maxWidth: 200, headerFilter: "input", formatter: stdFormatter, tooltip: 'Magazzino/Location'
    };
    table.addColumn(locationColumns);

    let binColumns = {
        title: "Bin", field: "bin", editor: "textarea", validator: '', editable: false, width: 150, minWidth: 100, maxWidth: 200, headerFilter: "input", formatter: stdFormatter, tooltip: 'Magazzino/Location'
    };
    table.addColumn(binColumns);

    let accountColumns = {
        title: "Conto di <br> Magazzino", field: "account", editor: "textarea", validator: '', width: 200, minWidth: 150, maxWidth: 300, editable: false, headerFilter: "", formatter: stdFormatter, tooltip: 'Magazzino/Location'
    };
    table.addColumn(accountColumns);

    let inventoryValueColumns = {
        title: "Valore Totale <br>al Costo Medio", field: "item_value", editor: "textarea", validator: '', width: 200, minWidth: 150, maxWidth: 300, editable: false, formatter: inventoryValueFormatter,
        bottomCalc: 'sum', tooltip: 'Valore Totale <br>al Costo Medio', bottomCalcParams: { precision: 2 },
    };
    table.addColumn(inventoryValueColumns);

    const loadingIcon = createLoadingIcon();
    const reportWIP = document.getElementById('report-wip');
    const tableTitle = document.getElementById('table-title');
    loadingIcon.style.display = 'block';
    reportWIP.style.display = 'none';
    tableTitle.style.display = 'none';

    https.get.promise({ url: resourcesUrl })
        .then((response) => {
            let data = JSON.parse(response.body);
            table.setData(data.data);
        })
        .catch((error) => {
            console.error(error);
        })
        .finally(() => {
            loadingIcon.style.display = 'none';
            reportDeposito.style.display = 'block';
            tableTitle.style.display = 'block';
        });
});
//------------------------------------------------------------------EDIT------------------------------------------------------
table.on("cellEdited", (cell) => { });

//-----------------------------------------------------------------PRINT PDF-------------------------------------------------------------------------------

document.getElementById('print-pdf').addEventListener('click', (event) => {
    table.hideColumn("to");
    table.hideColumn("so_text");
    table.hideColumn("item_value");
    table.hideColumn("units");

    table.download("pdf", "report_wip.pdf", { title: "Report WIP" });

    table.toggleColumn("to");
    table.toggleColumn("so_text");
    table.toggleColumn("item_value");
    table.toggleColumn("units");
    event.preventDefault();
}, false);

//-----------------------------------------------------------------PRINT XLS-------------------------------------------------------------------------------

document.getElementById('print-xls').addEventListener('click', (event) => {
    const columnsToHide = ["to"];
    columnsToHide.forEach(column => table.hideColumn(column));

    table.download("xlsx", "report_WIP.xlsx", { sheetName: "Report WIP", bom: true });

    columnsToHide.forEach(column => table.showColumn(column));
    event.preventDefault();
}, false);