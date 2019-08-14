//       _        ___    ______    _     _       
//      (_)      / _ \  |  ____|  (_)   | |      
// __  ___  __ _| | | | | |__ _ __ _  __| | __ _ 
// \ \/ / |/ _` | | | | |  __| '__| |/ _` |/ _` |
//  >  <| | (_| | |_| | | |  | |  | | (_| | (_| |
// /_/\_\_|\__,_|\___/  |_|  |_|  |_|\__,_|\__,_|

// Globe vars
Java.stackid = 0;
Java.debug = undefined;

// show java call stack
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
	console.log("[*]:" + log );
}

function XLibLOG(log) {
	if (Java.debug !== undefined && Java.debug) {
		console.log("[*]:" + log );
	}
}
/*
	xia0 frida java hook
	clz: class want to hook  methd: method of class callbackFunc: do your hook code
	callbackFunc: this , args
*/
function xia0SingleHook(clz, methd, callbackFunc){
	clz[methd].implementation = function (){
		XLibLOG("xia0Hook # ❇️ Hook the class:"+ clz + " method:" + methd );
		
		var argc = arguments.length;
		for (var i = 0; i < argc; i++) {
			XLibLOG("xia0Hook # args[" + i + "]:"+ arguments[i]);
		}

		var retv = null;
		
		switch (argc) {
			case 0:
				var newRetv = callbackFunc(this);
				if (newRetv !== undefined) {
					XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
					retv = newRetv;
				}else {
					retv = this[methd]();
				}
				break;
			case 1:
				var newRetv = callbackFunc(this, arguments[0]);
				if (newRetv !== undefined) {
					XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
					retv = newRetv;
				}else {
					retv = this[methd](arguments[0]);
				}
				break;
			case 2:
				var newRetv = callbackFunc(this, arguments[0], arguments[1]);
				if (newRetv !== undefined) {
					XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
					retv = newRetv;
				}else {
					retv = this[methd](arguments[0], arguments[1]);
				}
				break;
			case 3:
				var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2]);
				if (newRetv !== undefined) {
					XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
					retv = newRetv;
				}else {
					retv = this[methd](arguments[0], arguments[1], arguments[2]);
				}
				break;
			case 4:
				var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2], arguments[3]);
				if (newRetv !== undefined) {
					XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
					retv = newRetv;
				}else {
					retv = this[methd](arguments[0], arguments[1], arguments[2], arguments[3]);
				}
				break;
			case 5:
				var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
				if (newRetv !== undefined) {
					XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
					retv = newRetv;
				}else {
					retv = this[methd](arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
				}
				break;
			case 6:
				var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
				if (newRetv !== undefined) {
					XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
					retv = newRetv;
				}else {
					retv = this[methd](arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
				}
				break;
			case 7:
				var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
				if (newRetv !== undefined) {
					XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
					retv = newRetv;
				}else {
					retv = this[methd](arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
				}
				break;

			default:
				XLibLOG("xia0Hook # Hook class:"+ clz + " method:" + methd + " arguments count bigger than 7?");
				break;
		}
		
		return retv;
	}
}


/*

xia0 frida hook all overload class[func]
clz: class want to hook  methd: method of class callbackFunc: do your hook code
callbackFunc: this , args
	
*/

function xia0Hook(className, func, callbackFunc) {
	var clazz = Java.use(className);
	var overloads = clazz[func].overloads;
	for (var i in overloads) {
		if (overloads[i].hasOwnProperty('argumentTypes')) {		
			var parameters = [];
			
			var curArgumentTypes = overloads[i].argumentTypes;
			var args = [];
			
			for (var j in curArgumentTypes) {
				var cName = curArgumentTypes[j].className;
				parameters.push(cName);
				args.push('v' + j);
			}
			XLibLOG("xia0Hook # ❇️ Hook "+ className + "." + func  + "(" + parameters + ")");
			
			if (args.length > 7) {
				XLibLOG("xia0Hook # ❎ arguments size > 7, Will ignore your hook code!!!");
				var script = "var ret = this." + func + '(' + args.join(',') + ") || '';\n"
					+ "XLibLOG(\"xia0Hook # ⏰ Active "+ className + "." + func + "(" + parameters + "\");\n"
					+ 'var argc = arguments.length;\n'
					+ 'for (var i = 0; i < argc; i++) {\n'
					+ 'XLibLOG("xia0Hook # args[" + i + "]:"+ arguments[i]);\n'
					+ '}\n'
					+ 'XLibLOG("xia0Hook # retv:" + ret);\n'
					+ "return ret;"
				args.push(script);
				clazz[func].overload.apply(this, parameters).implementation = Function.apply(null, args);
				return;
			}
			
			clazz[func].overload.apply(this, parameters).implementation = function (){
				XLibLOG("xia0Hook # ⏰ Active "+ className + "." + func + "(" + parameters + ")");
				var argc = arguments.length;
				for (var i = 0; i < argc; i++) {
					XLibLOG("xia0Hook # args[" + i + "]:"+ arguments[i]);
				}
				
				var retv = null;
				
				switch (argc) {
					case 0:
						var newRetv = callbackFunc(this);
						if (newRetv !== undefined) {
							XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
							retv = newRetv;
						}else {
							retv = this[func]();
						}
						break;
					case 1:
						var newRetv = callbackFunc(this, arguments[0]);
						if (newRetv !== undefined) {
							XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
							retv = newRetv;
						}else {
							retv = this[func](arguments[0]);
						}
						break;
					case 2:
						var newRetv = callbackFunc(this, arguments[0], arguments[1]);
						if (newRetv !== undefined) {
							XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
							retv = newRetv;
						}else {
							retv = this[func](arguments[0], arguments[1]);
						}
						break;
					case 3:
						var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2]);
						if (newRetv !== undefined) {
							XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
							retv = newRetv;
						}else {
							retv = this[func](arguments[0], arguments[1], arguments[2]);
						}
						break;
					case 4:
						var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2], arguments[3]);
						if (newRetv !== undefined) {
							XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
							retv = newRetv;
						}else {
							retv = this[func](arguments[0], arguments[1], arguments[2], arguments[3]);
						}
						break;
					case 5:
						var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
						if (newRetv !== undefined) {
							XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
							retv = newRetv;
						}else {
							retv = this[func](arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
						}
						break;
					case 6:
						var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
						if (newRetv !== undefined) {
							XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
							retv = newRetv;
						}else {
							retv = this[func](arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
						}
						break;
					case 7:
						var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
						if (newRetv !== undefined) {
							XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
							retv = newRetv;
						}else {
							retv = this[func](arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
						}
						break;

					default:
						XLibLOG("xia0Hook # ❌ Faild "+ className + "." + func + "(" + parameters + ")");
						break;
				}
				
				return retv;
			}
		}
	}
}

/*	
	xia0NativeHook 
*/
function xia0NativeHook(moduleName, funcName, onEnterFunc, onLeaveFunc) {
	var funcPtr = Module.getExportByName(moduleName, funcName);
	if (funcPtr == null) {
		XLibLOG("xia0NativeHook # Can Not found module:" + moduleName +" func:" + funcName);
		return;
	}
	
	Interceptor.attach(funcPtr, {
		onEnter: function (args) {
			XLibLOG("xia0NativeHook # ⏰ ⏰ ⏰ onEnter \nModule:"+ moduleName + "\nfunc:" + funcName);
			
			onEnterFunc(args);
		},
		onLeave: function (retval) {
			XLibLOG("xia0NativeHook # ⏰ ⏰ ⏰ onLeave \nModule:"+ moduleName + "\nfunc:" + funcName);
			onLeaveFunc(retval);
		}
	});
}

XLOG("++++++++++++++++Android Frida Lib Loaded!✅++++++++++++++++");
