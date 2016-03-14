var _ = require('underscore');
var ReadWriteLock = require('rwlock');

var ajax = require('./ajax');

var userfolder = window.location.hash.slice(1);
var preferencesFile = '~/.magnolial/magnolial.prefs';
var configFile = '~/.magnolial/magnolial.rc';

var lock = new ReadWriteLock();


var writeToFile = function (filename, obj){
    lock.writeLock(function (release){
        if (filename[0] === '~'){
            filename = userfolder + filename.slice(1);
        }
        fs.writeFileSync(filename, JSON.stringify(obj)); 
        release();
    });    
}

var readFromFile = function (filename, onSuccess, onFailure){
    lock.readLock(function (release){
        if (filename[0] === '~'){
            filename = userfolder + filename.slice(1);
        }
        try {
            var returnObj = JSON.parse(fs.readFileSync(filename, 'utf8'));
        } catch (e){
            if (e.code != 'ENOENT'){throw e;}
            var error = {
                nodeError: e,
                status: 404
            }
            release();
            return onFailure(error); 
        }
        release();
        onSuccess(returnObj);
    });    
}

var fileGet = function(filename, onSuccess, onFailure){
    readFromFile(filename, onSuccess, onFailure);
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

var getPrefs = function(callback){
    var onSuccess = function (preferences){
        if (preferences === undefined){
            preferences = {lastReadA: "~/Desktop/untitled.mgl", lastReadB: ""};
            writeToFile(preferencesFile, preferences);
        }
        callback(preferences);
    }

    var onFailure = function (error){
        var preferences = {lastReadA: "~/Desktop/untitled.mgl", lastReadB: ""};
        writeToFile(preferencesFile, preferences);
        callback(preferences);
    }

    readFromFile(preferencesFile, onSuccess, onFailure);
}

var updatePrefs = function(preferences){
    if (!fs.existsSync(userfolder + "/.magnolial")){
        fs.mkdirSync(userfolder + "/.magnolial");
    }

   getPrefs(function(oldPrefs){
        _.extend(oldPrefs, preferences);
        writeToFile(preferencesFile, oldPrefs);
    });
    
}

var getConfig = function(callback){
    var onSuccess = function(config){
        if (config === undefined){
            var config = {useVim: true};
            writeToFile(configFile, config);
        }
        callback(config);
    }

    var onFailure = function (error){
        var config = {useVim: true};
        writeToFile(configFile, config);
        callback(config);
    }

    readFromFile(configFile, onSuccess, onFailure);
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
