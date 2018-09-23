


var myCodeMirror = CodeMirror(document.body, {
    value: "public class CodeBattles{\n\t public static void main (String[] args){\n\n\t}\n}",
    mode:  "text/x-java",
    lineNumbers: true,
    matchBrackets: true,
    autoCloseBrackets: true,
  });

  document.getElementById("submit_code").addEventListener("click", function(){
    
   var blob = new Blob([myCodeMirror.getValue()], {type: "text/plain;charset=utf-8"});
   saveAs(blob,"code.java");
  
  }) 
 