const express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql')
const {java} = require('compile-run');
var urlencodedParser = bodyParser.urlencoded({ extended: false})
var myConnection  = require('express-myconnection')
var path = require('path');
var config = require('./config.js')
const url = require('url')
var router = express.Router();



var con = mysql.createConnection({
   host: config.database.host,
   user: config.database.user,
   password: config.database.password,
   port: config.database.port,
   database: config.database.db
    });

app.use(myConnection(mysql, con, 'pool'))
app.use(express.static('Static'));
app.set('view engine', 'jade');

app.post('/submitted/:pnum', urlencodedParser, function(req, res){
	var pnum = parseInt(req.params.pnum);
	console.log(pnum);
    input = {
        source:req.body.editor
    };
    con.query("SELECT test_case FROM problem WHERE id = 1", function (err, result, fields) {
     if (err) throw err;
     var testcaseString = result[0].test_case;
     var testcase = parseInt(testcaseString, 10)
 	

    let resultPromise = java.runSource(input.source, {stdin:testcase})
    resultPromise
        .then(result => {
            console.log(result);//result object
            if(result.exitCode == 0)
            {
            	con.query("SELECT expected_output FROM problem WHERE id = " + pnum, function (err, result1, fields) {
    			 if (err) throw err;
    			 //console.log(result1[0].expected_output)
     				var expectedoutput = result1[0].expected_output;
				 

            	var actualoutput = result.stdout
            	console.log(actualoutput.substring(actualoutput.length-2, actualoutput.length))
            	//if(actualoutput.substring(actualoutput.length-2, actualoutput.length)=="\\n")
            	//	actualoutput = actualoutput.substring(actualoutput.length-2, actualoutput.length);
            	if(actualoutput == expectedoutput || actualoutput == expectedoutput + '\n')
            	{
            		res.send('You got it!');
            	}
            	else
            		res.send('You suck.');
            	});
            }
            else
                res.send('Compilation Failed');
            
        })
        .catch(err => {
            console.log(err);
            res.send("Compilation Failed");
        });
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
con.connect(function(err) {
   if (err) throw err;
});
app.get('/problems', function(req, res){
   con.query("SELECT id, Title FROM problem", function (err, result, fields) {
     if (err) throw err;
      res.render('ProblemList', { problemList: result });
    });
    

})

app.get('/challenge/:pnum', function(req, res){
	var pnum = parseInt(req.params.pnum);
   con.query("SELECT description, Title FROM problem WHERE id = " + pnum, function (err, result, fields) {
     if (err) throw err;
     console.log(result)
      res.render('Description', { problemData: result });
    });
});



