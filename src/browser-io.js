var _ = require('underscore');

var ajax = require('./ajax');


var get = function(filename, onSuccess, onFailure){
    if (filename.substring(0,7) === "http://"){
        ajax.getJSON(filename)
        .done(onSuccess)
        .fail(onFailure);
    } else {
        onFailure({status: 400});
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
        onFailure({status: 400});
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
        onFailure({status: 400});
    }
}

var getPrefs = function(){
    return {
        lastReadA:"http://localhost:5000/m/workflowy.mgl",
        lastReadB:"http://localhost:5000/m/workflowy.mgl"
    };
}

var updatePrefs = function(preferences){
}

var getConfig = function(){
}

var writeConfig = function(config){
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
