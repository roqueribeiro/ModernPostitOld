var max_zindex = function () {
    var window_zindex = [];
    $.each($("._area").find("._postit"), function (index, value) {
        _getzindex = ($(value).css("z-index") == "auto") ? 0 : $(value).css("z-index");
        window_zindex.push(_getzindex);
    });
    return Math.max.apply(Math, window_zindex);
};

var uuid = function () {
    var buf = new Uint32Array(4);
    window.crypto.getRandomValues(buf);
    var idx = -1;
    return "xxxxxxxxxxxx4xxy".replace(/[xy]/g, function (c) {
        idx++;
        var r = (buf[idx >> 3] >> ((idx % 8) * 4)) & 15;
        var v = c == "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

var rgb2hex = function (rgb) {
    if (rgb.search("rgb") == -1) {
        return rgb;
    }
    else if (rgb == "rgba(0, 0, 0, 0)") {
        return "transparent";
    }
    else {
        rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);

        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }
};
