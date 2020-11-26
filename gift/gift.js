// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
var urlParams;
(function () {
    var match,
        pl = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
        urlParams[decode(match[1])] = decode(match[2]);
})();
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}


var output = document.getElementById("output");
var mid = urlParams["mid"];
var anitime = 5000;
var inAnimation = false;
var silver = false;
var mustacheRegex = /{{(.*?)}}/g;
var template = {
    'gift': '感谢{{usr}}{{action}}的{{num}}个{{gift}}!',
    'guard': '感谢{{usr}}的{{guard}}',
    'superchat': '{{usr}}的{{num}}元SC：{{superchat}}'
};
var test = urlParams.hasOwnProperty('test');


if (urlParams.hasOwnProperty("template")) template['gift'] = urlParams["template"];
if (urlParams.hasOwnProperty("template-guard")) template['guard'] = urlParams["template-guard"];
if (urlParams.hasOwnProperty("template-sc")) template['superchat'] = urlParams["template-sc"];
if (urlParams.hasOwnProperty("time")) anitime = urlParams["time"] * 1000;
if (urlParams.hasOwnProperty("silver")) silver = urlParams["silver"] === 'true';

var callbacks = {
    'usr': function (d) {
        return '<span class="key">' + d.user + '</span>';
    },
    'action': function (d) {
        return d.action;
    },
    'num': function (d) {
        return '<span class="key">' + d.num + '</span>';
    },
    'gift': function (d) {
        return '<span class="key">' + d.gift + '</span>';
    },
    'superchat': function (d) {
        return '<span class="key">' + d.superchat + '</span>';
    },
    'guard': function (d) {
        var title;
        switch (d.guard) {
            case 1:
                title = '总督';
                break;
            case 2:
                title = '提督';
                break;
            case 3:
                title = '舰长';
                break;
            default:
                title = '上船';
        }
        return '<span class="key">' + title + '</span>';
    }
}

var ImgStorage = localStorage.getItem('gift-img');
var AudioStorage = localStorage.getItem('gift-audio');
var imgSet = false;
var audioSet = false;
var image = $('#gif')
var audio = $('#sound');
audio.prop('muted', true);

if (ImgStorage) {
    image.attr('src', ImgStorage);
    imgSet = true;
}

if (AudioStorage) {
    audio.attr('src', AudioStorage);
    audioSet = true;
}

function tryStart() {
    if (imgSet && audioSet) {
        $('.file-select').prop('hidden', true);
        $('#output').prop('hidden', false);
        audio.prop('muted', false);
        showGift();
    }
}

function defaultStart() {
    imgSet = true;
    audioSet = true;
    tryStart();
}


function clearStorage() {
    localStorage.removeItem('gift-img');
    localStorage.removeItem('gift-audio');
}

function readImage(input) {
    if (input.files && input.files[0]) {
        var URL = window.URL || window.webkitURL;
        var file = input.files[0];
        var FR = new FileReader();
        FR.addEventListener("load", function (e) {
            var buffer = e.target.result;
            localStorage.setItem("gift-img", buffer);
        });
        FR.readAsDataURL(file);
        image[0].src = URL.createObjectURL(file);
        imgSet = true;
        $('#image-form').prop('hidden', true)
        if (imgSet && audioSet) {
            $('.file-select').prop('hidden', true);
            $('#output').prop('hidden', false);
            audio.prop('muted', false);
            tryStart();
        }
    }
}
function readAudio(input) {
    if (input.files && input.files[0]) {
        var URL = window.URL || window.webkitURL;
        var file = input.files[0];
        var FR = new FileReader();
        FR.addEventListener("load", function (e) {
            var buffer = e.target.result;
            localStorage.setItem("gift-audio", buffer);
        });
        FR.readAsDataURL(file);
        audio[0].src = URL.createObjectURL(file);
        audioSet = true;
        $('#audio-form').prop('hidden', true)
        if (imgSet && audioSet) {
            $('.file-select').prop('hidden', true);
            $('#output').prop('hidden', false);
            audio.prop('muted', false);
            tryStart();
        }
    }
}

if (!window.hasOwnProperty('obsstudio')) {
}

class GiftQueue {
    constructor() {
        var arr = [];
        //入队操作  
        this.push = function (element) {
            if (test) return;
            arr.push(element);
            return true;
        };
        //出队操作  
        this.pop = function () {
            if (test) return;
            return arr.shift();
        };
        //获取队首  
        this.getFront = function () {
            if (test) {
                var rd = Math.floor((Math.random() * 3));
                switch (rd) {
                    case 0:
                        return {
                            'type': 'gift',
                            'action': '投喂',
                            'user': 'Xinrea',
                            'num': '99999',
                            'gift': '小电视飞船'
                        }
                    case 1:
                        return {
                            'type': 'guard',
                            'user': 'Xinrea',
                            'guard': 1
                        }
                    case 2:
                        return {
                            'type': 'superchat',
                            'user': 'Xinrea',
                            'num': '1000',
                            'superchat': '测试superchat'
                        }
                }
            }
            return arr[0];
        };
        //获取队尾  
        this.getRear = function () {
            return arr[arr.length - 1];
        };
        //清空队列  
        this.clear = function () {
            arr = [];
        };
        //获取队长  
        this.size = function () {
            if (test) return 1;
            return arr.length;
        };
    }
}

var giftQueue = new GiftQueue();


// 哔哩哔哩websocket处理部分，参考：https://github.com/lovelyyoshino/Bilibili-Live-API/blob/master/API.WebSocket.md
// 其中对于Websocket Frame的构成分析已经过时，具体解析请见代码
const textEncoder = new TextEncoder('utf-8');
const textDecoder = new TextDecoder('utf-8');

const readInt = function (buffer, start, len) {
    let result = 0
    for (let i = len - 1; i >= 0; i--) {
        result += Math.pow(256, len - i - 1) * buffer[start + i]
    }
    return result
}

const writeInt = function (buffer, start, len, value) {
    let i = 0
    while (i < len) {
        buffer[start + i] = value / Math.pow(256, len - i - 1)
        i++
    }
}

const encode = function (str, op) {
    let data = textEncoder.encode(str);
    let packetLen = 16 + data.byteLength;
    let header = [0, 0, 0, 0, 0, 16, 0, 1, 0, 0, 0, op, 0, 0, 0, 1]
    writeInt(header, 0, 4, packetLen)
    return (new Uint8Array(header.concat(...data))).buffer
}
const decode = function (blob) {
    return new Promise(function (resolve, reject) {
        let reader = new FileReader();
        reader.onload = function (e) {
            let buffer = new Uint8Array(e.target.result)
            let result = {}
            result.packetLen = readInt(buffer, 0, 4)
            result.headerLen = readInt(buffer, 4, 2)
            result.ver = readInt(buffer, 6, 2)
            result.op = readInt(buffer, 8, 4)
            result.seq = readInt(buffer, 12, 4)
            if (result.op === 5) {
                result.body = []
                if (result.ver === 0) {
                    let data = buffer.slice(result.headerLen, result.packetLen);
                    let body = textDecoder.decode(data);
                    result.body.push(JSON.parse(body));
                } else if (result.ver === 2) {
                    let newbuffer = pako.inflate(buffer.slice(result.headerLen, result.packetLen));
                    let offset = 0;
                    while (offset < newbuffer.length) {
                        let packetLen = readInt(newbuffer, offset + 0, 4)
                        let headerLen = 16// readInt(buffer,offset + 4,4)
                        let data = newbuffer.slice(offset + headerLen, offset + packetLen);
                        /**
                         *    引入pako做message解压处理，具体代码链接如下
                         *    https://github.com/nodeca/pako/blob/master/dist/pako.js
                         */
                        let body = textDecoder.decode(data);
                        if (body) {
                            result.body.push(JSON.parse(body));
                        }
                        offset += packetLen;
                    }
                }
            } else if (result.op === 3) {
                result.body = {
                    count: readInt(buffer, 16, 4)
                };
            }
            resolve(result)
        }
        reader.readAsArrayBuffer(blob);
    });
}

const ws = new WebSocket('wss://broadcastlv.chat.bilibili.com:2245/sub');
ws.onopen = function () {
    $('#status').text('')
    ws.send(encode(JSON.stringify({
        roomid: Number(mid)
    }), 7));
};

setInterval(function () {
    ws.send(encode('', 2));
}, 30000);

ws.onmessage = async function (msgEvent) {
    const packet = await decode(msgEvent.data);
    switch (packet.op) {
        case 8:
            ws.send(encode('', 2));
            break;
        case 3:
            break;
        case 5:
            packet.body.forEach((body) => {
                switch (body.cmd) {
                    case 'DANMU_MSG':
                        //console.log(`${body.info[2][1]}: ${body.info[1]}`);
                        break;
                    case 'SEND_GIFT':
                        if (!(imgSet && audioSet)) break;
                        NewGift('gift', body);
                        break;
                    case 'COMBO_SEND':
                        if (!(imgSet && audioSet)) break;
                        NewGift('combo', body);
                        break;
                    case 'GUARD_BUY':
                        if (!(imgSet && audioSet)) break;
                        NewGift('guard', body);
                        //if (audio[0].paused && !inAnimation) showGift();
                        break;
                    case 'USER_TOAST_MSG':
                        if (!(imgSet && audioSet)) break;
                        NewGift('guard', body);
                        //if (audio[0].paused && !inAnimation) showGift();
                        break;
                    case 'SUPER_CHAT_MESSAGE_JPN':
                        if (!(imgSet && audioSet)) break;
                        NewGift('superchat', body);
                        break;
                    case 'WELCOME':
                        break;
                    // 此处省略很多其他通知类型
                    default:
                }
            })
            break;
        default:
            console.log(packet);
    }
};

function NewGift(type, raw) {
    var d = null;
    switch (type) {
        case 'gift': {
            // 小心心会在之后以combo_send的形式出现
            if (raw.data.giftName === '小心心') break;
            // 其它银瓜子礼物
            if (raw.data.coin_type != 'gold' && silver) {
                d = {
                    'type': 'gift',
                    'action': raw.data.action,
                    'user': raw.data.uname,
                    'num': raw.data.num,
                    'gift': raw.data.giftName
                }
                break;
            }
            if (raw.data.coin_type != 'gold' && !silver) break;
            // 其它金瓜子礼物
            d = {
                'type': 'gift',
                'action': raw.data.action,
                'user': raw.data.uname,
                'num': raw.data.num,
                'gift': raw.data.giftName
            }
            break;
        }
        case 'combo': {
            // 好像只有小心心会这样显示
            if (!silver) break;
            d = {
                'type': 'gift',
                'action': raw.data.action,
                'user': raw.data.uname,
                'num': raw.data.batch_combo_num,
                'gift': raw.data.gift_name
            }
            break;
        }
        case 'guard':
            d = {
                'type': 'guard',
                'user': raw.data.username,
                'guard': raw.data.guard_level
            }
            break;
        case 'superchat':
            d = {
                'type': 'superchat',
                'user': raw.data.user_info.uname,
                'superchat': raw.data.message,
                'num': raw.data.price
            }
            break;
        default:
            break;
    }
    if (d) {
        giftQueue.push(d);
        if (audio[0].paused && !inAnimation) showGift();
    }
}

function showGift() {
    if (inAnimation) return;
    console.log(giftQueue.size() + " in queue");
    if (giftQueue.size() <= 0) return;
    var d = giftQueue.getFront();
    giftQueue.pop();
    $('.text').html(render(d));
    inAnimation = true;
    $('#output')[0].style.opacity = 1;
    $('#output')[0].style.transform = 'scale(1,1) translate(-50%, -50%)';
    sleep(anitime).then(() => {
        $('#output')[0].style.opacity = 0;
        $('#output')[0].style.transform = 'scale(0.8,0.9) translate(-50%, -50%)';
        sleep(1700).then(() => {
            inAnimation = false;
            if (giftQueue.size() > 0) showGift();
        });
    })
    audio[0].play();
}

function render(data) {
    var text = template[data.type].replace(mustacheRegex, function (match) {
        var id = match.substring(2, match.length - 2);
        if (callbacks[id]) {
            return callbacks[id](data);
        }
        return id;
    });
    return text;
}

tryStart();