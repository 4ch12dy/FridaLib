//       _        ___    ______    _     _       
//      (_)      / _ \  |  ____|  (_)   | |      
// __  ___  __ _| | | | | |__ _ __ _  __| | __ _ 
// \ \/ / |/ _` | | | | |  __| '__| |/ _` |/ _` |
//  >  <| | (_| | |_| | | |  | |  | | (_| | (_| |
// /_/\_\_|\__,_|\___/  |_|  |_|  |_|\__,_|\__,_|


// show java call stack
Java.stackid = 0;
function showCallstack(){
	function Where(stack){
		for(var i = 0; i < stack.length; ++i){
			send(stack[i].toString());
		}
	} 
	var threadef = Java.use('java.lang.Thread');
	var threadinstance = threadef.$new();
	var stack = threadinstance.currentThread().getStackTrace();
	send("=============================callstack============================="+ Java.stackid.toString());
	Java.stackid = Java.stackid + 1
	send("Full call stack:" + Where(stack));
}
