//       _        ___    ______    _     _       
//      (_)      / _ \  |  ____|  (_)   | |      
// __  ___  __ _| | | | | |__ _ __ _  __| | __ _ 
// \ \/ / |/ _` | | | | |  __| '__| |/ _` |/ _` |
//  >  <| | (_| | |_| | | |  | |  | | (_| | (_| |
// /_/\_\_|\__,_|\___/  |_|  |_|  |_|\__,_|\__,_|

// Author : xia0
// blog: http://4ch12dy.site


// xia0 log
function XLOG(log) {
    console.log("[*] " + log)
}

function XLibLOG(log) {
    console.log(log)
}

// format string with width
function format(str,width){	
    str = str + ""
    var len = str.length;
    
    if(len > width){
        return str
    }
    
    for(var i = 0; i < width-len; i++){
        str += " "
    }
    return str; 
}

function getImageVmaddrSlide(modulePath){
    // intptr_t   _dyld_get_image_vmaddr_slide(uint32_t image_index)
    var _dyld_get_image_vmaddr_slide = new NativeFunction(
        Module.findExportByName(null, '_dyld_get_image_vmaddr_slide'),
        'pointer',
        ['uint32']
    );
    // const char*  _dyld_get_image_name(uint32_t image_index) 
    var _dyld_get_image_name = new NativeFunction(
        Module.findExportByName(null, '_dyld_get_image_name'),
        'pointer',
        ['uint32']
    );
    // uint32_t  _dyld_image_count(void)
    var _dyld_image_count = new NativeFunction(
        Module.findExportByName(null, '_dyld_image_count'),
        'uint32',
        []
    );

    var image_count = _dyld_image_count();

    for (var i = 0; i < image_count; i++) {
        var image_name_ptr = _dyld_get_image_name(i)
        var image_silde_ptr = _dyld_get_image_vmaddr_slide(i)
        var image_name = Memory.readUtf8String(image_name_ptr)

        if (image_name == modulePath) {
            //XLOG(Memory.readUtf8String(image_name_ptr) + " slide:"+image_silde_ptr)
            return image_silde_ptr;
        }
        //XLOG(Memory.readUtf8String(image_name_ptr) + "slide:"+image_silde_ptr)
    }

    return 0;
}

function getAllClass(modulePath){

    // const char * objc_copyClassNamesForImage(const char *image, unsigned int *outCount)
    var objc_copyClassNamesForImage = new NativeFunction(
        Module.findExportByName(null, 'objc_copyClassNamesForImage'),
        'pointer',
        ['pointer', 'pointer']
    );
    // free
    var free = new NativeFunction(Module.findExportByName(null, 'free'), 'void', ['pointer']);
    
    // if given modulePath nil, default is mainBundle
    if(!modulePath){
        var path = ObjC.classes.NSBundle.mainBundle().executablePath().UTF8String();
    }else{
        var path = modulePath;
    }

    // create args
    var pPath = Memory.allocUtf8String(path);
    var p = Memory.alloc(Process.pointerSize);
    Memory.writeUInt(p, 0);

    var pClasses = objc_copyClassNamesForImage(pPath, p);
    var count = Memory.readUInt(p);
    var classes = new Array(count);

    for (var i = 0; i < count; i++) {
        var pClassName = Memory.readPointer(pClasses.add(i * Process.pointerSize));
        classes[i] = Memory.readUtf8String(pClassName);
    }

    free(pClasses);
    
    // XLOG(classes)
    return classes;
}
    

function getAllMethod(classname){
    var objc_getClass = new NativeFunction(
        Module.findExportByName(null, 'objc_getClass'),
        'pointer',
        ['pointer']
    );
    var class_copyMethodList = new NativeFunction(
        Module.findExportByName(null, 'class_copyMethodList'),
        'pointer',
        ['pointer', 'pointer']
    );

    var objc_getMetaClass = new NativeFunction(
        Module.findExportByName(null, 'objc_getMetaClass'),
        'pointer',
        ['pointer']
    );
    
    var method_getName = new NativeFunction(
        Module.findExportByName(null, 'method_getName'),
        'pointer',
        ['pointer']
    );
    
    var free = new NativeFunction(Module.findExportByName(null, 'free'), 'void', ['pointer']);
    
    // get objclass and metaclass
    var name = Memory.allocUtf8String(classname);
    var objClass = objc_getClass(name)
    var metaClass = objc_getMetaClass(name)
    
    // get obj class all methods
    var size_ptr = Memory.alloc(Process.pointerSize);
    Memory.writeUInt(size_ptr, 0);
    var pObjMethods = class_copyMethodList(objClass, size_ptr);
    var count = Memory.readUInt(size_ptr);
    
    var allMethods = new Array();
    
    var allObjMethods = new Array();
    
    // get obj class all methods name and IMP
    for (var i = 0; i < count; i++) {
        var curObjMethod = new Array();
        
        var pObjMethodSEL = method_getName(pObjMethods.add(i * Process.pointerSize))
        var pObjMethodName = Memory.readCString(Memory.readPointer(pObjMethodSEL))
        var objMethodIMP = Memory.readPointer(pObjMethodSEL.add(2*Process.pointerSize))
        // XLOG("-["+classname+ " " + pObjMethodName+"]" + ":" + objMethodIMP)
        curObjMethod.push(pObjMethodName)
        curObjMethod.push(objMethodIMP)
        allObjMethods.push(curObjMethod)
    }
    
    var allMetaMethods = new Array();
    
    // get meta class all methods name and IMP
    var pMetaMethods = class_copyMethodList(metaClass, size_ptr);
    var count = Memory.readUInt(size_ptr);
    for (var i = 0; i < count; i++) {
        var curMetaMethod = new Array();
        
        var pMetaMethodSEL = method_getName(pMetaMethods.add(i * Process.pointerSize))
        var pMetaMethodName = Memory.readCString(Memory.readPointer(pMetaMethodSEL))
        var metaMethodIMP = Memory.readPointer(pMetaMethodSEL.add(2*Process.pointerSize))
        //XLOG("+["+classname+ " " + pMetaMethodName+"]" + ":" + metaMethodIMP)
        curMetaMethod.push(pMetaMethodName)
        curMetaMethod.push(metaMethodIMP)
        allMetaMethods.push(curMetaMethod)
    }
    
    allMethods.push(allObjMethods)
    allMethods.push(allMetaMethods)
    
    free(pObjMethods);
    free(pMetaMethods);
    
    return allMethods;
}
    
function getInfoFromAddress(address){
    
    // int dladdr(const void *, Dl_info *);
    
    //typedef struct dl_info {
    //        const char      *dli_fname;     /* Pathname of shared object */
    //        void            *dli_fbase;     /* Base address of shared object */
    //        const char      *dli_sname;     /* Name of nearest symbol */
    //        void            *dli_saddr;     /* Address of nearest symbol */
    //} Dl_info;
    
    var dladdr = new NativeFunction(
        Module.findExportByName(null, 'dladdr'),
        'int',
        ['pointer','pointer']
    );
    
    var dl_info = Memory.alloc(Process.pointerSize*4);

    dladdr(ptr(address),dl_info)

    var dli_fname = Memory.readCString(Memory.readPointer(dl_info))
    var dli_fbase = Memory.readPointer(dl_info.add(Process.pointerSize))
    var dli_sname = Memory.readCString(Memory.readPointer(dl_info.add(Process.pointerSize*2)))
    var dli_saddr = Memory.readPointer(dl_info.add(Process.pointerSize*3))
    
    //XLOG("dli_fname:"+dli_fname)
    //XLOG("dli_fbase:"+dli_fbase)
    //XLOG("dli_sname:"+dli_sname)
    //XLOG("dli_saddr:"+dli_saddr)
    
    var addrInfo = new Array();
    
    addrInfo.push(dli_fname);
    addrInfo.push(dli_fbase);
    addrInfo.push(dli_sname);
    addrInfo.push(dli_saddr);
    
    //XLOG(addrInfo)
    return addrInfo;
}


function findSymbolFromAddress(modulePath,addr){
    var frameAddr = addr
    
    var theDis = 0xffffffffffffffff;
    var tmpDis = 0;
    var theClass = "None"
    var theMethodName = "None"
    var theMethodType = "-"
    var theMethodIMP = 0
    
    var allClassInfo = {}

    var allClass = getAllClass(modulePath);
    
    for(var i = 0, len = allClass.length; i < len; i++){
        var mInfo = getAllMethod(allClass[i]);
        var curClassName = allClass[i]
        
        var objms = mInfo[0];
        for(var j = 0, olen = objms.length; j < olen; j++){
            var mname = objms[j][0]
            var mIMP = objms[j][1]
            if(frameAddr >= mIMP){
                var tmpDis = frameAddr-mIMP
                if(tmpDis < theDis){
                    theDis = tmpDis
                    theClass = curClassName
                    theMethodName = mname
                    theMethodIMP = mIMP
                    theMethodType = "-"
                }
            }
        }

        var metams = mInfo[1];
        for(var k = 0, mlen = metams.length; k < mlen; k++){
            var mname = metams[k][0]
            var mIMP = metams[k][1]
            if(frameAddr >= mIMP){
                var tmpDis = frameAddr-mIMP
                if(tmpDis < theDis){
                    theDis = tmpDis
                    theClass = curClassName
                    theMethodName = mname
                    theMethodIMP = mIMP
                    theMethodType = "+"
                }
            }
        }
    }

    var symbol = theMethodType+"["+theClass+" "+theMethodName+"]"

    if(symbol.indexOf(".cxx")!=-1){
        symbol = "maybe C function?"
    }
    
    // if distance > 3000, maybe a c function
    if(theDis > 3000){
        symbol = "maybe C function? symbol:" + symbol
    }
    
    return symbol;
}

function xia0CallStackSymbols(onlyMainModule){
    XLOG("================================================xCallStackSymbols==========================================")
    function getExeFileName(modulePath){
        modulePath += ""
        return modulePath.split("/").pop()
    }
    
    var mainPath = ObjC.classes.NSBundle.mainBundle().executablePath().UTF8String();
    
    var threadClass = ObjC.classes.NSThread
    var symbols = threadClass["+ callStackSymbols"]()
    var addrs = threadClass["+ callStackReturnAddresses"]()
    var count = addrs["- count"]();

    for(var i = 0, len = count; i < len; i++){
        
        var curAddr = addrs["- objectAtIndex:"](i)["- integerValue"]();
        var info = getInfoFromAddress(curAddr);
        // skip frida call stack
        if(!info[0]){
            continue;
        }
        
        var dl_symbol = info[2]+""
        var curModulePath = info[0]+""
        
        var fileAddr = curAddr-getImageVmaddrSlide(curModulePath);

        if (onlyMainModule) {
            if (curModulePath == mainPath) {
                var symbol = findSymbolFromAddress(curModulePath,curAddr);
            }else{
                var symbol = info[2];
            }
        }else{
            if((!info[2] || dl_symbol.indexOf("redacted")!=-1) && curModulePath.indexOf("libdyld.dylib") == -1){
                var symbol = findSymbolFromAddress(curModulePath,curAddr);
            }else{
                var symbol = info[2];
            }
        }

        XLOG(format(i, 4)+format(getExeFileName(info[0]), 20)+"mem:"+format(ptr(curAddr),13)+"file:"+format(ptr(fileAddr),13)+format(symbol,80))
    }
    XLOG("==============================================================================================================")
    return;
}

function xCallStackSymbols(context){
    XLOG("================================================xCallStackSymbols==========================================")
    function getExeFileName(modulePath){
        modulePath += ""
        return modulePath.split("/").pop()
    }
    
    var mainPath = ObjC.classes.NSBundle.mainBundle().executablePath().UTF8String();
    var mainModuleName = getExeFileName(mainPath)
    
    var backtrace = Thread.backtrace(context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress)
    for (var i = 0;i < backtrace.length;i ++)
    {
        var curStackFrame = backtrace[i] + ''
        var curSym = curStackFrame.split("!")[1]
        var curAddr = curStackFrame.split("!")[0].split(" ")[0]
        var curModuleName = curStackFrame.split("!")[0].split(" ")[1]

        var info = getInfoFromAddress(curAddr);
        // skip frida call stack
        if(!info[0]){
            continue;
        }
        
        var dl_symbol = info[2]+""
        var curModulePath = info[0]+""
        
        var fileAddr = curAddr-getImageVmaddrSlide(curModulePath);
        
        // is the image in app dir?
        if (curModulePath.indexOf(mainModuleName) != -1 ) {
            curSym = findSymbolFromAddress(curModulePath,curAddr);
        }
        XLOG(format(i, 4)+format(getExeFileName(curModulePath), 20)+"mem:"+format(ptr(curAddr),13)+"file:"+format(ptr(fileAddr),13)+format(curSym,80))
    }
    XLOG("==============================================================================================================")
    return

}

function xia0Hook() {
    
}

XLOG("++++++++++++++++iOS Frida Lib Loaded!✅++++++++++++++++");