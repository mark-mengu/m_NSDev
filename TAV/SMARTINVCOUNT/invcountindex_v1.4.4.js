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

    if (window.Swal) {
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
        } else {
            showError('No Data', 'No inventory data found for the selected session.');
        }
    } catch (error) {
        console.error('Data loaded handler error:', error);
        showError('Data Error', 'An error occurred while processing data.');
    }
};

const customAjaxRequest = async (url, config) => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Custom AJAX request error:', error);
        throw error;
    }
};

const loadTableData = async (table, sessionValue) => {
    if (!table) { 
        throw new Error('Table instance is required'); 
    }

    try {
        // Fallback for non-NetSuite environments (for testing)
        const mockData = [
            { bin: "A01", item: "Test Item 1", shelf: "Upper", quantityn: 10, quantityk: 9, valuedifference: 100.50, quantity: 10 },
            { bin: "B02", item: "Test Item 2", shelf: "Lower", quantityn: 15, quantityk: 14, valuedifference: 200.75, quantity: 15 }
        ];

        // Simulating data load with a timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        table.setData(mockData);
        return mockData;
    } catch (error) {
        console.error('Table data loading error:', error);
        showError('Data Load Error', error.message);
        throw error;
    }
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
                tableBuilt: function () {
                    console.log("Table fully built");
                    resolve(this);
                },
                ajaxRequestFunc: customAjaxRequest,
                ajaxError: handleAjaxError,
                dataLoaded: function (data) {
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

const initializeApp = async () => {
    try {
        const tableElement = document.getElementById('report-inventorycount');
        if (tableElement) {
            tableElement.style.display = 'none';
        }

        if (window.$ && window.$.fn.select2) {
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
        const loadingIcon = document.getElementById('loading-icon');
        if (loadingIcon) {
            loadingIcon.remove();
        }
    }
};

document.addEventListener('DOMContentLoaded', initializeApp);
