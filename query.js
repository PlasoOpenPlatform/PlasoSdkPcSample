
const crypto = require('crypto');

const config = {
    signKey: "",
    appId: "",
}

let classEndTime = Math.ceil(Date.now()/1000) + 3600;
let params = {
    topic: "直播课堂", // 课堂名称
    endTime: classEndTime, // 课堂结束时间, 秒
    mediaType: "video", // 课堂类型：audio-音频课, video-视频课
    meetingId: 22088092, // 课堂ID
    meetingType: "private", // 课堂类型: 
    loginName: "wt", // 登录名
    userType: "speaker", // 用户类型: 主讲、听众、助教、监课、游客
    userName: "用户名",
};

params["d_dimension"] = "1280x720";
params["appId"] = config.appId;
params["appType"] = "liveclassSDK";
params["validBegin"] = Date.now()/1000;
params["validTime"] = 60; // 签名有效期

let keys = Object.keys(params).sort();

let tmpArr1 = []
for (let key of keys) {
    tmpArr1.push(`${key}=${params[key]}`);
}

params["signature"] = crypto.createHmac('sha1', config.signKey).update(tmpArr1.join("&")).digest('hex').toUpperCase();

let tmpArr2 = []
for (let key in params) {
    if (params[key] != undefined) tmpArr2.push(`${key}=${encodeURIComponent(params[key])}`);
}

let query = tmpArr2.join("&");

console.log(query)