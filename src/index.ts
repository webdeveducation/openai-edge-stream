import { createParser } from 'eventsource-parser';

export async function OpenAIEdgeStream(
  url: RequestInfo,
  init: RequestInit,
  options?: {
    terminationMessage?: string;
    textToEmit?: (data: string) => string;
  }
) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const res = await fetch(url, init);

  const stream = new ReadableStream({
    async start(controller) {
      let fullContent = '';
      const emit = async (msg: string) => {
        const queue = encoder.encode(msg);
        controller.enqueue(queue);
      };

      // callback
      async function onParse(event: any) {
        if (event.type === 'event') {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === (options?.terminationMessage || '[DONE]')) {
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
            const queue = encoder.encode(text);
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
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
}
