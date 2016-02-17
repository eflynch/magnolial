var _ = require('underscore');

var ajax = require('./ajax');

var userfolder = window.location.hash.slice(1);
var preferencesFile = '~/.magnolial/magnolial.prefs';
var configFile = '~/.magnolial/magnolial.rc';


var writeToFile = function (filename, obj){
    if (filename[0] === '~'){
        filename = userfolder + filename.slice(1);
    }
    fs.writeFile(filename, JSON.stringify(obj)); 
}

var readFromFile = function (filename){
    if (filename[0] === '~'){
        filename = userfolder + filename.slice(1);
    }
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

var fileGet = function(filename, onSuccess, onFailure){
    try {
        var file = readFromFile(filename);
    } catch (e){
        if (e.code != 'ENOENT'){throw e;}
        var error = {
            nodeError: e,
            status: 404
        }
        return onFailure(error); 
    }

    return onSuccess(file);
}

var get = function(filename, onSuccess, onFailure){
    if (filename.substring(0,7) === "http://"){
        ajax.getJSON(filename)
        .done(onSuccess)
        .fail(onFailure);
    } else {
        fileGet(filename, onSuccess, onFailure); 
    }
}

var patch = function(filename, obj, onSuccess, onFailure){
    if (onSuccess === undefined){onSuccess = function(){};}
    if (onFailure === undefined){onFailure = function(){};}
    if (filename.substring(0,7) === "http://"){
        ajax.patchJSON(filename, obj)
        .done(onSuccess)
        .fail(onFailure); 
    } else {
        try {
            writeToFile(filename, obj);
        } catch (e){
            if (e.code != 'ENOENT'){throw e;}
            var error = {
                nodeError: e,
                status: 404
            }
            return onFailure(error);
        }
        return onSuccess();
    } 
}

var post = function(filename, obj, onSuccess, onFailure){
    if (onSuccess === undefined){onSuccess = function(){};}
    if (onFailure === undefined){onFailure = function(){};}
    if (filename.substring(0,7) === "http://"){
        ajax.postJSON(filename, obj)
        .done(onSuccess)
        .fail(onFailure);
    } else {
        try {
            writeToFile(filename, obj);
        } catch (e){
            if (e.code != 'ENOENT'){throw e;}
            var error = {
                nodeError: e,
                status: 404
            }
            return onFailure(error);
        }
        return onSuccess();
    }
}

var getPrefs = function(){
    try {
        var preferences = readFromFile(preferencesFile);
    } catch (e){
        if (e.code != 'ENOENT'){throw e;}
        var preferences = {lastReadA: "~/Desktop/untitled.mgl", lastReadB: ""};
        writeToFile(preferencesFile, preferences);
    }
    if (preferences === undefined){
        preferences = {lastReadA: "~/Desktop/untitled.mgl", lastReadB: ""};
        writeToFile(preferencesFile, preferences);
    }
    return preferences;
}

var updatePrefs = function(preferences){
    if (!fs.existsSync(userfolder + "/.magnolial")){
        fs.mkdirSync(userfolder + "/.magnolial");
    }

    var oldPreferences = getPrefs();
    _.extend(oldPreferences, preferences);
    writeToFile(preferencesFile, oldPreferences);
}

var getConfig = function(){
    try {
        var config = readFromFile(configFile);
    } catch (e){
        if (e.code != 'ENOENT'){throw e;}
        var config = {useVim: true};
        writeToFile(configFile, config);
    }
    if (config === undefined){
        var config = {useVim: true};
        writeToFile(configFile, config);
    }
    return config;
}

var writeConfig = function(config){
    writeToFile(configFile, config);
}

var sync = function(aFilename, bFilename, onSuccess, onFailure){
    get(aFilename, function(dataA){
        get(bFilename, function(dataB){
            var dataSynced = {};
            if (dataA.timestamp > dataB.timestamp){
                dataSynced.trunk = dataA.trunk;
            } else {
                dataSynced.trunk = dataB.trunk;
            }
            dataSynced.timestamp = Date.now();
            patch(aFilename, dataSynced,function(){
                patch(bFilename, dataSynced, onSuccess, onFailure);
            }, onFailure);
        },onFailure);
    },onFailure);
}

module.exports = {
    get: get,
    post: post,
    patch: patch,
    sync: sync,
    getPrefs: getPrefs,
    updatePrefs: updatePrefs,
    getConfig: getConfig,
    writeConfig: writeConfig
}
