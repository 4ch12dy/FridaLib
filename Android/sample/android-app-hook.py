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
		Java.perform(function(){
			XLOG("Start Android Java Frida Hook!");
			
			var hookClass = Java.use("android.os.ServiceManager");
			
			xia0Hook(hookClass, 'getService', function (){
				/*
				var self = arguments[0]; self == this
				args == arguments[1:] : the args is the left of arguments form 1
				*/
				var self = arguments[0];
				var serviceName = arguments[1];
				
				if(serviceName == "window"){
					XLOG("App current want to get the service:" + serviceName);
					showCallstack();
					// if return null, screnn will be dark
					// return null;
				}
			
			});
						
			XLOG("Inited Android Java Frida Hook! Waiting for triggle");		
	});
	'''
	source = loadJSScript('../androidFridaLib.js')
	
	return hook_script + source

app_package = "com.tencent.mm"

device = frida.get_remote_device()
pid = device.spawn(app_package)
session = device.attach(pid)

script = session.create_script(do_hook())

script.on("message", on_message)
script.load()
sys.stdin.read()