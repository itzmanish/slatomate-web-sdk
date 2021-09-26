import * as React from 'react';
import { SlatomateClient } from '../client'

const SlatomateClientContext = React.createContext<SlatomateClient | null>(null)

const SlatomateClientProvider: React.FC<{ client: SlatomateClient }> = ({ children, client }) => {
    const [context, setContext] = React.useState<SlatomateClient>(client);

    React.useEffect(() => {
        setContext(client);
    }, [client]);

    return context ? (
        <SlatomateClientContext.Provider value={context}>
            {children}
        </SlatomateClientContext.Provider>
    ) : null
}

const useSlatomateClient = () => React.useContext(SlatomateClientContext)

export { SlatomateClientProvider, useSlatomateClient }