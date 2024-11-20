/**
 *@Description Enhanced inventory count table with sequential loading and yellow-orange theme
 *@author Marco Mengucci (modified)
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
        border: 7px solid #fef3c7;
        border-top: 7px solid #f59e0b;
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
        placeholder: "No Data Found",
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
        rowFormatter: (row) => {
            const data = row.getData();
            if (data.item_value === 0) {
                row.getElement().style.color = "#b45309";
                row.getElement().style.fontWeight = "bold";
            }
        },
        dataLoaded: function (data) {
            const loadingIcon = document.getElementById('loading-icon');
            if (loadingIcon) {
                loadingIcon.remove();
            }
            if (data && data.length > 0) {
                tableElement.style.display = 'block';
                document.getElementById('table-title').style.display = 'block';
            }
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
        background-color: #fef3c7;
        border-bottom: 2px solid #f59e0b;
    }

    .tabulator {
        background-color: #fffbeb;
        border: 1px solid #fcd34d;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px 0 rgba(245, 158, 11, 0.1);
    }

    .tabulator-header {
        background-color: #fef3c7 !important;
        border-bottom: 2px solid #f59e0b !important;
    }

    .tabulator-col {
        background-color: #fef3c7 !important;
        border-right: 1px solid #fcd34d !important;
        color: #92400e !important;
    }

    .tabulator-row {
        border-bottom: 1px solid #fcd34d !important;
        background-color: #fffbeb !important;
    }

    .tabulator-row:nth-child(even) {
        background-color: #fef3c7 !important;
    }

    .tabulator-row:hover {
        background-color: #fde68a !important;
    }

    .tabulator-footer {
        background-color: #fef3c7 !important;
        border-top: 2px solid #f59e0b !important;
    }

    #loading-icon {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 251, 235, 0.8);
        z-index: 9998;
    }

    .tabulator-placeholder {
        position: relative !important;
        height: 100px !important;
        padding-top: 40px !important;
        text-align: center !important;
        color: #92400e !important;
        font-weight: bold !important;
    }
`;

document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    const tableElement = document.getElementById('report-inventorycount');
    if (tableElement) {
        tableElement.style.display = 'none';
    }

    $('#invcount-header').select2({
        placeholder: "Select Inventory Count Session",
        allowClear: true
    });

    let table = null;

    const hideLoadingState = () => {
        const loadingIcon = document.getElementById('loading-icon');
        if (loadingIcon) {
            loadingIcon.remove();
        }
    };

    const showError = (title, message) => {
        hideLoadingState();
        Swal.fire({
            icon: 'error',
            title: title,
            text: message,
            confirmButtonColor: '#f59e0b',
            confirmButtonText: 'OK'
        });
    };

    document.getElementById('apply-load-inventorycount').addEventListener('click', async (event) => {
        event.preventDefault();

        const sessionValue = document.getElementById('invcount-header').value;
        if (!sessionValue) {
            Swal.fire({
                icon: 'warning',
                title: 'Selezione Richiesta',
                text: 'Si prega di selezionare una sessione di conteggio inventario',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        // Hide table and title before showing loading icon
        if (tableElement) {
            tableElement.style.display = 'none';
        }
        document.getElementById('table-title').style.display = 'none';

        // Show loading icon
        const loadingIcon = createLoadingIcon();
        loadingIcon.style.display = 'block';

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
                    body: {},
                    headers: { 'Content-Type': 'application/json' }
                })
                    .then((response) => {
                        try {
                            let data = JSON.parse(response.body);

                            if (data.error) {
                                throw new Error(data.error.message || 'Errore nella risposta del server');
                            }

                            if (!data.data || !Array.isArray(data.data)) {
                                throw new Error('Formato dati non valido');
                            }

                            // Set table data after validation
                            table.setData(data.data).then(() => {
                                // Update visibility after data is loaded
                                if (data.data.length === 0) {
                                    document.getElementById('table-title').style.display = 'block';
                                    tableElement.style.display = 'block';
                                }
                            });

                            document.getElementById('table-title').textContent = 'Inventory Count Report';
                        } catch (parseError) {
                            console.error('Data Parse Error:', parseError);
                            showError(
                                'Errore di Formato',
                                'I dati ricevuti non sono nel formato corretto: ' + parseError.message
                            );
                        }
                    })
                    .catch((error) => {
                        console.error('Data Fetch Error:', error);

                        let errorMessage = 'Impossibile caricare i dati del conteggio inventario';

                        if (error.type === 'NETWORK_ERROR') {
                            errorMessage = 'Errore di rete: verificare la connessione';
                        } else if (error.type === 'SSS_MISSING_REQD_ARGUMENT') {
                            errorMessage = 'Parametri mancanti nella richiesta';
                        } else if (error.type === 'RCRD_DOES_NOT_EXIST') {
                            errorMessage = 'Sessione di conteggio non trovata';
                        } else if (error.message) {
                            errorMessage = error.message;
                        }

                        showError('Errore', errorMessage);
                    });
            });
        } catch (error) {
            console.error('Global Error:', error);
            showError(
                'Errore Critico',
                'Si è verificato un errore imprevisto: ' + error.message
            );
        }
    });
});
