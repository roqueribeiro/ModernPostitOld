var db = openDatabase("db_postit", "1.0", "Modern Post-It Database", 2 * 1024 * 1024);

//Clear Database
//db.transaction(function(tx) { tx.executeSql("DROP TABLE postits", []) });

var tbl_query = "CREATE TABLE IF NOT EXISTS postits (id, title, content, color, state, zindex, w, h, x, y, dt)";
db.transaction(function (tx) {
    tx.executeSql(tbl_query, [], function (tx, results) {
        //console.log(results);
    }, function (tx, error) {
        console.log(error);
        $(".notification").jnotifyAddMessage({
            text: `Ocorreu um erro ao executar o procedimento.<br /><br />Descrição do erro: ${error.message}`,
            type: "error",
            permanent: false
        });
    });
});

var addNewPostit = function (id, title, content, color, state, zindex, w, h, x, y, dt) {
    //console.log(id, title, content, state, zindex, w, h, x, y, dt);
    var tblQuery = `INSERT INTO postits VALUES ('${id}', '${encodeURI(title.replace(/'/g, "''"))}', '${encodeURI(content.replace(/'/g, "''"))}', '${color}', '${state}', ${zindex}, ${w}, ${h}, ${x}, ${y}, ${dt});`;
    db.transaction(function (tx) {
        tx.executeSql(tblQuery, [], function (tx, results) {
            //console.log(results);
        }, function (tx, error) {
            console.log(error);
            $(".notification").jnotifyAddMessage({
                text: `Ocorreu um erro ao executar o procedimento.<br /><br />Descrição do erro: ${error.message}`,
                type: "error",
                permanent: false
            });
        });
    });
};

var updatePostitData = function (id, title, content, color, state, zindex, w, h, x, y) {
    var tblQuery = `UPDATE postits SET title = '${encodeURI(title.replace(/'/g, "''"))}', content = '${encodeURI(content.replace(/'/g, "''"))}', color = '${color}', state = '${state}', zindex = ${zindex}, w = ${w}, h = ${h}, x = ${x}, y = ${y} WHERE id = '${id}';`;
    db.transaction(function (tx) {
        tx.executeSql(tblQuery, [], function (tx, results) {
            //console.log(results);
            syncDatabase();
        }, function (tx, error) {
            console.log(error);
            $(".notification").jnotifyAddMessage({
                text: `Ocorreu um erro ao executar o procedimento.<br /><br />Descrição do erro: ${error.message}`,
                type: "error",
                permanent: false
            });
        });
    });
};

var removePostit = function (id) {
    var tblQuery = `DELETE FROM postits WHERE id = '${id}';`;
    db.transaction(function (tx) {
        tx.executeSql(tblQuery, [], function (tx, results) {
            //console.log(results);
        }, function (tx, error) {
            console.log(error);
            $(".notification").jnotifyAddMessage({
                text: `Ocorreu um erro ao executar o procedimento.<br /><br />Descrição do erro: ${error.message}`,
                type: "error",
                permanent: false
            });
        });
    });
};

var restoreSession = function () {
    db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM postits", [], function (tx, results) {
            if (results.rows.length > 0) {
                $.each(results.rows, function (index, value) {
                    createPostit(value);
                });
            }
        }, function (tx, error) {
            console.log(error);
            $(".notification").jnotifyAddMessage({
                text: `Ocorreu um erro ao executar o procedimento.<br /><br />Descrição do erro: ${error.message}`,
                type: "error",
                permanent: false
            });
        });
    });
};

//Save Database Online
var syncDatabase = function () {
    if ($("body").data("userprofile")) {
        websqldump.export({
            database: "db_postit",
            table: "postits",
            dataonly: true,
            success: function (sql) {
                $.ajax({
                    method: "POST",
                    url: "save.php",
                    data: {
                        action: "save",
                        userid: $("body").data("userprofile").userid,
                        dumpdatabase: String(sql)
                    }
                }).done(function (data) {
                    console.log(data);
                }).fail(function (jqXHR, textStatus) {
                    $(".notification").jnotifyAddMessage({
                        text: `Ocorreu um erro ao executar o procedimento.<br /><br />Descrição do erro: ${textStatus}`,
                        type: "error",
                        permanent: false
                    });
                });
            },
            error: function (msg) {
                console.log(msg);
            }
        });
    }
}

var restoreDatabaseFromServer = function () {
    db.transaction(function (tx) {
        tx.executeSql("DELETE FROM postits", [], function (tx, results) {
            $.ajax({
                method: "POST",
                url: "save.php",
                data: {
                    action: "read",
                    userid: $("body").data("userprofile").userid,
                    dumpdatabase: ""
                }
            }).done(function (data) {
                var windows = data.split("|;").length - 1;
                var restoredWindows = 0;
                $.each(data.split("|;"), function (i, val) {
                    if (val != "") {
                        db.transaction(function (tx) {
                            tx.executeSql(String($.trim(val)), [], function (tx, results) {
                                restoredWindows++;
                            }, function (tx, error) {
                                console.log(error);
                            });
                        });
                    }
                });
                var prepareWindows = setInterval(function () {
                    if (restoredWindows >= windows) {
                        $("._area").empty();
                        restoreSession();
                        clearInterval(prepareWindows);
                        $(".notification").jnotifyAddMessage({
                            text: "Restaurado dados sincronizados no servidor.",
                            type: "success",
                            permanent: false
                        });
                    }
                }, 100);
            }).fail(function (jqXHR, textStatus) {
                console.log(`Request failed: ${textStatus}`);
            });
        }, function (tx, error) {
            console.log(error);
        });
    });
}