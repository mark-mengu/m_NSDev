/**
 *@Description E
 *@author Marco Mengucci
 */

const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
};

const formatNumber = (num) => {
    if (!num) return '0,00';
    const roundedNum = Math.round(num * 100) / 100;
    const [integerPart, decimalPart] = roundedNum.toString().split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const formattedDecimal = decimalPart ? decimalPart.padEnd(2, '0') : '00';
    return `${formattedInteger},${formattedDecimal}`;
};

const stdFormatter = (cell) => {
    return cell.getValue() || '';
};

const stdBoldFormatter = (cell) => {
    return `<strong>${cell.getValue() || ''}</strong>`;
};

const inventoryValueFormatter = (cell) => {
    const value = cell.getValue();
    return value ? parseFloat(value).toFixed(2) : '0.00';
};

const createLoadingIcon = () => {
    const existingIcon = document.getElementById('loading-icon');
    if (existingIcon) return existingIcon;

    const loadingIcon = document.createElement('div');
    loadingIcon.id = 'loading-icon';

    const spinner = document.createElement('div');
    spinner.style.cssText = `
        border: 7px solid #f3f3f3;
        border-top: 7px solid #39ff14;
        border-radius: 50%;
        width: 75px;
        height: 75px;
        animation: spin 1s linear infinite;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
    `;
    loadingIcon.appendChild(spinner);
    document.body.appendChild(loadingIcon);
    return loadingIcon;
};

const createTableColumns = () => {
    return [
        {
            title: "Bin",
            field: "bin",
            headerFilter: "input",
            formatter: stdBoldFormatter,
            width: 130
        },
        {
            title: "Articolo",
            field: "item",
            headerFilter: "input",
            formatter: stdFormatter,
            width: 250
        },
        {
            title: "Shelf",
            field: "shelf",
            headerFilter: "input",
            formatter: stdFormatter,
            width: 200
        },
        {
            title: "Quantity NS",
            field: "quantityn",
            formatter: stdFormatter,
            width: 130
        },
        {
            title: "Quantity KDX",
            field: "quantityk",
            formatter: stdFormatter,
            width: 130
        },
        {
            title: "Valore Differenza",
            field: "valuedifference",
            formatter: inventoryValueFormatter,
            bottomCalc: 'sum',
            bottomCalcParams: { precision: 2 },
            width: 260
        },
        {
            title: "Quantity Contata",
            field: "quantity",
            editor: "input",
            formatter: stdFormatter,
            width: 260
        }
    ];
};

const initializeTable = () => {
    const tableElement = document.getElementById('report-inventorycount');
    tableElement.style.display = 'none';

    const table = new Tabulator("#report-inventorycount", {
        layout: "fitDataFill",
        movableRows: false,
        dataTree: true,
        groupBy: "",
        groupStartOpen: false,
        groupToggleElement: "header",
        groupHeader: (value, count, data) => {
            const totalValue = data.reduce((sum, row) => sum + (Number(row.item_value) || 0), 0);
            return `
                <div class="group-header">
                    ${value}
                    <span class="group-header-count">${count} risultati</span>
                    <span class="group-header-total">
                        TOTALE CONTO: ${totalValue.toLocaleString('it-IT', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}
                    </span>
                </div>`;
        },
        pagination: "local",
        paginationSize: 500,
        placeholder: "No Data Found",
        rowFormatter: (row) => {
            const data = row.getData();
            if (data.item_value === 0) {
                row.getElement().style.color = "red";
                row.getElement().style.fontWeight = "bold";
            }
        },
        dataLoaded: function (data) {
            const loadingIcon = document.getElementById('loading-icon');
            if (loadingIcon) {
                loadingIcon.style.display = 'none';
            }
            tableElement.style.display = 'block';
            document.getElementById('table-title').style.display = 'block';
        }
    });

    const columns = createTableColumns();
    columns.forEach(column => table.addColumn(column));

    return table;
};

const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background-color: #f0f9ff;
        border-bottom: 2px solid #93c5fd;
    }

    .tabulator {
        background-color: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }

    .tabulator-header {
        background-color: #f0f9ff !important;
        border-bottom: 2px solid #93c5fd !important;
    }

    .tabulator-col {
        background-color: #f0f9ff !important;
        border-right: 1px solid #e5e7eb !important;
    }

    .tabulator-row {
        border-bottom: 1px solid #e5e7eb !important;
    }

    .tabulator-row:nth-child(even) {
        background-color: #f8fafc !important;
    }

    .tabulator-row:hover {
        background-color: #f0f9ff !important;
    }

    .tabulator-footer {
        background-color: #f8fafc !important;
        border-top: 2px solid #93c5fd !important;
    }

    #loading-icon {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.8);
        z-index: 9998;
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('report-inventorycount')) {
        document.getElementById('report-inventorycount').style.display = 'none';
    }

    $('#invcount-header').select2({
        placeholder: "Select Inventory Count Session",
        allowClear: true
    });

    let table = null;

    document.getElementById('apply-load-inventorycount').addEventListener('click', async (event) => {
        event.preventDefault();

        const sessionValue = document.getElementById('invcount-header').value;
        if (!sessionValue) {
            Swal.fire({
                icon: 'warning',
                title: 'Selezione Richiesta',
                text: 'Si prega di selezionare una sessione di conteggio inventario'
            });
            return;
        }

        const loadingIcon = createLoadingIcon();
        loadingIcon.style.display = 'block';
        document.getElementById('report-inventorycount').style.display = 'none';
        document.getElementById('table-title').style.display = 'none';

        try {
            if (!table) {
                table = initializeTable();
            }

            require(['N/https', 'N/url', 'N/search'], (https, url, search) => {
                let resourcesUrl = url.resolveScript({
                    scriptId: 'customscript_gn_rl_inventory_count_data',
                    deploymentId: 'customdeploy_gn_rl_inventory_count_data',
                    params: {}
                });

                https.get.promise({
                    url: resourcesUrl,
                    body: JSON.stringify({}),
                    headers: { 'Content-Type': 'application/json' }
                })
                    .then((response) => {
                        let data = JSON.parse(response.body);
                        table.setData(data.data);
                        document.getElementById('table-title').textContent = 'Inventory Count Report';
                    })
                    .catch((error) => {
                        console.error('Data Fetch Error:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Errore',
                            text: 'Impossibile caricare i dati del conteggio inventario'
                        });
                    });
            });
        } catch (error) {
            console.error('Global Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Errore Critico',
                text: 'Si è verificato un errore imprevisto'
            });
            loadingIcon.style.display = 'none';
        }
    });
});
