import { getElectronRemote } from './utils.js';

// 保存板书到本地
export const onSaveBoardFn = async (value, callback) => {
    if (value?.fileInfo && value?.fileInfo?.length > 0) {
        let filePathList = [];
        value.fileInfo.forEach((item) => {
            if (item?.filePath && item?.filePath?.length > 0) {
                filePathList.push(...item.filePath);
            }
        });
        if (filePathList.length > 0) {
            try {
                const selectedPaths = await selectDirectory({
                    title: '请选择保存目录',
                    defaultPath: process.env.USERPROFILE,
                    multiSelections: false,
                });

                if (selectedPaths && selectedPaths.length > 0) {
                    const targetDir = selectedPaths[0];
                    const fs = require('fs');
                    const path = require('path');

                    // 确保目标目录存在
                    if (!fs.existsSync(targetDir)) {
                        fs.mkdirSync(targetDir, { recursive: true });
                    }

                    // 复制所有文件
                    for (const filePath of filePathList) {
                        try {
                            const fileName = path.basename(filePath);
                            const targetPath = path.join(targetDir, fileName);
                            fs.copyFileSync(filePath, targetPath);
                            console.log(`文件已复制: ${fileName}`);
                        } catch (err) {
                            console.error(`复制文件失败 ${filePath}:`, err);
                        }
                    }
                    callback(true);
                }
            } catch (error) {
                console.error('选择目录失败:', error);
                callback(false);
            }
        }
    }
};

/**
 * 选择目录的方法
 * @param {Object} options - 配置选项
 * @param {string} options.title - 对话框标题
 * @param {string} options.defaultPath - 默认打开的路径
 * @param {string[]} options.filters - 文件过滤器
 * @param {boolean} options.multiSelections - 是否允许多选
 * @returns {Promise<string[]>} 返回选择的文件路径数组
 */
function selectDirectory(options = {}) {
    const remote = getElectronRemote();
    const defaultOptions = {
        title: '选择目录',
        defaultPath: process.env.HOME || process.env.USERPROFILE,
        properties: ['openDirectory'],
        multiSelections: false,
    };

    const finalOptions = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
        remote.dialog
            .showOpenDialog(finalOptions)
            .then(({ filePaths, canceled }) => {
                console.log(filePaths, canceled, 'filePaths, canceled');
                if (canceled) {
                    reject(new Error('用户取消了选择'));
                } else if (filePaths && filePaths.length > 0) {
                    resolve(filePaths);
                } else {
                    reject(new Error('未选择任何目录'));
                }
            })
            .catch(reject);
    });
}
