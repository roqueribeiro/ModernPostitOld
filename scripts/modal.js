(function($) {

    $.swOpenDynamicModal = function(options) {

        var defaults = {
            title: "",
            content: "",
            buttons: {},
            closeid: ""
        };
        var settings = $.extend({}, defaults, options);
        var callbacks = $.Callbacks();
        var guid = Math.random().toString(30).replace(".", "");

        if (settings.closeid) {
            closeEffect(settings.closeid);
        }
        else {
            $("<div>", { 'id': guid, 'class': "modal" }).appendTo("body");
            $("<div>", { 'class': "modal-box" }).appendTo(".modal#" + guid);
            $("<div>", { 'class': "modal-content" }).appendTo(".modal#" + guid + " .modal-box");
            $("<content>").appendTo(".modal#" + guid + " .modal-content");
            $("<header>", { 'html': settings.title }).appendTo(".modal#" + guid + " content");
            $("<main>", { 'html': settings.content }).appendTo(".modal#" + guid + " content");
            $("<footer>").appendTo(".modal#" + guid + " content");

            var btnguid;
            var btnclass;
            if (settings.buttons.main) {
                btnguid = Math.random().toString(30).replace(".", "");
                btnclass = settings.buttons.main.btnclass;
                btnclass = !btnclass ? "btn-link" : btnclass;

                $("<button>", {
                    'id': btnguid,
                    'data-id': guid,
                    'text': settings.buttons.main.btntext,
                    'class': "btn " + btnclass
                }).appendTo(".modal#" + guid + " footer");

                $(".modal#" + guid + " button#" + btnguid).click(function(e) {
                    e.preventDefault();
                    callbacks.add(settings.buttons.main.callback);
                    callbacks.fire($(this));
                    callbacks.remove(settings.buttons.main.callback);
                });
            }

            if (settings.buttons.cancel) {
                btnguid = Math.random().toString(30).replace(".", "");
                btnclass = settings.buttons.cancel.btnclass;
                btnclass = !btnclass ? "btn-link" : btnclass;

                $("<button>", {
                    'id': btnguid,
                    'data-id': guid,
                    'text': settings.buttons.cancel.btntext,
                    'class': "btn " + btnclass
                }).appendTo(".modal#" + guid + " footer");

                $(".modal#" + guid + " button#" + btnguid).click(function(e) {
                    e.preventDefault();
                    callbacks.add(settings.buttons.cancel.callback);
                    callbacks.fire($(this));
                    callbacks.remove(settings.buttons.cancel.callback);
                });
            }

            if (settings.buttons.confirm) {
                btnguid = Math.random().toString(30).replace(".", "");
                btnclass = settings.buttons.confirm.btnclass;
                btnclass = !btnclass ? "btn-link" : btnclass;

                $("<button>", {
                    'id': btnguid,
                    'data-id': guid,
                    'text': settings.buttons.confirm.btntext,
                    'class': "btn " + btnclass
                }).appendTo(".modal#" + guid + " footer");

                $(".modal#" + guid + " button#" + btnguid).click(function(e) {
                    e.preventDefault();
                    callbacks.add(settings.buttons.confirm.callback);
                    callbacks.fire($(this));
                    callbacks.remove(settings.buttons.confirm.callback);
                });
            }

            openEffect(guid);

        }

        function openEffect(id) {
            $("#" + id).show(0, function() {

                $(this).transition({ opacity: 0 }, 0).transition({ opacity: 1 }, 300);

                $(this).find("content:first").transition({
                    scale: [0.5]
                }, 0).transition({
                    scale: [1.0]
                }, 300, "easeOutCubic");

            });
        }

        function closeEffect(id) {

            $("#" + id).transition({
                opacity: 0
            }, 300, function() {
                $(this).remove();
            });

            $("#" + id).find("content:first").transition({
                scale: [0.2],
                opacity: 0
            }, 300, "easeInBack");

        }

    };

})(jQuery);
