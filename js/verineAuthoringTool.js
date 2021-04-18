$(document).ready(function() {

    /////////////
    // GLOBALS //
    var CURRENT_EXERCISE_ID = 1;
    var EXERCISE_ARRAY = [];

    var CURRENT_VERINE_DATABASE; //aktuell geladene DB
    var DATABASE_ARRAY = [];
    var CURRENT_DATABASE_INDEX = 0;
    var CSS_COLOR_ARRAY = ["coral", "tomato", "orange", "gold", "palegreen", "yellowgreen", "mediumaquamarine", "paleturquoise", "skyblue", "cadetblue", "pink", "hotpink", "orchid", "mediumpurple", "lightvoral"];

    // START: erste Datenbank wird geladen
    init(fetch("data/Grundschule.db").then(res => res.arrayBuffer())).then(function(initObject) {

        CURRENT_VERINE_DATABASE = new VerineDatabase("Grundschule.db", initObject, "server");
        DATABASE_ARRAY.push(CURRENT_VERINE_DATABASE);
        CURRENT_DATABASE_INDEX = DATABASE_ARRAY.length - 1;

        updateDbChooser(DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name);
        let tempTables = CURRENT_VERINE_DATABASE.getTables();
        updateTableChooser(tempTables[0], tempTables);

        //sucht nach verine_exercises Tabelle
        if (tempTables.includes("verine_exercises")) {
            try {
                CURRENT_EXERCISE_ID = CURRENT_VERINE_DATABASE.getExercises()[0][0];
                fillExerciseSelect(CURRENT_EXERCISE_ID);
                fillAuthoringToolWithExercise();
            } catch (err) {
                console.log(err);
            }
        } else {
            console.log("not found")
        }

    }, function(error) { console.log(error) });


    ////////////
    // Quill //

    var quillExerciseDescription = new Quill('#txtExerciseDescription', {

        theme: 'snow'
    });


    var quillExcerciseMeta = new Quill('#txtExcerciseMeta', {

        theme: 'snow'
    });

    var quillFeedback = new Quill('#txtFeedback', {

        theme: 'snow'
    });
    ////////////
    // EVENTs //

    // Datenbankdatei wurde zum Upload ausgewählt
    $("#fileDbUpload").on('change', function() {
        var uploadedFile = this.files[0];

        var fileReader = new FileReader();
        fileReader.onload = function() {
            init(fileReader.result).then(function(initObject) {


                let uploadedFileName = buildDatabaseName(uploadedFile.name, null);
                let verineDatabase = new VerineDatabase(uploadedFileName, initObject, "local");
                CURRENT_VERINE_DATABASE = verineDatabase;
                DATABASE_ARRAY.push(verineDatabase);
                CURRENT_DATABASE_INDEX = DATABASE_ARRAY.length - 1;

                updateDbChooser(DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name);
                let tempTables = verineDatabase.getTables();
                updateTableChooser(tempTables[0], tempTables);

            }, function(error) { console.log(error) });
        }
        fileReader.readAsArrayBuffer(uploadedFile);

    });

    //Button: lädt die aktuell ausgewählte Datenbank herunter
    $(".btnDbDownload").click(function() {
        var binaryArray = CURRENT_VERINE_DATABASE.database.export();

        var blob = new Blob([binaryArray]);
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.href = window.URL.createObjectURL(blob);
        a.download = DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name;
        a.onclick = function() {
            setTimeout(function() {
                window.URL.revokeObjectURL(a.href);
            }, 1500);
        };
        a.click();
    });

    ////////////////////////////////////
    //Buttons im Reiter Übungen Editieren

    //Button: Speichern
    $(".btnSave").on("click", function() {
        updateExercise();
        fillExerciseSelect(CURRENT_EXERCISE_ID);
        fillAuthoringToolWithExercise();
    });

    //Button: neue Übung
    $(".btnNewExercise").on("click", function() {
        createExercise();
        fillExerciseSelect(CURRENT_EXERCISE_ID);
        fillAuthoringToolWithExercise();
    });

    //Button: aktuelle Übung löschen
    $(".btnDeleteExercise").on("click", function() {
        CURRENT_EXERCISE_ID = CURRENT_VERINE_DATABASE.deleteExercise(CURRENT_EXERCISE_ID);
        if (CURRENT_EXERCISE_ID == undefined) {
            createExercise();
        }
        fillExerciseSelect(CURRENT_EXERCISE_ID);
        fillAuthoringToolWithExercise();
    });

    //Select: Übungen werden ausgewählt
    $('#selectExercises').change(function() {
        CURRENT_EXERCISE_ID = $(this).val();
        fillAuthoringToolWithExercise();
    });

    //Button: Übung in der Liste eine Position nach oben schieben
    $(".btnMoveExerciseUp").on("click", function() {
        CURRENT_VERINE_DATABASE.reorderExercises(CURRENT_EXERCISE_ID, "up");
        fillExerciseSelect(CURRENT_EXERCISE_ID);
    });

    //Button: Übung in der Liste eine Position nach unten schieben
    $(".btnMoveExerciseDown").on("click", function() {
        CURRENT_VERINE_DATABASE.reorderExercises(CURRENT_EXERCISE_ID, "down");
        fillExerciseSelect(CURRENT_EXERCISE_ID);
    });

    // Select: Tabelle wird ausgewählt
    $('#selTableChooser').on('change', function() {
        CURRENT_VERINE_DATABASE.prepareTableData(this.value);
        $(".verineTableEditable").html(createTableDataEdit(CURRENT_VERINE_DATABASE.columns, CURRENT_VERINE_DATABASE.values));
    });

    ////////////////////////////////////
    //Buttons im Reiter Daten bearbeiten

    //Button: fügt am Ende der Tabelle eine neue Zeile ein
    $("#btnAddRow").on("click", function() {
        $(".verineTableEditable tbody").append(createNewRow());
    });

    //Button: speichert die Daten
    $("#btnSaveData").on("click", function() {
        CURRENT_VERINE_DATABASE.updateValues = checkForUpdates();
        CURRENT_VERINE_DATABASE.insertValues = checkForInserts();
        //persist data
        if (CURRENT_VERINE_DATABASE.persist().length > 0) {
            console.log("error persist");
        } else {
            //update table view
            CURRENT_VERINE_DATABASE.prepareTableData(null);
            $(".verineTableEditable").html(createTableDataEdit(CURRENT_VERINE_DATABASE.columns, CURRENT_VERINE_DATABASE.values));
        }
    });

    //Event: wenn eine Zelle der Tabelle angeklickt wird, wird diese editierbar gemacht
    $(".verineTableEditable").on("click", "td", function(event) {
        event.preventDefault();

        $(this).attr("contenteditable", "true");
        $(this).focus();
    });

    //Event: wenn das X in einer Zeile angeklickt wird, wird diese entfernt
    $(".verineTableEditable").on("click", ".verineRowDelete", function(event) {
        var thisId = $(this).attr("id");
        CURRENT_VERINE_DATABASE.deleteValues = checkForDeletes(thisId);
    });

    //Event: gibt die ID des angeklickten TD aus
    $(".verineTableEditable").on("input", "tbody td", function() {
        console.log($(this).attr("id"));

    });

    //////////////////////////////////////
    //Buttons im Reiter Datenbank Struktur

    //Button: Führt SQL Code auf der ausgewählten Datenbank aus
    $("#btnDirectSql").on("click", function() {
        let sqlCode = $("#txtDirectSql").val();
        let result = CURRENT_VERINE_DATABASE.runSqlCode(sqlCode);
        if (result.error == undefined) {
            console.log(result.query);
            let tempTables = CURRENT_VERINE_DATABASE.getTables();
            updateTableChooser(tempTables[0], tempTables);
            if (result.query != undefined) {
                $("#divQueryResult").show();
                $("#txtQueryResult").hide();
                $("#divQueryResult").html(createTableSql(result.query.columns, result.query.values));
            } else {
                $("#divQueryResult").hide();
                $("#txtQueryResult").show();
                $("#txtQueryResult").val("SQL Befehl erfolgreich ausgeführt: \n" + sqlCode);
            }
        } else {
            $("#divQueryResult").hide();
            $("#txtQueryResult").show();
            $("#txtQueryResult").val(result.error);
        }
    });

    $("#spanBtnCreate").on("click", function() {
        let createCommand = 'CREATE TABLE meine_tabelle (\n "id" INTEGER PRIMARY KEY,\n "first_name" TEXT NOT NULL,\n "last_name" TEXT NOT NULL,\n "email" TEXT NOT NULL UNIQUE,\n "phone" TEXT NOT NULL UNIQUE\n );';
        $("#txtDirectSql").val(createCommand);
    });
    $("#spanBtnInsert").on("click", function() {
        let insertCommand = 'INSERT INTO meine_tabelle (first_name, last_name, email, phone)\nVALUES\n ("Richard", "Müller", "mueller@example.com", "080 654321")';
        $("#txtDirectSql").val(insertCommand);
    });
    $("#spanBtnUpdate").on("click", function() {
        let updateCommand = 'UPDATE meine_tabelle\nSET first_name = "Benni",\n last_name = "Geuder"\nWHERE id = 1;';
        $("#txtDirectSql").val(updateCommand);
    });

    ///////////////
    // FUNCTIONs //

    //function: Datenbank wird geladen
    async function init(dataPromise) {
        //fetch Database
        const sqlPromise = initSqlJs({
            locateFile: file => `dist/${file}`
        });
        const [sql, bufferedDatabase] = await Promise.all([sqlPromise, dataPromise]);

        return new sql.Database(new Uint8Array(bufferedDatabase));
    }

    //function: aktualisiert eine Übung
    function updateExercise() {
        var currentExercise = CURRENT_VERINE_DATABASE.getExerciseById(CURRENT_EXERCISE_ID);
        if (!$.isEmptyObject(currentExercise)) {
            let exerciseUpdateArray = [];
            if (currentExercise.titel != $("#txtTitle").val()) exerciseUpdateArray.push([CURRENT_EXERCISE_ID, "titel", $("#txtTitle").val()]);
            if (currentExercise.beschreibung != $("#txtExerciseDescription").val()) exerciseUpdateArray.push([CURRENT_EXERCISE_ID, "beschreibung", $("#txtExerciseDescription").val()]);
            if (currentExercise.informationen != $("#txtExcerciseMeta").val()) exerciseUpdateArray.push([CURRENT_EXERCISE_ID, "informationen", $("#txtExcerciseMeta").val()]);
            if (currentExercise.antworten != $("#txtAnswers").val()) exerciseUpdateArray.push([CURRENT_EXERCISE_ID, "antworten", $("#txtAnswers").val()]);
            if (currentExercise.feedback != $("#txtFeedback").val()) exerciseUpdateArray.push([CURRENT_EXERCISE_ID, "feedback", $("#txtFeedback").val()]);
            CURRENT_VERINE_DATABASE.udpateExercise(exerciseUpdateArray);
        }

    }

    //function: erstellt ein neues Übungs Objekt mit ID und Standardnamen
    function createExercise() {
        var newExercise = {};
        if (CURRENT_EXERCISE_ID != undefined) newExercise.reihenfolge = CURRENT_VERINE_DATABASE.getNewExerciseOrderAfterId(CURRENT_EXERCISE_ID);
        else newExercise.reihenfolge = 1;
        newExercise.titel = "neue Übung";
        newExercise.beschreibung = "";
        newExercise.informationen = "";
        newExercise.antworten = "";
        newExercise.feedback = "";
        CURRENT_EXERCISE_ID = CURRENT_VERINE_DATABASE.addExercise(newExercise, CURRENT_EXERCISE_ID);
    }

    //function: Befüllt die Textfelder mit den Inhalten einer Übung
    function fillAuthoringToolWithExercise() {
        var currentExercise = CURRENT_VERINE_DATABASE.getExerciseById(CURRENT_EXERCISE_ID);
        if (!$.isEmptyObject(currentExercise)) {
            $("#txtTitle").val(currentExercise.titel);
            $("#txtExerciseDescription").val(currentExercise.beschreibung);
            $("#txtExcerciseMeta").val(currentExercise.informationen);
            $("#txtAnswers").val(currentExercise.antworten);
            $("#txtFeedback").val(currentExercise.feedback);
        }
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

    //function: aktualisiert das #selTableChooser select Feld
    function updateTableChooser(selected, tables) {
        $("#selTableChooser").html("");
        tables.forEach(element => {
            $("#selTableChooser").append(new Option(element, element));
        });
        if (selected != null) {
            $("#selTableChooser").val(selected);
            try {
                CURRENT_VERINE_DATABASE.prepareTableData(selected);
                $(".verineTableEditable").html(createTableDataEdit(CURRENT_VERINE_DATABASE.columns, CURRENT_VERINE_DATABASE.values));
            } catch (err) {
                console.log(err);
            }
        }
    }

});