

class VerineDatabase {

    constructor(name, currentDatabase, type) {
        this.name = name;
        this.database = currentDatabase;
        this.type = type;

        this.columns = undefined;
        this.values = undefined;

        this.activeTable = undefined;

        this.updateValues = []; //[sql_id, Spalte, Wert]
        this.insertValues = []; //[auto, Spalte1, Spalte2, ...]
        this.deleteValues = []; //[sql_id, sql_id, ...]
    }

    getTables() {
        return this.database.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")[0].values;
    }

    getColumns(tableName) {
        return this.database.exec("PRAGMA table_info(" + tableName + ")")[0].values;
    }


    getTableCreateStatement(tableName) {
        return this.database.exec("SELECT sql FROM sqlite_master WHERE name = '" + tableName + "'")[0].values[0][0];

    }

    persist() {
        //log(this.updateValues)
        //log(this.insertValues)
        // log(this.deleteValues)
        log(this.insertValues[0])
        //insert new data
        try {
            let insertQuery = this.createInsertQuery();
            this.database.exec("INSERT INTO " + this.activeTable + "(" + insertQuery[0] + ") VALUES " + insertQuery[1] + ";");
        } catch (err) {
            console.log(err);
        }

    }



    createInsertQuery() {
        //INSERT INTO pokemon(name, nr, größe, gewicht) VALUES("Pikachu", 3, 34, 4)
        let insertQuery = [];
        let tableNamesString = "";
        this.columns.forEach(column => {
            if (!column.type.split("|").includes("PRIMARY KEY")) {
                if (tableNamesString == "") tableNamesString += column.name;
                else tableNamesString += ", " + column.name;
            }
        });

        let insertValuesString = "";     //[auto, Spalte1, Spalte2, ...]
        this.insertValues.forEach(valueArray => {
            let tempValuesString = "";
            valueArray.forEach((value, index) => {
                if (value != "auto") {
                    if (isNaN(value)) value = '"' + value + '"'; //wenn value keine Zahl ist, muss es mit " " umklammert werden
                    if (tempValuesString == "") tempValuesString += '(' + value;
                    else tempValuesString += ', ' + value;

                    if (index == valueArray.length - 1) tempValuesString += ')';

                }
            });
            if (insertValuesString == "") insertValuesString += tempValuesString;
            else insertValuesString += ', ' + tempValuesString;
        });

        insertQuery.push(tableNamesString);
        insertQuery.push(insertValuesString);

        return insertQuery;
    }
    /*
CREATE TABLE "schueler"(
    "id" INTEGER NOT NULL UNIQUE,
    "vorname" TEXT NOT NULL,
    "nachname" TEXT NOT NULL,
    "geburtsdatum" TEXT,
    "klasse_id" INTEGER NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT),
    FOREIGN KEY("klasse_id") REFERENCES "klassen"("id")
);*/

    prepareTableData(tableName) {
        this.activeTable = tableName;

        let tableCreateStatement = this.getTableCreateStatement(tableName);
        let tableData = this.database.exec("SELECT * FROM " + tableName);
        let columnObjects = [];
        tableData[0].columns.forEach(column => {
            let columnObject = this.createColumnObject(column, tableCreateStatement);
            columnObjects.push(columnObject);
        });

        this.columns = columnObjects;
        this.values = tableData[0].values;
    }

    createColumnObject(columnName, tableCreateStatement) {

        let typeArray = ["INTEGER", "TEXT", "REAL", "NOT NULL", "UNIQUE"];

        let columnObject = {};
        columnObject.name = columnName;
        columnObject.type = "";

        //untersucht das Table Create Statement
        let tableCreateStatementArray = tableCreateStatement.split(",");
        tableCreateStatementArray.forEach(createStatementLine => {

            //find types
            let foundColumnName = createStatementLine.match(/\n(\s|)"([\wöäüß]+)"/); // z.B.: "id" INTEGER NOT NULL UNIQUE,
            if (foundColumnName != null && foundColumnName[2] == columnName) {
                typeArray.forEach(sqlType => {
                    var re = new RegExp("\\b" + sqlType + "\\b", "");
                    if (createStatementLine.search(re) != -1) {
                        if (columnObject.type == "") columnObject.type += sqlType;
                        else columnObject.type += "|" + sqlType;
                    }
                });
            }
            //check for primary key, ...
            let foundPrimaryKey = createStatementLine.match(/(PRIMARY KEY\(")(\w+)"/);
            if (foundPrimaryKey != null && foundPrimaryKey[2] == columnName) {
                if (columnObject.type == "") columnObject.type += "PRIMARY KEY";
                else columnObject.type += "|" + "PRIMARY KEY";
            }

        });
        return columnObject;
    }
}
