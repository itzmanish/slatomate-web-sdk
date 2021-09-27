import * as React from 'react';
import { invariant } from 'ts-invariant'
import { SlatomateClient } from '../../client';
import { getSlatomateContext } from './SlatomateContext';

export interface SlatomateConsumerProps {
    children: (client: SlatomateClient) => React.ReactChild | null;
}

export const SlatomateConsumer: React.FC<SlatomateConsumerProps> = props => {
    const SlatomateContext = getSlatomateContext();
    return (
        <SlatomateContext.Consumer>
            {(context: any) => {
                invariant(
                    context && context.client,
                    'Could not find "client" in the context of SlatomateConsumer. ' +
                    'Wrap the root component in an <SlatomateProvider>.'
                );
                return props.children(context.client);
            }}
        </SlatomateContext.Consumer>
    );
};