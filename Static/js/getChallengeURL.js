function getChallengeURL(){
	var patharray = window.location.pathname.split('/');
	var ProblemID = patharray[patharray.length-1];
	document.Try_Again.action = "/challenge/" + ProblemID;
}
