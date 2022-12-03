import { Uri } from '@polywrap/core-js';
import { ipfsResolverPlugin } from '@polywrap/ipfs-resolver-plugin-js';
import { ipfsPlugin } from '@polywrap/ipfs-plugin-js';
import { httpPlugin } from '@polywrap/http-plugin-js';
import {
  Connection,
  Connections,
  ethereumPlugin,
} from '@polywrap/ethereum-plugin-js';
import { ensResolverPlugin } from '@polywrap/ens-resolver-plugin-js';
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
  // IPFS URI RESOLVER
  if (!ipfsResolverWrapperResult.ok) {
    throw ipfsResolverWrapperResult.error;
  }
  const ipfsUriResolver = new WrapperResolver(
    Uri.from('ens/ipfs-resolver.polywrap.eth'),
    ipfsResolverWrapperResult.value,
  );

  // IPFS RESOLVER
  const ipfsWrapperResult = await ipfsPlugin({}).createWrapper();
  if (!ipfsWrapperResult.ok) {
    throw ipfsWrapperResult.error;
  }
  const ipfsResolver = new WrapperResolver(
    Uri.from('ens/ipfs.polywrap.eth'),
    ipfsWrapperResult.value,
  );

  // HTTP RESOLVER
  const httpWrapperResult = await httpPlugin({}).createWrapper();
  if (!httpWrapperResult.ok) {
    throw httpWrapperResult.error;
  }
  const httpResolver = new WrapperResolver(
    Uri.from('ens/http.polywrap.eth'),
    httpWrapperResult.value,
  );

  // ENS RESOLVER
  const ensWrapperResult = await ensResolverPlugin({}).createWrapper();
  if (!ensWrapperResult.ok) {
    throw ensWrapperResult.error;
  }
  const ensResolver = new WrapperResolver(
    Uri.from('ens/ens-resolver.polywrap.eth'),
    ensWrapperResult.value,
  );

  // Ethereum RESOLVER
  const ethereumWrapperResult = await ethereumPlugin({
    connections: new Connections({
      networks: {
        mainnet: new Connection({
          provider:
            'https://mainnet.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6',
        }),
        goerli: new Connection({
          provider:
            'https://goerli.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6',
        }),
        rinkeby: new Connection({
          provider:
            'https://rinkeby.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6',
        }),
      },
    }),
  }).createWrapper();
  if (!ethereumWrapperResult.ok) {
    throw ethereumWrapperResult.error;
  }
  const ethereumResolver = new WrapperResolver(
    Uri.from('ens/ethereum.polywrap.eth'),
    ensWrapperResult.value,
  );

  // AGGREGATED RESOLVER
  const resolver = RecursiveResolver.from([
    httpResolver,
    ipfsResolver,
    ipfsUriResolver,
    ethereumResolver,
    ensResolver,
    new ExtendableUriResolver(),
  ]);

  return new PolywrapClient({
    interfaces: [
      {
        interface: new Uri('wrap://ens/uri-resolver.core.polywrap.eth'),
        implementations: [
          new Uri('wrap://ens/ens-resolver.polywrap.eth'),
          new Uri('wrap://ens/ipfs-resolver.polywrap.eth'),
        ],
      },
    ],
    envs: [
      {
        uri: new Uri(
          'wrap://ipfs/QmQNkGuqN4KA1Bhb6TVfVy75pSJ3SyRvjbK6rjes9zkNnD',
        ),
        env: {
          provider: 'https://api.thegraph.com',
        },
      },
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
}
