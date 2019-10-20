#!/usr/bin/python
import frida
import sys 
import codecs
import os
import threading

NAME_OR_BUNDLEID = "cn.xiaobu.pipiPlay"

def do_hook():
    return xCallStackSymbolsTest()
    
def xCallStackSymbolsTest():
    script_dir = os.path.dirname(os.path.realpath(__file__))
    lib = os.path.join(script_dir, '../iOSFridaLib.js')
    source = ''
    with codecs.open(lib, 'r', 'utf-8') as f:
        source = source + f.read()
        
    js = '''
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

                    // just call [NSThread callStackSymbols]
                    var threadClass = ObjC.classes.NSThread
                    var symbols = threadClass["+ callStackSymbols"]()
                    XLOG(symbols)
                    
                    // call  xCallStackSymbols
                    xCallStackSymbols(this.context);
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
            console.log("Objective-C Runtime is not available!");
    }
    '''
    
    return source+js
    
def get_applications(device):
    try:
        applications = device.enumerate_applications()
    except Exception as e:
        print 'Failed to enumerate applications: %s' % e
        return

    return applications
    
def get_usb_iphone():
    Type = 'usb'
    if int(frida.__version__.split('.')[0]) < 12:
        Type = 'tether'
        
    device_manager = frida.get_device_manager()
    changed = threading.Event()
    
    def on_changed():
        changed.set()

    device_manager.on('changed', on_changed)

    device = None
    while device is None:
        devices = [dev for dev in device_manager.enumerate_devices() if dev.type == Type]
        if len(devices) == 0:
            print 'Waiting for USB device...'
            changed.wait()
        else:
            device = devices[0]
            
    device_manager.off('changed', on_changed)
    
    return device

if __name__ == '__main__':
    try:
        device = get_usb_iphone()
        bundle_identifier = ''
        name_or_bundleid = NAME_OR_BUNDLEID
        print("[+] connect frida server successs")
        for application in get_applications(device):
            if name_or_bundleid == application.identifier or name_or_bundleid == application.name:
                pid = application.pid
                display_name = application.name
                bundle_identifier = application.identifier
                print("[*] found app for bundleid:{}".format(bundle_identifier))
        
        if bundle_identifier == '':
            print("[-] not found app by bundleid:{}".format(bundle_identifier))
            exit(1)
        
        try:
            if not pid:
                pid = device.spawn([bundle_identifier])
                session = device.attach(pid)
                device.resume(pid)
            else:
                session = device.attach(pid)
            
            print("[+] attach app success for pid:{}".format(pid))
                
            script = session.create_script(do_hook())
            script.load()
            sys.stdin.read()
        except Exception as e:
            print e

    except KeyboardInterrupt:
        sys.exit(0)