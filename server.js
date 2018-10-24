const express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql')
const {java} = require('compile-run');
var urlencodedParser = bodyParser.urlencoded({ extended: false})
var myConnection  = require('express-myconnection')
var path = require('path');
var config = require('./config.js')

var rootoption = {root: __dirname};

var con = mysql.createConnection({
   host: config.database.host,
   user: config.database.user,
   password: config.database.password,
   port: config.database.port,
   database: config.database.db
    });

app.use(myConnection(mysql, con, 'pool'))
app.use(express.static('Static'));
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.post('/submitted', urlencodedParser, function(req, res){
    input = {
        source:req.body.editor
    };
    let resultPromise = java.runSource(input.source);
    resultPromise
        .then(result => {
            console.log(result);//result object
            if(result.exitCode == 0)
                res.send(result.stdout);
            else
                res.send('Compilation Failed');

        })
        .catch(err => {
            console.log(err);
            console.log('Compilation Failed');
            res.send("Compilation Failed");
        });


        
})

        //app.get('/submitted', function (req, res) {
        //  if (obj.exitCode == 1) {
        //      res.send('Compilation failed')
        //  } else {
        //      res.send(obj.stdout);
        //  }
        //})

app.listen(3000, function () {
 console.log('Example app listening on port 3000!')
})

app.get('/problems', function(req, res){
	  con.connect(function(err) {
   if (err) throw err;
   con.query("SELECT id, Title FROM problem", function (err, result, fields) {
     if (err) throw err;
      res.render('StudentList', { problemList: result });
    });
    
 });
})
