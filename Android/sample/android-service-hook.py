#!/usr/bin/python
import frida
import sys
import time
import os
import codecs

def on_message(message, data):
	if message['type'] == 'send':
		print("[*] {0}".format(message['payload']))
	else:
		print(message)

def loadJSScript(filePath):
	source = ''
	script_dir = os.path.dirname(os.path.realpath(__file__))
	JSHookFile = os.path.join(script_dir, filePath)
	with codecs.open(JSHookFile, 'r', 'utf-8') as f:
		source = source + f.read()
		
	return source

def do_hook():
	hook_script = '''
	setImmediate(function() {
		Java.perform(function(){
			XLOG("Start Android Java Frida Hook!");
			Java.debug = true;
			var hookClass = "com.android.server.pm.PackageManagerServiceUtils";
			// verifySignatures  isApkVerityEnabled
			
			xia0Hook(hookClass, 'compareSignatures', function (){
				
				//var self = arguments[0]; self == this
				//args == arguments[1:] : the args is the left of arguments form 1
				
				var self = arguments[0];
				var arg1 = arguments[1];
				var arg2 = arguments[2];
	
				var retv = self.compareSignatures(arg1, arg2);
				XLOG("Get orig ret:" + retv);
				return retv;
			});
			
			/*
			xia0Hook('java.lang.StringBuilder', '$init', function (){
				XLOG("==============================");
			});
			*/
			
			XLOG("Inited Android Java Frida Hook! Waiting for triggle");

		});
		
	});
	
	'''
	source = loadJSScript('../androidFridaLib.js')
	
	return hook_script + source
	

session=frida.get_usb_device().attach('system_server')

script = session.create_script(do_hook())

script.on("message", on_message)
time.sleep(1)
script.load()
sys.stdin.read()