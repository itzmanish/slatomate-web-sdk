import Axios, { AxiosInstance } from 'axios'
import { CallOptions } from "./types/clients"

const API_ENDPOINT = process.env.API_URL || "http://localhost:8000"

class SlatomateClient {
    API_ENDPOINT: string
    AUTH_TOKEN: string
    axios: AxiosInstance
    constructor(base_url?: string) {
        this.API_ENDPOINT = base_url || API_ENDPOINT
        this.AUTH_TOKEN = ""
        this.axios = Axios.create({ baseURL: base_url })
    }

    set auth_token(token: string) {
        this.AUTH_TOKEN = token
    }

    call = (opts: CallOptions) => {
        return this.axios.request({
            method: opts.method,
            headers: opts.headers,
            data: opts.body
        })
    }

    callWithAuth = (opts: CallOptions) => {
        return this.axios.request({
            method: opts.method,
            headers: {
                'Authorization': 'APIKEY ' + this.AUTH_TOKEN,
                ...opts.headers
            },
            data: opts.body
        });
    }

}

export { SlatomateClient }