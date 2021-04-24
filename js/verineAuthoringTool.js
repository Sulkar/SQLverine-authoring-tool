$(document).ready(function () {

    /////////////
    // GLOBALS //
    var CURRENT_EXERCISE_ID = 1;
    var NEW_DATABASE_COUNTER = 1;
    var MAX_DATABASE_COUNTER = 5;
    var CURRENT_VERINE_DATABASE; //aktuell geladene DB
    var DATABASE_ARRAY = [];
    var CURRENT_DATABASE_INDEX = 0;
    var CSS_COLOR_ARRAY = ["coral", "tomato", "orange", "gold", "palegreen", "yellowgreen", "mediumaquamarine", "paleturquoise", "skyblue", "cadetblue", "pink", "hotpink", "orchid", "mediumpurple", "lightvoral"];
    var CHANGED = false;

    //Wenn etwas geändert wurde, wird beim Verlassen der Website nachgefragt, ob man die Seite wirklich verlassen will.
    window.onbeforeunload = function () {
        if (CHANGED) {
            return "";
        }
    }

    // START: erste Datenbank wird geladen
    init(fetch("data/Grundschule.db").then(res => res.arrayBuffer())).then(function (initObject) {

        CURRENT_VERINE_DATABASE = new VerineDatabase("Grundschule.db", initObject, "server");
        DATABASE_ARRAY.push(CURRENT_VERINE_DATABASE);
        CURRENT_DATABASE_INDEX = DATABASE_ARRAY.length - 1;

        updateDbChooser(DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name);
        let tempTables = CURRENT_VERINE_DATABASE.getTables();
        updateTableChooser(tempTables[0], tempTables);

        //sucht nach verine_exercises Tabelle
        handleDatabaseExercises(tempTables);

    }, function (error) { console.log(error) });


    ////////////
    // Quill //
    var myToolbar = [
        [{ header: [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        ['clean'],
        ['image', 'code-block'] //add image here
    ];

    function imageHandler() {
        var range = this.quill.getSelection();
        var value = prompt('Bild-URL hier einfügen:');
        if (value) {
            this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
        }
    }

    var quillExerciseDescription = new Quill('#nav-edit #txtExerciseDescription', {
        theme: 'snow',
        modules: {
            toolbar: {
                container: myToolbar,
                handlers: {
                    image: imageHandler
                }
            }
        },
    });

    var quillExerciseTask = new Quill('#nav-edit #txtExerciseTask', {
        theme: 'snow',
        modules: {
            toolbar: {
                container: myToolbar,
                handlers: {
                    image: imageHandler
                }
            }
        },
    });

    var quillExcerciseMeta = new Quill('#nav-edit #txtExcerciseMeta', {
        theme: 'snow',
        modules: {
            toolbar: {
                container: myToolbar,
                handlers: {
                    image: imageHandler
                }
            }
        },
    });

    var quillFeedback = new Quill('#nav-edit #txtFeedback', {
        theme: 'snow',
        modules: {
            toolbar: {
                container: myToolbar,
                handlers: {
                    image: imageHandler
                }
            }
        },
    });

    ////////////
    // EVENTs //

    //Button: öffnet ein Modal für das Umbenennen der aktuellen Datenbank.    
    $("#btnDbRename").click(function () {
        $("#universal-modal").modal('toggle');
        $("#universal-modal .modal-title").html("Datenbank umbenennen");
        $("#universal-modal .modal-body").html("<input type='text' id='inputRenameDatabase' class='form-control input-check' aria-label='' aria-describedby='' value='" + CURRENT_VERINE_DATABASE.name + "'>");
        $("#universal-modal .modal-footer").html('<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">abbrechen</button><button type="button" id="btnRenameAccept" class="btn btn-primary">Änderung speichern</button>');
    });
    $("#universal-modal").on('click', '#btnRenameAccept', function () {
        CURRENT_VERINE_DATABASE.name = $("#inputRenameDatabase").val();
        updateDbChooser(DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name);
        $("#universal-modal").modal('toggle');
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

                updateDbChooser(DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name);
                let tempTables = verineDatabase.getTables();
                updateTableChooser(tempTables[0], tempTables);

                //sucht nach verine_exercises Tabelle
                handleDatabaseExercises(tempTables);

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

    //Button: erstellt eine neue Datenbank anhand der verfügbaren Platzhalterdatenbanken
    $(".btnDbNew").click(function () {

        if (NEW_DATABASE_COUNTER <= MAX_DATABASE_COUNTER) {
            init(fetch("data/newDB_" + NEW_DATABASE_COUNTER + ".db").then(res => res.arrayBuffer())).then(function (initObject) {
                CURRENT_VERINE_DATABASE = new VerineDatabase("neue Datenbank_" + NEW_DATABASE_COUNTER + ".db", initObject, "local");
                NEW_DATABASE_COUNTER++;
                DATABASE_ARRAY.push(CURRENT_VERINE_DATABASE);
                CURRENT_DATABASE_INDEX = DATABASE_ARRAY.length - 1;

                updateDbChooser(DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name);
                let tempTables = CURRENT_VERINE_DATABASE.getTables();
                updateTableChooser(tempTables[0], tempTables);

                //sucht nach verine_exercises Tabelle
                handleDatabaseExercises(tempTables);
            }, function (error) { console.log(error) });

        } else {
            $("#universal-modal").modal('toggle');
            $("#universal-modal .modal-title").html("neue Datenbank erstellen");
            $("#universal-modal .modal-body").html("<p>Leider ist die maximale Anzahl von Datenbanken erreicht. Es können keine weiteren erstellt werden. Lade Datenbanken herunter, um diese permanent zu speichern.</p>");
            $("#universal-modal .modal-footer").html('<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">OK</button>');
        }

    });

    //Button: wenn auf die Tabs geklickt wird
    $("#nav-tab button").click(function () {
        //save current exercise
        updateExercise();
        //set current selected as new exercise id
        fillExerciseSelect(CURRENT_EXERCISE_ID);
        fillEditViewWithExercise();
        fillPreviewViewWithExercise();
        //update edit table view
        CURRENT_VERINE_DATABASE.prepareTableData(null);
        $(".verineTableEditable").html(createTableDataEdit(CURRENT_VERINE_DATABASE.columns, CURRENT_VERINE_DATABASE.values));
    });

    ////////////////////////////////////
    //Buttons im Reiter Übungen Editieren

    //Button: neue verince_exercise Tabelle erstellen
    $("#btnCreateVerineTable").click(function () {
        CURRENT_VERINE_DATABASE.runSqlCode('CREATE TABLE verine_exercises ("id" INTEGER PRIMARY KEY, "reihenfolge" INTEGER NOT NULL, "titel" TEXT NOT NULL, "beschreibung" TEXT NOT NULL, "aufgabenstellung" TEXT NOT NULL, "informationen" TEXT NOT NULL, "antworten" TEXT NOT NULL, "feedback" TEXT NOT NULL, "geloest" INTEGER NOT NULL);');

        let tempTables = CURRENT_VERINE_DATABASE.getTables();
        updateTableChooser(tempTables[0], tempTables);
        handleDatabaseExercises(tempTables);
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
            let tab = new bootstrap.Tab(document.querySelector('#nav-edit-tab'));
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
        CURRENT_VERINE_DATABASE.prepareTableData(this.value);
        $(".verineTableEditable").html(createTableDataEdit(CURRENT_VERINE_DATABASE.columns, CURRENT_VERINE_DATABASE.values));
        let tab = new bootstrap.Tab(document.querySelector('#nav-tableEdit-tab'));
        tab.show();
    });

    //Button: fügt am Ende der Tabelle eine neue Zeile ein
    $("#btnAddRow").on("click", function () {
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
            CHANGED = true;
            //update table view
            CURRENT_VERINE_DATABASE.prepareTableData(null);
            $(".verineTableEditable").html(createTableDataEdit(CURRENT_VERINE_DATABASE.columns, CURRENT_VERINE_DATABASE.values));
            //update Übungen > Editieren
            fillExerciseSelect(CURRENT_EXERCISE_ID);
            fillEditViewWithExercise();
            fillPreviewViewWithExercise();
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
    $(".verineTableEditable").on("input", "tbody td", function () {
        console.log($(this).attr("id"));

    });

    //////////////////////////////////////
    //Buttons im Reiter Datenbank Struktur

    //Button: Führt SQL Code auf der ausgewählten Datenbank aus
    $("#btnDirectSql").on("click", function () {
        let sqlCode = $("#txtDirectSql").val();
        let result = CURRENT_VERINE_DATABASE.runSqlCode(sqlCode);
        if (result.error == undefined) {
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

    $("#spanBtnCreate").on("click", function () {
        let createCommand = 'CREATE TABLE meine_tabelle (\n "id" INTEGER PRIMARY KEY,\n "first_name" TEXT NOT NULL,\n "last_name" TEXT NOT NULL,\n "email" TEXT NOT NULL UNIQUE,\n "phone" TEXT NOT NULL UNIQUE\n );';
        $("#txtDirectSql").val(createCommand);
    });
    $("#spanBtnInsert").on("click", function () {
        let insertCommand = 'INSERT INTO meine_tabelle (first_name, last_name, email, phone)\nVALUES\n ("Richard", "Müller", "mueller@example.com", "080 654321")';
        $("#txtDirectSql").val(insertCommand);
    });
    $("#spanBtnUpdate").on("click", function () {
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
            if (currentExercise.beschreibung != he.encode(quillExerciseDescription.root.innerHTML)) exerciseUpdateArray.push([CURRENT_EXERCISE_ID, "beschreibung", he.encode(quillExerciseDescription.root.innerHTML)]);
            if (currentExercise.aufgabenstellung != he.encode(quillExerciseTask.root.innerHTML)) exerciseUpdateArray.push([CURRENT_EXERCISE_ID, "aufgabenstellung", he.encode(quillExerciseTask.root.innerHTML)]);
            if (currentExercise.informationen != he.encode(quillExcerciseMeta.root.innerHTML)) exerciseUpdateArray.push([CURRENT_EXERCISE_ID, "informationen", he.encode(quillExcerciseMeta.root.innerHTML)]);
            if (currentExercise.antworten != $("#txtAnswers").val()) exerciseUpdateArray.push([CURRENT_EXERCISE_ID, "antworten", $("#txtAnswers").val()]);
            if (currentExercise.feedback != he.encode(quillFeedback.root.innerHTML)) exerciseUpdateArray.push([CURRENT_EXERCISE_ID, "feedback", he.encode(quillFeedback.root.innerHTML)]);
            //gibt es Änderungen?
            if (exerciseUpdateArray.length > 0) {
                CHANGED = true;
                CURRENT_VERINE_DATABASE.updateExercise(exerciseUpdateArray);
            }

        }
    }

    //function: erstellt ein neues Übungs Objekt mit ID und Standardnamen
    function createExercise() {
        var newExercise = {};
        if (CURRENT_EXERCISE_ID != undefined) {
            newExercise.reihenfolge = CURRENT_VERINE_DATABASE.getNewExerciseOrderAfterId(CURRENT_EXERCISE_ID);
        }
        else newExercise.reihenfolge = 1;
        newExercise.titel = "neue Übung";
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
        let currentExercise = CURRENT_VERINE_DATABASE.getExerciseById(CURRENT_EXERCISE_ID);
        if (!$.isEmptyObject(currentExercise)) {
            console.log(currentExercise)
            $("#nav-edit #txtTitle").val(he.decode(currentExercise.titel));
            let deltaExerciseDescription = quillExerciseDescription.clipboard.convert(he.decode(currentExercise.beschreibung));
            quillExerciseDescription.setContents(deltaExerciseDescription, 'silent');
            let deltaExerciseTask = quillExerciseTask.clipboard.convert(he.decode(currentExercise.aufgabenstellung));
            quillExerciseTask.setContents(deltaExerciseTask, 'silent');
            let deltaExcerciseMeta = quillExcerciseMeta.clipboard.convert(he.decode(currentExercise.informationen));
            quillExcerciseMeta.setContents(deltaExcerciseMeta, 'silent');
            $("#nav-edit #txtAnswers").val(he.decode(currentExercise.antworten));
            let deltaFeedback = quillFeedback.clipboard.convert(he.decode(currentExercise.feedback));
            quillFeedback.setContents(deltaFeedback, 'silent');
        }

    }
    //function: Befüllt die Textfelder im #nav-preview mit den Inhalten einer Übung
    function fillPreviewViewWithExercise() {
        let currentExercise = CURRENT_VERINE_DATABASE.getExerciseById(CURRENT_EXERCISE_ID);
        if (!$.isEmptyObject(currentExercise)) {
            $("#nav-preview #preview-title").html(he.decode(currentExercise.titel));
            $("#nav-preview #preview-description").html(he.decode(currentExercise.beschreibung));
            $("#nav-preview #preview-task").html(he.decode(currentExercise.aufgabenstellung));
            $("#nav-preview #preview-meta").html(he.decode(currentExercise.informationen));
            //zeigt Antworten der Übung geparst an:
            let exerciseAnswer = "";
            exerciseAnswer += "Anzahl Lösungszeilen: " + currentExercise.answerObject.rows + "<br>";
            if (currentExercise.answerObject.input) exerciseAnswer += "Inputfeld <br>";
            currentExercise.answerObject.exerciseSolutionArray.forEach(solution => {
                exerciseAnswer += "<hr>";
                exerciseAnswer += "Antwort: " + solution.loesungString + "<br>";;
                if (solution.table != undefined) exerciseAnswer += "Tabelle: " + solution.table + "<br>";;
                if (solution.column != undefined) exerciseAnswer += "Spalte: " + solution.column + "<br>";;
            });
            $("#nav-preview #preview-antworten").html(exerciseAnswer);
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
                    $("#selectExercises").append(new Option(he.decode(exercise[2]), exercise[0]));
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
        $("#nav-edit .no-exercise").show();
        $("#nav-edit .no-exercise #no-exercise-info").html("Die aktuell gewählte Datenbank hat keine SQLverine Übungstabelle.");

    }

    //function: Befüllt die Tabs, Aufgabenauswahl... wenn verine exercises vorhanden sind.
    function handleDatabaseExercises(tempTables) {
        if (tempTables.includes("verine_exercises")) {
            try {
                if (CURRENT_VERINE_DATABASE.getExercises().length > 0) {
                    CURRENT_EXERCISE_ID = CURRENT_VERINE_DATABASE.getExercises()[0][0];
                } else {
                    CURRENT_EXERCISE_ID = undefined;
                    createExercise();
                }
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

            let tempTables = CURRENT_VERINE_DATABASE.getTables();
            updateTableChooser(tempTables[0], tempTables);
            //sucht nach verine_exercises Tabelle
            handleDatabaseExercises(tempTables);
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