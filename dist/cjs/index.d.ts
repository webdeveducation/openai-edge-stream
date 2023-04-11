export declare function OpenAIEdgeStream(url: RequestInfo, init: RequestInit, options?: {
    onStreamStart?: ({ emit, }: {
        emit: (msg: string) => void;
    }) => Promise<void> | void;
    onStreamEnd?: ({ emit, fullContent, }: {
        emit: (msg: string) => void;
        fullContent: string;
    }) => Promise<void> | void;
    terminationMessage?: string;
    textToEmit?: (data: string) => string;
}): Promise<ReadableStream<any>>;
