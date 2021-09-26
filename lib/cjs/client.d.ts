declare type CallOptions = {
    url: string;
    method: string;
    headers?: Headers;
    body?: string;
};
declare type Headers = {
    [key: string]: string;
};
declare class Client {
    API_ENDPOINT: string;
    AUTH_TOKEN: string;
    constructor(base_url?: string);
    set auth_token(token: string);
    call: (opts: CallOptions) => Promise<Response>;
    callWithAuth: (opts: CallOptions) => Promise<Response>;
}
export { Client };
