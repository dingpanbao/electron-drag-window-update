#原项目electron-drag-window

##https://github.com/TyphonEX/electron-drag-window

###增加onWindowDrag()方法入参，限制窗口大小，修复窗口拖动变大的问题
```
  onWindowDrag({
    width: width,
    height: height
  })
```