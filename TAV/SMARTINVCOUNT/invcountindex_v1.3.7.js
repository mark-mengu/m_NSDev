const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
};

const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0,00';
    const roundedNum = Math.round(num * 100) / 100;
    const [integerPart, decimalPart] = roundedNum.toString().split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const formattedDecimal = decimalPart ? decimalPart.padEnd(2, '0') : '00';
    return `${formattedInteger},${formattedDecimal}`;
};

// UI Components
const createLoadingIcon = () => {
    try {
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

        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes spin {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
        `;
        document.head.appendChild(styleSheet);

        loadingIcon.appendChild(spinner);
        document.body.appendChild(loadingIcon);
        return loadingIcon;
    } catch (error) {
        console.error('Loading icon creation error:', error);
        return null;
    }
};

const showError = (title, message) => {
    const loadingIcon = document.getElementById('loading-icon');
    if (loadingIcon) {
        loadingIcon.remove();
    }

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'error',
            title: title,
            text: message,
            confirmButtonColor: '#f59e0b',
            confirmButtonText: 'OK'
        });
    } else {
        alert(`${title}\n${message}`);
    }
};

const handleAjaxError = (error) => {
    console.error('AJAX Error:', error);
    showError('Data Loading Error',
        `Unable to load inventory data. Please check your connection and try again. 
        Error: ${error.message}`
    );
};

const handleDataLoaded = (data, tableElement) => {
    try {
        const loadingIcon = document.getElementById('loading-icon');
        if (loadingIcon) {
            loadingIcon.remove();
        }
        if (data && data.length > 0) {
            tableElement.style.display = 'block';
            document.getElementById('table-title').style.display = 'block';
        }
    } catch (error) {
        console.error('Data loaded handler error:', error);
    }
};

const loadTableData = async (table, sessionValue) => {
    if (!table) {
        throw new Error('Table instance is required');
    }

    return new Promise((resolve, reject) => {
        require(['N/https', 'N/url'], (https, url) => {
            try {
                const resourcesUrl = url.resolveScript({
                    scriptId: 'customscript_gn_rl_inventory_count_data',
                    deploymentId: 'customdeploy_gn_rl_inventory_count_data',
                    returnExternalUrl: false,
                    params: {
                        sessionId: sessionValue
                    }
                });

                if (!resourcesUrl) {
                    throw new Error('Failed to resolve RESTlet URL');
                }

                https.get.promise({
                    url: resourcesUrl,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache'
                    }
                })
                .then((response) => {
                    try {
                        if (!response || !response.body) {
                            throw new Error('Empty response received from server');
                        }

                        let data = JSON.parse(response.body);
                        
                        if (data.error) {
                            throw new Error(data.error.message || 'Server response error');
                        }

                        if (!data.data || !Array.isArray(data.data)) {
                            throw new Error('Invalid data format received');
                        }

                        // Process and validate each row
                        const processedData = data.data.map(row => ({
                            ...row,
                            quantityn: row.quantityn || '0',
                            quantityk: row.quantityk || '0',
                            valuedifference: row.valuedifference || '0.00',
                            quantity: row.quantity || '0'
                        }));

                        table.setData(processedData)
                            .then(() => resolve(processedData))
                            .catch(error => reject(new Error(`Failed to set table data: ${error.message}`)));
                    } catch (parseError) {
                        reject(new Error(`Data parsing error: ${parseError.message}`));
                    }
                })
                .catch(error => {
                    reject(new Error(`RESTlet request failed: ${error.message}`));
                });
            } catch (urlError) {
                reject(new Error(`Failed to resolve script URL: ${urlError.message}`));
            }
        });
    });
};

// Table configuration and formatting functions remain the same
const TABLE_CONFIG = {
    columns: [
        {
            title: "Bin",
            field: "bin",
            headerFilter: "input",
            formatter: stdBoldFormatter,
            width: 130,
            headerFilterPlaceholder: "Filter Bin"
        },
        {
            title: "Articolo",
            field: "item",
            headerFilter: "input",
            formatter: stdFormatter,
            width: 250,
            headerFilterPlaceholder: "Filter Article"
        },
        {
            title: "Shelf",
            field: "shelf",
            headerFilter: "input",
            formatter: stdFormatter,
            width: 200,
            headerFilterPlaceholder: "Filter Shelf"
        },
        {
            title: "Quantity NS",
            field: "quantityn",
            formatter: stdFormatter,
            width: 130,
            validator: ["numeric", "min:0"]
        },
        {
            title: "Quantity KDX",
            field: "quantityk",
            formatter: stdFormatter,
            width: 130,
            validator: ["numeric", "min:0"]
        },
        {
            title: "Valore Differenza",
            field: "valuedifference",
            formatter: inventoryValueFormatter,
            bottomCalc: 'sum',
            bottomCalcParams: { precision: 2 },
            width: 260,
            validator: "numeric"
        },
        {
            title: "Quantity Contata",
            field: "quantity",
            editor: "input",
            formatter: stdFormatter,
            width: 260,
            validator: ["numeric", "min:0"],
            editorParams: {
                selectContents: true
            }
        }
    ],
    layout: "fitDataFill",
    movableRows: false,
    dataTree: true,
    groupBy: "",
    groupStartOpen: false,
    groupToggleElement: "header",
    placeholder: "No Data Found",
    pagination: "local",
    paginationSize: 500
};

const initializeTable = () => {
    return new Promise((resolve, reject) => {
        try {
            const tableElement = document.getElementById('report-inventorycount');
            if (!tableElement) {
                throw new Error('Table element not found');
            }
            const table = new Tabulator("#report-inventorycount", {
                ...TABLE_CONFIG,
                tableBuilt: function() {
                    console.log("Table fully built");
                    resolve(table);
                },
                ajaxError: handleAjaxError,
                dataLoaded: function(data) {
                    handleDataLoaded(data, tableElement);
                }
            });
        } catch (error) {
            console.error('Table initialization error:', error);
            showError('Table Initialization Error', error.message);
            reject(error);
        }
    });
};

const handleLoadButtonClick = async (event) => {
    event.preventDefault();

    const sessionValue = document.getElementById('invcount-header')?.value;
    if (!sessionValue) {
        showError('Selection Required', 'Please select an inventory count session');
        return;
    }

    const tableElement = document.getElementById('report-inventorycount');
    const titleElement = document.getElementById('table-title');

    if (tableElement) tableElement.style.display = 'none';
    if (titleElement) titleElement.style.display = 'none';

    const loadingIcon = createLoadingIcon();
    if (loadingIcon) loadingIcon.style.display = 'block';

    try {
        const table = await initializeTable();
        await loadTableData(table, sessionValue);
    } catch (error) {
        console.error('Table loading error:', error);
        showError('Critical Error', 'An unexpected error occurred while loading the table: ' + error.message);
    }
};

const initializeApp = async () => {
    try {
        const tableElement = document.getElementById('report-inventorycount');
        if (tableElement) {
            tableElement.style.display = 'none';
        }

        if (typeof $ !== 'undefined' && typeof $.fn.select2 !== 'undefined') {
            $('#invcount-header').select2({
                placeholder: "Select Inventory Count Session",
                allowClear: true
            });
        }
        const loadButton = document.getElementById('apply-load-inventorycount');
        if (loadButton) {
            loadButton.addEventListener('click', handleLoadButtonClick);
        }
    } catch (error) {
        console.error('Application initialization error:', error);
        showError('Initialization Error', 'Failed to initialize the application: ' + error.message);
    }
};

document.addEventListener('DOMContentLoaded', initializeApp);
