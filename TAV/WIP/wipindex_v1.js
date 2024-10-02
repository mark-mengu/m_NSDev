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
    border-top: 7px solid #39ff14; /* Verde nucleare */
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
require(['N/https', 'N/url', 'N/currentRecord'], (https, url, cr) => {
    let resourcesUrl = url.resolveScript({
        scriptId: 'customscript_gn_reportwip_data_sl',
        deploymentId: 'custodeploy_gn_reportwip_data_sl',
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
    let soValueColumns = {
        title: "Sales Order", field: "so_text", editor: "textarea", validator: '', width: 280, minWidth: 200, maxWidth: 400, editable: false, headerFilter: "input", formatter: stdFormatter, tooltip: 'Sales Order Collegato'
    };
    table.addColumn(soValueColumns);
    let invValueColumns = {
        title: "Invoice", field: "inv_text", editor: "textarea", validator: '', editable: false, headerFilter: "input", formatter: stdFormatter, tooltip: 'Invoice Collegata'
    };
    table.addColumn(invValueColumns);
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
    let inventoryValueColumns = {
        title: "Valore Totale <br>al Costo Medio", field: "item_value", editor: "textarea", validator: '', editable: false, formatter: inventoryValueFormatter,
        bottomCalc: 'sum', tooltip: 'Valore Totale <br>al Costo Medio', bottomCalcParams: { precision: 2 },
    };
    table.addColumn(inventoryValueColumns);
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
    //event.preventDefault();
    //document.getElementById('report-deposito').style.display = 'none';
    //document.getElementById('table-title').style.display = 'none';
    table.hideColumn("to");
    table.hideColumn("so_text");
    table.hideColumn("item_value");
    table.hideColumn("units");

    table.download("pdf", "report_deposito.pdf", { title: "Report Controllo Merce in Conto Deposito" });

    table.toggleColumn("to");
    table.toggleColumn("so_text");
    table.toggleColumn("item_value");
    table.toggleColumn("units");
    event.preventDefault();
    //setTimeout(() => {
    //    window.location.reload();
    //}, 1000);
}, false);

//-----------------------------------------------------------------PRINT XLS-------------------------------------------------------------------------------

document.getElementById('print-xls').addEventListener('click', (event) => {
    //document.getElementById('report-deposito').style.display = 'none';
    //document.getElementById('table-title').style.display = 'none';
    const columnsToHide = ["to"];
    columnsToHide.forEach(column => table.hideColumn(column));

    table.download("xlsx", "report_deposito.xlsx", { sheetName: "Report Deposito", bom: true });

    columnsToHide.forEach(column => table.showColumn(column));
    event.preventDefault();
    //document.getElementById('report-deposito').style.display = '';
    //document.getElementById('table-title').style.display = '';
    // setTimeout(() => {
    //     window.location.reload();
    // }, 1000);

}, false);

//--------------------------------------------------------------EDITING NOT USED----------------------------------------------------------------------
/*
document.getElementById("").addEventListener("click", (event) => {
  event.preventDefault();
  require(['N/https', 'N/url', 'N/currentRecord', 'N/ui/dialog'], (https, url, cr, dialog) => {
    const scriptFix = document.createElement('script');
    scriptFix.src = "https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js";
    scriptFix.onload = () => {
      const _ = window._;
      let binDatas = _.some(table.getData(), obj => _.has(obj, 'bin') && (obj.bin == null || obj.bin === '' || obj.bin === undefined));
      if (binDatas) {
        dialog.alert({
          title: 'ATTENZIONE',
          message: `<center><img src="https://9094479.app.netsuite.com/core/media/media.nl?id=3105&c=9094479&h=lZQSbeBwUYC4IQL-ZVNFLj9yHvee0pyclIO65T5hPbXxV0EY&fcts=20240401080554&whence=" width="150" height="150"> <div style="color:yellow; background-color:gray; padding:10px; border-radius:10px;"><b>Non è possibile procedere con il controllo, non è stato inserito il BIN in tutte le righe.</b></div></center>`,
        });
        return false;
      }
      let resourcesUrl = url.resolveScript({
        scriptId: 'customscript_gn_tav_quality_control_data',
        deploymentId: 'customdeploy_gn_tav_quality_control_data',
      });
      let body = {
        data: table.getData(),
        qualitycontrol: cr.get().getValue('custpage_quality_control'),
        item: cr.get().getValue('custpage_item'),
        transaction: cr.get().getValue('custpage_transaction'),
        line: cr.get().getValue('custpage_line')
      };
      let response = https.post({ url: resourcesUrl, body: JSON.stringify(body) });
      table.setData(JSON.parse(response.body).data);
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Quality Control has been saved",
        showConfirmButton: false,
        timer: 2400
      });
      table.clearAlert();
    };
    document.head.appendChild(scriptFix);
  });
}, false);*/
