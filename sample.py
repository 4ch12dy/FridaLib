#!/usr/bin/python
import frida
import sys 
import codecs
import os

PACKAGE_NAME = "cn.xiaobu.pipiPlay"

def on_message(message, data):
	try:
		if message:
			print("[JSBACH] {0}".format(message["payload"]))
	except Exception as e:
		print(message)
		print(e)

def xia0CallStackSymbolsTest():
	script_dir = os.path.dirname(os.path.realpath(__file__))
	xia0CallStackSymbolsJS = os.path.join(script_dir, 'xia0CallStackSymbols.js')
	source = ''
	with codecs.open(xia0CallStackSymbolsJS, 'r', 'utf-8') as f:
		source = source + f.read()
	
	js = '''
	if (ObjC.available)
	{
			try
			{
					//Your class name here  - ZYOperationView operationCopyLink
					var className = "ZYMediaDownloadHelper";
					//Your function name here
					var funcName = "+ downloadMediaUrl:isVideo:progress:finishBlock:";
					var hook = eval('ObjC.classes.' + className + '["' + funcName + '"]');
					Interceptor.attach(hook.implementation, {
						onEnter: function(args) {
							// args[0] is self
							// args[1] is selector (SEL "sendMessageWithText:")
							// args[2] holds the first function argument, an NSString
							console.log("[*] Detected call to: " + className + " -> " + funcName);
						
							// just call [NSThread callStackSymbols]
							var threadClass = ObjC.classes.NSThread
							var symbols = threadClass["+ callStackSymbols"]()
							console.log(symbols)
							
							// call  xia0CallStackSymbols [true:just symbolish mainModule address false:symbolish all module address]
							xia0CallStackSymbols(true);
							xia0CallStackSymbols(false);
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


def do_hook():
	
	return xia0CallStackSymbolsTest()

if __name__ == '__main__':
	try:
		device = frida.get_device_manager().enumerate_devices()[-1]
		print device
		pid = device.spawn([PACKAGE_NAME])
		print("[JSBACH] {} is starting. (pid : {})".format(PACKAGE_NAME, pid))

		session = device.attach(pid)
		device.resume(pid)

		script = session.create_script(do_hook())
		script.on('message', on_message)
		script.load()
		sys.stdin.read()
	except KeyboardInterrupt:
		sys.exit(0)