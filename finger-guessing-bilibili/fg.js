import { CountUp } from "./countUp.min.js";

const options = {
    useGrouping: false,
};

// var counter = new CountUp('output', 0, options);
// counter.start();

// 阶段状态

var round = 0;
var stage = true;

// 投票部分
var voted = new Map();
var votelist = [[], [], []];
function vote(uid, name, type) {
    if (voted.has(uid)) return;
    voted.set(uid, true);
    scorelist.set(uid, { "name": name, "score": scorelist.get(uid)['score'] - 5 });
    votelist[type].push(uid);
    updateVote();
}
function updateVote() {
    $('#r' + round + ' > .card-body > .content-fluid > .main-content > .row > .col > .vote > .type0 > .count').text('x' + votelist[0].length);
    $('#r' + round + ' > .card-body > .content-fluid > .main-content > .row > .col > .vote > .type1 > .count').text('x' + votelist[1].length);
    $('#r' + round + ' > .card-body > .content-fluid > .main-content > .row > .col > .vote > .type2 > .count').text('x' + votelist[2].length);
}

// 分数部分
var scorelist = new Map();
function scoreEntry(name, score) {
    return (`<ul><span class='name'>${name}</span><span class='score'>${score}</span></ul>`)
}
function newMsg(uid, name, msg) {
    if (!scorelist.has(uid)) {
        scorelist.set(uid, { "name": name, "score": 100 });
    }
    if (!stage) return;
    let type = getType(msg);
    if (type != -1) {
        vote(uid, name, type);
    }
    updateScore();
}
function updateScore() {
    $('.card.score-board > .card-body > .card-text').empty();
    var array = Array.from(scorelist);
    array.sort(function (a, b) { return a[1]['score'] - b[1]['score'] });
    array.forEach(function (e) {
        $('.card.score-board > .card-body > .card-text').append(scoreEntry(e[1]['name'], e[1]['score']));
    });
}
function getType(msg) {
    if (msg.indexOf('#石头') != -1) return 0;
    if (msg.indexOf('#剪刀') != -1) return 1;
    if (msg.indexOf('#布') != -1) return 2;
    return -1;
}

// 游戏部分
function newRound() {
    round++;
    if (round > 3) $('#r' + (round - 3)).remove();
    $('.stage').find('.round').text(round);
    return (`
                    <div class="card main" style="margin-top: 20px;" id="r${round}">
                    <div class="card-body">
                        <div class="content-fluid">
                            <div class="round-tag">第<span class="round">${round}</span>轮</div>
                            <div class="main-content">
                                <div class="row">
                                    <div class="col">
                                        <div class="bot-type middle">?</div>
                                    </div>
                                    <div class="col">
                                        <div class="vs middle">VS</div>
                                    </div>
                                    <div class="col">
                                        <div class="vote middle">
                                            <div class="type0">👊<span class="count">x0</span></div>
                                            <div class="type1">✌️<span class="count">x0</span></div>
                                            <div class="type2">✋<span class="count">x0</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    `)
}

function gameStart() {
    var voteTime = 25;
    var resultTime = 5;
    var votei;
    var resulti;

    function voteDown() {
        $('#stage').text('统计阶段');
        $('#countDown').text(voteTime);
        if (voteTime === 0) {
            clearInterval(votei);
            endRound();
            voteTime = 25;
            return;
        }
        voteTime--;
    }
    function resultDown() {
        $('#stage').text('结算阶段');
        $('#countDown').text(resultTime);
        if (resultTime === 0) {
            clearInterval(resulti);
            beginRound();
            stage = true;
            resultTime = 5;
            return;
        }
        resultTime--;
    }

    function beginRound() {
        voted.clear();
        votelist = [[], [], []];
        $('.card.stage').after(newRound());
        stage = true;
        voteDown();
        votei = setInterval(voteDown, 1000);
    }

    function endRound() {
        stage = false;
        resultDown();
        resulti = setInterval(resultDown, 1000);
        let bot = Math.floor(Math.random() * 3);
        var win = 0;
        switch (bot) {
            case 0:
                $('#r' + round).find('.bot-type').text('👊');
                win = 2;
                break;
            case 1:
                $('#r' + round).find('.bot-type').text('✌️');
                win = 0;
                break;
            case 2:
                $('#r' + round).find('.bot-type').text('✋');
                win = 1;
                break;
            default:
        }
        $('#r' + round).find('.type' + win).addClass('win');
        let totalpt = (votelist[0].length + votelist[1].length + votelist[2].length) * 10;
        let losept = totalpt - votelist[win].length * 10;
        let averagePt = Math.ceil(losept / votelist[win].length);
        if (averagePt === 0) averagePt = 1;
        votelist[win].forEach(function (e) {
            scorelist.set(e, { "name": scorelist.get(e)['name'], "score": scorelist.get(e)['score'] + 5 + averagePt });
        });
        updateScore();
    }
    beginRound();
}

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
    ws.send(encode(JSON.stringify({
        roomid: 843610
    }), 7));
    gameStart();
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
                        // 弹幕显示
                        let uid = body['info'][2][0];
                        let name = body['info'][2][1];
                        let msg = body['info'][1];
                        newMsg(uid, name, msg);
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