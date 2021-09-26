const API_ENDPOINT = process.env.API_URL || "http://localhost:8000"

type CallOptions = {
    url: string
    method: string
    headers?: Headers
    body?: string
}

type Headers = {
    [key: string]: string;
}

class Client {
    API_ENDPOINT: string
    AUTH_TOKEN: string
    constructor(base_url?: string) {
        this.API_ENDPOINT = base_url || API_ENDPOINT
        this.AUTH_TOKEN = ""
    }

    set auth_token(token: string) {
        this.AUTH_TOKEN = token
    }

    call = (opts: CallOptions) => {
        return fetch(opts.url, {
            method: opts.method,
            headers: new Headers({
                ...opts.headers
            }),
            body: opts.body
        })
    }

    callWithAuth = (opts: CallOptions) => {
        return fetch(opts.url, {
            method: opts.method,
            headers: new Headers({
                'Authorization': 'APIKEY ' + this.AUTH_TOKEN,
                ...opts.headers
            }),
            body: opts.body
        });
    }

}

export { Client }