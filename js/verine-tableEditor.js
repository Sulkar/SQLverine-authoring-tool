$(document).ready(function () {

    //global variables
    var MAX_ROWS = 0;
    var SQL_ID_COLUMN;

    var columnObject1 = {
        name: "id",
        type: "integer|primary key"
    }
    var columnObject2 = {
        name: "vorname",
        type: "text"
    }
    var columnObject3 = {
        name: "nachname",
        type: "text"
    }

    var TABLE_COLUMNS = [
        columnObject1, columnObject2, columnObject3
    ];
    var TABLE_VALUES = [
        [1, "Mark", "Otto"],
        [2, "Jacob", "Thornton"],
        [3, "Larry", "Bird"]
    ];

    var UPDATE_VALUES = []; //[sql_id, Spalte, Wert]
    var INSERT_VALUES = []; //[auto, Spalte1, Spalte2, ...]
    var DELETE_VALUES = []; //[sql_id, sql_id, ...]


    ///////////
    // START //
    //create sample table
    $(".verineTableEditable").html(createTableDataEdit(TABLE_COLUMNS, TABLE_VALUES));


    //function: Sucht in der Tablle nach geänderten Werten und speichert diese im UPDATE_VALUES Array
    function checkForUpdates() {
        UPDATE_VALUES = [];
        //iteriert durch alle th im body = dort werden die IDs der Tabelle aufgelistet
        $(".verineTableEditable tbody .sqlID").each(function () {
            var thisId = $(this).attr("id");
            var tempRow = getRowFromId(thisId);
            var sqlIdOfRow = parseInt($(this).text());
            var maxColumns = TABLE_COLUMNS.length;

            TABLE_VALUES.forEach(element => {
                if (element[0] == sqlIdOfRow) {
                    //check every data of current row
                    for (var i = 0; i < maxColumns; i++) {
                        if ($("#id_" + i + "_" + tempRow).text() != element[i]) {
                            var rowCellValue = $("#id_" + i + "_" + tempRow).text();
                            element[i] = rowCellValue;
                            var columnName = TABLE_COLUMNS[i].name;
                            var rowIdValueArray = [sqlIdOfRow, columnName, rowCellValue];
                            UPDATE_VALUES.push(rowIdValueArray);
                        }
                    }
                }
            });

        });
        log(UPDATE_VALUES)
    }

    //function: Sucht in der Tabelle nach neu hinzugefügten Werten und speichert diese im INSERT_VALUES Array
    function checkForInserts() {
        INSERT_VALUES = [];
        //iteriert durch alle th im body = dort werden die IDs der Tabelle aufgelistet
        $(".verineTableEditable tbody .sqlID").each(function () {
            var thisId = $(this).attr("id");
            var tempRow = getRowFromId(thisId);
            if ($(this).text() == "auto") {
                var maxColumns = TABLE_COLUMNS.length;
                var tempInsertArray = [];
                //create new Array for row
                for (var i = 0; i < maxColumns; i++) {
                    var rowCellValue = $("#id_" + i + "_" + tempRow).text();
                    tempInsertArray.push(rowCellValue);
                }
                INSERT_VALUES.push(tempInsertArray);
            }
        });
        log(INSERT_VALUES)
    }

    //function: speichert die sql_ids von gelöschten Zeilen
    function saveSqlIdForDelete(tempId) {
        var sqlIdToDelete = getSqlIdofRow(tempId);
        var tempRow = getRowFromId(tempId);
        if (sqlIdToDelete != "auto") {
            DELETE_VALUES.push(parseInt(sqlIdToDelete));
        }
        //delete table row
        $("#row_" + tempRow).remove();
        log(DELETE_VALUES)
    }

    function getSqlIdofRow(tempId) {
        var tempRow = getRowFromId(tempId);
        return $("#id_" + SQL_ID_COLUMN + "_" + tempRow).text();
    }
    function getColumnFromId(tempId) {
        return tempId.match(/(?<=id_)(\d+?)(?=_\d+)/g)[0];
    }
    function getRowFromId(tempId) {
        return tempId.match(/(?<=id_\d+?_)(.+)/g)[0];
    }

    //Button: fügt am Ende der Tabelle eine neue Zeile ein
    $("#btnAddRow").on("click", function () {
        $(".verineTableEditable tbody").append(createNewRow());
    });

    //Button: speichert die Daten
    $("#btnSaveData").on("click", function () {
        checkForUpdates();
        checkForInserts();
    });

    //Event: wenn eine Zelle der Tabelle angeklickt wird, wird diese editierbar gemacht
    $(".verineTableEditable").on("click", "td", function (event) {
        event.preventDefault();

        $(this).attr("contenteditable", "true");
        $(this).focus();
    });

    $(".verineTableEditable").on("click", ".verineRowDelete", function (event) {
        var thisId = $(this).attr("id");
        saveSqlIdForDelete(thisId);
    });

    function createTable() {
        //<table class="table table-hover verineTableEditable">
    }

    //function: erstellt eine Tabelle anhand von Spalten und Zeilen
    function createTableDataEdit(columns, values) {
        var newTable = "";//"<table class='table table-hover verineTableEditable'>";
        newTable += "<thead>";
        columns.forEach((column) => {
            newTable += "<th scope='col'>" + column.name + "</th>";
        });
        //add edit column
        newTable += "<th scope='col' style='width:50px;'>edit</th>";

        newTable += "</thead>";

        newTable += "<tbody>";
        values.forEach((value, indexRow) => {
            newTable += "<tr id='row_" + indexRow + "'>";
            value.forEach((element, indexColumn) => {

                if (columns[indexColumn].type.split("|").includes("primary key")) {
                    SQL_ID_COLUMN = indexColumn;
                    newTable += "<th class='sqlID' id='id_" + indexColumn + "_" + indexRow + "'>" + element + "</th>";
                } else {
                    newTable += "<td style='' id='id_" + indexColumn + "_" + indexRow + "'>" + element + "</td>";
                }

            });
            //add edit td
            newTable += "<th><span id='id_" + TABLE_COLUMNS.length + "_" + indexRow + "' class='verineRowDelete'> X </span></th>";
            newTable += "</tr>";
            MAX_ROWS++;
        });

        newTable += "</tbody>";
        //newTable += "</table>";
        return newTable;

    }

    //function: fügt am Ende der Tabelle eine neue Zeile hinzu
    function createNewRow() {
        var newRow = "<tr id='row_" + (MAX_ROWS - 0) + "'>";
        TABLE_COLUMNS.forEach((element, indexColumn) => {
            if (element.type.split("|").includes("primary key")) {
                newRow += "<th class='sqlID' id='id_" + indexColumn + "_" + (MAX_ROWS - 0) + "'>auto</th>";
            } else {
                newRow += "<td style='' id='id_" + indexColumn + "_" + (MAX_ROWS - 0) + "'>dddd</td>";
            }
        });
        //add edit td
        newRow += "<th><span id='id_" + TABLE_COLUMNS.length + "_" + (MAX_ROWS - 0) + "' class='verineRowDelete'> X </span></th>";
        newRow += "</tr>";
        MAX_ROWS++;
        return newRow;
    }

    //function log
    function log(info, tempValue) {
        console.log(info);
        if (tempValue != undefined) console.log("-> " + tempValue);
    }
});