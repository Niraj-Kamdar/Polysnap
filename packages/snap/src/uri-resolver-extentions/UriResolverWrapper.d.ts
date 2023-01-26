import { Uri, CoreClient, IUriResolutionContext, UriPackageOrWrapper } from '@polywrap/core-js';
import { Result } from '@polywrap/result';
import { ResolverWithHistory } from '@polywrap/uri-resolvers-js';
export declare class UriResolverWrapper extends ResolverWithHistory<unknown> {
    readonly implementationUri: Uri;
    constructor(implementationUri: Uri);
    protected getStepDescription: () => string;
    protected _tryResolveUri(uri: Uri, client: CoreClient, resolutionContext: IUriResolutionContext): Promise<Result<UriPackageOrWrapper, unknown>>;
}
