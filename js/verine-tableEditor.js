$(document).ready(function () {

    //global variables
    var NR = 0;
    var CURRENT_ROW_ID = 1;

    /*var tableCellObject1 = {
        rowType : "header",
        columnType : "integer",
        value : 1
    }


    var CURRENT_SQL_TABLE_DATA = [
        [0, tableCellObject1],
        [1, tableCellObject2],
        [2, tableCellObject3],
        [3, tableCellObject4]
    ];*/

    //Button: fügt am Ende der Tabelle eine neue Zeile ein
    $("#btnAddRow").on("click", function () {
        $(".verineTableEditable tbody").append(createNewRow());
    });

    //Event: wenn eine Zelle der Tabelle angeklickt wird, wird diese editierbar gemacht
    $(".verineTableEditable td").on("click", function (event) {
        event.preventDefault();

        $(this).attr("contenteditable", "true");
        $(this).focus();
    });

    function createNewRow() {

    }

    //function log
    function log(info, tempValue) {
        console.log(info);
        if (tempValue != undefined) console.log("-> " + tempValue);
    }
});