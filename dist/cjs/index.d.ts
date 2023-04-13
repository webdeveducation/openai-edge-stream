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
