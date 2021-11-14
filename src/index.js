import $ from "jquery";
import he from "he";
import {
    Tab,
    Modal
} from "bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

import "summernote/dist/summernote-lite";
import "summernote/dist/summernote-lite.css";

import initSqlJs from "sql.js";
import {
    VerineDatabase
} from "./VerineDatabase";

import {
    SqlVerineEditor
} from "./SqlVerineEditor"

import "./css/index.css";



/////////////
// GLOBALS //
var CURRENT_EXERCISE_ID = 1;
var NEW_DATABASE_COUNTER = 1;
var MAX_DATABASE_COUNTER = 5;
var CURRENT_VERINE_DATABASE; //aktuell geladene DB
var DATABASE_ARRAY = [];
var CURRENT_DATABASE_INDEX = 0;
var CSS_COLOR_ARRAY = ["coral", "tomato", "orange", "gold", "palegreen", "yellowgreen", "mediumaquamarine", "paleturquoise", "skyblue", "cadetblue", "pink", "hotpink", "orchid", "mediumpurple", "lightvoral"];
//global variables
var MAX_ROWS = 0;
var SQL_ID_COLUMN;

var TABLE_COLUMNS;
var TABLE_VALUES;

var UPDATE_VALUES = []; //[sql_id, Spalte, Wert]
var INSERT_VALUES = []; //[auto, Spalte1, Spalte2, ...]
var DELETE_VALUES = []; //[sql_id, sql_id, ...]

//Wenn etwas geändert wurde, wird beim Verlassen der Website nachgefragt, ob man die Seite wirklich verlassen will.
window.onbeforeunload = function () {    

    if (CURRENT_VERINE_DATABASE != undefined && CURRENT_VERINE_DATABASE.getDataChanged()) {
        return "";
    }
}

//setup SqlVerineEditor
var sqlVerineEditor = new SqlVerineEditor();
sqlVerineEditor.setEditorContainer("sqlVerineEditor");
//sqlVerineEditor.setSchemaContainer("schemaArea");
sqlVerineEditor.setOutputContainer("outputArea");
sqlVerineEditor.activateExercises(false);
sqlVerineEditor.showCodeButton(false);
sqlVerineEditor.addRunFunctionDesktop(() => {
    let tempTables = CURRENT_VERINE_DATABASE.getTableNames();
    updateTableChooser(tempTables[0], tempTables);
});
sqlVerineEditor.showExerciseTable();
sqlVerineEditor.init();

// START: erste Datenbank wird geladen
init(fetch("data/Grundschule.db").then(res => res.arrayBuffer())).then(function (initObject) {
    CURRENT_VERINE_DATABASE = new VerineDatabase("Grundschule.db", initObject, "server");
    DATABASE_ARRAY.push(CURRENT_VERINE_DATABASE);
    CURRENT_DATABASE_INDEX = DATABASE_ARRAY.length - 1;

    //reinit SqlVerineEditor          
    sqlVerineEditor.setVerineDatabase(CURRENT_VERINE_DATABASE);
    sqlVerineEditor.reinit();

    updateDbChooser(DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name);
    let tempTables = CURRENT_VERINE_DATABASE.getTableNames();
    updateTableChooser(tempTables[0], tempTables);
    //sucht nach verine_exercises Tabelle
    handleDatabaseExercises(tempTables);
    handleDatabaseInfo(tempTables);

}, function (error) {
    console.log(error)
});


///////////////////////
// Summernote Editor //

$('#txtExerciseDescription').summernote({
    toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'picture', 'video']],
        ['view', ['codeview']]
    ]
});
$('#txtExerciseTask').summernote({
    toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'picture', 'video']],
        ['view', ['codeview']]
    ]
});
$('#txtExcerciseMeta').summernote({
    toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'picture', 'video']],
        ['view', ['codeview']]
    ]
});
$('#txtInfo').summernote({
    toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'picture', 'video']],
        ['view', ['codeview']]
    ]
});
$('#txtLizenz').summernote({
    toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'picture', 'video']],
        ['view', ['codeview']]
    ]
});
$('#txtFeedback').summernote({
    toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'picture', 'video']],
        ['view', ['codeview']]
    ]
});

// Modals
var modalUniversal = new Modal(document.getElementById('universal-modal-normal'));
var modalUniversalLargeExport = new Modal(document.getElementById('universal-modal-large-export'));
var modalUniversalLarge = new Modal(document.getElementById('universal-modal-large'));

////////////
// EVENTs //

//Button: öffnet ein Modal für das Umbenennen der aktuellen Datenbank.    
$("#btnDbRename").click(function () {
    modalUniversal.show();
    $("#universal-modal-normal .modal-title").html("Datenbank umbenennen");
    $("#universal-modal-normal .modal-body").html("<input type='text' id='inputRenameDatabase' class='form-control input-check' aria-label='' aria-describedby='' value='" + CURRENT_VERINE_DATABASE.name + "'>");
    $("#universal-modal-normal .modal-footer").html('<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">abbrechen</button><button type="button" id="btnRenameAccept" class="btn btn-primary">Änderung speichern</button>');
});
$("#universal-modal-normal").on('click', '#btnRenameAccept', function () {
    CURRENT_VERINE_DATABASE.name = $("#inputRenameDatabase").val();
    updateDbChooser(DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name);
    modalUniversal.hide();
});

//Button: öffnet ein Modal für den Export der Daten der aktuell gewählten Tabelle.
$("#btnExportCsvData").click(function () {
    modalUniversalLargeExport.toggle();
    $("#universal-modal-large-export #modal-title-table").html(CURRENT_VERINE_DATABASE.activeTable);
    let columnTable = "<thead><tr><th>Spalten:</th>";
    CURRENT_VERINE_DATABASE.columns.forEach((column, index) => {
        if (column.type.split("|").includes("PRIMARY KEY")) columnTable += "<td>" + column.name + " (auto)</td>"
        else columnTable += "<td>" + column.name + "</td>"
    });
    columnTable += "</tr></thead>";
    $("#universal-modal-large-export #columnTable").html(columnTable);

    let csvDelimiter = $("#universal-modal-large-export #inputCsvDelimiterExport").val();
    let csvIgnoreColumns = $("#universal-modal-large-export #inputCsvIgnoreColumnsExport").val();
    if (CURRENT_VERINE_DATABASE.values.length > 0) {
        $("#universal-modal-large-export #txtAreaCsvDataExport").val(createCsvForExport(csvDelimiter, csvIgnoreColumns));
    }
});
$("#universal-modal-large-export").on('click', '#btnAktualisieren', function () {
    let csvDelimiter = $("#universal-modal-large-export #inputCsvDelimiterExport").val();
    let csvIgnoreColumns = $("#universal-modal-large-export #inputCsvIgnoreColumnsExport").val();
    if (CURRENT_VERINE_DATABASE.values.length > 0) {
        $("#universal-modal-large-export #txtAreaCsvDataExport").val(createCsvForExport(csvDelimiter, csvIgnoreColumns));
    }

});

//Button: öffnet ein Modal für das Einfügen von CSV Daten in die aktuell gewählte Tabelle.    
$("#btnAddCsvData").click(function () {
    modalUniversalLarge.toggle();
    $("#universal-modal-large #modal-title-table").html(CURRENT_VERINE_DATABASE.activeTable);
    let columnTable = "<thead><tr><th>Spalten:</th>";
    CURRENT_VERINE_DATABASE.columns.forEach((column, index) => {
        if (column.type.split("|").includes("PRIMARY KEY")) columnTable += "<td>" + column.name + " (auto)</td>"
        else columnTable += "<td>" + column.name + "</td>"
    });
    columnTable += "</tr></thead>";
    $("#universal-modal-large #columnTable").html(columnTable);

});
$("#universal-modal-large").on('click', '#btnInsertCSV', function () {
    let csvDelimiter = $("#universal-modal-large #inputCsvDelimiter").val();
    let csvData = $("#universal-modal-large #txtAreaCsvData").val();
    let csvIgnoreColumns = $("#universal-modal-large #inputCsvIgnoreColumns").val();
    CURRENT_VERINE_DATABASE.insertValues = buildCsvInsertQuery(csvData, csvDelimiter, csvIgnoreColumns);
    //persist data
    let chkCsvImportIgnore = $('#chkCsvImportIgnore').is(":checked");
    let errorLogArray = CURRENT_VERINE_DATABASE.runSqlCode(CURRENT_VERINE_DATABASE.createInsertQuery(!chkCsvImportIgnore));
    if (errorLogArray.error != undefined) {
        $("#universal-modal-large #modal-error").html(errorLogArray.error);
    } else {
        $("#universal-modal-large #modal-error").html("");
        //update table view
        CURRENT_VERINE_DATABASE.setLastPaginationPage();
        CURRENT_VERINE_DATABASE.prepareTableData(null);
        $(".verineTableEditable").html(createTableDataEdit(CURRENT_VERINE_DATABASE.columns, CURRENT_VERINE_DATABASE.values));
        //update Übungen > Editieren
        fillExerciseSelect(CURRENT_EXERCISE_ID);
        fillEditViewWithExercise();
        fillPreviewViewWithExercise();
        modalUniversalLarge.hide();
    }
});

// Datenbankdatei wurde zum Upload ausgewählt
$("#fileDbUpload").on('change', function () {
    var uploadedFile = this.files[0];

    var fileReader = new FileReader();
    fileReader.onload = function () {
        init(fileReader.result).then(function (initObject) {

            let uploadedFileName = buildDatabaseName(uploadedFile.name, null);
            let verineDatabase = new VerineDatabase(uploadedFileName, initObject, "local");
            CURRENT_VERINE_DATABASE = verineDatabase;
            DATABASE_ARRAY.push(verineDatabase);
            CURRENT_DATABASE_INDEX = DATABASE_ARRAY.length - 1;

            //reinit SqlVerineEditor          
            sqlVerineEditor.setVerineDatabase(CURRENT_VERINE_DATABASE);
            sqlVerineEditor.reinit();

            updateDbChooser(DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name);
            let tempTables = verineDatabase.getTableNames();
            updateTableChooser(tempTables[0], tempTables);

            //sucht nach verine_exercises Tabelle
            handleDatabaseExercises(tempTables);
            handleDatabaseInfo(tempTables);

        }, function (error) {
            console.log(error)
        });
    }
    fileReader.readAsArrayBuffer(uploadedFile);

});

//Button: lädt die aktuell ausgewählte Datenbank herunter
$(".btnDbDownload").click(function () {
    var binaryArray = CURRENT_VERINE_DATABASE.database.export();

    var blob = new Blob([binaryArray]);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.href = window.URL.createObjectURL(blob);
    a.download = DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name;
    a.onclick = function () {
        setTimeout(function () {
            window.URL.revokeObjectURL(a.href);
        }, 1500);
    };
    a.click();
});

//Button: erstellt eine neue Datenbank anhand der verfügbaren Platzhalterdatenbanken
$(".btnDbNew").click(function () {

    if (NEW_DATABASE_COUNTER <= MAX_DATABASE_COUNTER) {
        init(fetch("data/newDB" + NEW_DATABASE_COUNTER + ".db").then(res => res.arrayBuffer())).then(function (initObject) {
            CURRENT_VERINE_DATABASE = new VerineDatabase("neue_Datenbank_" + NEW_DATABASE_COUNTER + ".db", initObject, "local");
            NEW_DATABASE_COUNTER++;
            DATABASE_ARRAY.push(CURRENT_VERINE_DATABASE);
            CURRENT_DATABASE_INDEX = DATABASE_ARRAY.length - 1;

            //reinit SqlVerineEditor          
            sqlVerineEditor.setVerineDatabase(CURRENT_VERINE_DATABASE);
            sqlVerineEditor.reinit();

            updateDbChooser(DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name);
            let tempTables = CURRENT_VERINE_DATABASE.getTableNames();
            updateTableChooser(tempTables[0], tempTables);

            //sucht nach verine_exercises Tabelle
            handleDatabaseExercises(tempTables);
            handleDatabaseInfo(tempTables);

        }, function (error) {
            console.log(error)
        });

    } else {
        modalUniversal.toggle();
        $("#universal-modal .modal-title").html("neue Datenbank erstellen");
        $("#universal-modal .modal-body").html("<p>Leider ist die maximale Anzahl von Datenbanken erreicht. Es können keine weiteren erstellt werden. Lade Datenbanken herunter, um diese permanent zu speichern.</p>");
        $("#universal-modal .modal-footer").html('<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">OK</button>');
    }

});

//Button: wenn auf die Tabs geklickt wird
$("#nav-tab button").click(function () {
    //save current exercise
    updateExercise();
    updateInfo();
    //set current selected as new exercise id
    fillExerciseSelect(CURRENT_EXERCISE_ID);
    fillEditViewWithExercise();
    fillPreviewViewWithExercise();
    //update edit table view
    if (CURRENT_VERINE_DATABASE.getTableNames().length > 0) {
        CURRENT_VERINE_DATABASE.prepareTableData(null);
        $(".verineTableEditable").html(createTableDataEdit(CURRENT_VERINE_DATABASE.columns, CURRENT_VERINE_DATABASE.values));
    }
});

////////////////////////////////////
//Buttons im Reiter Übungen Editieren

//Button: neue verince_exercise Tabelle erstellen
$("#btnCreateVerineTable").on('click', function () {
    //create verine_exercise table
    CURRENT_VERINE_DATABASE.runSqlCode('CREATE TABLE verine_exercises ("id" INTEGER, "reihenfolge" INTEGER NOT NULL, "titel" TEXT NOT NULL, "beschreibung" TEXT NOT NULL, "aufgabenstellung" TEXT NOT NULL, "informationen" TEXT NOT NULL, "antworten" TEXT NOT NULL, "feedback" TEXT NOT NULL, "geloest" INTEGER NOT NULL,	PRIMARY KEY("id" AUTOINCREMENT));');
    //create verine_info table
    CURRENT_VERINE_DATABASE.runSqlCode('CREATE TABLE verine_info ("id" INTEGER, "autor_name" TEXT, "autor_url" TEXT, "lizenz"	TEXT, "informationen" TEXT, "freie_aufgabenwahl" INTEGER, PRIMARY KEY("id" AUTOINCREMENT));');
    //create verine_info row
    CURRENT_VERINE_DATABASE.runSqlCode('INSERT INTO verine_info ("id", "autor_name", "autor_url", "lizenz", "informationen", "freie_aufgabenwahl") VALUES (1, "", "", "", "", 0);');

    //reinit SqlVerineEditor          
    sqlVerineEditor.reinit();

    let tempTables = CURRENT_VERINE_DATABASE.getTableNames();
    updateTableChooser(tempTables[0], tempTables);
    handleDatabaseExercises(tempTables);
    handleDatabaseInfo(tempTables);
});

//Button: Speichern Info
$("#btnSaveInfo").on("click", function () {
    updateInfo();
});

//Button: Speichern
$("#btnSaveEdit").on("click", function () {
    updateExercise();
    fillExerciseSelect(CURRENT_EXERCISE_ID);
    fillEditViewWithExercise();
    fillPreviewViewWithExercise();
    //update edit table view
    CURRENT_VERINE_DATABASE.prepareTableData(null);
    $(".verineTableEditable").html(createTableDataEdit(CURRENT_VERINE_DATABASE.columns, CURRENT_VERINE_DATABASE.values));
});

//Button: neue Übung
$(".btnNewExercise").on("click", function () {
    createExercise();
    fillExerciseSelect(CURRENT_EXERCISE_ID);
    fillEditViewWithExercise();
    fillPreviewViewWithExercise();
});

//Button: aktuelle Übung löschen
$(".btnDeleteExercise").on("click", function () {
    CURRENT_EXERCISE_ID = CURRENT_VERINE_DATABASE.deleteExercise(CURRENT_EXERCISE_ID);
    if (CURRENT_EXERCISE_ID == undefined) {
        createExercise();
    }
    fillExerciseSelect(CURRENT_EXERCISE_ID);
    fillEditViewWithExercise();
    fillPreviewViewWithExercise();
});

//Select: Übungen werden ausgewählt
$('#selectExercises').change(function () {
    //save current exercise
    updateExercise();
    //set current selected as new exercise id
    CURRENT_EXERCISE_ID = $(this).val();
    fillExerciseSelect(CURRENT_EXERCISE_ID);
    fillEditViewWithExercise();
    fillPreviewViewWithExercise();
    //update edit table view
    CURRENT_VERINE_DATABASE.prepareTableData(null);
    $(".verineTableEditable").html(createTableDataEdit(CURRENT_VERINE_DATABASE.columns, CURRENT_VERINE_DATABASE.values));
    if ($(".tab-pane.active").attr("id") != "nav-preview") {
        let tab = new Tab(document.querySelector('#nav-edit-tab'));
        tab.show();
    }
});

//Button: Übung in der Liste eine Position nach oben schieben
$(".btnMoveExerciseUp").on("click", function () {
    CURRENT_VERINE_DATABASE.reorderExercises(CURRENT_EXERCISE_ID, "up");
    fillExerciseSelect(CURRENT_EXERCISE_ID);
});

//Button: Übung in der Liste eine Position nach unten schieben
$(".btnMoveExerciseDown").on("click", function () {
    CURRENT_VERINE_DATABASE.reorderExercises(CURRENT_EXERCISE_ID, "down");
    fillExerciseSelect(CURRENT_EXERCISE_ID);
});


////////////////////////////////////
//Buttons im Reiter Daten bearbeiten

// Select: Tabelle wird ausgewählt
$('#selTableChooser').on('change', function () {
    CURRENT_VERINE_DATABASE.setCurrentPagination(0);
    CURRENT_VERINE_DATABASE.prepareTableData(this.value);
    $(".verineTableEditable").html(createTableDataEdit(CURRENT_VERINE_DATABASE.columns, CURRENT_VERINE_DATABASE.values));
    let tab = new Tab(document.querySelector('#nav-tableEdit-tab'));
    tab.show();
});

//Button: fügt am Ende der Tabelle eine neue Zeile ein
$("#btnAddRow").on("click", function () {
    //Neue Zeile soll an letzer Pagination Seite hinzugefügt werden
    CURRENT_VERINE_DATABASE.setLastPaginationPage();
    CURRENT_VERINE_DATABASE.prepareTableData(null);
    $(".verineTableEditable").html(createTableDataEdit(CURRENT_VERINE_DATABASE.columns, CURRENT_VERINE_DATABASE.values));
    //Neue Zeile wird appended
    $(".verineTableEditable tbody").append(createNewRow());
    var maxHeight = $(".verineTableEditableViewport").get(0).scrollHeight;
    $(".verineTableEditableViewport").scrollTop(maxHeight);

});


//Button: speichert die Daten
$("#btnSaveData").on("click", function () {
    CURRENT_VERINE_DATABASE.updateValues = checkForUpdates();
    CURRENT_VERINE_DATABASE.insertValues = checkForInserts();
    //persist data
    if (CURRENT_VERINE_DATABASE.persist().length > 0) {
        console.log("error persist");
    } else {
        //update table view
        CURRENT_VERINE_DATABASE.setLastPaginationPage();
        CURRENT_VERINE_DATABASE.prepareTableData(null);
        $(".verineTableEditable").html(createTableDataEdit(CURRENT_VERINE_DATABASE.columns, CURRENT_VERINE_DATABASE.values));
        //update Übungen > Editieren
        fillExerciseSelect(CURRENT_EXERCISE_ID);
        fillEditViewWithExercise();
        fillPreviewViewWithExercise();
        fillInfoViewWithInfo();
    }
});

//Event: onfocuslost input Pagination
$(".inputPagination").on("focusout", function (event) {
    let inputPaginationValue = $('.inputPagination').val();
    if(isNaN(inputPaginationValue) || inputPaginationValue == ""){
        inputPaginationValue = 200;
        $('.inputPagination').val(inputPaginationValue);
    } 

    let inputPaginationMax = parseInt(inputPaginationValue);
    if (CURRENT_VERINE_DATABASE.getMaxLimit() != inputPaginationMax) {
        if(inputPaginationMax > 10000) {
            inputPaginationMax = 10000;
            $('.inputPagination').val(inputPaginationMax);
        }
        CURRENT_VERINE_DATABASE.setMaxLimit(inputPaginationMax);
        CURRENT_VERINE_DATABASE.setCurrentPagination(0);

        CURRENT_VERINE_DATABASE.prepareTableData(null);
        $(".verineTableEditable").html(createTableDataEdit(CURRENT_VERINE_DATABASE.columns, CURRENT_VERINE_DATABASE.values));

    }
});

//Event: wenn eine Zelle der Tabelle angeklickt wird, wird diese editierbar gemacht
$(".verineTableEditable").on("click", "td", function (event) {
    event.preventDefault();
    $(this).attr("contenteditable", "true");
    $(this).focus();
});

//Event: wenn das X in einer Zeile angeklickt wird, wird diese entfernt
$(".verineTableEditable").on("click", ".verineRowDelete", function (event) {
    var thisId = $(this).attr("id");
    CURRENT_VERINE_DATABASE.deleteValues = checkForDeletes(thisId);
});

//Event: gibt die ID des angeklickten TD aus
/*$(".verineTableEditable").on("input", "tbody td", function () {
    console.log($(this).attr("id"));

});*/

//Button: Pagination
$('#nav-tableEdit').on('click', '.btnPaginationRight', function (event) {
    CURRENT_VERINE_DATABASE.setCurrentPagination(CURRENT_VERINE_DATABASE.getCurrentPagination() + 1);
    //persist data
    CURRENT_VERINE_DATABASE.updateValues = checkForUpdates();
    CURRENT_VERINE_DATABASE.insertValues = checkForInserts();
    if (CURRENT_VERINE_DATABASE.persist().length > 0) {
        console.log("error persist");
    } else {
        CURRENT_VERINE_DATABASE.prepareTableData(null);
        $(".verineTableEditable").html(createTableDataEdit(CURRENT_VERINE_DATABASE.columns, CURRENT_VERINE_DATABASE.values));
    }
});
$('#nav-tableEdit').on('click', '.btnPaginationLeft', function (event) {
    CURRENT_VERINE_DATABASE.setCurrentPagination(CURRENT_VERINE_DATABASE.getCurrentPagination() - 1);
    //persist data
    CURRENT_VERINE_DATABASE.updateValues = checkForUpdates();
    CURRENT_VERINE_DATABASE.insertValues = checkForInserts();
    if (CURRENT_VERINE_DATABASE.persist().length > 0) {
        console.log("error persist");
    } else {
        CURRENT_VERINE_DATABASE.prepareTableData(null);
        $(".verineTableEditable").html(createTableDataEdit(CURRENT_VERINE_DATABASE.columns, CURRENT_VERINE_DATABASE.values));
    }
});

//////////////////////////////////////
//Buttons im Reiter Datenbank Struktur

//Button: Führt SQL Code auf der ausgewählten Datenbank aus
$("#btnDirectSql").on("click", function () {
    let sqlCode = $("#txtDirectSql").val();
    let result = CURRENT_VERINE_DATABASE.runSqlCode(sqlCode);
    if (result.error == undefined) {
        let tempTables = CURRENT_VERINE_DATABASE.getTableNames();
        updateTableChooser(tempTables[0], tempTables);
        if (result.query != undefined) {
            $("#divQueryResult").show();
            $("#txtQueryResult").hide();
            $("#divQueryResult").html(createTableSql(result.query.columns, result.query.values));
        } else {
            $("#divQueryResult").hide();
            $("#txtQueryResult").show();
            $("#txtQueryResult").val("SQL Befehl erfolgreich ausgeführt: \n" + sqlCode);
            //check if verine_exercise table was deleted
            handleDatabaseExercises(tempTables);
            handleDatabaseInfo(tempTables);
        }
    } else {
        $("#divQueryResult").hide();
        $("#txtQueryResult").show();
        $("#txtQueryResult").val(result.error);
    }
});



///////////////
// FUNCTIONs //

//function: Datenbank wird geladen
async function init(dataPromise) {
    //fetch Database
    const sqlPromise = initSqlJs({
        locateFile: file => `${file}`
    });
    const [sql, bufferedDatabase] = await Promise.all([sqlPromise, dataPromise]);

    return new sql.Database(new Uint8Array(bufferedDatabase));
}

//function: Erstellt aus den Daten der Tabelle und einem Delimiter csv Daten für den Export
function createCsvForExport(csvDelimiter, csvIgnoreColumns) {
    if (csvDelimiter == "\\t") csvDelimiter = "\t";
    let csvExportData = "";
    CURRENT_VERINE_DATABASE.values.forEach(valueRow => {
        let csvExportLine = "";
        valueRow.forEach((value, index) => {
            if (!csvIgnoreColumns.split(",").includes(String(index + 1))) {
                if (csvExportLine == "") csvExportLine += value;
                else {
                    csvExportLine += csvDelimiter + value;
                }
            }
        });
        csvExportLine += "\n";
        csvExportData += csvExportLine;
    });
    return csvExportData;
}

//function: baut aus CSV Daten eines Textfeldes einen Insert Query
function buildCsvInsertQuery(csvData, csvDelimiter, csvIgnoreColumns) {
    let regexCsvDelimiter = new RegExp(csvDelimiter, "g");
    let csvIgnoreColumnsArray = csvIgnoreColumns.replaceAll(/\s/g, "").split(",");
    let insertValues = [];
    let csvDataArray = csvData.split("\n");
    csvDataArray.forEach(csvLine => {
        if (csvLine.replaceAll(/\s/g, "") != "") {
            if (csvDelimiter != ",") {
                csvLine = csvLine.replaceAll(",", "."); //ersetzt alle , mit .
            }
            csvLine = csvLine.replaceAll(/["']/g, ""); //ersetzt alle "' mit nichts
            csvLine = csvLine.replaceAll(/[|,;]$/g, ""); //ersetzt alle |,; am Ende der Zeile mit nichts
            let csvLineValues = csvLine.split(regexCsvDelimiter);
            let tempInsertArray = [];
            csvLineValues.forEach((value, index) => {
                if (!csvIgnoreColumnsArray.includes(String(index + 1))) {
                    tempInsertArray.push(value);
                }
            })
            insertValues.push(tempInsertArray);
        }
    });
    return insertValues;
}

//function: aktualisiert eine Übung
function updateExercise() {
    var currentExercise = CURRENT_VERINE_DATABASE.getExerciseById(CURRENT_EXERCISE_ID);
    if (!$.isEmptyObject(currentExercise)) {

        let exerciseUpdateArray = [];
        if (currentExercise.titel != $("#txtTitle").val()) exerciseUpdateArray.push([CURRENT_EXERCISE_ID, "titel", $("#txtTitle").val()]);
        if (currentExercise.beschreibung != $('#txtExerciseDescription').summernote('code')) exerciseUpdateArray.push([CURRENT_EXERCISE_ID, "beschreibung", $('#txtExerciseDescription').summernote('code')]);
        if (currentExercise.aufgabenstellung != $('#txtExerciseTask').summernote('code')) exerciseUpdateArray.push([CURRENT_EXERCISE_ID, "aufgabenstellung", $('#txtExerciseTask').summernote('code')]);
        if (currentExercise.informationen != $('#txtExcerciseMeta').summernote('code')) exerciseUpdateArray.push([CURRENT_EXERCISE_ID, "informationen", $('#txtExcerciseMeta').summernote('code')]);
        if (currentExercise.antworten != $("#txtAnswers").val()) exerciseUpdateArray.push([CURRENT_EXERCISE_ID, "antworten", $("#txtAnswers").val()]);
        if (currentExercise.feedback != $('#txtFeedback').summernote('code')) exerciseUpdateArray.push([CURRENT_EXERCISE_ID, "feedback", $('#txtFeedback').summernote('code')]);
        //gibt es Änderungen?
        if (exerciseUpdateArray.length > 0) {
            CURRENT_VERINE_DATABASE.updateExercise(exerciseUpdateArray);
        }

    }
}

//function: aktualisiert die meta informationen
function updateInfo() {
    var currentInfo = CURRENT_VERINE_DATABASE.getInfo();

    if (!$.isEmptyObject(currentInfo)) {

        let infoUpdateArray = [];
        if (currentInfo.autor_name != $("#txtAuthor").val()) infoUpdateArray.push(["autor_name", $("#txtAuthor").val()]);
        if (currentInfo.autor_url != $('#txtAuthorUrl').val()) infoUpdateArray.push(["autor_url", $('#txtAuthorUrl').val()]);
        if (currentInfo.lizenz != $('#txtLizenz').summernote('code')) infoUpdateArray.push(["lizenz", $('#txtLizenz').summernote('code')]);
        if (currentInfo.informationen != $('#txtInfo').summernote('code')) infoUpdateArray.push(["informationen", $('#txtInfo').summernote('code')]);
        if (document.getElementById('radioAufgabeFrei').checked) {
            infoUpdateArray.push(["freie_aufgabenwahl", 1]);
        } else {
            infoUpdateArray.push(["freie_aufgabenwahl", 0]);
        }


        //gibt es Änderungen?
        if (infoUpdateArray.length > 0) {
            CURRENT_VERINE_DATABASE.updateInfo(infoUpdateArray);
        }

    }
}

//function: erstellt ein neues Übungs Objekt mit ID und Standardnamen
function createExercise() {
    var newExercise = {};
    if (CURRENT_EXERCISE_ID != undefined) {
        newExercise.reihenfolge = CURRENT_VERINE_DATABASE.getNewExerciseOrderAfterId(CURRENT_EXERCISE_ID);
    } else newExercise.reihenfolge = 1;
    newExercise.titel = "neue Aufgabe";
    newExercise.beschreibung = "";
    newExercise.aufgabenstellung = "";
    newExercise.informationen = "";
    newExercise.antworten = "";
    newExercise.feedback = "";
    newExercise.geloest = 0;
    CURRENT_EXERCISE_ID = CURRENT_VERINE_DATABASE.addExercise(newExercise, CURRENT_EXERCISE_ID);
}



//function: Befüllt die Textfelder im #nav-edit mit den Inhalten einer Übung
function fillEditViewWithExercise() {
    if (CURRENT_EXERCISE_ID != undefined) {
        let currentExercise = CURRENT_VERINE_DATABASE.getExerciseById(CURRENT_EXERCISE_ID);
        if (!$.isEmptyObject(currentExercise)) {
            $("#nav-edit #txtTitle").val(currentExercise.titel);
            $('#txtExerciseDescription').summernote('code', currentExercise.beschreibung);
            $('#txtExerciseTask').summernote('code', currentExercise.aufgabenstellung);
            $('#txtExcerciseMeta').summernote('code', currentExercise.informationen);
            $('#txtFeedback').summernote('code', currentExercise.feedback);
            $("#nav-edit #txtAnswers").val(currentExercise.antworten);
        }
    } else {
        resetExerciseView();
    }
}

function resetExerciseView() {
    $("#nav-edit #txtTitle").val("");
    $('#txtExerciseDescription').summernote('code', "");
    $('#txtExerciseTask').summernote('code', "");
    $('#txtExcerciseMeta').summernote('code', "");
    $('#txtFeedback').summernote('code', "");
    $("#nav-edit #txtAnswers").val("");
}

function resetExercisePreviewView() {
    $("#nav-preview .exercise-title").html("");
    $("#nav-preview .exercise-description").html("");
    $("#nav-preview .exercise-task").html("");
    $("#nav-preview #exercise-feedback").html("");
    $("#exercise-meta").html("");
    $("#nav-preview #preview-antworten").html("");
}

//function: Befüllt die Textfelder im #nav-preview mit den Inhalten einer Übung
function fillPreviewViewWithExercise() {
    if (CURRENT_EXERCISE_ID != undefined) {
        let currentExercise = CURRENT_VERINE_DATABASE.getExerciseById(CURRENT_EXERCISE_ID);
        if (!$.isEmptyObject(currentExercise)) {
            $("#nav-preview .exercise-title").html(currentExercise.titel);
            $("#nav-preview .exercise-description").html(currentExercise.beschreibung);
            $("#nav-preview .exercise-task").html(currentExercise.aufgabenstellung);
            $("#nav-preview #exercise-feedback").html(currentExercise.feedback);

            //Informationen werden ausgeblendet, wenn kein Inhalt vorhanden ist
            if (removeEmptyTags(currentExercise.informationen) != "") {

                $("#exercise-meta").html(currentExercise.informationen);
            }

            //zeigt Antworten der Übung geparst an:
            let exerciseAnswer = "";
            exerciseAnswer += "Anzahl Lösungszeilen: " + currentExercise.answerObject.rows + "<br>";
            if (currentExercise.answerObject.input) exerciseAnswer += "Inputfeld <br>";
            currentExercise.answerObject.exerciseSolutionArray.forEach(solution => {
                exerciseAnswer += "<br>";
                exerciseAnswer += "Antwort: " + solution.loesungString + "<br>";;
                if (solution.table != undefined) exerciseAnswer += "Tabelle: " + solution.table + "<br>";;
                if (solution.column != undefined) exerciseAnswer += "Spalte: " + solution.column + "<br>";;
            });
            $("#nav-preview #preview-antworten").html(exerciseAnswer);
        }
    } else {
        resetExercisePreviewView();
    }
}

function removeEmptyTags(stringToTest) {
    return stringToTest.replaceAll(/[<p>|<br>|</p>|\s]/g, "");
}

//function: Erstellt eine Tabelle mit den Resultaten einer SQL Abfrage
function createTableSql(columns, values) {
    var newTable = "<div class='table-responsive'><table class='table table-bordered tableSql' style=''>";
    newTable += "<thead>";
    columns.forEach((column) => {
        newTable += "<th scope='col'>" + column + "</th>";
    });
    newTable += "</thead>";
    newTable += "<tbody>";
    values.forEach((value) => {
        newTable += "<tr>";
        value.forEach((element) => {
            newTable += "<td style=''>" + element + "</td>";
        });
        newTable += "</tr>";
    });
    newTable += "</tbody>";
    newTable += "</table></div>"
    return newTable;
}

//function: Befüllt das <select> Element mit den verfügbaren Übungen
function fillExerciseSelect(selectedId) {
    $("#selectExercises").html("");
    CURRENT_VERINE_DATABASE.getExerciseOrder().forEach(order => {
        CURRENT_VERINE_DATABASE.getExercises().forEach(exercise => {
            if (order[1] == exercise[0]) {
                $("#selectExercises").append(new Option(exercise[2], exercise[0]));
            }
        });
    });
    if (selectedId != undefined) $("#selectExercises").val(selectedId);
}

// function: testet ob es beim Upload eine Datenbank mit dem gleichen Namen gibt, wenn ja, dann wird ein Appendix hinzugefügt
function buildDatabaseName(name, appendix) {
    var found = false;
    if (appendix != null) {
        var nameArray = name.split(".");
        var fileEnding = nameArray[nameArray.length - 1];
        if (appendix == 1) {
            name = name.replace("." + fileEnding, "_" + appendix + "." + fileEnding);
        } else {
            name = name.replace("_" + (appendix - 1) + "." + fileEnding, "_" + appendix + "." + fileEnding);
        }
    }
    DATABASE_ARRAY.forEach(element => {
        if (element.name == name) {
            if (appendix == null) {
                appendix = 1;
            } else {
                appendix++;
            }
            found = true;
        }
    });
    if (found) {
        return buildDatabaseName(name, appendix);
    } else {
        return name;
    }
}

//function: aktualisiert das #selDbChooser select Feld
function updateDbChooser(selected) {
    $("#selDbChooser").html("");
    DATABASE_ARRAY.forEach(element => {
        $("#selDbChooser").append(new Option(element.name, element.name));
    });
    if (selected != null) $("#selDbChooser").val(selected);
}

//function: Zeigt im Editieren Tab die Information an, dass keine verine_exercises Tabelle gefunden wurde + Button, um diese Tabelle zu erzeugen.
function displayNoVerineExercise() {
    $("#selectExercises").html("");
    $("#nav-edit .yes-exercise").hide();
    $("#nav-preview-tab").hide();
    $("#nav-edit-tab").hide();
    $("#nav-info .yes-info").hide();
    $("#nav-info .no-info").show();
    $("#nav-info .no-info #no-info").html("Die aktuell gewählte Datenbank hat keine SQLverine Aufgabentabelle und keine SQLverine Infotabelle.");
    let tab = new Tab(document.querySelector('#nav-info-tab'));
    tab.show();
}

//function: Befüllt das Info Tab
function handleDatabaseInfo(tempTables) {

    if (tempTables.includes("verine_info")) {
        let dbInfo;
        try {
            if (CURRENT_VERINE_DATABASE.getInfo().length > 0) {

                dbInfo = CURRENT_VERINE_DATABASE.getInfo();
            } else {
                CURRENT_VERINE_DATABASE.runSqlCode('INSERT INTO verine_info ("id", "autor_name", "autor_url", "lizenz", "informationen") VALUES (1, "", "", "", "");');
                dbInfo = CURRENT_VERINE_DATABASE.getInfo();
            }

            $("#nav-info .yes-info").show();
            $("#nav-info .no-info").hide();

            fillInfoViewWithInfo();

        } catch (err) {
            console.log(err);
        }
    } else {
        displayNoVerineExercise();
    }
}
//function: Befüllt die Textfelder im #nav-edit mit den Inhalten einer Übung
function fillInfoViewWithInfo() {
    let dbInfo = CURRENT_VERINE_DATABASE.getInfo();

    if (!$.isEmptyObject(dbInfo)) {
        $("#txtAuthor").val(dbInfo.autor_name);
        $('#txtAuthorUrl').val(dbInfo.autor_url);
        $('#txtLizenz').summernote('code', dbInfo.lizenz);
        $('#txtInfo').summernote('code', dbInfo.informationen);
        if (dbInfo.freie_aufgabenwahl == 1)
            document.getElementById('radioAufgabeFrei').checked = true;
        else
            document.getElementById('radioAufgabeNichtFrei').checked = true;
    }
}

//function: Befüllt die Tabs, Aufgabenauswahl... wenn verine exercises vorhanden sind.
function handleDatabaseExercises(tempTables) {

    if (tempTables.includes("verine_exercises")) {
        try {
            if (CURRENT_VERINE_DATABASE.getExercises().length > 0) {

                CURRENT_EXERCISE_ID = CURRENT_VERINE_DATABASE.getExercises()[0][0];
            } else {
                CURRENT_EXERCISE_ID = undefined;
                //createExercise();
            }
            $("#nav-edit-tab").show();
            $("#nav-edit .yes-exercise").show();
            $("#nav-preview-tab").show();
            $("#nav-edit .no-exercise").hide();
            fillExerciseSelect(CURRENT_EXERCISE_ID);
            fillEditViewWithExercise();
            fillPreviewViewWithExercise();
        } catch (err) {
            console.log(err);
        }
    } else {
        displayNoVerineExercise();
    }
}

//Select: Wenn eine Datenbank im <select> ausgewählt wurde
$('#selDbChooser').on('change', function () {
    CURRENT_DATABASE_INDEX = getIndexOfDatabaseobject(this.value);

    // 1) Datenbank exisitiert und wurde bereits eingelesen
    if (CURRENT_DATABASE_INDEX != null && DATABASE_ARRAY[CURRENT_DATABASE_INDEX] != null) {
        CURRENT_VERINE_DATABASE = DATABASE_ARRAY[CURRENT_DATABASE_INDEX];

        //reinit SqlVerineEditor          
        sqlVerineEditor.setVerineDatabase(CURRENT_VERINE_DATABASE);
        sqlVerineEditor.reinit();

        let tempTables = CURRENT_VERINE_DATABASE.getTableNames();
        updateTableChooser(tempTables[0], tempTables);
        //sucht nach verine_exercises Tabelle
        handleDatabaseExercises(tempTables);
        handleDatabaseInfo(tempTables);
    }
});

// function: liefert den Index eines Datenbankobjekts aus dem DATABASE_ARRAY anhand des Namens zurück
function getIndexOfDatabaseobject(databaseName) {
    var indexOfDatabaseobject = null;
    DATABASE_ARRAY.forEach((element, index) => {
        if (element.name == databaseName) {
            indexOfDatabaseobject = index;
        }
    });
    return indexOfDatabaseobject;
}

//function: aktualisiert das #selTableChooser select Feld
function updateTableChooser(selected, tables) {
    $("#selTableChooser").html("");
    tables.forEach(element => {
        $("#selTableChooser").append(new Option(element, element));
    });
    if (selected != null && tables.length > 0) {
        $("#selTableChooser").val(selected);
        try {
            CURRENT_VERINE_DATABASE.prepareTableData(selected);
            $(".verineTableEditable").html(createTableDataEdit(CURRENT_VERINE_DATABASE.columns, CURRENT_VERINE_DATABASE.values));
        } catch (err) {
            $(".verineTableEditable").html("");
            console.log(err);
        }
    } else {
        $(".verineTableEditable").html("");
    }
}


///////////////
// FUNCTIONS //

//function: erstellt eine Tabelle anhand von Spalten und Zeilen
function createTableDataEdit(columns, values) {

    TABLE_COLUMNS = columns;
    TABLE_VALUES = values;

    let paginationRight = false;
    let paginationLeft = false;

    //wenn Testelement die maximale Anzahl der angezeigten Einträge übersteigt, wird es entfernt
    if (values.length > CURRENT_VERINE_DATABASE.getMaxLimit()) {
        values.pop();
        paginationRight = true;        
    }
    if (CURRENT_VERINE_DATABASE.getCurrentPagination() > 0) {
        paginationLeft = true;
    }

    var newTable = "<table class='table table-hover verineTableEditable'>";
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
            if (columns[indexColumn].type.split("|").includes("PRIMARY KEY")) {
                SQL_ID_COLUMN = indexColumn;

                newTable += "<th class='sqlID' id='id_" + indexColumn + "_" + indexRow + "'>" + he.encode(String(element)) + "</th>";
            } else {
                newTable += "<td style='' id='id_" + indexColumn + "_" + indexRow + "'>" + he.encode(String(element)) + "</td>";
            }

        });
        //add edit td
        newTable += "<th><span id='id_" + TABLE_COLUMNS.length + "_" + indexRow + "' class='verineRowDelete'> X </span></th>";
        newTable += "</tr>";
        MAX_ROWS++;
    });

    newTable += "</tbody></table>";

    //Pagination Schaltflächen und inputPagination aktualisieren
    $('.inputPagination').val(CURRENT_VERINE_DATABASE.getMaxLimit());
    if (paginationRight) {
        document.getElementsByClassName("btnPaginationRight")[0].parentElement.classList.remove("disabled");
    }else{
        document.getElementsByClassName("btnPaginationRight")[0].parentElement.classList.add("disabled");
    }
    if (paginationLeft) {
        document.getElementsByClassName("btnPaginationLeft")[0].parentElement.classList.remove("disabled");
    }else{
        document.getElementsByClassName("btnPaginationLeft")[0].parentElement.classList.add("disabled");
    }   

    return newTable;

}


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
                    if ($("#id_" + i + "_" + tempRow).text() != he.encode(String(element[i]))) {
                        var rowCellValue = he.decode(String($("#id_" + i + "_" + tempRow).text().replaceAll('"', "'")));
                        element[i] = rowCellValue;
                        var columnName = TABLE_COLUMNS[i].name;
                        var rowIdValueArray = [sqlIdOfRow, columnName, rowCellValue];
                        UPDATE_VALUES.push(rowIdValueArray);
                    }
                }
            }
        });

    });
    return UPDATE_VALUES;
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
    return INSERT_VALUES;
}

//function: speichert die sql_ids von gelöschten Zeilen
function checkForDeletes(tempId) {
    var sqlIdToDelete = getSqlIdofRow(tempId);
    var tempRow = getRowFromId(tempId);
    if (!isNaN(sqlIdToDelete)) {
        DELETE_VALUES.push(parseInt(sqlIdToDelete));
    }
    //delete table row
    $("#row_" + tempRow).remove();
    return DELETE_VALUES;
}

function getSqlIdofRow(tempId) {
    var tempRow = getRowFromId(tempId);
    return $("#id_" + SQL_ID_COLUMN + "_" + tempRow).text();
}

function getColumnFromId(tempId) {
    return tempId.match(/(id_)(\d+)_(\d+)/)[2];
}

function getRowFromId(tempId) {
    return tempId.match(/(id_)(\d+)_(\d+)/)[3];
}



//function: fügt am Ende der Tabelle eine neue Zeile hinzu
function createNewRow() {
    var newRow = "<tr id='row_" + (MAX_ROWS - 0) + "'>";
    TABLE_COLUMNS.forEach((element, indexColumn) => {
        if (element.type.split("|").includes("PRIMARY KEY")) {

            newRow += "<th class='sqlID' id='id_" + indexColumn + "_" + (MAX_ROWS - 0) + "'>auto</th>";
        } else {
            newRow += "<td style='' id='id_" + indexColumn + "_" + (MAX_ROWS - 0) + "' contenteditable='true'></td>";
        }
    });
    //add edit td
    newRow += "<th><span id='id_" + TABLE_COLUMNS.length + "_" + (MAX_ROWS - 0) + "' class='verineRowDelete'> X </span></th>";
    newRow += "</tr>";
    MAX_ROWS++;
    return newRow;
}