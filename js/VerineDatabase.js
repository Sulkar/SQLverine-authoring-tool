

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

        let errorLogArray = [];
        //update rows
        try {
            if (this.createUpdateQuery() != undefined) this.database.exec(this.createUpdateQuery());
        } catch (err) {
            errorLogArray.push(err);
            console.log(err);
        }

        //delete rows
        try {
            if (this.createDeleteQuery() != undefined) this.database.exec(this.createDeleteQuery());
        } catch (err) {
            errorLogArray.push(err);
            console.log(err);
        }
        //insert rows
        try {
            if (this.createInsertQuery() != undefined) this.database.exec(this.createInsertQuery());
        } catch (err) {
            errorLogArray.push(err);
            console.log(err);
        }
        return errorLogArray;

    }

    createUpdateQuery() {

        let updateQuery = ""; // UPDATE students SET score1 = 5, score2 = 8 WHERE id = 1;
        this.updateValues.forEach(updateValue => {
            if (isNaN(updateValue[2])) {
                updateQuery += 'UPDATE ' + this.activeTable + ' SET ' + updateValue[1] + ' = "' + updateValue[2] + '" WHERE id = ' + updateValue[0] + ';';
            } else {
                updateQuery += 'UPDATE ' + this.activeTable + ' SET ' + updateValue[1] + ' = ' + updateValue[2] + ' WHERE id = ' + updateValue[0] + ';';
            }

        });

        if (updateQuery != "") return updateQuery;
        else return undefined;

    }

    createDeleteQuery() {
        let deleteIds = ""; // '"DELETE FROM mytable WHERE id IN (?,?,?,...)");'
        this.deleteValues.forEach(idToDelete => {
            if (deleteIds == "") deleteIds += idToDelete;
            else deleteIds += ", " + idToDelete;
        });
        if (deleteIds != "") return 'DELETE FROM ' + this.activeTable + ' WHERE id IN (' + deleteIds + ')';
        else return undefined;
    }

    createInsertQuery() {
        let insertQuery = "";
        //INSERT INTO pokemon(name, nr, größe, gewicht) VALUES("Pikachu", 3, 34, 4)
        let tableNamesString = "";
        this.columns.forEach(column => {
            if (!column.type.split("|").includes("PRIMARY KEY")) {
                if (tableNamesString == "") tableNamesString += column.name;
                else tableNamesString += ", " + column.name;
            }
        });

        //[auto, Spalte1, Spalte2, ...]
        this.insertValues.forEach(valueArray => {
            let valuesString = "";
            valueArray.forEach((value, index) => {
                if (value != "auto") {
                    if (isNaN(value)) value = '"' + value + '"'; //wenn value keine Zahl ist, muss es mit " " umklammert werden
                    if (valuesString == "") valuesString += '(' + value;
                    else valuesString += ', ' + value;

                    if (index == valueArray.length - 1) valuesString += ')';

                }
            });
            insertQuery += 'INSERT INTO ' + this.activeTable + '(' + tableNamesString + ') VALUES ' + valuesString + ';';
        });

        //build insertQuery
        if (insertQuery != "") return insertQuery;
        else return undefined;
    }

    prepareTableData(tableName) {
        if(tableName == null){
            tableName = this.activeTable;
        }else{
            this.activeTable = tableName;
        }
        

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
