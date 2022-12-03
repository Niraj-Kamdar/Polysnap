/* eslint-disable no-case-declarations */
import { OnRpcRequestHandler } from '@metamask/snap-types';
import { InvokerOptions } from '@polywrap/core-js';
import { getClient } from './utils';

export const defaultIpfsProviders = [
  'https://ipfs.wrappers.io',
  'https://ipfs.io',
];

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case 'wrap_invoke':
      const invocation = request.params as unknown as InvokerOptions;
      const isApproved = await wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: `${origin}`.substring(0, 40),
            description: `URI: ${invocation.uri}\nMethod: ${invocation.method}`,
            textAreaContent: `Args ${JSON.stringify(invocation.args)}`,
          },
        ],
      });

      if (isApproved === true) {
        const client = await getClient();
        const response = await client.invoke<any>(invocation);
        if (!response.ok) {
          throw response.error;
        }
        return deserializeMap(response.value);
      }
      throw new Error('User declined invocation');
    default:
      throw new Error('Method not found.');
  }
};

// eslint-disable-next-line
function deserializeMap(val: any): any {
  if (val instanceof Map) {
    const obj: Record<string, any> = {};
    for (const [a, b] of val.entries()) {
      obj[a] = deserializeMap(b);
    }
    return obj;
  }
  return val;
}
