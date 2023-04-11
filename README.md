# OpenAI Edge Stream

## Basic usage

Use it like you would with `fetch`:

### Next JS example (with Node)

```js
// api/chat/sendMessage.js
export default function handler(req, res){
  // set appropriate headers for streaming
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");

  const stream = await OpenAIEdgeStream(
    'https://api.openai.com/v1/chat/completions',
    {
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_KEY}`,
      },
      method: 'POST',
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        stream: true,
        messages: [{ role: 'user', content: 'Tell me 5 interesting facts' }],
      }),
    }
  );

  for await (const chunk of stream) {
    res.write(chunk);
  }
  res.end();
}
```

### Next JS example (with Edge Functions)

```js
// api/chat/sendMessage.js
export const config = {
  runtime: 'edge',
}

export default function handler(req){
  const stream = await OpenAIEdgeStream(
    'https://api.openai.com/v1/chat/completions',
    {
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_KEY}`,
      },
      method: 'POST',
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        stream: true,
        messages: [{ role: 'user', content: 'Tell me 5 interesting facts' }],
      }),
    }
  );

  return new Response(stream);
}
```

### Then on the front end:

```js
const handleSendMessage = () => {
  const response = await fetch(`/api/chat/sendMessage`, {
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  });

  // make sure the data is a ReadableStream
  const data = response.body;
  if (!data) {
    return;
  }

  const reader = data.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let content = "";

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value);
    content = content + chunkValue;
    console.log("CHUNK VALUE: ", chunkValue);
  }

  console.log("CONTENT: ", content);
}
```

## Advanced usage

### Overriding the default `terminationMessage`:

The default `terminationMessage` is `[DONE]` (the message sent by OpenAI to determine when the stream has ended), but can be overridden like so:

```js
const stream = await OpenAIEdgeStream(
  'https://api.openai.com/v1/chat/completions',
  {
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [{ role: 'user', content: 'Tell me 5 interesting facts' }],
    }),
  },
  {
    terminationMessage: 'MY TERMINATION MESSAGE OVERRIDE',
  }
);
```

### Overriding the default `textToEmit`:

The default `textToEmit` logic is:

```js
const json = JSON.parse(data);
text = json.choices[0].delta?.content || '';
```

i.e. the data string is emitted from OpenAI's stream, which is stringified JSON, but our actual message content lives in `json.choices[0].delta?.content`. If for some reason you need to access a different property or want to supply your own logic, you can do so:

```js
const stream = await OpenAIEdgeStream(
  'https://api.openai.com/v1/chat/completions',
  {
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [{ role: 'user', content: 'Tell me 5 interesting facts' }],
    }),
  },
  {
    textToEmit: (data) => {
      // access differentProperty and prefix all messages with 'jim '
      const json = JSON.parse(data);
      return `jim ${json.choices[0].delta?.differentProperty || ''}`;
    },
  }
);
```
