import { CoreClient, Uri } from '@polywrap/core-js';
import { IFileReader } from '@polywrap/wasm-js';
import { Result } from '@polywrap/result';
export declare class UriResolverExtensionFileReader implements IFileReader {
    private readonly resolverExtensionUri;
    private readonly wrapperUri;
    private readonly client;
    constructor(resolverExtensionUri: Uri, wrapperUri: Uri, client: CoreClient);
    readFile(filePath: string): Promise<Result<Uint8Array, Error>>;
}
