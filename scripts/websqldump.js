/*
 * websqldump.js v1.0.0
 * Copyright 2016 Steven de Salas
 * http://github.com/sdesalas/websqldump
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

(function (window, undefined) {

    var wd = {};

    // Default config
    wd.config = {
        database: undefined,
        table: undefined, // undefined to export all tables
        version: "1.0",
        info: "",
        dbsize: 5 * 1024 * 1024, // 5MB
        linebreaks: false,
        schemaonly: false,
        dataonly: false,
        success: function (sql) {
            console.log(sql);
        },
        error: function (message) {
            throw new Error(message);
        }
    }

    wd.exportTable = function (config) {
        // Use closure to avoid overwrites
        var table = config.table;
        // Export schema
        if (!config.dataonly) {
            wd.execute({
                db: config.db,
                sql: "SELECT sql FROM sqlite_master WHERE type='table' AND tbl_name=?;",
                params: [table],
                success: function (results) {
                    if (!results.rows || !results.rows.length) {
                        if (typeof (config.error) === "function") config.error(`No such table: ${table}`);
                        return;
                    }
                    config.exportSql.push(results.rows.item(0)["sql"]);
                    if (config.schemaonly) {
                        if (typeof (config.success) === "function") config.success(config.exportSql.toString());
                        return;
                    }
                }
            });
        }
        // Export data
        if (!config.schemaonly) {
            wd.execute({
                db: config.db,
                sql: `SELECT * FROM '${table}';`,
                success: function (results) {
                    if (results.rows && results.rows.length) {
                        for (let i = 0; i < results.rows.length; i++) {
                            const row = results.rows.item(i);
                            const fields = [];
                            const values = [];
                            for (let col in row) {
                                if (row.hasOwnProperty(col)) {
                                    fields.push(col);
                                    values.push(`'${encodeURI(row[col].replace(/'/g, "''"))}'`);
                                }
                            }
                            config.exportSql.push(`INSERT INTO ${table}(${fields.join(",")}) VALUES (${values.join(",")})`);
                        }
                    }
                    if (typeof (config.success) === "function") config.success(config.exportSql.toString());
                },
                error: function (err) {
                    if (typeof (config.error) === "function") config.error(err);
                }
            });
        }
    }

    wd.export = function (config) {
        // Apply defaults
        for (let prop in wd.config) {
            if (typeof config[prop] === "undefined") config[prop] = wd.config[prop];
        }
        config.db = wd.open(config);
        config.exportSql = config.exportSql || [];
        config.exportSql.toString = function () { return this.join(config.linebreaks ? "|;\n" : "|; ") + "|;"; }
        if (config.table) {
            wd.exportTable(config);
        } else {
            config.exported = []; // list of exported tables
            config.outstanding = []; // list of outstanding tables
            var success = config.success; config.success = function () {
                config.exported.push(config.table);
                // Check if its all done
                if (config.exported.length >= config.outstanding.length) {
                    if (typeof (success) === "function") success(config.exportSql.toString());
                }
            }
            // Export all tables in db
            wd.execute({
                db: config.db,
                sql: "SELECT tbl_name FROM sqlite_master WHERE type='table';",
                success: function (results) {
                    if (results.rows) {
                        // First count the outstanding tables
                        let tblName;
                        for (var i = 0; i < results.rows.length; i++) {
                            tblName = results.rows.item(i)["tbl_name"];
                            if (tblName.indexOf("__WebKit") !== 0) // skip webkit internals
                                config.outstanding.push(tblName);
                        }
                        // Then export them
                        for (var i = 0; i < config.outstanding.length; i++) {
                            config.table = config.outstanding[i];
                            wd.exportTable(config);
                        }
                    }
                },
                error: function (err) {
                    if (typeof (error) === "function") error(transaction, err);
                }
            });
        }
    };

    wd.open = function (config) {
        if (!config) throw new Error("Please use a config object");
        if (!config.database) throw new Error("Please define a config database name.");
        return window.openDatabase(config.database, config.version || "1.0", config.info || "", config.dbsize || 512000);
    };

    // Helper method for executing SQL code in DB
    wd.execute = function (config) {
        if (!config) throw new Error("Please use a config object");
        if (!config.db) throw new Error("Please define a db obj to execute against");
        if (!config.sql) throw new Error("Please define some sql to execute.");
        config.db.transaction(function (transaction) {
            transaction.executeSql(config.sql, config.params || [],
                function (transaction, results) {
                    if (typeof (config.success) === "function") config.success(results);
                },
                function (transaction, err) {
                    if (typeof (config.error) === "function") config.error(err);
                }
            );
        });
    };

    window.websqldump = {
        export: function () {
            wd.export.apply(wd, arguments);
        }
    };

})(this);
