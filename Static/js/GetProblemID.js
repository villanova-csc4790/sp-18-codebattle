function getSubmittedURL(){
	var patharray = window.location.pathname.split('/');
	var ProblemID = patharray[patharray.length-1];
	document.user_code.action = "/submitted/" + ProblemID;
}
