if (ObjC.available)
{
    try
    {
        if ("WCBaseCgi" in ObjC.classes) {
            // -[WCBaseCgi setRequest:]
            var WCBaseCgi = ObjC.classes.WCBaseCgi;
            var setRequest = WCBaseCgi["- setRequest:"];
        
            Interceptor.attach(setRequest.implementation, {
                onEnter: function (args) {
                    var arg2 = ObjC.Object(args[2]); //GetUserHistoryPageRequest
                    console.log('-[WCBaseCgi setRequest:' + arg2 + ']');
                    xbacktrace(this.context);
                }
            });
        }
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