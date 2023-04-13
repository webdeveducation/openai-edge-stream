# OpenAI Edge Stream

## Basic usage

Use it like you would with `fetch`:

### Next JS example (with Node)

```js
// api/chat/sendMessage.js
import { OpenAIEdgeStream } from 'openai-edge-stream';

export default async function handler(req, res) {
  // set appropriate headers for streaming
  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream;charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');

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
import { OpenAIEdgeStream } from 'openai-edge-stream';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
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
import { streamReader } from 'openai-edge-stream';

const handleSendMessage = async () => {
  const response = await fetch(`/api/chat/sendMessage`, {
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  });

  let content = '';

  /*
  the second argument to streamReader is the callback for every
  complete message chunk received, in the following structure:
  {
    event: string,
    content: string
  }
  event defaults to "event", but will also be the eventId if
  any custom events that are emitted using the OpenAIEdgeStream's
  onBeforeStream or onAfterStream emit function (reference below)
  */
  await streamReader(response.body, (message) => {
    content = content + message.content;
  });

  console.log('CONTENT: ', content);
};
```

## Advanced usage

### onBeforeStream

If you need to perform any logic or emit a custom message before streaming begins, then you can use the `onBeforeStream` function:

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
    onBeforeStream: ({ emit }) => {
      /*
        emit takes 2 arguments, the message to emit (required)
        and the eventId to assign to this message (optional).
        The eventId can be grabbed in the streamReader as shown in
        the second code snippet below
      */
      emit('my custom message', 'customMessageEvent');
    },
  }
);
```

```js
await streamReader(response.body, (message) => {
  if (message.event === 'customMessageEvent') {
    console.log(message.content); // my custom message
  } else {
    content = content + message.content;
  }
});
```

### onAfterStream

If you need to perform any logic or emit a custom message after streaming has finished, but before the stream closes, then you can use the `onAfterStream` function:

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
    onAfterStream: ({ emit, fullContent }) => {
      /*
        emit is the same as onBeforeStream.
        fullContent contains the entire content that was received
        from OpenAI. This is ideal if needed to persist to a db etc.
      */
    },
  }
);
```

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
