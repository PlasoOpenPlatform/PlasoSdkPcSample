# 运行demo
```
electron . --debug
```
# js-sdk接入方法

## 实时课堂
### 接入步骤
#### 1 引入PlasoStyleUpime.js
js地址：https://wwwr.plaso.cn/static/sdk/js/plaso_style_upime-${version}.js
#### 2 创建sdkClient
```javascript
var sdkClient = PlasoStyleUpime.createLiveClient(dom, options, interfaces);
/*参数说明
dom: dom类型。用来装载实时课堂页面的dom节点
options: 对象。详见options
interfaces: 对象。用来传入回调函数，如：showResourceCenter，getExtFileName等。详见interfaces
```
#### 3 关闭实时课堂页面
通过interfaces参数传入onExit回调函数。如果query中未设置autoClose=true或者onClose="close"，需要在回调中执行sdkClient.destroy()
```javascript
function onExit() {
    sdkClient.destroy()
};
```
### options支持的参数
#### query: string
计算query, 参照query.js
必要。加入实时课堂需要签名后的query。query中的onClose参数只支持等于close

### interfaces回调接口
#### showResourceCenter
非必要。用于通知客户端打开资料中心，详见"高级-资料中心"
#### getExtFileName
非必要。用于根据info返回文件访问路径，详见"高级-插入外部文件"

### sdkClient对象的方法
#### insertObject
详见"高级-插入外部文件"
#### destroy()
关闭微课页面，销毁sdkClient对象

## 微课
### 接入步骤
#### 配置环境
* 微课本地录制必须在nw或electron环境下，且当前的html必须是本地html，即location.protocal必须是 **file://** 协议。
* 在app根目录下的 lib/lame/ 中存放lame的可执行文件
* 如果是windows系统，还要在app根目录下的 lib/ 中存放 zip.exe 
#### 1 引入PlasoStyleUpime.js
js地址：https://wwwr.plaso.cn/static/sdk/js/plaso_style_upime-${version}.js
#### 2 创建sdkClient
调用**PlasoStyleUpime.createLocalClient**创建微课录制的sdkClient对象
```javascript
// 使用开发环境appId接入调试时，需要切换到 dev 环境
PlasoStyleUpime.setEnv("dev");

var sdkClient = PlasoStyleUpime.createLocalClient(dom, options, interfaces);
/*参数说明
dom: dom类型。用来装载微课页面的dom节点
options: 对象。详见options
interfaces: 对象。用来传入回调函数，如：showResourceCenter，getExtFileName等。详见interfaces
*/
```
#### 3 保存草稿
* 微课sdk保存草稿后会调用**onSaveDraft**回调，返回**lessonInfo**
* 客户端可根据lessonInfo中返回的信息在本地维护草稿列表
#### 4 上传微课
* 微课sdk在制作完成时会调用onFinished回调，返回**lessonInfo**
* 此时页面不会退出，需要客户端手动调用**sdkClient.destroy()**
* 客户端可以调用PlasoStyleUpime.save方法将微课内容上传到自己的oss

### options支持的参数
#### path: string
必要。制作微课、存放草稿的目录。MAC电脑上为保证有读写权限的，path不要位于**userData**目录外

electron获取**userData**目录方法：
```javascript
var dataPath = app.getPath("userData");
```
#### topic: string
非必要。当传入非空字符串时表示默认微课名，不会在界面上显示，但在制作完成时会弹窗对其进行编辑
#### enablePreview: boolean
非必要。当enablePreview为true时，将开放制作微课过程中预览剪切的功能


### interfaces回调接口
#### onReady
当sdkClient初始化完成后触发
#### onCancel
点击退出按钮时触发。sdk界面不会主动退出，需要调用sdkClient.destroy退出

#### onSaveDraft

当sdk执行保存草稿动作后触发，返回lessonInfo对象，以下是函数定义和lessonInfo的定义：

```typescript
    interface LessonInfo{
        cover: string,//封面地址
        duration:number,//时长
        size:number,//微课文件的大小 单位 b
        topic:string//标题
    }
    declare function onSaveDraft( lessonInfo: LessonInfo ):void
```

#### onFinished

当sdk执行制作完成动作后触发，返回lessonInfo对象，以下是函数定义和lessonInfo的定义(注意和onSaveDraft的区别)：

```typescript
    interface LessonInfo{
        cover: string,//封面地址
        duration:number,//时长
        size:number,//所有文件的大小 单位 b
        topic:string//标题
        fileName:string,//压缩文件地址
        refFile:Array //一个储存额外信息的数组
    }
    declare function onFinished( lessonInfo: LessonInfo ):void
```

#### getOpQuery

微课本地插入word、excel文件时需要调用getOpQuery接口，如果未传入该接口则无法解析文档。接收一个对象，返回Promise, Promise的结果为签名后的query。这个query是一个字符串,包含signature字段,以下是函数定义:

```typescript
    declare function getOpQuery(params: object) : Promise<string>;
    //如:signature=20B3366EABE8A803A1EF1D489707DB0DD7153F16&appId=xxx&validBegin=xxx&validTime=xxx...
    //该字符串必须包含appId、validBegin、validTime、signature字段,以及生成此signature的所有字段
    //对于字段值,请先调用encodeURIComponent(浏览器提供,绑定在window对象上,可以直接调用)
```

#### showResourceCenter
非必要。用于通知客户端打开资料中心，详见"高级-资料中心"
#### getExtFileName
非必要。用于根据info返回文件访问路径，详见"高级-插入外部文件"

### sdkClient对象的方法
#### insertObject
向sdk中插入文件。详见"高级->插入文件"
#### destroy()
关闭微课页面，销毁sdkClient对象
### 上传方法

#### save

上传制作的微课到oss,以下是函数定义和参数声明:

```typescript
    type Query = string//包含appId、validBegin、validTime、signature的签名字符串
    interface OSSToken{
        accessKeyId:string,
        accessKeySecret:string,
        stsToken:string,
        uploadPath:string,//要上传到bucket下的目录路径
        bucket:string,
        region:string,
        provider:string,//要上传到的云,目前仅支持阿里.例provider:"OSS"
        expire:number //有效时间秒数(绝对时间),如 Math.floor((Date.now() / 1000))
    }
    interface saveResult{
        code:number,//标识操作结果状态,0标识成功
        path:string,//上传到的远程oss地址(包含协议域名等完整的地址)
        cover:string//封面地址(包含协议域名等完整的地址)
    }
    interface UploadStatus{
        onUploadProgress?:(uploadedLength:number , totalLength:number ) => void
        onUploadFinished?:(status:saveResult)=> void
    }
    interface OptionParam{
        token:OSSToken,
        uploadStatus?:UploadStatus,
        autoDelete?:boolean//完成后是否清空目录
    }
    declare function save(query:Query,path:string,option:OptionParam):Promise<saveResult>
```

path 是存放微课的目录
OSSToken,参考阿里,不过我们定义的对象里面多了uploadPath字段,表示要上传的目录路径(bucket下)
UploadStatus 是一个对象,可以有两个回调函数onUploadProgress,通知回调进度,onUploadFinished 通知操作结果
autoDelete 表示操作结束后是否把文件删除(默认不删除)
如果当前使用的是开发环境下的appId，需要先执行**PlasoStyleUpime.setEnv("dev");**

## 高级
### 插入外部文件
客户端可以调用sdkClient.insertObject方法插入文件。insertObject方法接收fileObject结构的参数。如果外部文件的地址是非公开、需要签名的或是具有有效期的，还需要在interfaces中实现getExtFileName方法，当fileObject对象中有info属性时，sdkClient会调用getExitFileName(info)获取该文件临时的访问地址
#### fileObject结构
```typescript
enum file_type { PPT=1,IMAGE, PDF, WORD, EXCEL, AUDIO, VIDEO }

interface fileObject{
    type: file_type; // 文件类型
    title: string; // 文件名称
    url?: string; // 文件的可下载地址
    info?: Array<any>; // 文件信息
}
```
fileObject必须包含type属性，number类型，表示文件类型。目前支持PPT, IMAGE, PDF, WORD, EXCEL, AUDIO, VIDEO等类型。使用时请引用**PlasoStyleUpime.FILETYPE**里的宏定义对type属性进行赋值
```javascript
PlasoStyleUpime.FILETYPE = {
    PPT, // 动态ppt
    IMAGE, // 图片
    PDF, // pdf
    WORD, // doc
    EXCEL, // xlsx/xls
    AUDIO, // 音频
    VIDEO // 视频
}
```
* **IMAGE** url属性必须是可供下载图片的地址。title必须带有文件后缀名，否则会导致gif图片被当做jpeg图片插入
* **PDF/WORD/EXCEL** url属性必须是可供下载的pdf文件的地址，文件类型仅用来显示文件类型的图标
* **AUDIO/VIDEO** 可以设置url属性为长期有效的、公开的可以访问的音视频文件全路径，或者设置info属性为表示文件信息的数组，可以通过getExtFileName(info)可以获取文件有效路径
* **PPT** 可以设置url属性为可以下载的ppt文件的地址（仅限实时课堂）

#### getExtFileName
传入表示文件信息的info数组，返回Promise，Promise的结果为文件地址。info数组的内容由使用机构自己定义，保证实时课堂的老师端/学生端、历史课堂、微课里都能调用getExtFileName(info)得到文件的有效路径
```typescript
function getExtFileName(info: Array<any>) : Promise<string>;
```
### 资料中心
客户端在创建sdkClient时，通过interfaces参数传入**showResourceCenter**回调函数，实时课堂speaker/assitant角色界面、微课界面会增加“资料中心”按钮，点击工具栏的文件图标后显示。点击该按钮后会执行**showResourceCenter**回调函数。客户端可以在sdk界面上层显示资料中心窗口，当用户选择文件后，客户端再调用**sdkClient.insertObject**方法将资料中心的文件以**fileObject**的结构插入sdk