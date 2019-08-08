#!/usr/bin/python
import frida
import sys
import time
import os
import codecs


session=frida.get_usb_device().attach('system_server')

def do_hook():
	hook_script = '''
	setImmediate(function() {
		Java.perform(function(){
			XLOG("Start Android Java Frida Hook!");
						
			var hookClass = Java.use("com.android.server.pm.PackageManagerServiceUtils");
			
			xia0Hook(hookClass, 'compareSignatures', function (){
				//XLOG("call back");
				
				var argc = arguments[0].length;
				XLOG(argc)
				
			});
			
			xia0Hook(hookClass, 'verifySignatures', function (){
				//XLOG("call back");
				//var ret = this.compareSignatures();
				var argc = arguments[0].length;
				XLOG(argc)
				
			});
			xia0Hook(hookClass, 'isApkVerityEnabled', function (){
				//XLOG("call back");
				
				var argc = arguments[0].length;
				XLOG(argc)
							
			});
			
			
			// hook com.android.server.pm.PackageManagerService.installPackageLI
			hookClass = Java.use("com.android.server.pm.PackageManagerService");
			
			xia0Hook(hookClass, 'installPackageLI', function (){
				//XLOG("call back");
				
				var argc = arguments[0].length;
				XLOG(argc)
				
			});
			XLOG("Inited Android Java Frida Hook! Waiting for triggle");

		});

	});
	'''
	source = loadJSScript('../androidFridaLib.js')
	
	return hook_script + source
	

def loadJSScript(filePath):
	source = ''
	script_dir = os.path.dirname(os.path.realpath(__file__))
	JSHookFile = os.path.join(script_dir, filePath)
	with codecs.open(JSHookFile, 'r', 'utf-8') as f:
		source = source + f.read()
		
	return source
	

def on_message(message, data):
	if message['type'] == 'send':
		print("[*] {0}".format(message['payload']))
	else:
		print(message)


script = session.create_script(do_hook())


script.on("message", on_message)
time.sleep(1)
script.load()
sys.stdin.read()