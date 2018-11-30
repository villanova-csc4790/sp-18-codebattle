function hintPenalty(){
      $.ajax({
        type: "POST",
        url: "/hint",
        data: {"attemptid" : $('#attemptid').val()}
       });
  }