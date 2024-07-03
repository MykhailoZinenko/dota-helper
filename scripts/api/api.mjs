export const PLAYER_ID = `879791715`;//`990567883`;

export const STEAM_API_DOMAIN = 'http://api.steampowered.com';

export const GET_HEROES_ID_URL = `${STEAM_API_DOMAIN}/IEconDOTA2_570/GetHeroes/v1`;

export const OPENDOTA_API_DOMAIN = 'https://api.opendota.com';

export const GET_PROFILE_INFO_URL = `${OPENDOTA_API_DOMAIN}/api/players/${PLAYER_ID}`;

export const GET_PROFILE_WL_URL = `${GET_PROFILE_INFO_URL}/wl`;

export const GET_MATCHES_HISTORY_URL = `${GET_PROFILE_INFO_URL}/matches`;

export const GET_MATCH_DETAILS_URL = `${OPENDOTA_API_DOMAIN}/api/matches`;

export const STEAM_API_REQUEST_PARAMS = {
    method: 'GET',
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "X-Requested-With,content-type,origin"
    }
}

export const OPENDOTA_REQUEST_OPTIONS = {
    method: 'GET',
};

export const OPENDOTA_API_MATCHES_URL_PARAMS = {
    limit: 25,
}

export const STEAM_API_HEROES_URL_PARAMS = {
    language: 'en_us',
    key: '50CC25544B5C54DC774F73750192FFE9',
}

export const HEROES_ICONS_URL = 'https://dotabase.dillerm.io/vpk';
export const ITEMS_ICONS_URL = 'https://dotabase.dillerm.io/vpk';

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
