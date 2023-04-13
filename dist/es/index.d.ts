export declare function streamReader(data: ReadableStream<Uint8Array>, onMessageReceived: (message: {
    event: string;
    content: string;
}) => void): Promise<void>;
export declare function OpenAIEdgeStream(url: RequestInfo, init: RequestInit, options?: {
    terminationMessage?: string;
    textToEmit?: (data: string) => string;
    onBeforeStream?: (options: {
        emit: (msg: string, eventId?: string) => void;
    }) => Promise<void> | void;
    onAfterStream?: (options: {
        emit: (msg: string, eventId?: string) => void;
        fullContent: string;
    }) => Promise<void> | void;
}): Promise<ReadableStream<any>>;
