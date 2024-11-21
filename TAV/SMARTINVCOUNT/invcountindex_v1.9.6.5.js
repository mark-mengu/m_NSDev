/**
 *@Description 
 *@author Marco Mengucci
 */

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
var singleSelectHeaderFilter = (cell) => {
    var selectedValue = binTypes[0];
    const filterFunc = (rowData) => {
        return rowData['bin'] === selectedValue;
    };

    const onChange = (event) => {
        selectedValue = event.target.value;
        cell.getColumn().getTable().removeFilter(filterFunc);
        cell.getColumn().getTable().addFilter(filterFunc);
    };
    let select = document.createElement("select");
    select.id = 'binSelector';
    select.className = "cool-select";
    select.style = 'width: 100%; padding: 5px; font-size: 14px; border: 1px solid #ccc; border-radius: 5px;';

    binTypes.forEach((bin) => {
        const option = document.createElement("option");
        option.value = bin;
        option.text = bin;
        select.appendChild(option);
    });
    cell.getColumn().getTable().addFilter(filterFunc);
    select.addEventListener('change', onChange);
    return select;
};

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
var table;
let initialData = [];
table = new Tabulator("#report-inventorycount", {
    layout: "fitDataFill",
    movableRows: false,
    placeholder: "No Data Found",
    pagination: "local",
    paginationSize: 70,
    groupBy: false,
    reactiveData: true,
    data: initialData,
    progressiveRender: true,
    progressiveRenderSize: 70,
    columns: [
        {
            title: "Location",
            field: "location",
            formatter: stdBoldFormatter,
            width: 130
        },
        {
            title: "Bin",
            field: "bin",
            headerFilter: "input",
            formatter: stdBoldFormatter,
            width: 100,
            headerFilterPlaceholder: ""
        },
        {
            title: "Articolo",
            field: "item",
            headerFilter: "input",
            formatter: stdFormatter,
            width: 450,
            headerFilterPlaceholder: "Filtra per articolo..."
        },
        {
            title: "Shelf NetSuite",
            field: "shelfnetsuite",
            //headerFilter: "input",
            formatter: stdFormatter,
            width: 180,
            //headerFilterPlaceholder: "Filtra per NetSuite shelf..."
        },
        {
            title: "Shelf Kardex",
            field: "shelfkardex",
            //headerFilter: "input",
            formatter: stdFormatter,
            width: 180,
            //headerFilterPlaceholder: "Filtra per Kardex shelf..."
        },
        {
            title: "Q.tà <br>NetSuite",
            field: "qtynetsuite",
            formatter: stdFormatter,
            width: 120,
            validator: ["numeric", "min:0"]
        },
        {
            title: "Q.tà <br>Kardex",
            field: "qtykardex",
            formatter: stdFormatter,
            width: 120,
            validator: ["numeric", "min:0"]
        },
        {
            title: "Q.tà <br>Contata",
            field: "qty",
            editor: "input",
            formatter: qtyconfirmedFormatted,
            width: 120,
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
            title: "Valore <br>Differenza",
            field: "valuedifference",
            formatter: inventoryValueFormatter,
            bottomCalc: 'sum',
            bottomCalcParams: { precision: 2 },
            width: 150,
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
        const buttonAdj = document.getElementById('load-inventoryadj');

        if (sessionRecord.custrecord_gn_tav_invcount_head_status[0].value == "2") {
            validationIcon.style.display = 'inline';
            validationIcon.innerHTML = '<b>Sessione di Inventario chiusa</b> ❌';
            validationIcon.style.color = 'red';
        } else {
            validationIcon.style.display = 'inline';
            validationIcon.innerHTML = '<b>Sessione di Inventario aperta</b> ✅';
            validationIcon.style.color = 'green';
        }
        if (sessionRecord.custrecord_gn_tav_invcount_head_status[0].value == "2") {
            buttonAdj.disabled = true;
            buttonAdj.classList.add('disabled-style');
        } else {
            buttonAdj.disabled = false;
            buttonAdj.classList.remove('disabled-style');
        }

        let resourcesUrl = url.resolveScript({
            scriptId: 'customscript_gn_rl_inventory_count_data',
            deploymentId: 'customdeploy_gn_rl_inventory_count_data',
            params: { session: session }
        });
        https.get.promise({
            url: resourcesUrl,
            body: {},
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

document.getElementById('load-inventoryadj').addEventListener('click', (event) => {
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
        const buttonAdj = document.getElementById('load-inventoryadj');
        const visibleData = table.getData("visible");

        if (visibleData.length == 0)
            Swal.fire({
                title: 'Attenzione!',
                text: 'Non ci sono riga da Trasformare in ADJ',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        if (sessionRecord.custrecord_gn_tav_invcount_head_status[0].value == "2") {
            validationIcon.style.display = 'inline';
            validationIcon.innerHTML = '<b>Sessione di Inventario chiusa</b> ❌';
            validationIcon.style.color = 'red';
        } else {
            validationIcon.style.display = 'inline';
            validationIcon.innerHTML = '<b>Sessione di Inventario aperta</b> ✅';
            validationIcon.style.color = 'green';
        }
        if (sessionRecord.custrecord_gn_tav_invcount_head_status[0].value == "2") {
            buttonAdj.disabled = true;
            buttonAdj.classList.add('disabled-style');
        } else {
            buttonAdj.disabled = false;
            buttonAdj.classList.remove('disabled-style');
        }

        let resourcesUrl = url.resolveScript({
            scriptId: 'customscript_gn_rl_inventory_count_data',
            deploymentId: 'customdeploy_gn_rl_inventory_count_data',
            params: {}
        });
        https.put.promise({
            url: resourcesUrl,
            body: JSON.stringify({ data: visibleData, session: session }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then((response) => {
                let resp = JSON.parse(response.body);
                if (resp) { document.getElementById('apply-load-inventorycount').click(); }
            })
            .catch((error) => {
                Swal.fire({
                    title: 'Errore!',
                    text: 'Si è verificato un errore durante la creazione del ADJ ' + error.message,
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


table.on("cellEdited", (cell) => {
    let cellrow = cell.getRow().getData();
    require(['N/https', 'N/url'], (https, url) => {
        const { overlay, loadingIcon } = showeditLoadingOverlay();
        let session = document.getElementById('invcount-header').value;
        let resourcesUrl = url.resolveScript({
            scriptId: 'customscript_gn_rl_inventory_count_data',
            deploymentId: 'customdeploy_gn_rl_inventory_count_data',
            params: {}
        });
        https.post.promise({
            url: resourcesUrl,
            body: { session: session, detail: cellrow.detail, qty: cell.getValue() },
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
                document.body.removeChild(overlay);
                document.getElementById('report-inventorycount').style.display = 'block';
                document.getElementById('table-title').style.display = 'block';
            });
    });
});

const showeditLoadingOverlay = () => {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999';

    const loadingIcon = document.createElement('div');
    loadingIcon.id = 'loading-icon';
    loadingIcon.innerHTML = 'Caricamento in corso...';
    loadingIcon.style.color = 'white';
    loadingIcon.style.fontSize = '24px';
    overlay.appendChild(loadingIcon);
    document.body.appendChild(overlay);
    return { overlay, loadingIcon };
}






