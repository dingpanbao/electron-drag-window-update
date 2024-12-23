import { BrowserWindow, ipcMain, screen } from "electron"
import { ElectronDragWindow } from "./type"

// save dragging window size and mouse positon
const WindowConfigMap = new Map<Electron.IpcMainEvent['processId'], ElectronDragWindow.WindowConfigMapParams>()

const getWindowByProcessId = (processId: Electron.IpcMainEvent['processId']) => BrowserWindow.getAllWindows().find(win => win.webContents.getProcessId() === processId)

export const onWindowDrag = (data: ElectronDragWindow.WindowConfigMapParams) => {
  ipcMain.on(
    ElectronDragWindow.IpcKey.ELECTRON_DRAG_WINDOW,
    function (e) {
      const processId = e.processId

      const config = WindowConfigMap.get(processId)

      if (!config) return

      const win = getWindowByProcessId(processId)

      if (!win || win.isDestroyed()) return

      /**
       * change position
       */
      const { x, y } = screen.getCursorScreenPoint()

      const { mouseX, mouseY } = config

      const nextX = x - mouseX
      const nextY = y - mouseY

      const [oldX, oldY] = win.getPosition()

      if ([x, oldX].includes(nextX) && [y, oldY].includes(nextY)) return
      win.setBounds({
          x: nextX,
          y: nextY,
          width: data.width,
          height: data.height
      })

      /**
       * reset window size, reason by https://github.com/electron/electron/issues/10862
       */
      //const { width, height } = config

      //win.setSize(width, height)
    }
  )

  // save config
  ipcMain.on(
    ElectronDragWindow.IpcKey.ELECTRON_DRAG_START,
    function (e, params: ElectronDragWindow.IpcParams[ElectronDragWindow.IpcKey.ELECTRON_DRAG_START]) {
      const processId = e.processId

      const win = getWindowByProcessId(processId)

      if (!win || win.isDestroyed()) return console.error('error dont find win by ELECTRON_DRAG_START')

      const [width, height] = win.getSize()

      const { mouseX, mouseY } = params

      WindowConfigMap.set(processId, { width, height, mouseX, mouseY })
    }
  )

  // delete config
  ipcMain.on(
    ElectronDragWindow.IpcKey.ELECTRON_DRAG_OVER,
    function (e) {
      WindowConfigMap.delete(e.processId)
    }
  )
}