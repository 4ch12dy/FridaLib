# xia0FridaScript
some useful frida script library for reversing and debugging

### Android

#### androidFridaLib

- showCallstack

  show java call stack

- xia0Hook

  easy to use hook java and auto log arguments and ret value and so on

#### sample 

some test script about app and service hook in android

### iOS

#### iOSFridaLib

- getImageVmaddrSlide(modulePath)

  get slide of given image path

- getAllClass(modulePath)

  get all class of given image path

- getAllMethod(classname)

  get all methold(objc, meta) of given class name

  Objc methold: array[0]

  Meta methold: array[1]

- getInfoFromAddress(address)

  use dladdr to get info of given address
  
- findSymbolFromAddress

  try get symbol of address in OC function

- xCallStackSymbols

  get call stack symbols although symbol striped

#### sample

this is some test js script loaded into frida python script

you can add your test js script similar to provided easily

### Surpise

this project is twitted by [@Mobile Security](https://twitter.com/mobilesecurity_) at https://twitter.com/mobilesecurity_/status/1172116516839546883

emmmm,  But it just a baby projet. Be glade that you make it grouth with me 

### Reference

- http://4ch12dy.site/2019/07/02/xia0CallStackSymbols/xia0CallStackSymbols/

