export const PLAYER_ID = `879791715`;//`990567883`;

export const STEAM_API_DOMAIN = 'http://api.steampowered.com';

export const GET_HEROES_ID_URL = `${STEAM_API_DOMAIN}/IEconDOTA2_570/GetHeroes/v1`;

export const OPENDOTA_API_DOMAIN = 'https://api.opendota.com';

export const GET_PROFILE_INFO_URL = `${OPENDOTA_API_DOMAIN}/api/players/${PLAYER_ID}`;

export const GET_PROFILE_WL_URL = `${GET_PROFILE_INFO_URL}/wl`;

export const RAPID_API_DOMAIN = 'https://community-dota-2.p.rapidapi.com';

export const GET_MATCHES_HISTORY_URL = `${RAPID_API_DOMAIN}/IDOTA2Match_570/GetMatchHistory/V001`;

export const GET_MATCH_DETAILS_URL = `${RAPID_API_DOMAIN}/IDOTA2Match_570/GetMatchDetails/V001`;

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

export const RAPID_API_REQUEST_OPTIONS = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': '2728be20a0msha60b2464b6645b6p19f919jsn8a0a0a238521',
        'X-RapidAPI-Host': 'community-dota-2.p.rapidapi.com'
    }
};

export const RAPID_API_MATCHES_URL_PARAMS = {
    key: 'B6A03C37E3E0D4CF79455EFC39A8A41A',
    account_id: '76561198840057443',//'76561198950833611',
    matches_requested: 25,
    format: 'JSON',
    player_name: null, //Search matches with a player name, exact match only
    hero_id: null, // dota/scripts/npc/npc_heroes.txt
    skill: null, //skill 0 for any, 1 for normal, 2 for high, 3 for very high skillnull
    date_min: null, // date in UTC seconds since Jan 1, 1970 (unix time format)
    date_max: null, // date in UTC seconds since Jan 1, 1970 (unix time format)
    league_id: null, // matches for a particular league
    start_at_match_id: null, // Start the search at the indicated match id, descending
};

export const STEAM_API_HEROES_URL_PARAMS = {
    language: 'en_us',
    key: '50CC25544B5C54DC774F73750192FFE9',
}

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


async function getMatchesDetails(matches) {
    const promises = matches.map(async (match) => {
        const id = match['match_id'];

        if (!id) {
            return;
        }

        const url = `${RAPID_API_GET_MATCH_DETAIL_URL}&match_id=${id}`;

        const response = await fetch(url, RAPID_API_REQUEST_OPTIONS);
        const data = await response.json();
        if ('result' in data) {
            return data.result;
        } else {
            return null;
        }
    });

    const matchesDetails = await Promise.all(promises);
    return matchesDetails;
}

async function getMatches(GET_MATCHES_URL) {
    let matches = null;
    try {
        const response = await fetch(GET_MATCHES_URL, RAPID_API_REQUEST_OPTIONS);
        const data = await response.json();
        if ('matches' in data?.result) {
            matches = data.result.matches;
        }
    } catch (error) {
        console.error(error);
    }

    return matches;
}
