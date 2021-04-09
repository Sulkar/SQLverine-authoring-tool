$(document).ready(function () {

    //global variables
    var NR = 0;
    var CURRENT_EXERCISE_ID = 1;
    var EXERCISE_ARRAY = [];

    var exercise = {};
    exercise.id = 1;
    exercise.order = 1;
    exercise.name = "Einleitung";
    exercise.question = "Willkommen bei der Einleitung";
    exercise.info = "Blablabla";
    exercise.answerKeywords = "";
    exercise.feedback = "";

    EXERCISE_ARRAY.push(exercise);

    exercise = {};
    exercise.id = 2;
    exercise.order = 1;
    exercise.name = "Übung 1";
    exercise.question = "Wann ist Franz Meier geboren?";
    exercise.info = "Ein Datum wird in SQL Datenbanken im englischen Format 'YYYY-MM-DD' angegeben. \n Y = Year, M = Month, D = Day.";
    exercise.answerKeywords = "1982-02-06";
    exercise.feedback = "Super, Deien SQL Abfrage war richtig.";

    EXERCISE_ARRAY.push(exercise);

    // START //
    fillExerciseSelect(CURRENT_EXERCISE_ID);
    fillAuthoringToolWithExercise(CURRENT_EXERCISE_ID);

    ////////////
    // EVENTs //

    //Button: Speichern
    $(".btnSave").on("click", function () {
        updateExercise();
        fillExerciseSelect(CURRENT_EXERCISE_ID);
        fillAuthoringToolWithExercise(CURRENT_EXERCISE_ID);
    });

    //Button: neue Exercise
    $(".btnNewExercise").on("click", function () {
        createExercise();
        fillExerciseSelect(CURRENT_EXERCISE_ID);
        fillAuthoringToolWithExercise(CURRENT_EXERCISE_ID);
    });

    //Select: Exercises werden ausgewählt
    $('#selectExercises').change(function () {
        CURRENT_EXERCISE_ID = $(this).val();
        fillAuthoringToolWithExercise(CURRENT_EXERCISE_ID);
    });


    ///////////////
    // FUNCTIONs //

    //function: aktualisiert eine Exercise
    function updateExercise() {
        var currentExercise = getExerciseById(CURRENT_EXERCISE_ID);
        //Exercise Objekt mit aktuellen Inhalten anpassen
        currentExercise.name = $("#txtTitle").val();
        currentExercise.question = $("#txtExerciseDescription").val();
        currentExercise.info = $("#txtExcerciseMeta").val();
        currentExercise.answerKeywords = $("#txtAnswers").val();
        currentExercise.feedback = $("#txtFeedback").val();
    }
    //function: erstellt ein neues Exercise Objekt mit ID und ORDER
    function createExercise() {
        var newExercise = {};
        newExercise.id = getNewExerciseId();
        newExercise.order = 3; //getNextSelectExerciseOrder();
        newExercise.name = "neue Übung";
        newExercise.question = "";
        newExercise.info = "";
        newExercise.answerKeywords = "";
        newExercise.feedback = "";
        addExerciseToArrayAfterId(newExercise, CURRENT_EXERCISE_ID);
        CURRENT_EXERCISE_ID = newExercise.id;
    }

    //function: testet ob die Exercise im Array schon existiert, wenn ja wird diese aktualisiert, wenn nicht, wird diese neu hinzugefügt.
    function addExerciseToArray(exerciseToAdd, inserAfterExerciseId) {
        var exerciseExists = false;
        EXERCISE_ARRAY.forEach((exercise, index) => {
            if (exercise.id == exerciseToAdd.id) {
                exercise = exerciseToAdd;
                exerciseExists = true;
            }
        });
        if (!exerciseExists) {
            EXERCISE_ARRAY.push(exerciseToAdd);
        }
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



    //function: sucht die höchste aktuell vergebene Exercise ID und gibt diese +1 zurück
    function getNewExerciseId() {
        var maxExerciseId = 0;
        EXERCISE_ARRAY.forEach(exercise => {
            if (exercise.id > maxExerciseId) {
                maxExerciseId = exercise.id;
            }
        });
        return (maxExerciseId + 1);
    }

    //function: Befüllt die Textfelder mit den Inhalten einer Exercise
    function fillAuthoringToolWithExercise(exerciseId) {
        var currentExercise = getExerciseById(exerciseId);
        $("#txtTitle").val(currentExercise.name);
        $("#txtExerciseDescription").val(currentExercise.question);
        $("#txtExcerciseMeta").val(currentExercise.info);
        $("#txtAnswers").val(currentExercise.answerKeywords);
        $("#txtFeedback").val(currentExercise.feedback);

    }

    //function: Befüllt das <select> Element mit den verfügbaren Exercises
    function fillExerciseSelect(selectedId) {
        $("#selectExercises").html("");
        EXERCISE_ARRAY.forEach(exercise => {
            $("#selectExercises").append(new Option(exercise.name, exercise.id));
        });
        if (selectedId != undefined) $("#selectExercises").val(selectedId);
    }

    //function: Sucht aus dem Array mit Exercises die Exercise mit der übergebenen ID
    function getExerciseById(exerciseId) {
        var foundExercise = undefined;
        EXERCISE_ARRAY.forEach(exercise => {
            if (exercise.id == exerciseId) {
                foundExercise = exercise;
            }
        });
        return foundExercise;
    }

    function getKeywords() {

    }



    //function log
    function log(info, tempValue) {
        console.log(info);
        if (tempValue != undefined) console.log("-> " + tempValue);
    }
});