var getJSON = function(filename){
    return $.ajax(filename, {
        contentType:'application/json',
        type: 'GET'
    });
}

var patchJSON = function(filename, obj){
    return $.ajax(filename, {
        contentType:'application/json',
        type:'PATCH',
        data: JSON.stringify(obj)
    });
}

var postJSON = function(filename, obj){
    return $.ajax(filename, {
        contentType:'application/json',
        type:'POST',
        data: JSON.stringify(obj)
    });
}

module.exports = {
    getJSON: getJSON,
    patchJSON: patchJSON,
    postJSON: postJSON
};
