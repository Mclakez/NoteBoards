const BASE_URL = "http://localhost:5000/api"

export const api = {
    get: (endpoint) => request(endpoint),
    post: (endpoint, body) => request(endpoint, 'POST', body),
    patch: (endpoint, body) => request(endpoint, 'PATCH', body),
    delete: (endpoint) => request(endpoint, 'DELETE')
}

const request = async(endpoint, method = 'GET', body = null) => {
    const options = {
        method,
        credentials: 'include',
        headers: {}
        
    }

    if (body && !(body instanceof FormData)) {
        options.headers["Content-Type"] = 'application/json'
        options.body = JSON.stringify(body)
    }

    if( body instanceof FormData) {
        options.body = body
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, options)
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Something went wrong')
    return data
}