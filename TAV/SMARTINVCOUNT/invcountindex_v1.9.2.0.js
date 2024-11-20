
var validate = (cell) => {
    console.log('cell.getData()', cell.getData());
    return true;
}

const formatDate = (date) => {
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

const formatNumber = (num) => {
    const roundedNum = Math.round(num * 100) / 100;
    const [integerPart, decimalPart] = roundedNum.toString().split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const formattedDecimal = decimalPart ? decimalPart.padEnd(2, '0') : '00';
    return `${formattedInteger},${formattedDecimal}`;
}

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

var qtyconfirmedFormatted = (cell, formatterParams) => {
    let value = cell.getValue();
    cell.getElement().style.backgroundColor = "#FFD580";
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
    border-top: 7px solid #ff6600; 
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

const reportInvCount = document.getElementById('report-inventorycount').style.display = 'none';
const tableTitle = document.getElementById('table-title').style.display = 'none';

let initialData = [];
let table = new Tabulator("#report-inventorycount", {
    layout: "fitDataFill",
    movableRows: false,
    placeholder: "No Data Found",
    pagination: "local",
    paginationSize: 100,
    groupBy: false,
    reactiveData: true,
    data: initialData,
    columns: [
        {
            title: "Bin",
            field: "bin",
            headerFilter: "input",
            formatter: stdBoldFormatter,
            width: 130,
            headerFilterPlaceholder: "Filtra per bin..."
        },
        {
            title: "Articolo",
            field: "item",
            headerFilter: "input",
            formatter: stdFormatter,
            width: 350,
            headerFilterPlaceholder: "Filtra per articolo..."
        },
        {
            title: "Shelf NetSuite",
            field: "shelfnetsuite",
            headerFilter: "input",
            formatter: stdFormatter,
            width: 200,
            headerFilterPlaceholder: "Filtra per NetSuite shelf..."
        },
        {
            title: "Shelf Kardex",
            field: "shelfkardex",
            headerFilter: "input",
            formatter: stdFormatter,
            width: 200,
            headerFilterPlaceholder: "Filtra per Kardex shelf..."
        },
        {
            title: "Quantity NetSuite",
            field: "qtynetsuite",
            formatter: stdFormatter,
            width: 200,
            validator: ["numeric", "min:0"]
        },
        {
            title: "Quantity Kardex",
            field: "qtykardex",
            formatter: stdFormatter,
            width: 200,
            validator: ["numeric", "min:0"]
        },
        {
            title: "Quantity Contata",
            field: "qty",
            editor: "input",
            formatter: qtyconfirmedFormatted,
            width: 200,
            validator: ["numeric", "min:0"],
            editorParams: {
                selectContents: true
            },
            editable: (cell) => {
                const rowData = cell.getRow().getData();
                return rowData.statusheader !== "2";
            }
        },
        {
            title: "Valore Differenza",
            field: "valuedifference",
            formatter: inventoryValueFormatter,
            bottomCalc: 'sum',
            bottomCalcParams: { precision: 2 },
            width: 200,
            validator: "numeric"
        }
    ]
});
document.getElementById('report-inventorycount').style.display = 'none';
document.getElementById('table-title').style.display = 'none';

document.getElementById('apply-load-inventorycount').addEventListener('click', (event) => {
    event.preventDefault();

    const loadingIcon = createLoadingIcon();
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = 9999;
    overlay.appendChild(loadingIcon);
    document.body.appendChild(overlay);
    loadingIcon.style.display = 'block';

    document.getElementById('report-inventorycount').style.display = 'none';
    document.getElementById('table-title').style.display = 'none';

    let session = document.getElementById('invcount-header').value;
    let validationIcon = document.getElementById('validation-icon');
    if (!session || session.trim() === 'null') {
        validationIcon.style.display = 'inline';
        validationIcon.innerHTML = '❌';
        validationIcon.style.color = 'red';
        Swal.fire({
            title: 'Attenzione!',
            text: 'Selezionare prima una Sessione di inventario valida...',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        loadingIcon.style.display = 'none';
        document.body.removeChild(overlay);

        return;
    }
    require(['N/https', 'N/url', "N/search"], (https, url, search) => {
        const sessionRecord = search.lookupFields({ type: "customrecord_gn_tav_inv_count_header", id: session, columns: ["custrecord_gn_tav_invcount_head_status"] });
        if (sessionRecord.custrecord_gn_tav_invcount_head_status[0].value == "2") {
            validationIcon.style.display = 'inline';
            validationIcon.innerHTML = '<b>Sessione di Inventario chiusa</b> ❌';
            validationIcon.style.color = 'red';
        } else {
            validationIcon.style.display = 'inline';
            validationIcon.innerHTML = '<b>Sessione di Inventario aperta</b> ✅';
            validationIcon.style.color = 'green';
        }

        let resourcesUrl = url.resolveScript({
            scriptId: 'customscript_gn_rl_inventory_count_data',
            deploymentId: 'customdeploy_gn_rl_inventory_count_data',
            params: { session: session }
        });

        https.get.promise({
            url: resourcesUrl,
            body: JSON.stringify({}),
            headers: { 'Content-Type': 'application/json' }
        })
            .then((response) => {
                let data = JSON.parse(response.body);
                table.setData(data.data);
            })
            .catch((error) => {
                Swal.fire({
                    title: 'Errore!',
                    text: 'Si è verificato un errore durante il caricamento dei dati: ' + error,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            })
            .finally(() => {
                loadingIcon.style.display = 'none';
                document.body.removeChild(overlay);
                document.getElementById('report-inventorycount').style.display = 'block';
                document.getElementById('table-title').style.display = 'block';
            });
    });
});









