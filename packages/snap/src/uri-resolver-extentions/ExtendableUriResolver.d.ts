import { Uri, CoreClient, IUriResolver, IUriResolutionContext, UriPackageOrWrapper } from '@polywrap/core-js';
import { Result } from '@polywrap/result';
import { UriResolverAggregatorBase } from '@polywrap/uri-resolvers-js';
export declare class ExtendableUriResolver extends UriResolverAggregatorBase<Error, Error> {
    private readonly resolverName;
    constructor(resolverName?: string);
    getUriResolvers(uri: Uri, client: CoreClient, resolutionContext: IUriResolutionContext): Promise<Result<IUriResolver<unknown>[], Error>>;
    tryResolveUri(uri: Uri, client: CoreClient, resolutionContext: IUriResolutionContext): Promise<Result<UriPackageOrWrapper, Error>>;
    protected getStepDescription: () => string;
}
