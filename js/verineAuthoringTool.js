$(document).ready(function () {


    //global variables
    var NR = 0;
    var CURRENT_EXERCISE_ID = 1;
    var EXERCISE_ARRAY = [];

    //Testdaten
    var exercise = {};
    exercise.id = 1;
    exercise.name = "Einleitung";
    exercise.question = "Willkommen bei der Einleitung";
    exercise.info = "Blablabla";
    exercise.answerKeywords = "";
    exercise.feedback = "";
    EXERCISE_ARRAY.push(exercise);

    exercise = {};
    exercise.id = 2;
    exercise.name = "Übung 1";
    exercise.question = "Wann ist Franz Meier geboren?";
    exercise.info = "Ein Datum wird in SQL Datenbanken im englischen Format 'YYYY-MM-DD' angegeben. \n Y = Year, M = Month, D = Day.";
    exercise.answerKeywords = "1982-02-06";
    exercise.feedback = "Super, Deien SQL Abfrage war richtig.";
    EXERCISE_ARRAY.push(exercise);

    exercise = {};
    exercise.id = 3;
    exercise.name = "Übung 2";
    exercise.question = "Wie heisst Fritz mit Nachnamen";
    exercise.info = "";
    exercise.answerKeywords = "Müller";
    exercise.feedback = "Super, Deien SQL Abfrage war richtig.";
    EXERCISE_ARRAY.push(exercise);

    // START //
    fillExerciseSelect(CURRENT_EXERCISE_ID);
    fillAuthoringToolWithExercise();

    ////////////
    // EVENTs //

    //Button: Speichern
    $(".btnSave").on("click", function () {
        updateExercise();
        fillExerciseSelect(CURRENT_EXERCISE_ID);
        fillAuthoringToolWithExercise();
    });

    //Button: neue Übung
    $(".btnNewExercise").on("click", function () {
        createExercise();
        fillExerciseSelect(CURRENT_EXERCISE_ID);
        fillAuthoringToolWithExercise();
    });

    //Button: aktuelle Übung löschen
    $(".btnDeleteExercise").on("click", function () {
        deleteExercise();
        fillExerciseSelect(CURRENT_EXERCISE_ID);
        fillAuthoringToolWithExercise();
    });

    //Select: Übungen werden ausgewählt
    $('#selectExercises').change(function () {
        CURRENT_EXERCISE_ID = $(this).val();
        fillAuthoringToolWithExercise();
    });

    //Button: Übung in der Liste eine Position nach oben schieben
    $(".btnMoveExerciseUp").on("click", function () {
        selectMoveExerciseUp();
        fillExerciseSelect(CURRENT_EXERCISE_ID);
    });
    //Button: Übung in der Liste eine Position nach unten schieben
    $(".btnMoveExerciseDown").on("click", function () {
        selectMoveExerciseDown();
        fillExerciseSelect(CURRENT_EXERCISE_ID);
    });



    ///////////////
    // FUNCTIONs //

    //function: verschiebt eine Übung im Übungsarray eine Position nach oben
    function selectMoveExerciseUp() {
        var currentExercise = getExerciseById(CURRENT_EXERCISE_ID);
        var currentArrayIndexOfExercise = 0;
        EXERCISE_ARRAY.forEach((exercise, index) => {
            if (exercise.id == currentExercise.id) {
                currentArrayIndexOfExercise = index;
            }
        });
        //ist Übung nicht an erster Position des Arrays, schiebe die Übung nach oben
        if (currentArrayIndexOfExercise > 0) {
            EXERCISE_ARRAY.splice(currentArrayIndexOfExercise, 1);
            EXERCISE_ARRAY.splice(currentArrayIndexOfExercise - 1, 0, currentExercise);
        }
    }

    //function: verschiebt eine Übung im Übungsarray eine Position nach unten
    function selectMoveExerciseDown() {
        var currentExercise = getExerciseById(CURRENT_EXERCISE_ID);
        var currentArrayIndexOfExercise = 0;
        EXERCISE_ARRAY.forEach((exercise, index) => {
            if (exercise.id == currentExercise.id) {
                currentArrayIndexOfExercise = index;
            }
        });
        //ist Übung nicht an erster Position des Arrays, schiebe die Übung nach oben
        if (currentArrayIndexOfExercise < EXERCISE_ARRAY.length - 1) {
            EXERCISE_ARRAY.splice(currentArrayIndexOfExercise, 1);
            EXERCISE_ARRAY.splice(currentArrayIndexOfExercise + 1, 0, currentExercise);
        }
    }

    //function: aktualisiert eine Übung
    function updateExercise() {
        var currentExercise = getExerciseById(CURRENT_EXERCISE_ID);
        //Exercise Objekt mit aktuellen Inhalten anpassen
        currentExercise.name = $("#txtTitle").val();
        currentExercise.question = $("#txtExerciseDescription").val();
        currentExercise.info = $("#txtExcerciseMeta").val();
        currentExercise.answerKeywords = $("#txtAnswers").val();
        currentExercise.feedback = $("#txtFeedback").val();
    }
    //function: erstellt ein neues Übungs Objekt mit ID und Standardnamen
    function createExercise() {
        var newExercise = {};
        newExercise.id = getNewExerciseId();
        newExercise.name = "neue Übung";
        newExercise.question = "";
        newExercise.info = "";
        newExercise.answerKeywords = "";
        newExercise.feedback = "";
        addExerciseToArrayAfterId(newExercise, CURRENT_EXERCISE_ID);
        CURRENT_EXERCISE_ID = newExercise.id;
    }

    //function: löscht eine ausgewählte Übung und setzt die ID auf die nächst vorhandene Übung
    function deleteExercise() {
        var currentExercise = getExerciseById(CURRENT_EXERCISE_ID);
        var currentArrayIndexOfExercise = 0;
        EXERCISE_ARRAY.forEach((exercise, index) => {
            if (exercise.id == currentExercise.id) {
                currentArrayIndexOfExercise = index;
            }
        });
        //vorherige/nächste Übung wird selektiert
        if (currentArrayIndexOfExercise > 0) { // Übung vor der zu löschenden Übung
            CURRENT_EXERCISE_ID = EXERCISE_ARRAY[currentArrayIndexOfExercise - 1].id;
        } else if (currentArrayIndexOfExercise < EXERCISE_ARRAY.length - 1) { // Übung nach der zu löschenden Übung
            CURRENT_EXERCISE_ID = EXERCISE_ARRAY[currentArrayIndexOfExercise + 1].id;
        } else { //die zu löschende Übung ist die letzte Übung, eine neue leere Übung wird erstellt
            createExercise();
            fillExerciseSelect(CURRENT_EXERCISE_ID);
            fillAuthoringToolWithExercise();
        }
        EXERCISE_ARRAY.splice(currentArrayIndexOfExercise, 1);
    }

    //function: fügt eine neue Übung nach einer angegebenen Übungs ID ein
    function addExerciseToArrayAfterId(exerciseToAdd, inserAfterExerciseId) {
        var indexToInsertExercise = 0;
        EXERCISE_ARRAY.forEach((exercise, index) => {
            if (exercise.id == inserAfterExerciseId) {
                indexToInsertExercise = index + 1;
            }
        });
        EXERCISE_ARRAY.splice(indexToInsertExercise, 0, exerciseToAdd);
    }

    //function: sucht die höchste aktuell vergebene Übungs ID und gibt diese +1 zurück
    function getNewExerciseId() {
        var maxExerciseId = 0;
        EXERCISE_ARRAY.forEach(exercise => {
            if (exercise.id > maxExerciseId) {
                maxExerciseId = exercise.id;
            }
        });
        return (maxExerciseId + 1);
    }

    //function: Befüllt die Textfelder mit den Inhalten einer Übung
    function fillAuthoringToolWithExercise() {
        var currentExercise = getExerciseById(CURRENT_EXERCISE_ID);
        $("#txtTitle").val(currentExercise.name);
        $("#txtExerciseDescription").val(currentExercise.question);
        $("#txtExcerciseMeta").val(currentExercise.info);
        $("#txtAnswers").val(currentExercise.answerKeywords);
        $("#txtFeedback").val(currentExercise.feedback);

    }

    //function: Befüllt das <select> Element mit den verfügbaren Übungen
    function fillExerciseSelect(selectedId) {
        $("#selectExercises").html("");
        EXERCISE_ARRAY.forEach(exercise => {
            $("#selectExercises").append(new Option(exercise.name, exercise.id));
        });
        if (selectedId != undefined) $("#selectExercises").val(selectedId);
    }

    //function: Sucht aus dem Array mit Übungen die Übung mit der übergebenen ID
    function getExerciseById(exerciseId) {
        var foundExercise = undefined;
        EXERCISE_ARRAY.forEach(exercise => {
            if (exercise.id == exerciseId) {
                foundExercise = exercise;
            }
        });
        return foundExercise;
    }


    // SQLverine Code //
    ////////////////////

    //global variables
    var NR = 0;
    var NEXT_ELEMENT_NR = 0;
    var CURRENT_SELECTED_ELEMENT = undefined;
    var CURRENT_SELECTED_SQL_ELEMENT = "START";
    var ACTIVE_CODE_VIEW_DATA; // JSON Data holder
    var USED_TABLES = []; // listet alle genutzten Tabellen einer DB auf, um SELECTs entsprechend zu befüllen
    var CURRENT_VERINE_DATABASE; //aktuell geladene DB
    var DATABASE_ARRAY = [];
    var CURRENT_DATABASE_INDEX = 0;
    //DATABASE_ARRAY.push(createDatabaseObject("Grundschule.db", null, "server"));
    var CSS_COLOR_ARRAY = ["coral", "tomato", "orange", "gold", "palegreen", "yellowgreen", "mediumaquamarine", "paleturquoise", "skyblue", "cadetblue", "pink", "hotpink", "orchid", "mediumpurple", "lightvoral"];






    //function: Datenbank wird geladen
    async function init(dataPromise) {
        //fetch Database
        const sqlPromise = initSqlJs({
            locateFile: file => `dist/${file}`
        });
        const [sql, bufferedDatabase] = await Promise.all([sqlPromise, dataPromise]);

        return new sql.Database(new Uint8Array(bufferedDatabase));
    }





    // START - erste Datenbank wird geladen
    init(fetch("data/Grundschule.db").then(res => res.arrayBuffer())).then(function (initObject) {

        let verineDatabase = new VerineDatabase("Grundschule.db", initObject, "server");
        CURRENT_VERINE_DATABASE = verineDatabase;
        DATABASE_ARRAY.push(verineDatabase);
        CURRENT_DATABASE_INDEX = DATABASE_ARRAY.length - 1;

        updateDbChooser(DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name);
        let tempTables = verineDatabase.getTables();
        updateTableChooser(tempTables[0], tempTables);


    }, function (error) { console.log(error) });






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

                updateDbChooser(DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name);
                let tempTables = verineDatabase.getTables();
                updateTableChooser(tempTables[0], tempTables);

            }, function (error) { console.log(error) });
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
                log(err);
            }

        }
    }

    // Select: Tabelle wird ausgewählt
    $('#selTableChooser').on('change', function () {
        CURRENT_VERINE_DATABASE.prepareTableData(this.value);
        $(".verineTableEditable").html(createTableDataEdit(CURRENT_VERINE_DATABASE.columns, CURRENT_VERINE_DATABASE.values));

    });



    // Table Events
    $(".verineTableEditable").html(createTableDataEdit(TABLE_COLUMNS, TABLE_VALUES));

    //Button: fügt am Ende der Tabelle eine neue Zeile ein
    $("#btnAddRow").on("click", function () {
        $(".verineTableEditable tbody").append(createNewRow());
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

    $(".verineTableEditable").on("click", ".verineRowDelete", function (event) {
        var thisId = $(this).attr("id");
        CURRENT_VERINE_DATABASE.deleteValues = checkForDeletes(thisId);
    });
    $(".verineTableEditable").on("input", "tbody td", function () {
        log($(this).attr("id"));

    });





    //function log
    function log(info, tempValue) {
        console.log(info);
        if (tempValue != undefined) console.log("-> " + tempValue);
    }
});