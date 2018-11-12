function getLeaderboardURL(){
	$('#problemlist').find('li').click( function(){
	var elementclicked = ($(this).index()+1);
	location.href = "/leaderboard/" + elementclicked;
	});
}