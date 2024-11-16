//--------------------------------------------------------------RAWss FUNCTIONS-----------------------------------------
var validate = (cell) => {
    let q = cell.getValue();
    console.log('cell.getData()', cell.getData());
    return true;
}

var editCheck = (cell) => {
    return !cell.getRow().getData().hold;
}

var printInventoryNumber = (cell, formatterParams, onRendered) => {
    return cell.getColumn().getDefinition().editorParams.values[cell.getValue()];
};

var printBin = (cell, formatterParams, onRendered) => {
    return cell.getColumn().getDefinition().editorParams.values[cell.getValue()];
};

var printIcon = (cell, formatterParams) => {
    return "<i class='fa fa-print'></i>";
};

var linkFormatter = (cell, formatterParams) => {
    let value = cell.getValue();
    let url = 'https://example.com/' + encodeURIComponent(value);
    cell.getElement().style.backgroundColor = "#CACAEE";
    return `<a href="${url}" target="_blank">${value}</a>`;
};

var stdFormatter = (cell, formatterParams) => {
    let value = cell.getValue();
    cell.getElement().style.backgroundColor = "#CACAEE";
    return value;
};

var salesorderFormatter = (cell, formatterParams) => {
    let value = cell.getValue();
    cell.getElement().style.backgroundColor = "#CACAEE";
    let button = '<button id="opensss" class="sexy-button" onclick="openWind(event, \'' + value + '\')">Apri Ordine di Vendita</button>';
    return button;
};

var customerFormatter = (cell, formatterParams) => {
    let value = cell.getValue();
    cell.getElement().style.backgroundColor = "#CACAEE";
    return '<u>' + value + '</u>';
};

var inventoryValueFormatter = (cell, formatterParams) => {
    let value = cell.getValue();
    cell.getElement().style.backgroundColor = "#CACAEE";
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
    border-top: 7px solid #eb9534;
    border-radius: 55%;
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
    }
  `;
    document.head.appendChild(style);
    return loadingIcon;
}
//----------------------------------------------------------------TABULATOR-----------------------------------------------------

const table = new Tabulator("#report-deposito", {
    movableRows: false,
    groupToggleElement: true,
    initialFilter: [
        { field: "customer_id", type: "=", value: "1" }
    ],
    tabulatorId: "report-deposito-table",
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
    //frozenRows:1,
    //groupBy: "customer",
    //groupByHeader: true,
    ajaxProgressiveLoad: "scroll",
    printFooter: "",
    printHeader: "<center><h1>Conto Deposito Overview</h1></center>",
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

document.getElementById('report-deposito').style.display = 'none';
document.getElementById('table-title').style.display = 'none';
require(['N/https', 'N/url', 'N/currentRecord', 'N/runtime'], (https, url, cr, runtime) => {
    let resourcesUrl = url.resolveScript({
        scriptId: 'customscript_gn_ta_conto_deposito_data',
        deploymentId: 'customdeploy_gn_ta_conto_deposito_data',
        params: {
            date: cr.get().getValue('custpage_date'),
            customer: cr.get().getValue('custpage_customer'),
            item: cr.get().getValue('custpage_item'),
            serial: cr.get().getValue('custpage_serial'),
        }
    });
    table.setFilter("customer_id", "=", `${runtime.getCurrentUser().id}`);

    let docValueColumns = {
        title: " ", field: "so_link", editor: "textarea", validator: '', editable: false, headerFilter: "", formatter: salesorderFormatter, tooltip: 'Vedi Documento'
    };
    table.addColumn(docValueColumns);
    let soValueColumns = {
        title: "Sales Order", field: "so_text", editor: "textarea", validator: '', width: 280, minWidth: 200, maxWidth: 400, editable: false, headerFilter: "input", formatter: stdFormatter, tooltip: 'Sales Order Collegato'
    };
    table.addColumn(soValueColumns);
    let invValueColumns = {
        title: "Fattura", field: "inv_text", editor: "textarea", validator: '', editable: false, headerFilter: "input", formatter: customerFormatter, tooltip: 'Invoice Collegata'
    };
    table.addColumn(invValueColumns);
    let invDateColumn = {
        title: "Data Fattura", field: "inv_date", editor: "textarea", validator: '', width: 180, minWidth: 150, maxWidth: 200, editable: false, headerFilter: "input",
        formatter: stdFormatter,
        tooltip: 'Data Fattura',
    };
    table.addColumn(invDateColumn);
    let machineColumns = {
        title: "Articolo", field: "item", editor: "textarea", validator: '', editable: false, headerFilter: "input", formatter: customerFormatter, tooltip: 'Articolo'
    };
    table.addColumn(machineColumns);
    let displaynameColumns = {
        title: "Descrizione Articolo", field: "displayname", editor: "textarea", validator: '', width: 300, minWidth: 200, maxWidth: 400, editable: false, headerFilter: "input",
        formatter: stdFormatter,
        tooltip: 'Descrizione Articolo'
    };
    table.addColumn(displaynameColumns);
    let serialColumns = {
        title: "Seriale", field: "seriale", editor: "textarea", validator: '', editable: false, headerFilter: "input", formatter: stdFormatter, tooltip: 'Seriale'
    };
    table.addColumn(serialColumns);
    let quantityColumn = {
        title: "Quantità", field: "quantity", editor: "number", validator: '', editable: false, formatter: stdFormatter, tooltip: 'Quantità', bottomCalc: 'sum'
    };
    table.addColumn(quantityColumn);
    let unitsColumn = {
        title: "U.tà", field: "units", editor: "textarea", validator: '', editable: false, formatter: stdFormatter, tooltip: 'U.tà'
    };
    table.addColumn(unitsColumn);

    const loadingIcon = createLoadingIcon();
    const reportDeposito = document.getElementById('report-deposito');
    const tableTitle = document.getElementById('table-title');
    loadingIcon.style.display = 'block';
    reportDeposito.style.display = 'none';
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
table.on("cellEdited", (cell) => {
    //cell.getData()['edit'] = true;
});

//-----------------------------------------------------------------PRINT PDF-------------------------------------------------------------------------------

document.getElementById('print-pdf').addEventListener('click', (event) => {
    table.hideColumn("so_link");

    table.download("pdf", "report_deposito.pdf", { title: "Report Controllo Merce in Conto Deposito" });

    table.toggleColumn("so_link");
    event.preventDefault();
}, false);

//-----------------------------------------------------------------PRINT XLS-------------------------------------------------------------------------------

document.getElementById('print-xls').addEventListener('click', (event) => {
    const columnsToHide = ["so_link"];
    columnsToHide.forEach(column => table.hideColumn(column));

    table.download("xlsx", "report_deposito.xlsx", { sheetName: "Report Deposito", bom: true });

    columnsToHide.forEach(column => table.showColumn(column));
    event.preventDefault();

}, false);

