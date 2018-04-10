const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const url = require("url");

const Menu = electron.Menu;
const Tray = electron.Tray;
const iconName = "favicon.ico";
const iconPath = path.join(__dirname, iconName);

let appIcon = null;
let mainWindow;

function createWindow() {

    mainWindow = new BrowserWindow({
        transparent: true,
        frame: false,
        skipTaskbar: true,
        movable: false,
        resizable: false,
        maximizable: false,
        minimizable: false,
        'node-integration': true,
        'web-preferences': {
            'javascript': true,
            'images': true,
            'direct-write': true,
            'experimental-features': true,
            'subpixel-font-scaling': true
        },
        icon: iconPath
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));

    mainWindow.maximize();

    mainWindow.on("closed", function () {
        mainWindow = null;
    });

    mainWindow.on("minimize", function (event) {
        event.preventDefault();
        mainWindow.hide();
    });

    appIcon = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Show",
            click: function () {
                mainWindow.show();
            }
        }, {
            label: "Hide",
            click: function () {
                mainWindow.hide();
            }
        }, {
            label: "Close",
            click: function () {
                app.quit();
            }
        }
    ]);

    appIcon.on("double-click", function () {
        if (mainWindow.isVisible()) mainWindow.hide(); else mainWindow.show();
    });

    appIcon.setToolTip("Modern Post-it");
    appIcon.setContextMenu(contextMenu);

    const electronGoogleOauth = require("electron-google-oauth");   
    const browserWindowParams = {
        'use-content-size': true,
        center: true,
        show: false,
        resizable: false,
        'always-on-top': true,
        'standard-window': true,
        'auto-hide-menu-bar': true,
        'node-integration': false
    };
    const googleOauth = electronGoogleOauth(browserWindowParams);

    (async () => {
        const authCode = await googleOauth.getAuthorizationCode(
            ["https://www.google.com/m8/feeds"],
            "642143382565-j6b4pmt6l2btqogs74g3o3ga9k28jbk4.apps.googleusercontent.com",
            "-nDE38i9uGXr6CxEb4WShF3U",
            "http://localhost:9090"
        );
        console.dir(authCode);
        const result = await googleOauth.getAccessToken(
            ["https://www.google.com/m8/feeds"],
            "642143382565-j6b4pmt6l2btqogs74g3o3ga9k28jbk4.apps.googleusercontent.com",
            "-nDE38i9uGXr6CxEb4WShF3U",
            "http://localhost:9090"
        );
        console.dir(result);
    })();

}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
    if (appIcon) appIcon.destroy();
});

app.on("activate", function () {
    if (mainWindow === null) {
        createWindow();
    }
});
