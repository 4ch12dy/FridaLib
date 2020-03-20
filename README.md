# FridaLib
iOS/android frida library for reversing

### Android

#### funtions in androdFridaLib

- backtrace : Print java call stack

  ```js
  function backtrace()
  ```

- java_single_hook : hook java class method and auto log args and return value

  ```js
  function java_single_hook(className, methd, callbackFunc)
  ```

- java_hook : hook java class all overload methods and auto log args and return value

  ```js
  function java_hook(className, func, callbackFunc)
  ```

- native_hook_symbol : hook native function by symbol

  ```js
  function native_hook_symbol(moduleName, funcName, onEnterFunc, onLeaveFunc)
  ```

- native_hook_address : hook native function by address

  ```js
  function native_hook_address(moduleName, funcAddr, onEnterFunc, onLeaveFunc)
  ```

- print_class_fields : print class object all fields

  ```js
  function print_class_fields(obj)
  ```

- bytes_to_string : byte data convert to java string

  ```js
  function bytes_to_string(data)
  ```

- string_to_bytes : string convert to byte data

  ```js
  function string_to_bytes(str)
  ```

- hook_register_natives : hook RegisterNatives in libart.so

  ```js
  function hook_register_natives()
  ```

#### sample 

some test script about app and service hook in android

### iOS

#### funtions in iOSFridaLib

- get_image_vm_slide : get image vm address slide 

  ```js
  function get_image_vm_slide(modulePath)
  ```

- get_all_objc_class : get all ObjC class by image path

  ```js
  function get_all_objc_class(modulePath)
  ```

- get_all_class_methods : get all methods of a class

  ```js
  function get_all_class_methods(classname)
  ```

- get_info_form_address : get some info from addr

  ```
  function get_info_form_address(address)
  ```

- find_symbol_from_address : find best match objc symbol from address

  ```js
  function find_symbol_from_address(modulePath,addr)
  ```

- backtrace 

- ```js
  function backtrace(onlyMainModule)
  ```

- xbacktrace : print a symbol call stack 

  ```js
  function xbacktrace(context)
  ```

#### sample

this is some test js script loaded into frida python script

you can add your test js script similar to provided easily



### How to use

you can refer to the sample



### Surpise

this project is twitted by [@Mobile Security](https://twitter.com/mobilesecurity_) at https://twitter.com/mobilesecurity_/status/1172116516839546883

emmmm,  But it just a baby projet. Be glade that you make it grouth with me 

### Reference

- http://4ch12dy.site/2019/07/02/xia0CallStackSymbols/xia0CallStackSymbols/
- https://github.com/interference-security/frida-scripts
- https://github.com/frida
- https://github.com/iddoeldor/frida-snippets
