import * as React from 'react';
import { SlatomateClient } from '../../client';
import { canUseSymbol } from '../../utils';

export interface SlatomateContextValue {
    client?: SlatomateClient;
}

// To make sure Slatomate Client doesn't create more than one React context
// (which can lead to problems like having an Apollo Client instance added
// in one context, then attempting to retrieve it from another different
// context), a single Slatomate context is created and tracked in global state.
const contextKey = canUseSymbol
    ? Symbol.for('__SLATOMATE_CONTEXT__')
    : '__SLATOMATE_CONTEXT__';

export function getSlatomateContext(): React.Context<SlatomateContextValue> {
    let context = (React.createContext as any)[contextKey] as React.Context<SlatomateContextValue>;
    if (!context) {
        Object.defineProperty(React.createContext, contextKey, {
            value: context = React.createContext<SlatomateContextValue>({}),
            enumerable: false,
            writable: false,
            configurable: true,
        });
        context.displayName = 'SlatomateContext';
    }
    return context;
}
