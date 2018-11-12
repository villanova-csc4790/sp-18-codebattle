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
    con.query("SELECT test_case FROM problem WHERE ProblemId = "+pnum, function (err, result, fields) {
     if (err) throw err;
     var testcase = result[0].test_case;

    let resultPromise = java.runSource(input.source, {stdin:testcase})
    resultPromise
        .then(result => {
            console.log(result);//result object
            if(result.exitCode == 0)
            {
            	con.query("SELECT expected_output FROM problem WHERE problemId = " + pnum, function (err, result1, fields) {
    			 if (err) throw err;
    			 //console.log(result1[0].expected_output)
     				var expectedoutput = result1[0].expected_output;
			       	var actualoutput = result.stdout

			       	console.log(expectedoutput)
			       	console.log(actualoutput)
                
            	if(actualoutput == expectedoutput || actualoutput == expectedoutput + '\n')
            	{
            	 res.render("SubmittedSuccess")
            	}
            	else
                res.render("SubmittedFail",{error:"Wrong Answer"})
            	});
            }
            else
                res.render('SubmittedFail',{error: "Compilation Failed"});
            
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
   con.query("SELECT ProblemId, title FROM problem", function (err, result, fields) {
     if (err) throw err;
      res.render('ProblemList', { problemList: result });
    });
    

})
app.get('/challenge/intro/:pnum', function(req,res){
	var pnum = parseInt(req.params.pnum);
	con.query("SELECT ProblemId, title FROM problem WHERE ProblemId = " + pnum, function (err, result, fields) {
		if (err) throw err
			res.render('Introduction', {problemTitle: result});
});
});

/*app.post('/username/:pnum', urlencodedParser, function(req,res){
	var username = req.body.username;
	var d = new Date();
	var starttime = d.getTime();
	con.query("INSERT INTO Attempts('username', 'Problem', 'StartTime', 'Attempts') VALUES('"+username+"',"+req.params.pnum+", "+starttime+", 1", function(err,result,fields) {
		if (err) throw err
	});
});
*/	

app.post('/challenge/:pnum', urlencodedParser, function(req, res){
	var pnum = parseInt(req.params.pnum);
	var username = req.body.username;
	var d = new Date();
	var starttime = d.getTime();
	con.query("INSERT INTO Attempt(username,Problem,StartTime,Attempts) VALUES('"+username+"',"+pnum+", "+starttime+", 1)", function(err,result,fields) {
		if (err) throw err
	});

    con.query("SELECT description, title FROM problem WHERE ProblemId = " + pnum, function (err1, result1, fields1) {
     if (err1) throw err1
     con.query("SELECT AttemptId, username FROM Attempt WHERE username='"+username+"' AND StartTime="+starttime, function(err2, result2, fields2){
     	if (err2) throw err2
     	      res.render('Description', { problemData: result1, attemptData: result2});
     });

    });
});



