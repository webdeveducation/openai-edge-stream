export declare function OpenAIEdgeStream(url: RequestInfo, init: RequestInit, options?: {
    terminationMessage?: string;
    textToEmit?: (data: string) => string;
}): Promise<ReadableStream<any>>;
