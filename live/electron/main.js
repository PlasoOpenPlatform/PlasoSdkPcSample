const isElectron = !!process.versions['electron'];
if (isElectron) {
    const path = require('path');
    const fs = require('fs');
    try {
        require('@plasosdk/plaso-electron-sdk');
    } catch (e) {
        console.log(e);
    }
    const { app, Menu, BrowserWindow, ipcMain } = require('electron');
    const isDarwin = process.platform == 'darwin';

    let mainWindow = null;

    const gotTheLock = app.requestSingleInstanceLock();

    // TODO: 如果想运行多个实例，需要把这里的quit去掉，但是双实例能不能承受的住，还是未知数
    if (!gotTheLock) {
        app.quit();
    } else {
        const url = require('url');
        const args = process.argv.filter((arg) => arg.indexOf('-') == 0);
        let title = '',
            icon = '',
            manifest;

        if (args.length > 0 && args[0].toLocaleLowerCase().indexOf('dev') >= 0) {
            app.commandLine.appendSwitch('--ignore-certificate-errors', 'true');
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

        app.allowRendererProcessReuse = false;

        let urlScheme = null;

        function createWindow(event) {
            Menu.setApplicationMenu(null);

            mainWindow = new BrowserWindow({
                width: 1180,
                height: 730,
                minWidth: 1180,
                minHeight: 730,
                title: title,
                icon: path.join(__dirname, icon),
                webPreferences: {
                    contextIsolation: false,
                    nodeIntegration: true,
                    enableRemoteModule: true,
                    nodeIntegrationInWorker: true,
                },
            });

            function versionComp(newVersion, oldVersion) {
                const newVersionList = (newVersion || '0').split('.');
                const oldVersionList = (oldVersion || '0').split('.');
                const length = newVersionList.length > oldVersionList.length ? newVersionList.length : oldVersionList.length;
                for (let i = 0; i < length; i++) {
                    const newVersionValue = newVersionList[i] == undefined ? 0 : parseInt(newVersionList[i]);
                    const oldVersionValue = oldVersionList[i] == undefined ? 0 : parseInt(oldVersionList[i]);
                    const res = newVersionValue - oldVersionValue;
                    if (res !== 0) {
                        return res;
                    }
                }
                return 0;
            }

            const electronVersion = process.versions['electron'];
            if (electronVersion && versionComp(electronVersion, '14.0.0') >= 0) {
                const electronStore = require('@electron/remote/main');
                electronStore.initialize();
                electronStore.enable(mainWindow.webContents);
            }

            mainWindow.webContents.on('did-finish-load', () => {
                if (urlScheme) {
                    mainWindow.webContents.send('url-scheme', urlScheme);
                }
            });

            mainWindow.loadURL(
                url.format({
                    pathname: path.join(__dirname, 'index.html'),
                    protocol: 'file:',
                    slashes: true,
                }),
            );

            mainWindow.on('close', (event) => {
                event.preventDefault();
                const windows = BrowserWindow.getAllWindows();
                windows.forEach((window) => window.destroy());
                app.quit();
            });

            if (process.argv.some((one) => one == '--debug' || one == '--inspect')) {
                mainWindow.webContents.openDevTools({ mode: 'detach' });
            }
        }

        app.on('ready', () => {
            createWindow();
            urlScheme = process.argv.find((arg) => arg.startsWith('yxtplasoelectronsdkdemo://'));

            ipcMain.on('resource-center-selected', (_, resourceInfo) => {
                mainWindow.webContents.send('resource-center-selected', resourceInfo);
            });
        });

        app.on('activate', function () {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });

        app.on('second-instance', (event, commandLine, workingDirectory) => {
            const url = process.argv.find((arg) => arg.startsWith('yxtplasoelectronsdkdemo://'));
            if (url) {
                mainWindow.webContents.send('url-scheme', url);
            }
            // 当运行第二个实例时,将会聚焦到mainWindow这个窗口
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.focus();
            }
        });
    }
}
