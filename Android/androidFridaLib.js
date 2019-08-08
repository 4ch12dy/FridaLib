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
			XLOG(stack[i].toString());
		}
	} 
	var threadef = Java.use('java.lang.Thread');
	var threadinstance = threadef.$new();
	var stack = threadinstance.currentThread().getStackTrace();
	XLOG("=====================Callstack # " + Java.stackid.toString() + "========================");
	Java.stackid = Java.stackid + 1;
	XLOG(Where(stack));
}

// xia0 Frida Log
function XLOG(log) {
	console.log("[I]:" + log );
}

// xia0 frida java hook
// clz: class want to hook  methd: method of class callbackFunc: do your hook code
function xia0Hook(clz, methd, callbackFunc){
	clz[methd].implementation = function (){
		XLOG("xia0Hook # Hook class:"+ clz + " method:" + methd);
		
		var argc = arguments.length;
		for (var i = 0; i < argc; i++) {
			XLOG("xia0Hook # args[" + i + "]:"+ arguments[i]);
		}
		
		callbackFunc(arguments);
	}
}

XLOG("++++++++++++++++Android Frida Lib Loaded!✅++++++++++++++++");
