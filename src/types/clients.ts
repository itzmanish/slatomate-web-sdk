import { Method } from "axios"

export type CallOptions = {
    url: string
    method: Method
    headers?: Headers
    body?: string
}

export type Headers = {
    [key: string]: string;
}
