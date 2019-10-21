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

def load_js_from_file(js_path):
    script_dir = os.path.dirname(os.path.realpath(__file__))
    lib_path = os.path.join(script_dir, '../androidFridaLib.js')
    lib_source = ''
    with codecs.open(lib_path, 'r', 'utf-8') as f:
        lib_source = lib_source + f.read()
        
    js_path = os.path.join(script_dir, js_path)
    js_source = ''
    with codecs.open(js_path, 'r', 'utf-8') as f:
        js_source = js_source + f.read()
    return lib_source+js_source

def do_hook():
    
    source = load_js_from_file('./androidFridaLib.js')
    
    return source

app_package = "com.didi.wsg"

device = frida.get_remote_device()
#pid = device.spawn(app_package)
pid = 6969
session = device.attach(pid)

script = session.create_script(do_hook())

script.on("message", on_message)
script.load()
sys.stdin.read()