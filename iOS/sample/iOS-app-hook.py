#!/usr/bin/python
import frida
import sys 
import codecs
import os
import threading

NAME_OR_BUNDLEID = "com.tencent.xin"

def do_hook():
    return xCallStackSymbolsTest()
    
def libFuncTest():
    return load_js_from_file('./libFuncTest.js')
    
def xCallStackSymbolsTest():
    return load_js_from_file('./xCallStackSymbols.js')
    
def load_js_from_file(js_path):
    script_dir = os.path.dirname(os.path.realpath(__file__))
    lib_path = os.path.join(script_dir, '../iOSFridaLib.js')
    lib_source = ''
    with codecs.open(lib_path, 'r', 'utf-8') as f:
        lib_source = lib_source + f.read()
        
    js_path = os.path.join(script_dir, js_path)
    js_source = ''
    with codecs.open(js_path, 'r', 'utf-8') as f:
        js_source = js_source + f.read()
    return lib_source+js_source
    
def on_message(message, data):
    if message['type'] == 'send':
        print("[*] {0}".format(message['payload']))
    else:
        print(message)
    
def get_applications(device):
    try:
        applications = device.enumerate_applications()
    except Exception as e:
        print('Failed to enumerate applications: %s' % e)
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
            print('Waiting for USB device...')
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
            script.on("message", on_message)
            script.load()
            sys.stdin.read()
        except Exception as e:
            print(e)

    except KeyboardInterrupt:
        sys.exit(0)