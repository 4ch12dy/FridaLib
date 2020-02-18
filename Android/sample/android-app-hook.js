Java.perform(function(){
    XLOG("Start Android Java Frida Hook!");
    
    var hookClass = "android.os.ServiceManager";
    
    java_hook(hookClass, 'getService', function (){
        /*
        var self = arguments[0]; self == this
        args == arguments[1:] : the args is the left of arguments form 1
        
        var self = arguments[0];
        var serviceName = arguments[1];
        
        if(serviceName == "window"){
            XLOG("App current want to get the service:" + serviceName);
            // showCallstack();
            // if return null, screnn will be dark
            // return null;
        }
        */
    });
    
    java_hook("com.didi.security.wireless.SecurityLib","nativeCheck",function (){});
                
    XLOG("Inited Android Java Frida Hook! Waiting for triggle");		
});