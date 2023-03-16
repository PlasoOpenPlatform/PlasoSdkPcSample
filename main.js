const isElectron = !!process.versions['electron'];
if (isElectron) {
    const path = require('path');
    const fs = require('fs');
    try{
        require("@plasosdk/winproxy");
        require("@plasosdk/screenshot");
        require("@plasosdk/rtmpplayer");
    }
    catch(e) {
        console.log(e);
    }
    const { app, Menu, ipcMain, BrowserWindow } = require('electron');
    const isDarwin = process.platform == 'darwin';

    let mainWindow = null

    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
        app.quit();
    } else {
        const url = require('url');
        const args = process.argv.filter(arg => arg.indexOf('-') == 0);
        let title = '', icon = '', manifest;
    
        if (args.length > 0 && args[0].toLocaleLowerCase().indexOf('dev') >= 0) {
            app.commandLine.appendSwitch('--ignore-certificate-errors', 'true')
        }
    
        try {
            manifest = JSON.parse(fs.readFileSync(path.join(__dirname, './package.json')).toString());
            title = manifest.window.title;
            icon = manifest.window.icon;
            if (isDarwin) app.setName(title);
        } catch (err) {
            title = '';
            console.log('fs read file error');
        }
    
        app.commandLine.appendSwitch('disable-gpu', true)
        app.allowRendererProcessReuse = false
    
        function createWindow(event) {
            Menu.setApplicationMenu(null);
            // Create the browser window.
            mainWindow = new BrowserWindow({
                width: 1180,
                height: 730,
                minWidth: 1180,
                minHeight: 730,
                title: title,
                icon: path.join(__dirname, icon),
                // frame: false,
                // transparent: true,
                webPreferences: {
                    // preload: path.join(__dirname, 'preload.js'),
                    contextIsolation: false,
                    nodeIntegration: true,
                    enableRemoteModule:true,
                    // allowRendererProcessReuse: true,
                }
            })
    
            // and load the index.html of the app.
            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'demo.html'),
                protocol: 'file:',
                slashes: true
            }))
    
            if (process.argv.some(one => one == '--debug')) {
                mainWindow.webContents.openDevTools({mode: 'detach'});
            }
        }
    
    
        app.on('ready', () => {
            createWindow()
        })
    
        app.on('window-all-closed', function () {
            app.quit()
        })
    
        app.on('activate', function () {
            if (BrowserWindow.getAllWindows().length === 0) createWindow()
        })

        app.on('second-instance', (event, commandLine, workingDirectory) => {
            // 当运行第二个实例时,将会聚焦到mainWindow这个窗口
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore()
                mainWindow.focus()
            }
        })
    }
} else {
    const nw = require('nw.gui');
    const { width, height, min_width, min_height, frame, show, title } = nw.App.manifest.window;
    nw.Window.open('demo.html', { width, height, min_width, min_height, frame, show, title }, function (win) {
        console.log(win);
    });
}