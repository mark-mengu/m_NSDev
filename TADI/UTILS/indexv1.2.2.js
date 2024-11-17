//--------------------------------------------------------------RAWss FUNCTIONS-----------------------------------------
const styleS = document.createElement('style');
styleS.textContent = `
.custom-so-link {
    color: #4CAF50;
    padding: 4px;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    transition: all 0.3s ease;
    margin-left: 8px;
}

.custom-so-link:hover {
    transform: translateY(-2px);
}

.custom-so-link svg {
    width: 28px;
    height: 28px;
    fill: #e77f08;
    transition: all 0.3s ease;
}

.custom-so-link:hover svg {
    fill: #e77f08;
}

.custom-so-cell {
    background-color: #CACAEE;
    padding: 8px;
    border-radius: 4px;
    display: flex;
    align-items: center;
}
`;
document.head.appendChild(styleS);

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

var transferorderFormatter = (cell, formatterParams) => {
    let value = cell.getValue();
    cell.getElement().style.backgroundColor = "#CACAEE";
    let button = '<button id="opensss" class="sexy-button" onclick="openWind(event, \'' + value + '\')">Apri Transfer</button>';
    return button;
};

var customerFormatter = (cell, formatterParams) => {
    let value = cell.getValue();
    cell.getElement().style.backgroundColor = "#CACAEE";
    return '<u>' + value + '</u>';
};


const salesOrderFormatter = (cell, formatterParams) => {
    let so_consegna_link = cell.getValue();
    let parts = so_consegna_link.split('|').map(value => value || "");
    let listIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>`;
    let link = `<a href="https://6518658.app.netsuite.com/app/common/search/searchresults.nl?searchtype=Transaction&IT_Item_NAME=&CU_Entity_ENTITYID=&AFC_Transaction_NUMBERTEXT=${parts[2]}&Transaction_NUMBERTEXT=&style=NORMAL&IT_Item_NAMEtype=CONTAINS&CU_Entity_ENTITYIDtype=CONTAINS&AFC_Transaction_NUMBERTEXTtype=CONTAINS&Transaction_NUMBERTEXTtype=CONTAINS&report=&grid=&searchid=2435&dle=T&sortcol=Transction_DATATED11_raw&sortdir=DESC&csv=HTML&OfficeXML=F&pdf=&size=1000&_csrf=nRz36NGWjWsvP7GzsEiTlgPOWs0ch0TQ6oRNqk9S4nnJHBgZd3NMuSQsJFgKf33phq1f7N9dpkE2KC20mt1IqfIIoLZD5V_MX8Euk8k384S6lIbklLz8sORggkYkhTGTo6zgkkzfQ2jFOlpvDY0eyIdnXHNHcjMhPCP7EMUIJLs%3D&twbx=F" 
        target="_blank" 
        class="custom-so-link" 
        >
        ${listIcon}
    </a>`;

    cell.getElement().classList.add('custom-so-cell');
    return `<p>${parts[1]} ${link}</p>`;
};

var invoiceDateFormatter = (cell, formatterParams) => {
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
    return rowData.name == filterParams.name && rowValue < headerValue;
}
var agentBusinessFilter = (agent, agentsMap) => {
    return function (data) {
        if (!agent) { return true; }
        let customerCode = data.customer.split(" ")[0].toLowerCase();
        let customerAgents = agentsMap.find(item => item.customer.toLowerCase() === customerCode);
        if (!customerAgents) { return false; }
        let isPrintingAgent = customerAgents.printingagent === agent;
        let isMonitorAgent = customerAgents.monitoragent === agent;
        console.log(isPrintingAgent, isMonitorAgent);
        if (isPrintingAgent && data.item_class.toLowerCase().includes("printing")) { return true; }
        if (isMonitorAgent && data.item_class.toLowerCase().includes("monitor")) { return true; }
        return false;
    };
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
require(['N/https', 'N/url', 'N/currentRecord', "N/runtime"], (https, url, cr, runtime) => {
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
    let docValueColumns = {
        title: " ", field: "to", editor: "textarea", validator: '', editable: false, headerFilter: "", formatter: transferorderFormatter, tooltip: 'Vedi Documento'
    };
    table.addColumn(docValueColumns);
    let toDateColumns = {
        title: "Data Transfer Order", field: "to_date", editor: "textarea", editable: false, sorter: "date", formatter: stdFormatter, headerFilter: "input", headerFilterFunc: "like", tooltip: 'Data Transfer Order', sorterParams: { format: "yyyy-MM-dd", alignEmptyValues: "top", }
    };
    table.addColumn(toDateColumns);
    let toValueColumns = {
        title: "Transfer Order", field: "to_text", editor: "textarea", validator: '', width: 280, minWidth: 200, maxWidth: 400, editable: false, headerFilter: "input", formatter: stdFormatter, tooltip: 'Transfer Order di riferimento'
    };
    table.addColumn(toValueColumns);
    let soLinkColumns = {
        title: "Sales Order", field: "so_consegna_link", editor: "textarea", validator: '', width: 200, minWidth: 190, maxWidth: 300, editable: false, headerFilter: "input", formatter: salesOrderFormatter, tooltip: 'Clicca per vedere i Conto Consegna Collegati a questo Sales Order'
    };
    table.addColumn(soLinkColumns);
    let soValueColumns = {
        title: "Sales Order", field: "so_text", editor: "textarea", validator: '', width: 280, minWidth: 200, maxWidth: 400, editable: false, headerFilter: "input", formatter: salesOrderFormatter, tooltip: '', visible: false
    };
    table.addColumn(soValueColumns);
    let invValueColumns = {
        title: "Fattura", field: "inv_text", editor: "textarea", validator: '', editable: false, headerFilter: "input", formatter: stdFormatter, tooltip: 'Invoice Collegata'
    };
    table.addColumn(invValueColumns);
    let invDateColumns = {
        title: "Data Fattura", field: "inv_date", editor: "textarea", validator: '', width: 180, minWidth: 170, maxWidth: 220, editable: false, headerFilter: "input",
        formatter: invoiceDateFormatter,
        tooltip: 'Data Fattura',
    };
    table.addColumn(invDateColumns);
    let customerColumn = {
        title: "Cliente", field: "customer", editor: "textarea", validator: '', width: 280, minWidth: 200, maxWidth: 400, editable: false, headerFilter: "input",
        formatter: customerFormatter,
        tooltip: 'Cliente',
    };
    table.addColumn(customerColumn);
    let machineColumns = {
        title: "Articolo", field: "item", editor: "textarea", validator: '', editable: false, headerFilter: "input", formatter: stdFormatter, tooltip: 'Articolo'
    };
    table.addColumn(machineColumns);
    let agentColumns = {
        title: "Agent", field: "agent", editor: "textarea", validator: '', width: 280, minWidth: 200, maxWidth: 400, editable: false, headerFilter: "", formatter: stdFormatter, tooltip: '', visible: false
    };
    table.addColumn(agentColumns);
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
        title: "Quantità", field: "quantity", editor: "number", validator: '', editable: false, formatter: stdFormatter, tooltip: 'Quantità', bottomCalc: ''
    };
    table.addColumn(quantityColumn);
    let unitsColumn = {
        title: "U.tà", field: "units", editor: "textarea", validator: '', editable: false, formatter: stdFormatter, tooltip: 'U.tà'
    };
    table.addColumn(unitsColumn);
    if (runtime.getCurrentUser().role == 1217 || runtime.getCurrentUser().role == 1236) {
        table.setFilter("agent", "=", (runtime.getCurrentUser().id).toString());
    };
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

//-----------------------------------------------------------------PRINT PDF-------------------------------------------------------------------------------
document.getElementById('print-pdf').addEventListener('click', (event) => {
    table.hideColumn("to");
    table.hideColumn("units");
    table.hideColumn("so_consegna_link");
    table.toggleColumn("so_text");

    table.download("pdf", "report_deposito.pdf", { title: "Report Controllo Merce in Conto Deposito" });

    table.toggleColumn("to");
    table.toggleColumn("so_consegna_link");
    table.toggleColumn("units");
    table.hideColumn("so_text");
    event.preventDefault();

}, false);

//-----------------------------------------------------------------PRINT XLS-------------------------------------------------------------------------------

document.getElementById('print-xls').addEventListener('click', (event) => {
    const normalcolumns = ["to", "so_consegna_link"];
    const reversecolumns = ["so_text"];
    normalcolumns.forEach(column => table.hideColumn(column));
    reversecolumns.forEach(column => table.showColumn(column));

    table.download("xlsx", "report_deposito.xlsx", { sheetName: "Report Deposito", bom: true });

    normalcolumns.forEach(column => table.showColumn(column));
    reversecolumns.forEach(column => table.hideColumn(column));

    event.preventDefault();
}, false);


