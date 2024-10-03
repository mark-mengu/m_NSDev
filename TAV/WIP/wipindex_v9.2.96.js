/**
 *@NApiVersion 2.1
 *@NModuleScope Public
 *@Description utils
 *@author Marco Mengucci
 */

define(['N/record', 'N/search', 'N/query', 'N/runtime', 'N/url'],
    (record, search, query, runtime, url) => {
        //---------------------------------------------------GET DATA AND COLUMNS CONDITIONALLY-----------------------------------------------------------
        const _data = (date, item, location, serial, bin, account) => {
            //let { tableColumns } = _columns(date, item, location, serial, bin, account);
            //COLUMNS NON UTILIZZATE
            //NON SERVONO COMPARSA DI COLONNE DINAMICA
            let itemsData = { data: getData() };
            // itemsData.data.forEach(data => {
            //     data["hold"] = true;
            //     if (data.tbdType != '') {
            //         data.tbdType.split(',').forEach(x => { data[x] = 'To be Defined'; })
            //     }
            // }); 
            return itemsData;
        }
        //---------------------------------------------------------COLUMNS to ADD DYNAMICALLY--------------------------------------------------------------
        const _columns = (date, item, location, serial, bin, account) => {
            let tableColumns = [];
            if (customer == '') {
                let values = {};
                inventoryDetails.filter(inventoryDetail => (inventoryDetail.inventoryNumber != undefined && inventoryDetail.inventoryNumber != ''))
                    .forEach(inventoryNumber => {
                        values[inventoryNumber.inventoryNumber] = inventoryNumber.number;
                    });
                tableColumns.push({
                    title: 'Inventory Number',
                    validator: "required",
                    field: 'inventoryNumber',
                    editor: "list",
                    editorParams: { values }
                });
                let bins = inventoryDetails.filter(inventoryDetail => (inventoryDetail.bin != undefined && inventoryDetail.bin != ''));
                qualityControlResultSrc.custitem_tav_lista_controlli_qualita.forEach((x) => {
                    tableColumns.push({
                        title: x.text,
                        field: x.value,
                        validator: "required",
                        editor: "list",
                        editorParams: { values: ['Good', 'Defect', 'To be Defined'] },
                        cellClick: function (e, cell) {
                            cell.getElement().style.backgroundColor = 'red';
                        }
                    });
                });
            }
            return { tableColumns };
        }

        //------------------------------------------------------GET DATA-------------------------------------------------
        const getData = () => {
            const assemblies = [{
                itemid: 'Forno TPHF 312', item: 1111, displayname: 'Forno', recordtype: 'Assembly Build', bin: "Prod", binid: 1111, location: '0957', locationid: 11111,
                account: 'GEST', accountid: 1111, item_value: 11111111
            }];
            // const itemreceipts = [];

            //const assemblies = getAssemblyBuildsMovements();
            // const itemreceipts = getItemReceiptsMovements();
            //const itemfulfillments = getItemFulfillsMovements();
            //const inventorytransfers = getInventoryTransfersMovements();
            //const bintransfers = getBinTransfersMovements();
            //const adjustments = getInventoryAdjustmentMovements();

            let warData = assemblies;
            log.debug('warData', warData.length);
            log.debug('warData', warData);
            return warData;
        }
        //--------------------------------------------------ELABORATE DATA FUNCTION--------------------------------------
        const elaborateDatas = (transferReceipts, depositoFulfills) => {
            const fulfillGroups = _.groupBy(depositoFulfills, (item) => `${item.itemid}-${item.to}`);
            return _.filter(transferReceipts, (tf) => {
                const k = `${tf.itemid}-${tf.to_id}`;
                const matchingFfs = fulfillGroups[k];
                if (matchingFfs && matchingFfs.length > 0) {
                    let remainingTfQuantity = _.parseInt(tf.quantity);
                    matchingFfs.forEach(ff => {
                        const fulfillQty = _.parseInt(ff.quantity);
                        if (remainingTfQuantity > 0) {
                            const quantityMinus = Math.min(remainingTfQuantity, fulfillQty);
                            // UPDATE TF
                            remainingTfQuantity -= quantityMinus;
                            // UPDATE FF
                            ff.quantity = (fulfillQty - quantityMinus).toString();
                        }
                    });
                    tf.quantity = remainingTfQuantity.toString();
                }
                return _.parseInt(tf.quantity) > 0;
            });
        }
        //---------------------------------------------------GET ASSEMBLY BUILD MOVEMENTS----------------------------------------
        const getAssemblyBuildsMovements = () => {
            let itemsInfos = [];
            var assemblybuilds = search.create({
                type: "assemblybuild",
                settings: [{ "name": "consolidationtype", "value": "AVERAGE" }, { "name": "includeperiodendtransactions", "value": "F" }],
                filters:
                    [
                        ["type", "anyof", "Build"],
                        "AND",
                        ["account.type", "anyof", "OthCurrAsset"],
                        "AND",
                        ["taxline", "is", "F"],
                        "AND",
                        ["mainline", "any", ""],
                        "AND",
                        ["item.type", "anyof", "InvtPart", "Assembly"],
                        "AND",
                        ["quantity", "isnotempty", ""]
                    ],
                columns:
                    [
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        search.createColumn({ name: "recordtype", label: "Record Type" }),
                        search.createColumn({ name: "trandate", label: "Date" }),
                        search.createColumn({ name: "postingperiod", label: "Period" }),
                        search.createColumn({ name: "item", label: "Item" }),
                        search.createColumn({ name: "type", join: "item", label: "Item Type" }),
                        search.createColumn({ name: "costingmethod", join: "item", label: "Costing Method" }),
                        search.createColumn({ name: "quantity", label: "Quantity" }),
                        search.createColumn({ name: "location", label: "Location" }),
                        search.createColumn({ name: "account", label: "Account" }),
                        search.createColumn({ name: "amount", label: "Amount" }),
                        search.createColumn({ name: "fxrate", label: "Item Rate" }),
                        search.createColumn({ name: "binnumber", join: "inventoryDetail", label: "Bin Number" })
                    ]
            });
            let resultsOvercame = Overcome4000Limit(assemblybuilds);
            resultsOvercame.forEach((result) => {
                let obj = {
                    itemid: result.getValue('item'),
                    item: result.getText('item'),
                    recordtype: result.getValue('recordtype'),
                    bin: result.getText({ name: "binnumber", join: "inventoryDetail" }),
                    binid: result.getValue({ name: "binnumber", join: "inventoryDetail" }),
                    location: result.getText('location'),
                    locationid: result.getValue('location'),
                    account: result.getText('account'),
                    accountid: result.getValue('account'),
                    item_value: result.getValue('amount')
                };
                itemsInfos.push(obj);
                return false;
            });
            return itemsInfos;
        }
        //---------------------------------------------------GET ITEM RECEIPTS MOVEMENTS----------------------------------------
        const getItemReceiptsMovements = () => {
            let itemsInfos = [];
            var itemreceipt = search.create({
                type: "itemreceipt",
                settings: [{ "name": "consolidationtype", "value": "AVERAGE" }, { "name": "includeperiodendtransactions", "value": "F" }],
                filters:
                    [
                        ["type", "anyof", "ItemRcpt"],
                        "AND",
                        ["account.type", "anyof", "OthCurrAsset"],
                        "AND",
                        ["taxline", "is", "F"],
                        "AND",
                        ["mainline", "is", "F"],
                        "AND",
                        ["item.type", "anyof", "InvtPart", "Assembly"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        search.createColumn({ name: "recordtype", label: "Record Type" }),
                        search.createColumn({ name: "trandate", label: "Date" }),
                        search.createColumn({ name: "postingperiod", label: "Period" }),
                        search.createColumn({ name: "item", label: "Item" }),
                        search.createColumn({ name: "type", join: "item", label: "Item Type" }),
                        search.createColumn({ name: "costingmethod", join: "item", label: "Costing Method" }),
                        search.createColumn({ name: "quantity", label: "Quantity" }),
                        search.createColumn({ name: "location", label: "Location" }),
                        search.createColumn({ name: "account", label: "Account" }),
                        search.createColumn({ name: "amount", label: "Amount" }),
                        search.createColumn({ name: "fxrate", label: "Item Rate" }),
                        search.createColumn({ name: "binnumber", join: "inventoryDetail", label: "Bin Number" })
                    ]
            });
            let resultsOvercame = Overcome4000Limit(itemreceipt);
            resultsOvercame.forEach((result) => {
                let obj = {
                    itemid: result.getValue('item'),
                    item: result.getText('item'),
                    recordtype: result.getValue('recordtype'),
                    bin: result.getText({ name: "binnumber", join: "inventoryDetail" }),
                    binid: result.getValue({ name: "binnumber", join: "inventoryDetail" }),
                    location: result.getText('location'),
                    locationid: result.getValue('location'),
                    account: result.getText('account'),
                    accountid: result.getValue('account'),
                    item_value: result.getValue('amount')
                };
                itemsInfos.push(obj);
                return false;
            });
            return itemsInfos;
        }

        //-----------------------------------------DATA SORT--------------------------------------------------
        const parseDate = (dateStr) => {
            if (dateStr == null) { return ''; }
            if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
                throw new Error(`Invalid date format. Expected DD/MM/YYYY, got: ${dateStr}`);
            }
            const parts = dateStr.split('/').map(part => parseInt(part, 10));
            const [day, month, year] = parts;
            if (month < 1 || month > 12) { throw new Error(`Invalid month in date: ${dateStr}`); }
            const date = new Date(year, month - 1, day);
            if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
                throw new Error(`Invalid date: ${dateStr}`);
            }
            return date;
        };
        //--------------------------------------------------------OVERCOME SEARCH LIMIT---------------------------------------
        let Overcome4000Limit = (search) => {
            var results = search.run();
            var searchResults = [];
            var searchid = 0;
            do {
                var resultslice = results.getRange({ start: searchid, end: searchid + 1000 });
                resultslice.forEach((slice) => {
                    searchResults.push(slice);
                    searchid++;
                });
            }
            while (resultslice.length >= 1000);
            return searchResults;
        }
        //-------------------------------------------------------GET PARAM--------------------------------------------------
        const scriptParameter = (parameterName) => {
            var currentScript = runtime.getCurrentScript();
            var parameter = currentScript.getParameter({
                name: parameterName
            });
            return parameter;
        }

        //-----------------------------------------------RETURN------------------------------------------------------

        return { data: _data, scriptParameter }
    })
