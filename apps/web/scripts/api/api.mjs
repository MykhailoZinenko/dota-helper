export const PLAYER_ID = `879791715`;

export const API_BASE = ``;

export const GET_HEROES_URL = `${API_BASE}/api/heroes`;

export const GET_PROFILE_URL = `${API_BASE}/api/profile/${PLAYER_ID}`;

export const GET_MATCHES_URL = `${API_BASE}/api/matches/${PLAYER_ID}`;

export const REQUEST_OPTIONS = {
    method: 'GET',
};

export function buildUrlWithParams(url, params) {
    if (!params) return url;

    let urlWithParams = url + '/?';

    for (let key in params) {
        if (params[key] !== null) {
            urlWithParams += `${key}=${params[key]}&`;
        }
    }

    urlWithParams = urlWithParams.slice(0, -1);
    return urlWithParams;
}
