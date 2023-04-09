var eventsourceParser = require('eventsource-parser');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function OpenAIEdgeStream(url, init, options) {
    return __awaiter(this, void 0, void 0, function () {
        var encoder, decoder, counter, res, stream;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    encoder = new TextEncoder();
                    decoder = new TextDecoder();
                    counter = 0;
                    return [4 /*yield*/, fetch(url, init)];
                case 1:
                    res = _a.sent();
                    stream = new ReadableStream({
                        start: function (controller) {
                            var _a, e_1, _b, _c;
                            return __awaiter(this, void 0, void 0, function () {
                                // callback
                                function onParse(event) {
                                    var _a;
                                    return __awaiter(this, void 0, void 0, function () {
                                        var data, text, json, queue;
                                        return __generator(this, function (_b) {
                                            switch (_b.label) {
                                                case 0:
                                                    if (!(event.type === 'event')) return [3 /*break*/, 4];
                                                    data = event.data;
                                                    if (!(data === ((options === null || options === void 0 ? void 0 : options.terminationMessage) || '[DONE]'))) return [3 /*break*/, 3];
                                                    if (!(options === null || options === void 0 ? void 0 : options.onStreamEnd)) return [3 /*break*/, 2];
                                                    return [4 /*yield*/, options.onStreamEnd({ emit: emit })];
                                                case 1:
                                                    _b.sent();
                                                    _b.label = 2;
                                                case 2:
                                                    controller.close();
                                                    return [2 /*return*/];
                                                case 3:
                                                    try {
                                                        text = '';
                                                        if (options === null || options === void 0 ? void 0 : options.textToEmit) {
                                                            text = options.textToEmit(data) || '';
                                                        }
                                                        else {
                                                            json = JSON.parse(data);
                                                            text = ((_a = json.choices[0].delta) === null || _a === void 0 ? void 0 : _a.content) || '';
                                                        }
                                                        if (counter < 2 && (text.match(/\n/) || []).length) {
                                                            // this is a prefix character (i.e., "\n\n"), do nothing
                                                            return [2 /*return*/];
                                                        }
                                                        queue = encoder.encode(text);
                                                        controller.enqueue(queue);
                                                        counter++;
                                                    }
                                                    catch (e) {
                                                        // maybe parse error
                                                        controller.error(e);
                                                    }
                                                    _b.label = 4;
                                                case 4: return [2 /*return*/];
                                            }
                                        });
                                    });
                                }
                                var emit, parser, _d, _e, _f, chunk, e_1_1;
                                var _this = this;
                                return __generator(this, function (_g) {
                                    switch (_g.label) {
                                        case 0:
                                            emit = function (msg) { return __awaiter(_this, void 0, void 0, function () {
                                                var queue;
                                                return __generator(this, function (_a) {
                                                    queue = encoder.encode(msg);
                                                    controller.enqueue(queue);
                                                    return [2 /*return*/];
                                                });
                                            }); };
                                            if (!(options === null || options === void 0 ? void 0 : options.onStreamStart)) return [3 /*break*/, 2];
                                            return [4 /*yield*/, options.onStreamStart({ emit: emit })];
                                        case 1:
                                            _g.sent();
                                            _g.label = 2;
                                        case 2:
                                            parser = eventsourceParser.createParser(onParse);
                                            _g.label = 3;
                                        case 3:
                                            _g.trys.push([3, 8, 9, 14]);
                                            _d = true, _e = __asyncValues(res.body);
                                            _g.label = 4;
                                        case 4: return [4 /*yield*/, _e.next()];
                                        case 5:
                                            if (!(_f = _g.sent(), _a = _f.done, !_a)) return [3 /*break*/, 7];
                                            _c = _f.value;
                                            _d = false;
                                            try {
                                                chunk = _c;
                                                parser.feed(decoder.decode(chunk));
                                            }
                                            finally {
                                                _d = true;
                                            }
                                            _g.label = 6;
                                        case 6: return [3 /*break*/, 4];
                                        case 7: return [3 /*break*/, 14];
                                        case 8:
                                            e_1_1 = _g.sent();
                                            e_1 = { error: e_1_1 };
                                            return [3 /*break*/, 14];
                                        case 9:
                                            _g.trys.push([9, , 12, 13]);
                                            if (!(!_d && !_a && (_b = _e.return))) return [3 /*break*/, 11];
                                            return [4 /*yield*/, _b.call(_e)];
                                        case 10:
                                            _g.sent();
                                            _g.label = 11;
                                        case 11: return [3 /*break*/, 13];
                                        case 12:
                                            if (e_1) throw e_1.error;
                                            return [7 /*endfinally*/];
                                        case 13: return [7 /*endfinally*/];
                                        case 14: return [2 /*return*/];
                                    }
                                });
                            });
                        },
                    });
                    return [2 /*return*/, stream];
            }
        });
    });
}

exports.OpenAIEdgeStream = OpenAIEdgeStream;
//# sourceMappingURL=index.js.map
