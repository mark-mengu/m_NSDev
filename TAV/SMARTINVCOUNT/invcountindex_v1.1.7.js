// ----------------------------------------------------------------RAW FUNCTIONS-------------------------------------
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

// -------------------------------------------------FORMATTERS------------------------------------------------------
const stdFormatter = (cell) => {
    cell.getElement().style.backgroundColor = "#ffffbf";
    return cell.getValue() || '';
};

const stdBoldFormatter = (cell) => {
    cell.getElement().style.backgroundColor = "#ffffbf";
    return `<strong>${cell.getValue() || ''}</strong>`;
};

const inventoryValueFormatter = (cell) => {
    cell.getElement().style.backgroundColor = "#ffffbf";
    const value = cell.getValue();
    return value ? parseFloat(value).toFixed(2) : '0.00';
};

// --------------------------------------------------------ICONS----------------------------------------------------
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
    `;    
    loadingIcon.appendChild(spinner);
    document.body.appendChild(loadingIcon);
    return loadingIcon;
};

// ------------------------------------------------------------------TABULATOR---------------------------------------------------------------
const initializeTable = () => {
    return new Tabulator("#report-inventorycount", {
        movableRows: false,
        dataTree: true,
        groupBy: "account",
        groupStartOpen: false,
        groupToggleElement: "header",
        groupHeader: (value, count, data) => {
            const totalValue = data.reduce((sum, row) => sum + (Number(row.item_value) || 0), 0);
            return `${value}
                <span class="group-header-count">${count} risultati</span>
                <span class="group-header-total">
                    TOTALE CONTO: ${totalValue.toLocaleString('it-IT', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </span>`;
        },
        pagination: "local",
        paginationSize: 500,
        placeholder: "No Data Found",
        rowFormatter: (row) => {
            const data = row.getData();
            if (data.item_value === 0) {
                row.getCells().forEach(cell => {
                    cell.getElement().style.color = "red";
                    cell.getElement().style.fontWeight = "bold";
                });
            }
        }
    });
};
document.addEventListener('DOMContentLoaded', () => {
    $('#invcount-header').select2({
        placeholder: "Select Inventory Count Session",
        allowClear: true
    });
    const table = initializeTable();
    const columns = [
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
    columns.forEach(column => table.addColumn(column));

    document.getElementById('apply-load-inventorycount').addEventListener('click', async (event) => {
        event.preventDefault();
        const sessionValue = document.getElementById('invcount-header').value;
        if (!sessionValue) {
            Swal.fire({
                icon: 'warning',
                title: 'Selection Required',
                text: 'Please select an inventory count session'
            });
            return;
        }
        const loadingIcon = createLoadingIcon();
        loadingIcon.style.display = 'block';
        document.getElementById('report-inventorycount').style.display = 'none';
        document.getElementById('table-title').style.display = 'none';
        try {
            const response = await fetch('/api/inventory-count', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            table.setData(data.data);
            
            document.getElementById('table-title').textContent = 'Inventory Count Report';
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load inventory count data'
            });
        } finally {
            loadingIcon.style.display = 'none';
            document.getElementById('report-inventorycount').style.display = 'block';
            document.getElementById('table-title').style.display = 'block';
        }
    });
});
