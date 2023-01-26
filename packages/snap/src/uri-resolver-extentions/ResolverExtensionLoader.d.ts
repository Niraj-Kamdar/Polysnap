import { Uri, CoreClient, Wrapper, IUriResolutionContext } from '@polywrap/core-js';
import { Result } from '@polywrap/result';
export declare const loadResolverExtension: (currentUri: Uri, resolverExtensionUri: Uri, client: CoreClient, resolutionContext: IUriResolutionContext) => Promise<Result<Wrapper, unknown>>;
