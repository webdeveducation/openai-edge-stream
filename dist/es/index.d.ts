export declare function OpenAIEdgeStream(url: RequestInfo, init: RequestInit, options?: {
    onStreamStart?: ({ emit, }: {
        emit: (msg: string) => void;
    }) => Promise<void> | void;
    onStreamEnd?: ({ emit, }: {
        emit: (msg: string) => void;
    }) => Promise<void> | void;
    terminationMessage?: string;
    textToEmit?: (data: string) => string;
}): Promise<ReadableStream<any>>;
