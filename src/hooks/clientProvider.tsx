import * as React from 'react';
import { Client } from '../client'

const SlatomateClientContext = React.createContext<Client | null>(null)

const SlatomateClientProvider: React.FC<{ client: Client }> = ({ children, client }) => {

    return (
        <SlatomateClientContext.Provider value={client}>
            {children}
        </SlatomateClientContext.Provider>
    )
}

const useSlatomateClient = () => {
    return React.useContext(SlatomateClientContext)
}

export { SlatomateClientProvider, useSlatomateClient }