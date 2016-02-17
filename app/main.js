var app = require('app');
var BrowserWindow = require('browser-window');

//require('crash-reporter').start({companyName:"ch.evanlyn"});

var mainWindow = null;

app.on('window-all-closed', function (){
    if (process.platform != 'darwin'){
        app.quit();
    }
});

app.on('ready', function (){
    mainWindow = new BrowserWindow({width: 800, height: 800});

    function getUserHome() {
      return process.env.HOME || process.env.USERPROFILE;
    }

    mainWindow.loadURL('file://' + __dirname + '/index.html#' + getUserHome());

    mainWindow.on('closed', function (){
        mainWindow = null;
    });
});
