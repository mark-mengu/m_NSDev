/**
 * @Description Enhanced inventory count table with complete helper functions
 */


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

const stdFormatter = (cell) => {
    try {
        return cell.getValue() || '';
    } catch (error) {
        console.error('Formatter error:', error);
        return '';
    }
};

const stdBoldFormatter = (cell) => {
    try {
        return `<strong>${cell.getValue() || ''}</strong>`;
    } catch (error) {
        console.error('Bold formatter error:', error);
        return '';
    }
};

const inventoryValueFormatter = (cell) => {
    try {
        const value = cell.getValue();
        return value ? parseFloat(value).toFixed(2) : '0.00';
    } catch (error) {
        console.error('Value formatter error:', error);
        return '0.00';
    }
};

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

const customAjaxRequest = async (url, config, params) => {
    const maxRetries = 3;
    let retryCount = 0;
    while (retryCount < maxRetries) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            retryCount++;
            if (retryCount === maxRetries) {
                throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
    }
};


const loadTableData = (table, sessionValue) => {
    console.log('DATA LOAD STARTED', { sessionValue });

    const tableTitle = document.getElementById('table-title');
    if (tableTitle) {
        tableTitle.textContent = `Inventory Count - ${sessionValue}`;
        tableTitle.style.display = 'block';
    }

    // Create detailed logging function
    const logStep = (step, details = {}) => {
        console.group(`LoadTableData: ${step}`);
        console.log('Details:', details);
        console.trace(); // Print stack trace
        console.groupEnd();
    };

    require(['N/https', 'N/url', 'N/runtime'], (https, url, runtime) => {
        try {
            logStep('Resolving Script URL', { sessionValue });

            const resourcesUrl = url.resolveScript({
                scriptId: 'customscript_gn_rl_inventory_count_data',
                deploymentId: 'customdeploy_gn_rl_inventory_count_data',
                params: { sessionId: sessionValue }
            });

            logStep('Resolved Script URL', { resourcesUrl });

            // Comprehensive error handling wrapper
            const executeRequest = () => {
                return new Promise((resolve, reject) => {
                    https.get.promise({
                        url: resourcesUrl,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    }).then(response => {
                        logStep('HTTP Response Received', {
                            status: response.status,
                            bodyLength: response.body ? response.body.length : 'No Body'
                        });

                        try {
                            const data = JSON.parse(response.body);

                            if (data.error) {
                                logStep('Server Error', { errorMessage: data.error.message });
                                throw new Error(data.error.message || 'Server response error');
                            }

                            if (!data.data || !Array.isArray(data.data)) {
                                logStep('Invalid Data Format', { receivedData: data });
                                throw new Error('Invalid data format received');
                            }

                            resolve(data.data);
                        } catch (parseError) {
                            logStep('Data Parsing Error', {
                                originalError: parseError.message,
                                responseBody: response.body
                            });
                            reject(parseError);
                        }
                    }).catch(httpError => {
                        logStep('HTTPS Request Error', {
                            errorMessage: httpError.message,
                            scriptContext: runtime.getCurrentScript().id
                        });
                        reject(httpError);
                    });
                });
            };
            // Execute request with comprehensive error handling
            executeRequest()
                .then(processedData => {
                    logStep('Setting Table Data', { dataLength: processedData.length });
                    return table.setData(processedData);
                })
                .then(() => {
                    logStep('Table Data Set Successfully');
                    const tableElement = document.getElementById('report-inventorycount');
                    if (tableElement) tableElement.style.display = 'block';
                })
                .catch(error => {
                    logStep('Critical Failure', {
                        errorMessage: error.message,
                        stack: error.stack
                    });
                    showError('Data Loading Error', error.message);
                });

        } catch (urlResolutionError) {
            logStep('URL Resolution Error', {
                errorMessage: urlResolutionError.message,
                scriptContext: runtime.getCurrentScript().id
            });
            showError('URL Resolution Error', urlResolutionError.message);
        }
    });
};

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
            title: "Shelf NetSuite",
            field: "shelfnetsuite",
            headerFilter: "input",
            formatter: stdFormatter,
            width: 200,
            headerFilterPlaceholder: "Filter Shelf"
        },
        {
            title: "Shelf NetSuite",
            field: "shelfkardex",
            headerFilter: "input",
            formatter: stdFormatter,
            width: 200,
            headerFilterPlaceholder: "Filter Shelf"
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
            formatter: stdFormatter,
            width: 200,
            validator: ["numeric", "min:0"],
            editorParams: {
                selectContents: true
            }
        },
        {
            title: "Valore Differenza",
            field: "valuedifference",
            formatter: inventoryValueFormatter,
            bottomCalc: 'sum',
            bottomCalcParams: { precision: 2 },
            width: 260,
            validator: "numeric"
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
            const table = new Tabulator("#report-inventorycount", {
                ...TABLE_CONFIG,
                tableBuilt: function () {
                    resolve(this);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
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

const handleLoadButtonClick = async (event) => {
    event.preventDefault();
    const sessionValue = document.getElementById('invcount-header').value;
    if (!sessionValue) {
        showError('Selection Required', 'Please select an inventory count session');
        return;
    }
    const tableElement = document.getElementById('report-inventorycount');
    if (tableElement) tableElement.style.display = 'none';

    createLoadingIcon();
    try {
        const table = initializeTable();
        loadTableData(table, sessionValue);
    } catch (error) {
        showError('Critical Error', error.message);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    $('#invcount-header').select2({
        placeholder: "Select Inventory Count Session",
        allowClear: true
    });

    document.getElementById('apply-load-inventorycount').addEventListener('click', handleLoadButtonClick);
});

