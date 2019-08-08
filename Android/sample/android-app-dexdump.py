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
	
#/art/runtime/dex/art_dex_file_loader.cc  on android 9
#std::unique_ptr<DexFile> ArtDexFileLoader::OpenCommon(const uint8_t* base,
#                                                     size_t size,
#                                                     const uint8_t* data_base,
#                                                     size_t data_size,
#                                                     const std::string& location,
#                                                     uint32_t location_checksum,
#                                                     const OatDexFile* oat_dex_file,
#                                                     bool verify,
#                                                     bool verify_checksum,
#                                                     std::string* error_msg,
#                                                     std::unique_ptr<DexFileContainer> container,
#                                                     VerifyResult* verify_result)

def do_hook():
	hook_script = '''
		XLOG("Init Android Native Frida Hook!");
		var funcName = "_ZN3art13DexFileLoader10OpenCommonEPKhjS2_jRKNSt3__112basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEjPKNS_10OatDexFileEbbPS9_NS3_10unique_ptrINS_16DexFileContainerENS3_14default_deleteISH_EEEEPNS0_12VerifyResultE";
		
		xia0NativeHook("libart.so", funcName, function (){
			if(Memory.readU32(args[1]) == DEX_MAGIC) {
				dexrec.push(args[1]);
			}
		},function (){
			XLOG(" I am in onLeave");		
		});
		
		Java.perform(function(){
			
			var hookClass = Java.use("android.os.ServiceManager");
				
			XLOG("Inited Android Java Frida Hook! Waiting for triggle");		
	});
	'''
	source = loadJSScript('../androidFridaLib.js')
	
	return hook_script + source

app_package = "com.lvse.juren"

device = frida.get_remote_device()
pid = device.spawn(app_package)
session = device.attach(pid)

script = session.create_script(do_hook())

script.on("message", on_message)
script.load()
sys.stdin.read()