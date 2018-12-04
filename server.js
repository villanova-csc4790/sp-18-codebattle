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
var async = require('async');

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
	var numCases = 0;
	var numPassed = 0;
	var TypeOfError;
	var wrong = false;
	var fail = false;

	con.query("UPDATE Attempt SET Attempts=Attempts+1 WHERE AttemptId="+req.body.attemptid, function(err, result, fields){
			if(err) throw err
		});

    input = {
        source:req.body.editor
    };

    con.query("UPDATE Attempt Set SourceCode ='"+input.source+"' WHERE AttemptId="+req.body.attemptid, function(err,result,fields){
    	if(err) throw err;
    });


    con.query("SELECT CaseId, Input FROM TestCases WHERE ProblemId = "+pnum+" ORDER BY CaseId", function (testerr, tests, fields) {
    	if(testerr) throw testerr;
    	numCases = tests.length;


    	async.eachSeries(tests, function(test, callback){
    		var testcase = test.Input;
    		var caseid = test.CaseId;
		    console.log(wrong+ " " + fail)
		   	if(wrong  == false && fail == false)
		   	{
		   		console.log(numPassed);

		    	let resultPromise = java.runSource(input.source, {stdin:testcase})
		    	resultPromise
	        	.then(result => {
	            	console.log(result);//result object
	      			console.log(tests);

	            	if(result.exitCode == 0)
	            	{
			        	con.query("SELECT expected_output FROM TestCases WHERE CaseId = "+caseid, function (err1, result1, fields) {
						 	if (err1) throw err1;
			 				var expectedoutput = result1[0].expected_output.replace(/[\n\r]/g, '');
					       	var actualoutput = result.stdout.replace(/[\n\r]/g, '');
			            	
			            	console.log(actualoutput);
			            	console.log(expectedoutput);
			        		if(actualoutput == expectedoutput || actualoutput == expectedoutput + '\n')
			        		{
			        			numPassed=numPassed+1;
								if(numPassed == numCases)
								{
									var ed = new Date();
									var endtime = ed.getTime();
									con.query("UPDATE Attempt Set EndTime ="+endtime+" WHERE AttemptId="+req.body.attemptid+" AND EndTime IS NULL", function(err2,result2,fields2){
										if(err2) throw err2;
									});

									con.query("SELECT StartTime, EndTime, Attempts, Problem, Penalties, username FROM Attempt WHERE AttemptId="+req.body.attemptid, function(err3, result3, fields3){
										if (err3) throw err3
										var totaltime =  (result3[0].EndTime-result3[0].StartTime)+(result3[0].Attempts-1)*300000+(result3[0].Penalties)*300000;
										Minutes = totaltime/60000;
										Minutes = +Minutes.toFixed(2);
													con.query("SELECT username, EndTime-StartTime+(Attempts-1)*300000+Penalties*300000 AS totaltime FROM Attempt WHERE Problem=" + pnum + " AND EndTime IS NOT NULL ORDER BY totaltime ASC LIMIT 10", function(err4,result4,fields4){
														if(err4) throw err4;
														for(var j =0;j<result4.length;j++){
															var temp = result4[j].totaltime/60000;
															temp = +temp.toFixed(2);
															result4[j].totaltime = temp;
														}
													res.render("SubmittedSuccess", {time: Minutes, username: result3[0].username, problem: result3[0].Problem, leaders:result4});            	 			
													});
										});
								}
								callback();
			        		}
			        		else if(result.errorType != null){
			        			fail = true;
			        			TypeOfError = result.errorType;
			        			res.render("SubmittedFail",{error: TypeOfError, AttemptId: req.body.attemptid, username: req.body.username, numPassed: numPassed, numCases: numCases, FailedInput: tests[numPassed].Input});
								callback(); 
							}
			            	
			            	else{
			            		wrong = true;
			            		res.render("WrongAnswer", {AttemptId: req.body.attemptid, username: req.body.username, numPassed: numPassed, numCases: numCases, FailedInput: tests[numPassed].Input});   
								callback(); 
			        		}    
			        		        	
			        	
			        	});
			        }
					else if(result.exitCode == 143)
			       		{
			       			fail = true;
			       			TypeOfError = 'Too Much Time';
			        		res.render("SubmittedFail",{error: TypeOfError, AttemptId: req.body.attemptid, username: req.body.username, numPassed: numPassed, numCases: numCases, FailedInput: tests[numPassed].Input});
							callback(); 
			       		}
			        else
			        {
			        	fail = true;
			        	TypeOfError = result.errorType;
			        	res.render("SubmittedFail",{error: TypeOfError, AttemptId: req.body.attemptid, username: req.body.username, numPassed: numPassed, numCases: numCases, FailedInput: tests[numPassed].Input});
						callback(); 
			        }    

			    })
			    .catch(err => {
			        console.log(err);
			        res.send("Compiler Error");
			        callback(); 

			    });
			}
			else{
				callback();
			}
    	})
   });             
})

app.listen(3000, function () {
 console.log('Example app listening on port 3000!')
})

con.connect(function(err) {
   if (err) throw err;
});

app.post('/hint', urlencodedParser, function(req,res){
	console.log(req)
	con.query("UPDATE Attempt SET Penalties = Penalties+1 WHERE AttemptId="+req.body.attemptid, function(err, result, fields){
		if(err) throw err
	}) 	
});

app.get('/problems', function(req, res){
   con.query("SELECT ProblemId, title FROM problem", function (err, result, fields) {
    	if (err) throw err;
    	con.query("SELECT Problem, IFNULL(SUM(Attempts),0) AS Tries FROM Attempt GROUP BY Problem ORDER BY Problem", function(err1,result1,fields1){
     		if(err1) throw err1;
     		con.query("SELECT Problem, COUNT(AttemptId) AS Successes, MIN(EndTime-StartTime+(Attempts-1)*300000+Penalties*300000) AS TopTime FROM Attempt WHERE EndTime IS NOT NULL GROUP BY Problem ORDER BY Problem", function(err2,result2,fields2){
     			if(err2) throw err2;
     			for(var i =0;i<result2.length;i++){
        			var temp = result2[i].TopTime/60000;
        			temp = +temp.toFixed(2);
        			result2[i].TopTime = temp;
        		}
         		console.log(result2);

	     		res.render('ProblemList', { problemList: result, numTries: result1, numSuccess: result2});

     		});
    	});
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
app.get('/leaderboard/:pnum', function(req, res){
	var pnum = parseInt(req.params.pnum)
	var selected;
	con.query("SELECT title FROM problem WHERE ProblemId="+pnum, function(err, result, fields){
		if(err) throw err
			selected = result[0].title;
	});

	con.query("SELECT username, EndTime-StartTime+(Attempts-1)*300000+Penalties*300000 AS totaltime FROM Attempt WHERE Problem="+pnum+" AND EndTime IS NOT NULL ORDER BY totaltime ASC", function(err,result2,fields){
        if(err) throw err;
        for(var i =0;i<result2.length;i++){
        	var temp = result2[i].totaltime/60000;
        	temp = +temp.toFixed(2);
        	result2[i].totaltime = temp;
        }
        con.query("SELECT title FROM problem ORDER BY ProblemId ASC", function(err1,result1,fields1){
        	if(err) throw err
        	res.render("Leaderboard", {leaders:result2, problems: result1, curprob: selected});
        });

	});
});



app.post('/challenge/:pnum', urlencodedParser, function(req, res){
	var pnum = parseInt(req.params.pnum);
	var username = req.body.username;
	var attemptid = req.body.attemptid;
	var d = new Date();
	var starttime = d.getTime();
	
	if(attemptid == null){
		con.query("INSERT INTO Attempt(username,Problem,StartTime,Attempts) VALUES('"+username+"',"+pnum+", "+starttime+", 0)", function(err,result,fields) {
		if (err) throw err
		attemptid = result.insertId;
		});
	}

	else{
		
	}


    con.query("SELECT description, title FROM problem WHERE ProblemId = " + pnum, function (err1, result1, fields1) {
     if (err1) throw err1
     con.query("SELECT AttemptId, username, SourceCode FROM Attempt WHERE username='"+username+"' AND AttemptId="+attemptid, function(err2, result2, fields2){
     	if (err2) throw err2
     		Source = result2[0].SourceCode;
     		if(Source== null){
     			Source = "public class CodeBattles{\npublic static void main (String[] args){\n}}"
     		}

     	      res.render('Description', { problemData: result1, attemptData: result2, source: Source});
     });

    });
});



