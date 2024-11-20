/**
 * @Description Enhanced inventory count table with improved error handling and fallback mechanisms
 * @author Marco Mengucci (modified with additional error handling)
 */

// Utility functions
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

// Table formatting functions with error handling
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
        loadingIcon.appendChild(spinner);
        document.body.appendChild(loadingIcon);
        return loadingIcon;
    } catch (error) {
        console.error('Loading icon creation error:', error);
        return null;
    }
};

const createTableColumns = () => {
    return [
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
    ];
};

// Table initialization with error handling
const initializeTable = () => {
    try {
        const tableElement = document.getElementById('report-inventorycount');
        if (!tableElement) {
            throw new Error('Table element not found');
        }

        tableElement.style.display = 'none';

        const table = new Tabulator("#report-inventorycount", {
            layout: "fitDataFill",
            movableRows: false,
            dataTree: true,
            groupBy: "",
            groupStartOpen: false,
            groupToggleElement: "header",
            placeholder: "No Data Found",
            ajaxRequestFunc: customAjaxRequest,
            ajaxError: function(error) {
                handleAjaxError(error);
            },
            groupHeader: (value, count, data) => {
                try {
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
                } catch (error) {
                    console.error('Group header error:', error);
                    return `<div class="group-header">Error loading group header</div>`;
                }
            },
            pagination: "local",
            paginationSize: 500,
            rowFormatter: (row) => {
                try {
                    const data = row.getData();
                    if (data.item_value === 0) {
                        row.getElement().style.color = "#b45309";
                        row.getElement().style.fontWeight = "bold";
                    }
                } catch (error) {
                    console.error('Row formatter error:', error);
                }
            },
            dataLoaded: function(data) {
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
            }
        });

        const columns = createTableColumns();
        columns.forEach(column => table.addColumn(column));

        return table;
    } catch (error) {
        console.error('Table initialization error:', error);
        showError('Table Initialization Error', error.message);
        return null;
    }
};

// Custom AJAX request function with retry mechanism
const customAjaxRequest = async (url, config, params) => {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any required NetSuite authentication headers here
                },
                credentials: 'include' // Important for NetSuite authentication
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
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
    }
};

// Error handling
const handleAjaxError = (error) => {
    console.error('AJAX Error:', error);
    showError('Data Loading Error', 
        `Unable to load inventory data. Please check your connection and try again. 
        Error: ${error.message}`
    );
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

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
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

        let table = null;

        // Event listener for the load button
        const loadButton = document.getElementById('apply-load-inventorycount');
        if (loadButton) {
            loadButton.addEventListener('click', async (event) => {
                event.preventDefault();

                const sessionValue = document.getElementById('invcount-header')?.value;
                if (!sessionValue) {
                    showError('Selection Required', 'Please select an inventory count session');
                    return;
                }

                if (tableElement) {
                    tableElement.style.display = 'none';
                }
                
                const titleElement = document.getElementById('table-title');
                if (titleElement) {
                    titleElement.style.display = 'none';
                }

                const loadingIcon = createLoadingIcon();
                if (loadingIcon) {
                    loadingIcon.style.display = 'block';
                }

                try {
                    table = initializeTable();
                    if (!table) {
                        throw new Error('Failed to initialize table');
                    }

                    // Initialize the table with data
                    await loadTableData(table, sessionValue);
                } catch (error) {
                    console.error('Table loading error:', error);
                    showError('Critical Error', 
                        'An unexpected error occurred while loading the table: ' + error.message
                    );
                }
            });
        }
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Initialization Error', 
            'Failed to initialize the application: ' + error.message
        );
    }
});
