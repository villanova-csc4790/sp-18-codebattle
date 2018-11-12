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
    con.query("UPDATE Attempt Set SourceCode ='"+input.source+"' WHERE AttemptId="+req.body.attemptid, function(err,result,fields){
    	if(err) throw err;
    });

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
                
            	if(actualoutput == expectedoutput || actualoutput == expectedoutput + '\n')
            	{
            		var ed = new Date();
            		endtime = ed.getTime();
            	 	con.query("UPDATE Attempt Set EndTime ="+endtime+" WHERE AttemptId="+req.body.attemptid+" AND EndTime IS NULL", function(err,result,fields){
    				if(err) throw err;
   				 	});
            	 	con.query("SELECT StartTime, EndTime, Attempts, Problem, username FROM Attempt WHERE AttemptId="+req.body.attemptid, function(err, result, fields){
            	 		var totaltime =  (result[0].EndTime-result[0].StartTime)+(result[0].Attempts-1)*300000;
            	 		Minutes = totaltime/60000;
            	 		Minutes = +Minutes.toFixed(2);
            	 		con.query("SELECT username, EndTime-StartTime+(Attempts-1)*300000 AS totaltime FROM Attempt WHERE Problem=" + result[0].Problem + " ORDER BY totaltime ASC LIMIT 10", function(err,result2,fields){
            	 			if(err) throw err;
            	 			for(var i =0;i<result2.length;i++){
            	 				var temp = result2[i].totaltime/60000;
            	 				temp = +temp.toFixed(2);
            	 				result2[i].totaltime = temp;
            	 			}
   				 			res.render("SubmittedSuccess", {time: Minutes, username: result[0].username, problem: result[0].Problem, leaders:result2});            	 			
            	 		});
            	 	});

            	}
            	else
                res.render("SubmittedFail",{error:"Wrong Answer", AttemptId: req.body.attemptid, username: req.body.username})
            	});
            }
            else
                res.render('SubmittedFail',{error: "Compilation Failed", AttemptId: req.body.attemptid, username: req.body.username});
            
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
app.get('/leaderboard/:pnum', function(req, res){
	var pnum = parseInt(req.params.pnum)
	var selected;
	con.query("SELECT title FROM problem WHERE ProblemId="+pnum, function(err, result, fields){
		if(err) throw err
			selected = result[0].title;
	});

	con.query("SELECT username, EndTime-StartTime+(Attempts-1)*300000 AS totaltime FROM Attempt WHERE Problem="+pnum+" ORDER BY totaltime ASC", function(err,result2,fields){
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
		con.query("INSERT INTO Attempt(username,Problem,StartTime,Attempts) VALUES('"+username+"',"+pnum+", "+starttime+", 1)", function(err,result,fields) {
		if (err) throw err
		console.log(result)
		attemptid = result.insertId;
		});
	}

	else{
		con.query("UPDATE Attempt SET Attempts=Attempts+1 WHERE AttemptId="+attemptid, function(err, result, fields){
			if(err) throw err
		});
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



