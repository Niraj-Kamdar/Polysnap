import {
  Wrapper,
  CoreClientConfig,
  Env,
  GetFileOptions,
  GetImplementationsOptions,
  InterfaceImplementations,
  InvokeOptions,
  InvokerOptions,
  QueryOptions,
  Uri,
  createQueryDocument,
  getImplementations,
  parseQuery,
  TryResolveUriOptions,
  IUriResolver,
  CoreClient,
  IUriResolutionContext,
  UriPackageOrWrapper,
  UriResolutionContext,
  getEnvFromUriHistory,
  QueryResult,
  InvokeResult,
} from '@polywrap/core-js';

import { msgpackEncode, msgpackDecode } from "@polywrap/msgpack-js";
import { buildCleanUriHistory } from '@polywrap/uri-resolvers-js';
import { Result, ResultOk, ResultErr } from '@polywrap/result';

export class PolywrapClient implements CoreClient {
  private _config: CoreClientConfig<Uri>;

  constructor(config: CoreClientConfig<Uri>) {
    this._config = config;
  }

  public getConfig(): CoreClientConfig<Uri> {
    return this._config;
  }

  public getInterfaces(): readonly InterfaceImplementations<Uri>[] | undefined {
    return this._config.interfaces;
  }

  public getEnvs(): readonly Env<Uri>[] | undefined {
    return this._config.envs;
  }

  public getResolver(): IUriResolver<unknown> {
    return this._config.resolver;
  }

  public getEnvByUri<TUri extends Uri | string>(
    uri: TUri,
  ): Env<Uri> | undefined {
    const uriUri = Uri.from(uri);

    const envs = this.getEnvs();
    if (!envs) {
      return undefined;
    }

    return envs.find((environment) => Uri.equals(environment.uri, uriUri));
  }

  public async getImplementations<TUri extends Uri | string>(
    uri: TUri,
    options: GetImplementationsOptions = {},
  ): Promise<Result<TUri[], Error>> {
    const isUriTypeString = typeof uri === 'string';
    const applyResolution = Boolean(options.applyResolution);

    const getImplResult = await getImplementations(
      Uri.from(uri),
      this.getInterfaces() ?? [],
      applyResolution ? this : undefined,
      applyResolution ? options.resolutionContext : undefined,
    );

    if (!getImplResult.ok) {
      return getImplResult;
    }

    const uris = isUriTypeString
      ? (getImplResult.value.map((x: Uri) => x.uri) as TUri[])
      : (getImplResult.value as TUri[]);

    return ResultOk(uris);
  }

  public async getManifest<TUri extends Uri | string>(
    uri: TUri,
  ): Promise<Result<unknown, Error>> {
    const load = await this.loadWrapper(Uri.from(uri), undefined);
    if (!load.ok) {
      return load;
    }
    const wrapper = load.value;
    const manifest = wrapper.getManifest();

    return ResultOk(manifest);
  }

  public async getFile<TUri extends Uri | string>(
    uri: TUri,
    options: GetFileOptions,
  ): Promise<Result<string | Uint8Array, Error>> {
    const load = await this.loadWrapper(Uri.from(uri), undefined);
    if (!load.ok) {
      return load;
    }
    const wrapper = load.value;

    return await wrapper.getFile(options);
  }

  public async query<
    TData extends Record<string, unknown> = Record<string, unknown>,
    TVariables extends Record<string, unknown> = Record<string, unknown>,
    TUri extends Uri | string = string,
  >(options: QueryOptions<TVariables, TUri>): Promise<QueryResult<TData>> {
    let result: QueryResult<TData>;

    try {
      const typedOptions: QueryOptions<TVariables, Uri> = {
        ...options,
        uri: Uri.from(options.uri),
      };

      const { uri, query, variables } = typedOptions;

      // Convert the query string into a query document
      const queryDocument =
        typeof query === 'string' ? createQueryDocument(query) : query;

      // Parse the query to understand what's being invoked
      const parseResult = parseQuery(uri, queryDocument, variables);
      if (!parseResult.ok) {
        result = { errors: [parseResult.error as Error] };
        return result;
      }
      const queryInvocations = parseResult.value;

      // Execute all invocations in parallel
      const parallelInvocations: Promise<{
        name: string;
        result: InvokeResult<unknown>;
      }>[] = [];

      for (const invocationName of Object.keys(queryInvocations)) {
        parallelInvocations.push(
          this.invoke({
            ...queryInvocations[invocationName],
            uri: queryInvocations[invocationName].uri,
            // eslint-disable-next-line @typescript-eslint/no-shadow
          }).then((result) => ({
            name: invocationName,
            result,
          })),
        );
      }

      // Await the invocations
      const invocationResults = await Promise.all(parallelInvocations);

      // Aggregate all invocation results
      const data: Record<string, unknown> = {};
      const errors: Error[] = [];

      for (const invocation of invocationResults) {
        if (invocation.result.ok) {
          data[invocation.name] = invocation.result.value;
        } else {
          errors.push(invocation.result.error as Error);
        }
      }

      result = {
        data: data as TData,
        errors: errors.length === 0 ? undefined : errors,
      };
    } catch (error: unknown) {
      if (Array.isArray(error)) {
        result = { errors: error };
      } else {
        result = { errors: [error as Error] };
      }
    }

    return result;
  }

  public async invokeWrapper<
    TData = unknown,
    TUri extends Uri | string = string,
  >(
    options: InvokerOptions<TUri> & { wrapper: Wrapper },
  ): Promise<InvokeResult<TData>> {
    try {
      const typedOptions: InvokeOptions<Uri> = {
        ...options,
        uri: Uri.from(options.uri),
      };

      const wrapper = options.wrapper;
      const invocableResult = await wrapper.invoke(typedOptions, this);

      if (!invocableResult.ok) {
        return ResultErr(invocableResult.error);
      }

      const value = invocableResult.value;

      if (options.encodeResult && !invocableResult.encoded) {
        const encoded = msgpackEncode(value);
        return ResultOk(encoded as unknown as TData);
      } else if (invocableResult.encoded && !options.encodeResult) {
        const decoded = msgpackDecode(value as Uint8Array);
        return ResultOk(decoded as TData);
      } else {
        return ResultOk(value as TData);
      }
    } catch (error) {
      return ResultErr(error);
    }
  }

  public async invoke<TData = unknown, TUri extends Uri | string = string>(
    options: InvokerOptions<TUri>,
  ): Promise<InvokeResult<TData>> {
    try {
      const typedOptions: InvokeOptions<Uri> = {
        ...options,
        uri: Uri.from(options.uri),
      };

      const resolutionContext =
        options.resolutionContext ?? new UriResolutionContext();

      const loadWrapperResult = await this.loadWrapper(
        typedOptions.uri,
        resolutionContext,
      );

      if (!loadWrapperResult.ok) {
        return loadWrapperResult;
      }
      const wrapper = loadWrapperResult.value;

      const resolutionPath = resolutionContext.getResolutionPath();
      const env = getEnvFromUriHistory(
        resolutionPath.length > 0 ? resolutionPath : [typedOptions.uri],
        this,
      );

      const invokeResult = await this.invokeWrapper<TData, Uri>({
        env: env?.env,
        ...typedOptions,
        wrapper,
      });

      if (!invokeResult.ok) {
        return invokeResult;
      }

      return invokeResult;
    } catch (error) {
      return ResultErr(error);
    }
  }

  public async tryResolveUri<TUri extends Uri | string>(
    options: TryResolveUriOptions<TUri>,
  ): Promise<Result<UriPackageOrWrapper, unknown>> {
    const uri = Uri.from(options.uri);

    const uriResolver = this.getResolver();

    const resolutionContext =
      options.resolutionContext ?? new UriResolutionContext();

    const response = await uriResolver.tryResolveUri(
      uri,
      this,
      resolutionContext,
    );

    return response;
  }

  public async loadWrapper(
    uri: Uri,
    resolutionContext?: IUriResolutionContext,
    options?: unknown,
  ): Promise<Result<Wrapper, Error>> {
    if (!resolutionContext) {
      resolutionContext = new UriResolutionContext();
    }

    const result = await this.tryResolveUri({
      uri,
      resolutionContext,
    });

    if (!result.ok) {
      if (result.error) {
        return ResultErr(new Error(result.error));
      }
      return ResultErr(
        Error(
          `Error resolving URI "${uri.uri}"\nResolution Stack: ${JSON.stringify(
            buildCleanUriHistory(resolutionContext.getHistory()),
            null,
            2,
          )}`,
        ),
      );
    }

    const uriPackageOrWrapper = result.value;

    if (uriPackageOrWrapper.type === 'uri') {
      const error = Error(
        `Error resolving URI "${uri.uri}"\nURI not found ${
          uriPackageOrWrapper.uri.uri
        }\nResolution Stack: ${JSON.stringify(
          buildCleanUriHistory(resolutionContext.getHistory()),
          null,
          2,
        )}`,
      );
      return ResultErr(error);
    }

    if (uriPackageOrWrapper.type === 'package') {
      const result = await uriPackageOrWrapper.package.createWrapper(options);

      if (!result.ok) {
        return result;
      }

      return ResultOk(result.value);
    }
    return ResultOk(uriPackageOrWrapper.wrapper);
  }
}
