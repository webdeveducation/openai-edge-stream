import { createParser } from 'eventsource-parser';

export async function streamReader(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onMessageReceived: (message: { event: string; content: string }) => void
) {
  const decoder = new TextDecoder();
  let done = false;
  let tempValue = '';

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value);
    const chunkPieces = chunkValue.split('\n');
    for (let chunkPiece of chunkPieces) {
      if (chunkPiece) {
        if (tempValue) {
          chunkPiece = tempValue + chunkPiece;
          tempValue = '';
        }

        // match json string and extract it from the chunk
        const match = chunkPiece.match(/\{(.*?)\}/);
        if (match) {
          tempValue = chunkPiece.replace(match[0], '');
          chunkPiece = match[0];
        }

        try {
          const parsed = JSON.parse(chunkPiece);
          onMessageReceived({
            event: parsed.e || 'event',
            content: decodeURI(parsed.c),
          });
        } catch (e) {
          tempValue = chunkPiece;
        }
      }
    }
  }
}

export async function OpenAIEdgeStream(
  url: RequestInfo,
  init: RequestInit,
  options?: {
    terminationMessage?: string;
    textToEmit?: (data: string) => string;
    onBeforeStream?: (options: {
      emit: (msg: string, eventId?: string) => void;
    }) => Promise<void> | void;
    onAfterStream?: (options: {
      emit: (msg: string, eventId?: string) => void;
      fullContent: string;
    }) => Promise<void> | void;
  }
) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const res = await fetch(url, init);

  const stream = new ReadableStream({
    async start(controller) {
      let fullContent = '';

      // callback
      async function onParse(event: any) {
        if (event.event === 'emit') {
          try {
            const data = event.data;
            const json = JSON.parse(data);
            const text = json.message;
            const queue = encoder.encode(
              `{"e": "${json.eventId}", "c": "${encodeURI(text)}"}\n`
            );
            controller.enqueue(queue);
          } catch (e) {
            console.log('ERROR IN CUSTOM EMIT: ', e);
          }
        } else if (event.type === 'event') {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === (options?.terminationMessage || '[DONE]')) {
            if (options?.onAfterStream) {
              await options.onAfterStream({
                emit: (msg, eventId = '') => {
                  const queue = encoder.encode(
                    `{"e": "${eventId}", "c": "${encodeURI(msg)}"}\n`
                  );
                  controller.enqueue(queue);
                },
                fullContent,
              });
            }
            controller.close();
            return;
          }
          try {
            let text = '';
            if (options?.textToEmit) {
              text = options.textToEmit(data) || '';
            } else {
              const json = JSON.parse(data);
              text = json.choices[0].delta?.content || '';
            }

            fullContent = fullContent + text;

            if (counter < 2 && (text.match(/\n/) || []).length) {
              // this is a prefix character (i.e., "\n\n"), do nothing
              return;
            }
            const queue = encoder.encode(`{"c": "${encodeURI(text)}"}\n`);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            // maybe parse error
            controller.error(e);
          }
        }
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse);

      const emit = (msg: string, eventId?: string) => {
        parser.feed(
          `event: emit\ndata: {"eventId": "${eventId}", "message": "${msg}"}\n\n`
        );
      };

      if (options?.onBeforeStream) {
        await options.onBeforeStream({ emit });
      }

      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
}
