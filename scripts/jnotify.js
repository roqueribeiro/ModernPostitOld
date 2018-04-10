(function ($) {

    $.fn.jnotifyInizialize = function (options) {
        const defaults = {
            oneAtTime: false,
            appendType: "prepend"
        };
        options = $.extend({}, defaults, options);
        this.addClass("notify-wrapper");
        if (options.oneAtTime) this.addClass("notify-wrapper-oneattime");
        if (options.appendType === "prepend" && options.oneAtTime === false) this.addClass("notify-wrapper-prepend");
        return this;
    };

    $.fn.jnotifyAddMessage = function (options) {

        const notifyWrapper = this;

        function remove(obj) {

            obj.transit({ opacity: "0", y: "-50px" }, 400, "easeInQuad");

            obj.parent().animate({ height: "0px" }, 600, function () { obj.parent().remove(); });

        }

        if (notifyWrapper.hasClass("notify-wrapper")) {

            const defaults = {
                text: "",
                type: "",
                permanent: false,
                disappearTime: 5000
            };
            options = $.extend({}, defaults, options);
            let styleClass;

            switch (options.type) {
                case "info":
                    styleClass = "alert-info";
                    break;
                case "success":
                    styleClass = "alert-success";
                    break;
                case "warning":
                    styleClass = "alert-warning";
                    break;
                case "error":
                    styleClass = "alert-danger";
                    break;
                default:
                    styleClass = "alert-success";
                    break;
            }

            if (notifyWrapper.hasClass("notify-wrapper-oneattime")) {
                this.children().remove();
            }

            const notifyItemWrapper = $("<div />", { "class": "jnotify-item-wrapper" });
            var notifyItem = $("<div />", { "class": "alert" }).addClass(styleClass);

            if (notifyWrapper.hasClass("notify-wrapper-prepend")) {
                notifyItem.prependTo(notifyWrapper);
                notifyWrapper.find(".alert:last").hide().fadeIn(400);
            } else {
                notifyItem.appendTo(notifyWrapper);
                notifyWrapper.find(".alert:last").hide().fadeIn(400);
            }

            notifyItem.wrap(notifyItemWrapper);
            $("<span />").html(options.text).appendTo(notifyItem);

            $("<button />", {
                "type": "button",
                "class": "close",
                "html": "&times;"
            }).prependTo(notifyItem).click(function () {
                remove(notifyItem);
            });

            if (!options.permanent) {
                setTimeout(function () {
                    remove(notifyItem);
                }, options.disappearTime);
            }
        }
    };

})($);