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
    // if (Java.debug !== undefined && Java.debug) {
        console.log("[*]:" + log );
    // }
}
/*
    xia0 frida java hook
    clz: class want to hook  methd: method of class callbackFunc: do your hook code
    callbackFunc: this , args
*/
function xia0SingleHook(className, methd, callbackFunc){
    var clz = Java.use(className);
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
                    XLibLOG("xia0Hook # orig ret:" + retv);
                }
                break;
            case 3:
                var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2]);
                if (newRetv !== undefined) {
                    XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
                    retv = newRetv;
                }else {
                    retv = this[methd](arguments[0], arguments[1], arguments[2]);
                    XLibLOG("xia0Hook # orig ret:" + retv);
                }

                break;
            case 4:
                var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2], arguments[3]);
                if (newRetv !== undefined) {
                    XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
                    retv = newRetv;
                }else {
                    retv = this[methd](arguments[0], arguments[1], arguments[2], arguments[3]);
                    XLibLOG("xia0Hook # orig ret:" + retv);
                }
                break;
            case 5:
                var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
                if (newRetv !== undefined) {
                    XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
                    retv = newRetv;
                }else {
                    retv = this[methd](arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
                    XLibLOG("xia0Hook # orig ret:" + retv);
                }
                break;
            case 6:
                var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
                if (newRetv !== undefined) {
                    XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
                    retv = newRetv;
                }else {
                    retv = this[methd](arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
                    XLibLOG("xia0Hook # orig ret:" + retv);
                }
                break;
            case 7:
                var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
                if (newRetv !== undefined) {
                    XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
                    retv = newRetv;
                }else {
                    retv = this[methd](arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
                    XLibLOG("xia0Hook # orig ret:" + retv);
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
                            XLibLOG("xia0Hook # orig ret:" + retv);
                        }
                        break;
                    case 1:
                        var newRetv = callbackFunc(this, arguments[0]);
                        if (newRetv !== undefined) {
                            XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
                            retv = newRetv;
                        }else {
                            retv = this[func](arguments[0]);
                            XLibLOG("xia0Hook # orig ret:" + retv);
                        }
                        break;
                    case 2:
                        var newRetv = callbackFunc(this, arguments[0], arguments[1]);
                        if (newRetv !== undefined) {
                            XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
                            retv = newRetv;
                        }else {
                            retv = this[func](arguments[0], arguments[1]);
                            XLibLOG("xia0Hook # orig ret:" + retv);
                        }
                        break;
                    case 3:
                        var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2]);
                        if (newRetv !== undefined) {
                            XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
                            retv = newRetv;
                        }else {
                            retv = this[func](arguments[0], arguments[1], arguments[2]);
                            XLibLOG("xia0Hook # orig ret:" + retv);
                        }
                        break;
                    case 4:
                        var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2], arguments[3]);
                        if (newRetv !== undefined) {
                            XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
                            retv = newRetv;
                        }else {
                            retv = this[func](arguments[0], arguments[1], arguments[2], arguments[3]);
                            XLibLOG("xia0Hook # orig ret:" + retv);
                        }
                        break;
                    case 5:
                        var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
                        if (newRetv !== undefined) {
                            XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
                            retv = newRetv;
                        }else {
                            retv = this[func](arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
                            XLibLOG("xia0Hook # orig ret:" + retv);
                        }
                        break;
                    case 6:
                        var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
                        if (newRetv !== undefined) {
                            XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
                            retv = newRetv;
                        }else {
                            retv = this[func](arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
                            XLibLOG("xia0Hook # orig ret:" + retv);
                        }
                        break;
                    case 7:
                        var newRetv = callbackFunc(this, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
                        if (newRetv !== undefined) {
                            XLibLOG("xia0Hook # replace origin retv with new retv:" + newRetv);
                            retv = newRetv;
                        }else {
                            retv = this[func](arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
                            XLibLOG("xia0Hook # orig ret:" + retv);
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


/*  
    xia0NativeHookByAddress
*/
function xia0NativeHookByAddress(moduleName, funcAddr, onEnterFunc, onLeaveFunc) {
    var libBaseAddr = Module.findBaseAddress(moduleName);
    if (!libBaseAddr) {
        XLibLOG("xia0NativeHookByAddress failed to get base address of "+ moduleName)
        return
    }
    var funcPtr = libBaseAddr.add(funcAddr)
    XLibLOG("xia0NativeHookByAddress # ❇️ hook " + moduleName+" libBase:" + libBaseAddr + " offset:" + ptr(funcAddr) + " funcAddr:" + funcPtr)
    Interceptor.attach(funcPtr, {
        onEnter: function (args) {
            XLibLOG("xia0NativeHookByAddress # ⏰ ⏰ ⏰ onEnter \n\tModule:"+ moduleName + "\tfunc:" + ptr(funcAddr));
            
            onEnterFunc(args);
        },
        onLeave: function (retval) {
            XLibLOG("xia0NativeHookByAddress # ⏰ ⏰ ⏰ onLeave \n\tModule:"+ moduleName + "\tfunc:" + ptr(funcAddr));
            onLeaveFunc(retval);
        }
    });
}

function showFields(obj){

    var fields = Java.cast(obj.getClass(),Java.use('java.lang.Class')).getDeclaredFields();
    if (fields.length > 0) {
        XLibLOG("========" + obj.$className + " fields" + "========")
    }
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        field.setAccessible(true);
        var name = field.getName();
        var value = field.get(obj);
        XLibLOG("\tFields[\""+name+"\"]:"+value);
    }
}

function bytes2String(data) {
    var buffer = Java.array('byte', data);
    var result = "";
    for(var i = 0; i < buffer.length; ++i){
        result += String.fromCharCode((buffer[i] & 0xff));
    }
    
    return result;
}

function string2Bytes(str) {
    var ch, st, re = []; 
    for (var i = 0; i < str.length; i++ ) { 
        ch = str.charCodeAt(i);  
        st = [];                 

        do {  
            st.push( ch & 0xFF );  
            ch = ch >> 8;          
        }    
        while ( ch );  
        re = re.concat( st.reverse() ); 
    }  
    return re;
}


// https://github.com/lasting-yang/frida_hook_libart/blob/master/hook_RegisterNatives.js
var ishook_libart = false;

function hookRegisterNatives(callBackFunc) {
    if (ishook_libart === true) {
        return;
    }
    var symbols = Module.enumerateSymbolsSync("libart.so");
    var addrGetStringUTFChars = null;
    var addrNewStringUTF = null;
    var addrFindClass = null;
    var addrGetMethodID = null;
    var addrGetStaticMethodID = null;
    var addrGetFieldID = null;
    var addrGetStaticFieldID = null;
    var addrRegisterNatives = null;
    var addrAllocObject = null;
    var addrCallObjectMethod = null;
    var addrGetObjectClass = null;
    var addrReleaseStringUTFChars = null;
    for (var i = 0; i < symbols.length; i++) {
        var symbol = symbols[i];
        if (symbol.name == "_ZN3art3JNI17GetStringUTFCharsEP7_JNIEnvP8_jstringPh") {
            addrGetStringUTFChars = symbol.address;
            XLibLOG("Found GetStringUTFChars:" + symbol.address +" " + symbol.name);
        } else if (symbol.name == "_ZN3art3JNI12NewStringUTFEP7_JNIEnvPKc") {
            addrNewStringUTF = symbol.address;
            XLibLOG("Found NewStringUTF:" + symbol.address +" " + symbol.name);
        } else if (symbol.name == "_ZN3art3JNI9FindClassEP7_JNIEnvPKc") {
            addrFindClass = symbol.address;
            XLibLOG("Found FindClass:" + symbol.address +" " + symbol.name);
        } else if (symbol.name == "_ZN3art3JNI11GetMethodIDEP7_JNIEnvP7_jclassPKcS6_") {
            addrGetMethodID = symbol.address;
            XLibLOG("Found GetMethodID:" + symbol.address +" " + symbol.name);
        } else if (symbol.name == "_ZN3art3JNI17GetStaticMethodIDEP7_JNIEnvP7_jclassPKcS6_") {
            addrGetStaticMethodID = symbol.address;
            XLibLOG("Found GetStaticMethodID:" + symbol.address +" " + symbol.name);
        } else if (symbol.name == "_ZN3art3JNI10GetFieldIDEP7_JNIEnvP7_jclassPKcS6_") {
            addrGetFieldID = symbol.address;
            XLibLOG("Found GetFieldID:" + symbol.address +" " + symbol.name);
        } else if (symbol.name == "_ZN3art3JNI16GetStaticFieldIDEP7_JNIEnvP7_jclassPKcS6_") {
            addrGetStaticFieldID = symbol.address;
            XLibLOG("Found GetStaticFieldID:" + symbol.address +" " + symbol.name);
        } else if (symbol.name == "_ZN3art3JNI15RegisterNativesEP7_JNIEnvP7_jclassPK15JNINativeMethodi") {
            addrRegisterNatives = symbol.address;
            XLibLOG("Found RegisterNatives:" + symbol.address +" " + symbol.name);
        } else if (symbol.name.indexOf("_ZN3art3JNI11AllocObjectEP7_JNIEnvP7_jclass") >= 0) {
            addrAllocObject = symbol.address;
            XLibLOG("Found AllocObject:" + symbol.address +" " + symbol.name);
        }  else if (symbol.name.indexOf("_ZN3art3JNI16CallObjectMethodEP7_JNIEnvP8_jobjectP10_jmethodIDz") >= 0) {
            addrCallObjectMethod = symbol.address;
            XLibLOG("Found CallObjectMethod:" + symbol.address +" " + symbol.name);
        } else if (symbol.name.indexOf("_ZN3art3JNI14GetObjectClassEP7_JNIEnvP8_jobject") >= 0) {
            addrGetObjectClass = symbol.address;
            XLibLOG("Found GetObjectClass:" + symbol.address +" " + symbol.name);
        } else if (symbol.name.indexOf("_ZN3art3JNI21ReleaseStringUTFCharsEP7_JNIEnvP8_jstringPKc") >= 0) {
            addrReleaseStringUTFChars = symbol.address;
            XLibLOG("Found ReleaseStringUTFChars:" + symbol.address +" " + symbol.name);
        }
    }

    if (addrRegisterNatives != null) {
        Interceptor.attach(addrRegisterNatives, {
            onEnter: function (args) {
                XLibLOG("[RegisterNatives] method_count: " +  args[3]);
                var env = args[0];
                var java_class = args[1];
                
                var funcAllocObject = new NativeFunction(addrAllocObject, "pointer", ["pointer", "pointer"]);
                var funcGetMethodID = new NativeFunction(addrGetMethodID, "pointer", ["pointer", "pointer", "pointer", "pointer"]);
                var funcCallObjectMethod = new NativeFunction(addrCallObjectMethod, "pointer", ["pointer", "pointer", "pointer"]);
                var funcGetObjectClass = new NativeFunction(addrGetObjectClass, "pointer", ["pointer", "pointer"]);
                var funcGetStringUTFChars = new NativeFunction(addrGetStringUTFChars, "pointer", ["pointer", "pointer", "pointer"]);
                var funcReleaseStringUTFChars = new NativeFunction(addrReleaseStringUTFChars, "void", ["pointer", "pointer", "pointer"]);

                var clz_obj = funcAllocObject(env, java_class);
                var mid_getClass = funcGetMethodID(env, java_class, Memory.allocUtf8String("getClass"), Memory.allocUtf8String("()Ljava/lang/Class;"));
                var clz_obj2 = funcCallObjectMethod(env, clz_obj, mid_getClass);
                var cls = funcGetObjectClass(env, clz_obj2);
                var mid_getName = funcGetMethodID(env, cls, Memory.allocUtf8String("getName"), Memory.allocUtf8String("()Ljava/lang/String;"));
                var name_jstring = funcCallObjectMethod(env, clz_obj2, mid_getName);
                var name_pchar = funcGetStringUTFChars(env, name_jstring, ptr(0));
                var class_name = ptr(name_pchar).readCString();
                funcReleaseStringUTFChars(env, name_jstring, name_pchar);

                //XLibLOG(class_name);

                var methods_ptr = ptr(args[2]);

                var method_count = parseInt(args[3]);
                for (var i = 0; i < method_count; i++) {
                    var name_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3));
                    var sig_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3 + Process.pointerSize));
                    var fnPtr_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3 + Process.pointerSize * 2));

                    var name = Memory.readCString(name_ptr);
                    var sig = Memory.readCString(sig_ptr);
                    var find_module = Process.findModuleByAddress(fnPtr_ptr);
                    XLibLOG("[RegisterNatives] Java class:" + class_name + " name:" + name + " sig:" + sig + " fnPtr:" + fnPtr_ptr + " module_name:" + find_module.name + " module_base:" + find_module.base + " offset:" + ptr(fnPtr_ptr).sub(find_module.base));

                }
            },
            onLeave: function (retval) { }
        });
    }

    ishook_libart = true;
}

XLOG("++++++++++++++++Android Frida Lib Loaded!✅++++++++++++++++");
