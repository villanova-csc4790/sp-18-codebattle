const express = require('express');
var app = express();
var bodyParser = require('body-parser');

const {java} = require('compile-run');
var urlencodedParser = bodyParser.urlencoded({ extended: false})

app.use(express.static('Static'));


app.get('/', function (req, res) {
  res.sendFile('/index.html');
})


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
	    //	if (obj.exitCode == 1) {
	    //		res.send('Compilation failed')
	    //	} else {
	    //		res.send(obj.stdout);
	    //	}
	    //})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})