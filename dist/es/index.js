import { createParser } from 'eventsource-parser';

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
    return __awaiter(this, void 0, void 0, function* () {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        let counter = 0;
        const res = yield fetch(url, init);
        const stream = new ReadableStream({
            start(controller) {
                var _a, e_1, _b, _c;
                return __awaiter(this, void 0, void 0, function* () {
                    const emit = (msg) => __awaiter(this, void 0, void 0, function* () {
                        const queue = encoder.encode(msg);
                        controller.enqueue(queue);
                    });
                    if (options === null || options === void 0 ? void 0 : options.onStreamStart) {
                        yield options.onStreamStart({ emit });
                    }
                    // callback
                    function onParse(event) {
                        var _a;
                        return __awaiter(this, void 0, void 0, function* () {
                            if (event.type === 'event') {
                                const data = event.data;
                                // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
                                if (data === ((options === null || options === void 0 ? void 0 : options.terminationMessage) || '[DONE]')) {
                                    if (options === null || options === void 0 ? void 0 : options.onStreamEnd) {
                                        yield options.onStreamEnd({ emit });
                                    }
                                    controller.close();
                                    return;
                                }
                                try {
                                    let text = '';
                                    if (options === null || options === void 0 ? void 0 : options.textToEmit) {
                                        text = options.textToEmit(data) || '';
                                    }
                                    else {
                                        const json = JSON.parse(data);
                                        text = ((_a = json.choices[0].delta) === null || _a === void 0 ? void 0 : _a.content) || '';
                                    }
                                    if (counter < 2 && (text.match(/\n/) || []).length) {
                                        // this is a prefix character (i.e., "\n\n"), do nothing
                                        return;
                                    }
                                    const queue = encoder.encode(text);
                                    controller.enqueue(queue);
                                    counter++;
                                }
                                catch (e) {
                                    // maybe parse error
                                    controller.error(e);
                                }
                            }
                        });
                    }
                    // stream response (SSE) from OpenAI may be fragmented into multiple chunks
                    // this ensures we properly read chunks and invoke an event for each SSE event stream
                    const parser = createParser(onParse);
                    try {
                        // https://web.dev/streams/#asynchronous-iteration
                        for (var _d = true, _e = __asyncValues(res.body), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                            _c = _f.value;
                            _d = false;
                            try {
                                const chunk = _c;
                                parser.feed(decoder.decode(chunk));
                            }
                            finally {
                                _d = true;
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                });
            },
        });
        return stream;
    });
}

export { OpenAIEdgeStream };
//# sourceMappingURL=index.js.map
