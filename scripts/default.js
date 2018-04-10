document.addEventListener("DOMContentLoaded", function () {
    $(".preloader").transit({
        'opacity': 0
    }, 300, function () {
        $(this).hide();
        gapiAuthUser();
    });
});

$(document).ready(function () {

    $(".notification").jnotifyInizialize({
        oneAtTime: false,
        appendType: "append"
    });

    $("._area").on("DOMNodeInserted", function (e) {
        const postit = $(this).find("._postit").last();

        postit.draggable({
            handle: "._postit_header_move",
            containment: "parent",
            scroll: false,
            iframeFix: true,
            stack: "div",
            distance: 0,
            start: function () {
                $(this).css("opacity", "1");
                $("._area ._postit").not(this).css("opacity", "0.4");
                $(this).find("._postit_content").hide();
                $(this).css("box-shadow", "0 20px 40px rgba(0, 0, 0, 0.4)");
            },
            stop: function () {
                $("._area ._postit").css("opacity", "1");
                $("._area ._postit").css("opacity", "1");
                $(this).find("._postit_content").show();
                $(this).css("box-shadow", "0 2px 8px rgba(0, 0, 0, 0.6)");
                savePostitData();
            }
        }).resizable({
            containment: "parent",
            helper: "ui-resizable-helper",
            scroll: false,
            resize: function (event, ui) {
                $(this).css({ "z-index": max_zindex() + 1 });
                $(".ui-resizable-helper").css({ "z-index": max_zindex() + 1 });
                $(".ui-resizable-helper").html($("<p />", {
                    "html": `L: ${$(".ui-resizable-helper").width()}px A: ${$(".ui-resizable-helper").height()}px`
                }));
            },
            stop: function (event, ui) {
                savePostitData();
            }
        });

        tinymce.init({
            selector: "._postit_content",
            inline: true,
            theme: "modern",
            plugins: [
                "advlist autolink link image lists print anchor",
                "searchreplace wordcount visualblocks visualchars fullscreen media",
                "table contextmenu directionality emoticons textcolor paste textcolor colorpicker"
            ],
            toolbar1: "code | print | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify",
            toolbar2: "forecolor backcolor | bullist numlist | outdent indent | table",
            toolbar3: "fontselect fontsizeselect | link unlink image media",
            menubar: false,
            toolbar_items_size: "small"
        });

    });

    $(document).on("click", "._postit", function () {
        $(this).css({ "z-index": max_zindex() + 1 });
    });

    $(document).on("click", "._postit_header i", function () {
        var thispostit = $(this).parent().parent();
        if ($(this).data("action") == "postit-hide") {
            thispostit.find("._postit_content").hide();
            thispostit.transit({
                'opacity': 0,
                'y': 40
            }, 300, "easeInBack", function () {
                thispostit.transit({ 'y': 0 }, 0);
                thispostit.addClass("minimized");
                savePostitData();
            });
        }
        else if ($(this).data("action") == "postit-color") {
            if (thispostit.find(".postit-color-menu").length == 0) {
                $("<div />", {
                    'class': "postit-color-menu",
                    'style': `background: ${thispostit.css("background")}`,
                    'html': [
                        $("<ul />", {
                            'html': [
                                $("<li />", {
                                    'data-color': "#ffffff"
                                }).css({ 'background': "#ffffff" }),
                                $("<li />", {
                                    'data-color': "#ffffe6"
                                }).css({ 'background': "#ffffe6" }),
                                $("<li />", {
                                    'data-color': "#ffebe6"
                                }).css({ 'background': "#ffebe6" }),
                                $("<li />", {
                                    'data-color': "#e6ffe6"
                                }).css({ 'background': "#e6ffe6" }),
                                $("<li />", {
                                    'data-color': "#e6f2ff"
                                }).css({ 'background': "#e6f2ff" })
                            ]
                        })
                    ]
                }).appendTo(thispostit);
                thispostit.find(".postit-color-menu").hide().fadeIn("fast");
            }
            else {
                thispostit.find(".postit-color-menu").fadeOut("fast", function () {
                    $(this).remove();
                });
            }
        }
        else if ($(this).data("action") == "postit-remove") {
            thispostit.find("._postit_content").hide();
            thispostit.transit({
                'opacity': 0,
                'scale': [0, 0]
            }, 300, "easeInBack", function () {
                $(this).remove();
                removePostit($(this).prop("id"));
            });
        }
    });

    $(document).on("click", ".postit-color-menu li", function () {
        $(this).parent().parent().css({
            'background': $(this).data("color")
        });
        $(this).parent().parent().parent().css({
            'background': $(this).data("color")
        });
        $(this).parent().parent().fadeOut("fast", function () {
            $(this).remove();
            savePostitData();
        });
    });

    $("nav a").click(function () {
        var htmlContent;
        if ($(this).data("action") == "postit-create") {
            createPostit();
        }
        else if ($(this).data("action") == "postit-list") {
            htmlContent = $("<table />", {
                'id': "tmpMinimizedPostit",
                'html': $("<tbody />")
            });
            $.swOpenDynamicModal({
                title: "Lembretes Arquivados",
                content: htmlContent,
                buttons: {
                    cancel: {
                        btntext: "Fechar",
                        btnclass: "btn-link",
                        callback: function (element) {
                            $("._area ._postit").css("opacity", "1");
                            $.swOpenDynamicModal({
                                closeid: $(element).data("id")
                            });
                        }
                    }
                }
            });
            listMinimizedPostits();
        }
        else if ($(this).data("action") == "postit-account") {
            const userprofile = $("body").data("userprofile");
            if ([userprofile].length > 0) {
                const userId = userprofile.userid;
                const userName = userprofile.username;
                const userGivenName = userprofile.usergivenname;
                const userFamilyName = userprofile.userfamilyname;
                const userPhoto = userprofile.userphoto;
                const userEmail = userprofile.useremail;
                htmlContent = $("<div />", {
                    'class': "postit-account-box",
                    'html': [
                        $("<div />", {
                            'class': "postit-account-box-photo",
                            'html': $("<img />", { 'src': userPhoto })
                        }),
                        $("<div />", {
                            'class': "postit-account-box-details",
                            'html': [
                                $("<p />", {
                                    'class': "account-datails-name",
                                    'html': userName
                                }),
                                $("<p />", {
                                    'class': "account-datails-email",
                                    'html': userEmail
                                })
                            ]
                        }),
                        $("<div />", {
                            'class': "postit-account-box-navigation",
                            'html': $("<button />", { 'html': "Desconectar", 'onclick': "gapiLogout();" })
                        })
                    ]
                });
                $.swOpenDynamicModal({
                    title: "Gerênciamento de Contas",
                    content: htmlContent,
                    buttons: {
                        cancel: {
                            btntext: "Fechar",
                            btnclass: "btn-link",
                            callback: function (element) {
                                $.swOpenDynamicModal({
                                    closeid: $(element).data("id")
                                });
                            }
                        }
                    }
                });
            }
        }
    });

    $(document).on("click", "#tmpMinimizedPostit tbody tr", function () {
        var thispostit = $("._area").find(`#${$(this).prop("id")}`);
        thispostit.removeClass("minimized");
        thispostit.click();
        listMinimizedPostits();
        thispostit.transit({
            'opacity': 0,
            'scale': [0, 0]
        }, 0).transit({
            'opacity': 1,
            'scale': [1, 1]
        }, 300, "easeOutCubic", function () {
            thispostit.find("._postit_content").show();
            savePostitData();
        });
    });

    $(document).on("keyup", "._postit_header input", function () {
        savePostitData();
    });

    restoreSession();

});

var listMinimizedPostits = function () {
    $("#tmpMinimizedPostit tbody").empty();
    if ($("._area").find(".minimized").length > 0) {
        jQuery.fn.reverse = [].reverse;
        $.each($("._area").find("._postit").reverse(), function (index, value) {
            const title = $(value).find("._postit_header input").val();
            if ($(value).hasClass("minimized")) {
                $("<tr />", {
                    'id': $(value).prop("id"),
                    'html': [
                        $("<td />", {
                            'html': $("<span />").css({
                                'background': $(value).css("background")
                            })
                        }),
                        $("<td />", {
                            'html': (title != "" ? title : "<i style='color:#CCCCCC;'>Sem Título</i>")
                        }),
                        $("<td />", {
                            'html': moment($(value).data("timestamp"), "YYYYMMDDHHmmss").locale("pt-br").fromNow()
                        })
                    ]
                }).appendTo("#tmpMinimizedPostit tbody");
            }
        });
    }
    else {
        $("<tr />", {
            'html': [
                $("<td />", { 'class': "table-empty", 'html': "Não há lembretes arquivados." })
            ]
        }).appendTo("#tmpMinimizedPostit tbody");
    }
};

var createPostit = function (restoreData) {

    var id = uuid();
    var title = "";
    var content = "";
    var color = "#ffffff";
    var state = "";
    var zindex = max_zindex() + 1;
    var w = 300;
    var h = 300;
    var x = $("._area").width() / 2 - w / 2;
    var y = $("._area").height() / 2 - h / 2;
    var dt = parseInt(moment().format("YYYYMMDDHHmmss"));

    if (restoreData) {
        id = restoreData.id;
        title = restoreData.title;
        content = restoreData.content;
        color = restoreData.color;
        state = restoreData.state;
        zindex = restoreData.zindex;
        w = restoreData.w;
        h = restoreData.h;
        x = restoreData.x;
        y = restoreData.y;
        dt = restoreData.dt;
    }

    $("<div />", {
        'id': id,
        'class': `_postit ${state}`,
        'data-timestamp': dt,
        'html': [
            $("<div />", {
                'class': "_postit_header",
                'html': [
                    $("<div />", {
                        'class': "_postit_header_move"
                    }),
                    $("<input />", {
                        'type': "text",
                        'name': "title",
                        'value': decodeURI(decodeURI(title)),
                        'placeholder': "Digite um título...",
                        'maxlength': "100"
                    }),
                    $("<i />", {
                        'class': "fa fa-paint-brush",
                        'data-action': "postit-color"
                    }),
                    $("<i />", {
                        'class': "fa fa-window-minimize",
                        'data-action': "postit-hide"
                    }),
                    $("<i />", {
                        'class': "fa fa-trash",
                        'data-action': "postit-remove"
                    })
                ]
            }),
            $("<div />", {
                'class': "_postit_content",
                'html': decodeURI(decodeURI(content))
            })
        ]
    }).appendTo("._area");

    var thispostit = $(`#${id}`);
    if (!restoreData) {
        zindex = max_zindex() + 1;
        w = thispostit.width();
        h = thispostit.height();
        x = $("._area").height() / 2 - h / 2;
        y = $("._area").width() / 2 - w / 2;
        addNewPostit(id, "", "", color, "", zindex, w, h, x, y, dt);
    }

    thispostit.css({
        "backgroundColor": color,
        "width": parseInt(w),
        "height": parseInt(h),
        "top": parseInt(x),
        "left": parseInt(y),
        "z-index": parseInt(zindex)
    });

    thispostit.transit({
        'opacity': 0,
        'scale': [0, 0]
    }, 0).transit({
        'opacity': 1,
        'scale': [1, 1]
    }, 300, "easeOutCubic");
};

var savePostitData = function () {
    $.each($("._area").find("._postit"), function (index, value) {
        const id = $(value).prop("id");
        const title = $(value).find("._postit_header input").val();
        const content = $(value).find("._postit_content").html();
        const color = rgb2hex($(value).css("backgroundColor"));
        const state = ($(value).hasClass("minimized")) ? "minimized" : "";
        const zindex = parseInt(($(value).css("z-index") == "auto") ? 0 : $(value).css("z-index"));
        const w = $(value).width();
        const h = $(value).height();
        const x = parseInt($(value).css("top"));
        const y = parseInt($(value).css("left"));

        updatePostitData(id, title, content, color, state, zindex, w, h, x, y);
    });
};

setInterval(function () {
    savePostitData();
    $(".notification").jnotifyAddMessage({
        text: "Sincronizado.",
        type: "info",
        disappearTime: 1000,
        permanent: false
    });
}, 100000);
