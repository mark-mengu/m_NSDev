/**
 * @Description Enhanced inventory count table with proper initialization sequence
 */

// Utility functions remain the same
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

// Formatters remain the same
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

// Table configuration
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

// Initialize table with proper event handling
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
                    // Now it's safe to perform post-initialization operations
                    console.log("Table fully built");
                    resolve(table);
                },
                ajaxRequestFunc: customAjaxRequest,
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

// Main application initialization
const initializeApp = async () => {
    try {
        // Hide table initially
        const tableElement = document.getElementById('report-inventorycount');
        if (tableElement) {
            tableElement.style.display = 'none';
        }

        // Initialize Select2 if available
        if (typeof $ !== 'undefined' && typeof $.fn.select2 !== 'undefined') {
            $('#invcount-header').select2({
                placeholder: "Select Inventory Count Session",
                allowClear: true
            });
        }

        // Set up load button handler
        const loadButton = document.getElementById('apply-load-inventorycount');
        if (loadButton) {
            loadButton.addEventListener('click', handleLoadButtonClick);
        }

    } catch (error) {
        console.error('Application initialization error:', error);
        showError('Initialization Error', 'Failed to initialize the application: ' + error.message);
    }
};

// Event Handlers
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

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);
