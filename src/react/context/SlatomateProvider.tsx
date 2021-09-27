import * as React from 'react';
import { invariant } from "ts-invariant";
import { SlatomateClient } from '../../client'
import { getSlatomateContext } from './SlatomateContext';

export interface SlatomateProviderProps {
    client: SlatomateClient;
    children: React.ReactNode | React.ReactNode[] | null;
}

export const SlatomateProvider: React.FC<SlatomateProviderProps> = ({
    client,
    children
}) => {
    const SlatomateContext = getSlatomateContext();
    return (
        <SlatomateContext.Consumer>
            {(context: any = {}) => {
                if (client && context.client !== client) {
                    context = Object.assign({}, context, { client });
                }

                invariant(
                    context.client,
                    'SlatomateProvider was not passed a client instance. Make ' +
                    'sure you pass in your client via the "client" prop.'
                );

                return (
                    <SlatomateContext.Provider value={context}>
                        {children}
                    </SlatomateContext.Provider>
                );
            }}
        </SlatomateContext.Consumer>
    );
};