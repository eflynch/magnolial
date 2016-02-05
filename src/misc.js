// openFile: function (){
//     if (remote === null || remote === undefined){return;}
//     var dialog = remote.require('dialog');
//     dialog.showOpenDialog(function (fileNames){
//         if (fileNames.length){
//             var root = readFromFile(fileNames[0]);
//             this.initializeTree(root);
//         }
//     }.bind(this));
// },
// saveFile: function (){
//     if (remote === null || remote === undefined){return;}
//     var dialog = remote.require('dialog');
//     dialog.showSaveDialog(function (fileName){
//         writeToFile(fileName, this.state.root);
//     }.bind(this));
// },

// var readFromFile = function (filename){
//     if (fs === null || fs === undefined){return;}
//     return JSON.parse(fs.readFileSync(filename, 'utf8'));
// }

// var writeToFile = function (filename, obj){
//     if (fs === null || fs === undefined){return;}
//     fs.writeFile(filename, JSON.stringify(obj)); 
// }