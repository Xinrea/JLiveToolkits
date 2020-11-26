var template = {
    'time': ['#output {',
        'font-size: {{text-size}}px;',
        'font-family:"{{text-font}}";',
        'color: {{text-color}};{{text-shadow-stroke}}',
        'opacity: {{opacity}};',
        '}'
    ].join('\n'),
    'heat': ['#output {',
        'font-size: {{text-size}}px;',
        'font-family:"{{text-font}}";',
        'color: {{text-color}};{{text-shadow-stroke}}',
        'opacity: {{opacity}};',
        '}'
    ].join('\n'),
    'vote': ['#output {',
        'font-family:"{{text-font}}";',
        'color: {{text-color}};',
        'font-size: {{text-size}}px;',
        'opacity: {{opacity}};',
        '}',
        '.optionBar {',
        'background-color: {{option-ftcolor}};',
        'border-radius: {{option-radius}}px;',
        '}',
        '.option {',
        'background-color: {{option-bgcolor}};',
        'border-radius: {{option-radius}}px;',
        '{{option-shadow}}',
        '}',
        '.stroke {',
        '{{text-shadow-stroke}}',
        '}',
    ].join('\n'),
    'gift': ['#output {',
        'font-size: {{text-size}}px;',
        'font-family:"{{text-font}}";',
        'color: {{text-color}};{{text-shadow-stroke}}',
        'opacity: {{opacity}};',
        '}',
        '.key {',
        'color: {{text-keycolor}};',
        '}'
    ].join('\n'),
};

var styles = {};

var mustacheRegex = /{{(.*?)}}/g;

var getValue = function (panel, id) {
    var input = $('#' + panel).find('.' + id);
    if (input) {
        return input.val()
    }
    return id;
}
var isChecked = function (panel, id) {
    return $('#' + panel).find('.' + id).prop('checked');
}
function isChinese(s) {
    return /[\u4e00-\u9fa5]/.test(s);
}
function ch2Unicdoe(str) {
    if (!str) {
        return;
    }
    var unicode = '';
    for (var i = 0; i < str.length; i++) {
        var temp = str.charAt(i);
        if (isChinese(temp)) {
            unicode += '\\' + temp.charCodeAt(0).toString(16) + " ";
        }
        else {
            unicode += temp;
        }
    }
    return unicode;
}
var callbacks = {
    'time': {
        'text-font': function (id) {
            return ch2Unicdoe(getValue('time', id));
        },
        'text-shadow-stroke': function (id) {
            if (!isChecked('time', 'text-stroke') && !isChecked('time', 'text-shadow')) return '';
            var tmp = '\ntext-shadow:\n';
            if (isChecked('time', 'text-stroke')) {
                var size = getValue('time', 'stroke-size');
                var color = getValue('time', 'stroke-color');
                for (var i = -1; i < 2; i++) {
                    for (var j = -1; j < 2; j++) {
                        tmp += i * size + 'px ' + j * size + 'px ' + '0 ' + color;
                        if (i === 1 && j === 1) {
                            if (isChecked('time', 'text-shadow')) {
                                var x = getValue('time', 'shadow-x');
                                var y = getValue('time', 'shadow-y');
                                var b = getValue('time', 'shadow-blur');
                                var c = getValue('time', 'shadow-color');
                                tmp += ',\n' + x + 'px ' + y + 'px ' + b + 'px ' + c + ';';
                            } else {
                                tmp += ';';
                            }
                        } else {
                            tmp += ',\n';
                        }
                    }
                }
            } else {
                var x = getValue('time', 'shadow-x');
                var y = getValue('time', 'shadow-y');
                var b = getValue('time', 'shadow-blur');
                var c = getValue('time', 'shadow-color');
                tmp += x + 'px ' + y + 'px ' + b + 'px ' + c + ';';
            }
            return tmp;
        }
    },
    'heat': {
        'text-font': function (id) {
            return ch2Unicdoe(getValue('heat', id));
        },
        'text-shadow-stroke': function (id) {
            if (!isChecked('heat', 'text-stroke') && !isChecked('heat', 'text-shadow')) return '';
            var tmp = '\ntext-shadow:\n';
            if (isChecked('heat', 'text-stroke')) {
                var size = getValue('heat', 'stroke-size');
                var color = getValue('heat', 'stroke-color');
                for (var i = -1; i < 2; i++) {
                    for (var j = -1; j < 2; j++) {
                        tmp += i * size + 'px ' + j * size + 'px ' + '0 ' + color;
                        if (i === 1 && j === 1) {
                            if (isChecked('heat', 'text-shadow')) {
                                var x = getValue('heat', 'shadow-x');
                                var y = getValue('heat', 'shadow-y');
                                var b = getValue('heat', 'shadow-blur');
                                var c = getValue('heat', 'shadow-color');
                                tmp += ',\n' + x + 'px ' + y + 'px ' + b + 'px ' + c + ';';
                            } else {
                                tmp += ';';
                            }
                        } else {
                            tmp += ',\n';
                        }
                    }
                }
            } else {
                var x = getValue('heat', 'shadow-x');
                var y = getValue('heat', 'shadow-y');
                var b = getValue('heat', 'shadow-blur');
                var c = getValue('heat', 'shadow-color');
                tmp += x + 'px ' + y + 'px ' + b + 'px ' + c + ';';
            }
            return tmp;
        }
    },
    'vote': {
        'option-shadow': function (id) {
            if (isChecked('vote', 'box-shadow')) {
                var tmp = 'box-shadow:';
                var x = getValue('vote', 'box-x');
                var y = getValue('vote', 'box-y');
                var b = getValue('vote', 'box-blur');
                var c = getValue('vote', 'box-color');
                tmp += ' ' + x + 'px ' + y + 'px ' + b + 'px ' + c + ';';
                return tmp;
            }
            return '';
        },
        'text-font': function (id) {
            return ch2Unicdoe(getValue('vote', id));
        },
        'text-shadow-stroke': function (id) {
            if (!isChecked('vote', 'text-stroke') && !isChecked('vote', 'text-shadow')) return '';
            var tmp = 'text-shadow:\n';
            if (isChecked('vote', 'text-stroke')) {
                var size = getValue('vote', 'stroke-size');
                var color = getValue('vote', 'stroke-color');
                for (var i = -1; i < 2; i++) {
                    for (var j = -1; j < 2; j++) {
                        tmp += i * size + 'px ' + j * size + 'px ' + '0 ' + color;
                        if (i === 1 && j === 1) {
                            if (isChecked('vote', 'text-shadow')) {
                                var x = getValue('vote', 'shadow-x');
                                var y = getValue('vote', 'shadow-y');
                                var b = getValue('vote', 'shadow-blur');
                                var c = getValue('vote', 'shadow-color');
                                tmp += ',\n' + x + 'px ' + y + 'px ' + b + 'px ' + c + ';';
                            } else {
                                tmp += ';';
                            }
                        } else {
                            tmp += ',\n';
                        }
                    }
                }
            } else {
                var x = getValue('vote', 'shadow-x');
                var y = getValue('vote', 'shadow-y');
                var b = getValue('vote', 'shadow-blur');
                var c = getValue('vote', 'shadow-color');
                tmp += x + 'px ' + y + 'px ' + b + 'px ' + c + ';';
            }
            return tmp;
        }
    },
    'gift': {
        'text-font': function (id) {
            return ch2Unicdoe(getValue('gift', id));
        },
        'text-shadow-stroke': function (id) {
            if (!isChecked('gift', 'text-stroke') && !isChecked('gift', 'text-shadow')) return '';
            var tmp = '\ntext-shadow:\n';
            if (isChecked('gift', 'text-stroke')) {
                var size = getValue('gift', 'stroke-size');
                var color = getValue('gift', 'stroke-color');
                for (var i = -1; i < 2; i++) {
                    for (var j = -1; j < 2; j++) {
                        tmp += i * size + 'px ' + j * size + 'px ' + '0 ' + color;
                        if (i === 1 && j === 1) {
                            if (isChecked('gift', 'text-shadow')) {
                                var x = getValue('gift', 'shadow-x');
                                var y = getValue('gift', 'shadow-y');
                                var b = getValue('gift', 'shadow-blur');
                                var c = getValue('gift', 'shadow-color');
                                tmp += ',\n' + x + 'px ' + y + 'px ' + b + 'px ' + c + ';';
                            } else {
                                tmp += ';';
                            }
                        } else {
                            tmp += ',\n';
                        }
                    }
                }
            } else {
                var x = getValue('gift', 'shadow-x');
                var y = getValue('gift', 'shadow-y');
                var b = getValue('gift', 'shadow-blur');
                var c = getValue('gift', 'shadow-color');
                tmp += x + 'px ' + y + 'px ' + b + 'px ' + c + ';';
            }
            return tmp;
        }
    },
};

var updateCallback = {
    'time': function (s) {
        $('#time').find('iframe').contents().find('body').find('style').eq(1).html(s);
    },
    'heat': function (s) {
        $('#heat').find('iframe').contents().find('body').find('style').html(s);
    },
    'vote': function (s) {
        $('#vote').find('iframe').contents().find('body').find('style').html(s);
    },
    'gift': function (s) {
        $('#gift').find('iframe').contents().find('body').find('style').html(s);
    },
}

var copyURLCallback = {
    'time': function () {
        var iframe = $('#time').find('iframe');
        return 'https://obs.joi-club.cn/' + iframe.attr('src');
    },
    'heat': function () {
        var iframe = $('#heat').find('iframe');
        return 'https://obs.joi-club.cn/' + iframe.attr('src');
    },
    'vote': function () {
        var iframe = $('#vote').find('iframe');
        var src = iframe.attr('src')
        return 'https://obs.joi-club.cn/' + src.slice(0, -5);
    },
    'gift': function () {
        var iframe = $('#gift').find('iframe');
        var src = iframe.attr('src')
        return 'https://obs.joi-club.cn/' + src.slice(0, -5);
    }
}

var copyCSSCallback = {
    'time': function () {
        return styles['time'];
    },
    'heat': function () {
        return styles['heat'];
    },
    'vote': function () {
        return styles['vote'];
    },
    'gift': function () {
        return styles['gift'];
    }
}
var update = function (event) {
    var panel = $(event.srcElement).parents('.panel').attr('id');
    if ($(event.srcElement).hasClass('time-format')) {
        var iframe = $('#time').find('iframe');
        iframe.attr('src', 'clock/index.html?format=' + getValue(panel, 'time-format'));
        iframe.get(0).addEventListener("load", function () {
            this.removeEventListener("load", arguments.call, false);
            updateStyle(panel, styles[panel]);
        }, false);
    }
    if ($(event.srcElement).hasClass('room') || $(event.srcElement).hasClass('time') || $(event.srcElement).hasClass('opt') || $(event.srcElement).hasClass('template') || $(event.srcElement).hasClass('template-guard') || $(event.srcElement).hasClass('template-sc') || $(event.srcElement).hasClass('silver')) {
        $('.room').val(getValue(panel, 'room'));
        var iframe = $('#heat').find('iframe');
        var iframe2 = $('#vote').find('iframe');
        var iframe3 = $('#gift').find('iframe');
        iframe.attr('src', 'heat/index.html?mid=' + getValue(panel, 'room'));
        iframe2.attr('src', 'vote/index.html?mid=' + getValue(panel, 'room') + '&option=' + getValue('vote', 'opt') + '&time=' + getValue('vote', 'time') + '&test');
        iframe3.attr('src', 'gift/index.html?mid=' + getValue(panel, 'room') + '&time=' + getValue('gift', 'time') + '&template=' + getValue('gift', 'template') + '&template-guard=' + getValue('gift', 'template-guard') + '&template-sc=' + getValue('gift', 'template-sc') + '&silver=' + isChecked('gift', 'silver') + '&test');
        iframe.get(0).addEventListener("load", function () {
            this.removeEventListener("load", arguments.call, false);
            updateStyle('heat', styles['heat']);
        }, false);
        iframe2.get(0).addEventListener("load", function () {
            this.removeEventListener("load", arguments.call, false);
            updateStyle('vote', styles['vote']);
        }, false);
        iframe3.get(0).addEventListener("load", function () {
            this.removeEventListener("load", arguments.call, false);
            updateStyle('gift', styles['gift']);
        }, false);
    }
    render(panel);
}

var updateStyle = function (p, s) {
    updateCallback[p](s);
}

var render = function (panel) {
    var style = template[panel].replace(mustacheRegex, function (match) {
        var id = match.substring(2, match.length - 2);
        if (callbacks[panel][id]) {
            return callbacks[panel][id](id);
        }
        return getValue(panel, id);
    });
    updateStyle(panel, style);
    styles[panel] = style;
}

var renderAll = function () {
    render('time');
    render('heat');
    render('vote');
    render('gift')
}

var copy = function (e) {
    var panel = $(e).parents('.panel').attr('id');
    if ($(e).hasClass('url-btn')) {
        return copyURLCallback[panel]();
    } else {
        return copyCSSCallback[panel]();
    }
}

var inputs = document.querySelectorAll('input');
inputs.forEach(function (input) {
    input.addEventListener('change', update);
    if ($(input).hasClass('room') || $(input).hasClass('time') || $(input).hasClass('opt') || $(input).hasClass('template') || $(input).hasClass('template-guard') || $(input).hasClass('template-sc')) {

    }
    else input.addEventListener('input', update);
});

var selects = document.querySelectorAll('select');
selects.forEach(function (select) {
    select.addEventListener('change', update);
});

new ClipboardJS('button', {
    text: function (trigger) {
        return copy(trigger);
    }
});

renderAll();