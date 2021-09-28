import * as React from 'react';
import { invariant } from 'ts-invariant';
import { SlatomateClient } from '../../client';
import { getSlatomateContext } from '../context';

export function useSlatomateClient(): SlatomateClient {
  const { client } = React.useContext(getSlatomateContext());
  invariant(
    client,
    'No Slatomate Client instance can be found. Please ensure that you ' +
    'have called `SlatomateProvider` higher up in your tree.'
  );
  return client!;
}