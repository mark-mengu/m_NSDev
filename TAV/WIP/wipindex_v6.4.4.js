//--------------------------------------------------------------RAWss FUNCTIONS-----------------------------------------
var validate = (cell) => {
    let q = cell.getValue();
    console.log('cell.getData()', cell.getData());
    return true;
}

//------------------------------------------------LOAD DEFAULT DATES CALCULATED--------------------------------------------------------

const formatDate = (date) => {
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let year = date.getFullYear();
    return `${year}-${month}-${day}`;
}
//-------------------------------------------------FILTER BIN---------------------------------------------------------------
// Store the original data outside the filter function
let originalData = null;

const binFilter = (headerValue, rowValue, rowData, filterParams) => {
    // If this is the first time the filter is run, store the original data
    if (!originalData) {
        originalData = JSON.parse(JSON.stringify(rowData));
    }

    // If the filter is empty, reset to original data
    if (!headerValue) {
        Object.assign(rowData, originalData);
        return true; // Show all rows
    }

    // If the row has children, we need to filter them
    if (rowData._children && rowData._children.length > 0) {
        // Filter children based on the bin value
        const filteredChildren = rowData._children.filter(child =>
            child.bin.toLowerCase().includes(headerValue.toLowerCase())
        );

        // If there are matching children, we need to show this row and update its value
        if (filteredChildren.length > 0) {
            // Calculate new item_value for the parent based on filtered children
            const newItemValue = filteredChildren.reduce((sum, child) =>
                sum + parseFloat(child.item_value), 0
            ).toFixed(2);

            // Update the parent's item_value
            rowData.item_value = newItemValue;

            // Update the children array with only the filtered children
            rowData._children = filteredChildren;

            return true; // Show this row
        }

        return false; // Hide this row if no children match
    }

    // For rows without children, check if their bin matches
    return rowData.bin.toLowerCase().includes(headerValue.toLowerCase());
};
//-------------------------------------------------FILTER BIN---------------------------------------------------------------
const locationFilter = (headerValue, rowValue, rowData, filterParams) => {
    //headerValue - the value of the header filter element
    //rowValue - the value of the column in this row
    //rowData - the data for the row being filtered
    //filterParams - params object passed to the headerFilterFuncParams property

    return rowData.name == filterParams.name && rowValue < headerValue; //must return a boolean, true if it passes the filter.
}
//-------------------------------------------------FILTER BIN---------------------------------------------------------------
const tranFilter = (headerValue, rowValue, rowData, filterParams) => {
    //headerValue - the value of the header filter element
    //rowValue - the value of the column in this row
    //rowData - the data for the row being filtered
    //filterParams - params object passed to the headerFilterFuncParams property

    return rowData.name == filterParams.name && rowValue < headerValue; //must return a boolean, true if it passes the filter.
}
//-------------------------------------------------FILTER BIN---------------------------------------------------------------
const itemFilter = (headerValue, rowValue, rowData, filterParams) => {
    //headerValue - the value of the header filter element
    //rowValue - the value of the column in this row
    //rowData - the data for the row being filtered
    //filterParams - params object passed to the headerFilterFuncParams property

    return rowData.name == filterParams.name && rowValue < headerValue; //must return a boolean, true if it passes the filter.
}
//-------------------------------------------------FILTER BIN---------------------------------------------------------------
const accountFilter = (headerValue, rowValue, rowData, filterParams) => {
    //headerValue - the value of the header filter element
    //rowValue - the value of the column in this row
    //rowData - the data for the row being filtered
    //filterParams - params object passed to the headerFilterFuncParams property

    return rowData.name == filterParams.name && rowValue < headerValue; //must return a boolean, true if it passes the filter.
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
    dataTreeCollapseElement: `<i class='fas fa-minus-square' style='font-size: 30px; color: #ff0000;'></i>`,
    dataTreeExpandElement: `<i class="fa fa-plus-square" aria-hidden="true" style='font-size: 30px; color: #00ff00;'></i>`,
    dataTreeChildIndent: 15,
    dataTreeFilter: true,
    tabulatorId: "report-wip-table",
    ajaxURL: '',
    ajaxParams: {},
    ajaxFiltering: true,
    rowHeader: {
        resizable: true,
        frozen: true,
        width: 70,
        formatter: (cell) => { cell.getRow().getPosition(); },
        hozAlign: "center"
    },
    selectableRangeRows: false,
    columnDefaults: { headerSort: true, resizable: "header" },
    dataLoaderLoading: "Loading data...",
    placeholder: "No DATA Found...",
    pagination: "local",
    paginationSize: 150,
    ajaxProgressiveLoad: "scroll",
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

require(['N/https', 'N/url', 'N/search'], (https, url, search) => {
    let resourcesUrl = url.resolveScript({
        scriptId: 'customscript_gn_rl_reportwip_data',
        deploymentId: 'customdeploy_gn_rl_reportwip_data',
        params: {}
    });

    // Function to load data with filters
    function loadFilteredData(filters = {}) {
        const loadingIcon = document.getElementById('loading-icon');
        const reportWIP = document.getElementById('report-wip');
        const tableTitle = document.getElementById('table-title');

        loadingIcon.style.display = 'block';
        reportWIP.style.display = 'none';
        tableTitle.style.display = 'none';

        let params = { 
            endDate: formatDate(new Date()), 
            startDate: formatDate(new Date()),
            filters: filters
        };

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
            reportWIP.style.display = 'block';
            tableTitle.style.display = 'block';
        });
    }

    // Add columns with header filters
    let accountColumns = {
        title: "Conto Magazzino", field: "account", editor: "textarea", headerFilterPlaceholder: "Filtra un conto...", validator: '', width: 570, minWidth: 200, maxWidth: 700, editable: false, headerFilter: "input", formatter: stdBoldFormatter, tooltip: 'Magazzino/Location'
    };
    table.addColumn(accountColumns);

    let trxColumns = {
        title: "Transazione", field: "docnumber", editor: "textarea", validator: '', headerFilterPlaceholder: "Filtra una transazione...", editable: false, width: 200, minWidth: 150, maxWidth: 300, headerFilter: "input", formatter: stdFormatter, tooltip: 'Articolo'
    };
    table.addColumn(trxColumns);

    let quantityColumns = {
        title: "Quantity", field: "quantity", editor: "textarea", validator: '', editable: false, width: 130, minWidth: 80, maxWidth: 140, formatter: stdFormatter,
        tooltip: 'Quantità',
    };
    table.addColumn(quantityColumns);

    let itemColumns = {
        title: "Articolo", field: "item", editor: "textarea", headerFilterPlaceholder: "Filtra un articolo...", validator: '', editable: false, width: 500, minWidth: 300, maxWidth: 600, headerFilter: "input", formatter: stdFormatter, tooltip: 'Articolo'
    };
    table.addColumn(itemColumns);

    let locationColumns = {
        title: "Location", field: "location", editor: "textarea", headerFilterPlaceholder: "...", validator: '', editable: false, width: 120, minWidth: 80, maxWidth: 150, headerFilter: "input", formatter: stdFormatter, tooltip: 'Magazzino/Location'
    };
    table.addColumn(locationColumns);

    let binColumns = {
        title: "Bin",
        field: "bin",
        width: 100,
        minWidth: 80,
        maxWidth: 150,
        headerFilterPlaceholder: "...",
        headerFilterFunc: binFilter,
        editor: "textarea", validator: '', editable: false, headerFilter: "input",
        formatter: stdFormatter,
        tooltip: 'Bin',
    };
    table.addColumn(binColumns);

    let inventoryValueColumns = {
        title: "Valore al Costo Medio", field: "item_value", editor: "textarea", validator: '', width: 260, minWidth: 150, maxWidth: 300, editable: false, formatter: inventoryValueFormatter,
        bottomCalc: 'sum', tooltip: 'Valore al Costo Medio', bottomCalcParams: { precision: 2 },
    };
    table.addColumn(inventoryValueColumns);

    // Add event listener for header filter changes
    table.on("headerFilterChanged", function(){
        let filters = {};
        table.getHeaderFilters().forEach(function(filter){
            if(filter.value){
                filters[filter.field] = filter.value;
            }
        });
        loadFilteredData(filters);
    });

    // Initial data load
    loadFilteredData();

    document.addEventListener("DOMContentLoaded", () => { setDefaultDates(); });
});

//---------------------------------------------------APPLY FILTER EVENT DATA---------------------------------------------------
document.getElementById('apply-filters-data').addEventListener('click', (event) => {
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

//---------------------------------------------------EMPTY FILTER EVENT DATA---------------------------------------------------
document.getElementById('apply-filters-data-empty').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';

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
        let params = {};
        params.startDate = '';
        params.endDate = '';

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