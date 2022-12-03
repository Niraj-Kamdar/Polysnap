import { Uri } from '@polywrap/core-js';
import { ipfsResolverPlugin } from '@polywrap/ipfs-resolver-plugin-js';
import { ipfsPlugin } from '@polywrap/ipfs-plugin-js';
import { RecursiveResolver, WrapperResolver } from '@polywrap/uri-resolvers-js';
import { PolywrapClient } from './client';
import { ExtendableUriResolver } from './uri-resolver-extentions';
import { defaultIpfsProviders } from '.';

// eslint-disable-next-line jsdoc/require-description
/**
 *
 */
export async function getClient(): Promise<PolywrapClient> {
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

  return new PolywrapClient({
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
          disableParallelRequests: true,
        },
      },
    ],
    resolver,
  });
}
