if (ObjC.available)
{
    try
    {
        //hook - ZYOperationView operationCopyLink
        var className = "ZYMediaDownloadHelper";
        var funcName = "+ downloadMediaUrl:isVideo:progress:finishBlock:";
        var hook = eval('ObjC.classes.' + className + '["' + funcName + '"]');
        
        Interceptor.attach(hook.implementation, {
            onEnter: function(args) {
                // args[0] is self
                // args[1] is selector (SEL "sendMessageWithText:")
                // args[2] holds the first function argument, an NSString

                var mainPath = ObjC.classes.NSBundle.mainBundle().executablePath().UTF8String();
                XLOG(mainPath)
                
                var slide = getImageVmaddrSlide(mainPath)
                
                XLOG(slide)
                
            }
        });
    }
    catch(err)
    {
        console.log("[!] Exception2: " + err.message);
    }
}
else
{
    console.log("[-] Objective-C Runtime is not available!");
}