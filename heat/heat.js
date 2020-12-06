import { CountUp } from "./countUp.min.js";
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

const options = {
    useGrouping: false,
};

var counter = new CountUp('output', 0, options);
counter.start();
var output = document.getElementById("output");
var mid = urlParams["mid"];

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

const ws = new ReconnectingWebSocket('wss://broadcastlv.chat.bilibili.com:2245/sub');
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
            const heat = packet.body.count;
            counter.update(heat);
            break;
        case 5:
            packet.body.forEach((body) => {
                switch (body.cmd) {
                    case 'DANMU_MSG':
                        //console.log(`${body.info[2][1]}: ${body.info[1]}`);
                        break;
                    case 'SEND_GIFT':
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
