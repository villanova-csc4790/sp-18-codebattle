var spawn = require('child_process').spawn; 
var prc = spawn('javac',  ['programIJustCompiled'])
prc.stdout.setEncoding('utf8');
var data
function getData(data){
    this.data = data;
}
prc.stdout.on('data', function (data) { 
    var str = data.toString()   
    var lines = str.split(/(\r?\n)/g);
    //Write lines to your socket
});