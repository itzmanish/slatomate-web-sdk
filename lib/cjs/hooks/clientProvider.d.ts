import * as React from 'react';
import { Client } from '../client';
declare const SlatomateClientProvider: React.FC<{
    client: Client;
}>;
declare const useSlatomateClient: () => Client | null;
export { SlatomateClientProvider, useSlatomateClient };
