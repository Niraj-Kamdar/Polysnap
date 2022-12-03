import { OnRpcRequestHandler } from '@metamask/snap-types';
import { WasmWrapper } from '@polywrap/wasm-js';
import { msgpackDecode } from '@polywrap/msgpack-js';
import {
  PackageToWrapperCacheResolver,
  RecursiveResolver,
  StaticResolver,
  UriResolver,
  UriResolverAggregator,
  WrapperResolver,
} from '@polywrap/uri-resolvers-js';
import { ipfsResolverPlugin } from '@polywrap/ipfs-resolver-plugin-js';
import { ipfsPlugin } from '@polywrap/ipfs-plugin-js';
import { Uri } from '@polywrap/core-js';
// import { AsyncWasmInstance } from "@polywrap/asyncify-js";
import { ExtendableUriResolver } from './uri-resolver-extentions';
import { PolywrapClient } from './client';
// import { module } from './utils';

export const defaultIpfsProviders = [
  'https://ipfs.wrappers.io',
  'https://ipfs.io',
];

/**
 * Get a message from the origin. For demonstration purposes only.
 *
 * @param originString - The origin string.
 * @returns A message based on the origin.
 */
export const getMessage = (originString: string): string =>
  `Hello, ${originString}!`;

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case 'hello': {
      // const wrapper = await WasmWrapper.from(
      //   new Uint8Array(),
      //   new Uint8Array(module),
      // );

      const ipfsResolverWrapperResult = await ipfsResolverPlugin(
        {},
      ).createWrapper();
      if (!ipfsResolverWrapperResult.ok) {
        throw ipfsResolverWrapperResult.error;
      }
      const ipfsUriResolver = new WrapperResolver(
        Uri.from('ens/ipfs-resolver.polywrap.eth'),
        ipfsResolverWrapperResult.value,
      );

      const ipfsWrapperResult = await ipfsPlugin({}).createWrapper();
      if (!ipfsWrapperResult.ok) {
        throw ipfsWrapperResult.error;
      }
      const ipfsResolver = new WrapperResolver(
        Uri.from('ens/ipfs.polywrap.eth'),
        ipfsWrapperResult.value,
      );

      const resolver = RecursiveResolver.from([
        ipfsResolver,
        ipfsUriResolver,
        new ExtendableUriResolver(),
      ]);

      // const resolver = new WrapperResolver(Uri.from('ens/hello.eth'), wrapper);

      const client = new PolywrapClient({
        interfaces: [
          {
            interface: new Uri('wrap://ens/uri-resolver.core.polywrap.eth'),
            implementations: [new Uri('wrap://ens/ipfs-resolver.polywrap.eth')],
          },
        ],
        envs: [
          {
            uri: new Uri('wrap://ens/ipfs.polywrap.eth'),
            env: {
              provider: defaultIpfsProviders[0],
              fallbackProviders: defaultIpfsProviders.slice(1),
            },
          },
        ],
        resolver,
      });

      const result = await client.invoke({
        uri: 'ipfs/QmXDrNvjpGeQ84hNELv4smTjQQB3BYYB2ahAT9DdvZ6Fsc',
        method: 'computeFibonacci',
        args: { n: 10 },
      });

      // const result = await client.invoke({
      //   uri: 'ipfs/QmbYw6XfEmNdR3Uoa7u2U1WRqJEXbseiSoBNBt3yPFnKvi',
      //   method: 'sha3_256',
      //   args: { message: 'Hello World!' },
      // });

      if (result.ok) {
        const a = await wallet.request({
          method: 'snap_confirm',
          params: [
            {
              prompt: getMessage(origin),
              description: 'Invoked',
              textAreaContent: JSON.stringify(result.value),
            },
          ],
        });
        return a;
      }
      const a = await wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: getMessage(origin),
            description: 'Invocation Error',
            textAreaContent: result.error?.message.slice(0, 1000),
          },
        ],
      });
      return a;
    }
    default:
      throw new Error('Method not found.');
  }
};
