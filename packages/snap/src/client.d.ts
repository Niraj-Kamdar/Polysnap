import { Wrapper, CoreClientConfig, Env, GetFileOptions, GetImplementationsOptions, InterfaceImplementations, InvokerOptions, QueryOptions, Uri, TryResolveUriOptions, IUriResolver, CoreClient, IUriResolutionContext, UriPackageOrWrapper, QueryResult, InvokeResult } from '@polywrap/core-js';
import { Result } from '@polywrap/result';
export declare class PolywrapClient implements CoreClient {
    private _config;
    constructor(config: CoreClientConfig<Uri>);
    getConfig(): CoreClientConfig<Uri>;
    getInterfaces(): readonly InterfaceImplementations<Uri>[] | undefined;
    getEnvs(): readonly Env<Uri>[] | undefined;
    getResolver(): IUriResolver<unknown>;
    getEnvByUri<TUri extends Uri | string>(uri: TUri): Env<Uri> | undefined;
    getImplementations<TUri extends Uri | string>(uri: TUri, options?: GetImplementationsOptions): Promise<Result<TUri[], Error>>;
    getManifest<TUri extends Uri | string>(uri: TUri): Promise<Result<unknown, Error>>;
    getFile<TUri extends Uri | string>(uri: TUri, options: GetFileOptions): Promise<Result<string | Uint8Array, Error>>;
    query<TData extends Record<string, unknown> = Record<string, unknown>, TVariables extends Record<string, unknown> = Record<string, unknown>, TUri extends Uri | string = string>(options: QueryOptions<TVariables, TUri>): Promise<QueryResult<TData>>;
    invokeWrapper<TData = unknown, TUri extends Uri | string = string>(options: InvokerOptions<TUri> & {
        wrapper: Wrapper;
    }): Promise<InvokeResult<TData>>;
    invoke<TData = unknown, TUri extends Uri | string = string>(options: InvokerOptions<TUri>): Promise<InvokeResult<TData>>;
    tryResolveUri<TUri extends Uri | string>(options: TryResolveUriOptions<TUri>): Promise<Result<UriPackageOrWrapper, unknown>>;
    loadWrapper(uri: Uri, resolutionContext?: IUriResolutionContext, options?: unknown): Promise<Result<Wrapper, Error>>;
}
