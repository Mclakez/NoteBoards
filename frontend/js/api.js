const BASE_URL = "https://noteboards.onrender.com/api"

function clearAuthSession() {
    localStorage.removeItem('noteboards-user')
    document.cookie = 'token=; Max-Age=0; path=/; SameSite=Lax'
}

function redirectToLoginPage() {
    const isLoginPage = window.location.pathname.endsWith('/login.html')

    if (isLoginPage) {
        return
    }

    clearAuthSession()
    window.location.replace('./login.html')
}

export const api = {
    get: (endpoint) => request(endpoint),
    post: (endpoint, body) => request(endpoint, 'POST', body),
    patch: (endpoint, body) => request(endpoint, 'PATCH', body),
    delete: (endpoint) => request(endpoint, 'DELETE')
}

const request = async(endpoint, method = 'GET', body = null) => {
    const controller = new AbortController()
    const timeoutMs = 15000
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
        const options = {
            method,
            credentials: 'include',
            headers: {},
            signal: controller.signal
        }

        if (body && !(body instanceof FormData)) {
            options.headers["Content-Type"] = 'application/json'
            options.body = JSON.stringify(body)
        }

        if (body instanceof FormData) {
            options.body = body
        }

        const res = await fetch(`${BASE_URL}${endpoint}`, options)
        const contentType = res.headers.get('content-type') || ''
        const data = contentType.includes('application/json') ? await res.json() : {}

        if (!res.ok) {
            const message = data.message || data.error || ''

            if (res.status === 401 || res.status === 403 || /jwt|token/i.test(message)) {
                redirectToLoginPage()
            }

            throw new Error(message || 'Something went wrong')
        }

        return data
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('The server is taking too long to respond. Please try again.')
        }

        throw error
    } finally {
        clearTimeout(timeoutId)
    }
}