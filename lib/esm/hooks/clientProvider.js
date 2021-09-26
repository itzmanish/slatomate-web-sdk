import * as React from 'react';
var SlatomateClientContext = React.createContext(null);
var SlatomateClientProvider = function (_a) {
    var children = _a.children, client = _a.client;
    return (React.createElement(SlatomateClientContext.Provider, { value: client }, children));
};
var useSlatomateClient = function () {
    return React.useContext(SlatomateClientContext);
};
export { SlatomateClientProvider, useSlatomateClient };
