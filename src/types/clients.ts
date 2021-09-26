export type CallOptions = {
    url: string
    method: string
    headers?: Headers
    body?: string
}

export type Headers = {
    [key: string]: string;
}
