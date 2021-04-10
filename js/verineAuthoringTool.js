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





    //function log
    function log(info, tempValue) {
        console.log(info);
        if (tempValue != undefined) console.log("-> " + tempValue);
    }
});