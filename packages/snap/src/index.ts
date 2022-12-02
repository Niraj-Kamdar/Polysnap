import { OnRpcRequestHandler } from '@metamask/snap-types';
import { WasmWrapper } from '@polywrap/wasm-js';
import { msgpackDecode } from '@polywrap/msgpack-js';
import { UriResolver, WrapperResolver } from '@polywrap/uri-resolvers-js';
// import { PolywrapClient } from '@polywrap/client-js';
// import { AsyncWasmInstance } from "@polywrap/asyncify-js";
import { PolywrapClient } from './client';
import { module } from './utils';
import { Uri } from '@polywrap/core-js';

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
      // const uri1 = 'wrap://ens/some-uri1.eth';
      // const uri2 = 'wrap://ens/some-uri2.eth';
      // const resolver = UriResolver.from([{ from: uri1, to: uri2 }]);

      const wrapper = await WasmWrapper.from(
        new Uint8Array(),
        new Uint8Array(module),
      );

      const resolver = new WrapperResolver(Uri.from('ens/hello.eth'), wrapper);

      const client = new PolywrapClient({
        interfaces: [],
        envs: [],
        resolver,
      });

      const result = await client.invoke({
        uri: 'ens/hello.eth',
        method: 'simpleMethod',
        args: { arg: 'Hello' },
      });
      if (result.ok) {
        const a = await wallet.request({
          method: 'snap_confirm',
          params: [
            {
              prompt: getMessage(origin),
              description: 'Invoked',
              textAreaContent: result.value,
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
            textAreaContent: result.error ? 'failure' : 'unknown error',
          },
        ],
      });
      return a;
    }
    default:
      throw new Error('Method not found.');
  }
};
