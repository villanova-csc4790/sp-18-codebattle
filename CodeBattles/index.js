


var myCodeMirror = CodeMirror(document.body, {
    value: "public class CodeBattles",
    mode:  "text/x-java",
    lineNumbers: true,
    matchBrackets: true,
    autoCloseBrackets: true,
  });

  document.getElementById("submit_code").addEventListener("click", function(){
    
   var blob = new Blob([myCodeMirror.getValue()], {type: "text/plain;charset=utf-8"});
   saveAs(blob,"code.java");
  
  }) 
 