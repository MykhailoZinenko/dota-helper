import {
    PLAYER_ID,
    GET_HEROES_ID_URL,
    GET_PROFILE_INFO_URL,
    GET_PROFILE_WL_URL,
    GET_MATCHES_HISTORY_URL,
    GET_MATCH_DETAILS_URL,
    STEAM_API_REQUEST_PARAMS,
    OPENDOTA_REQUEST_OPTIONS,
    RAPID_API_REQUEST_OPTIONS,
    RAPID_API_MATCHES_URL_PARAMS,
    STEAM_API_HEROES_URL_PARAMS,
    buildUrlWithParams,
} from "../../api/api.mjs"

import {
    DataManager
} from "../../utils/dataManager.mjs"

export default {

    async getProfileInfo() {
        let profileInfoData = null;
        let profileWlData = null;

        const profileInfoDataManager = new DataManager(GET_PROFILE_INFO_URL, { requestOptions: OPENDOTA_REQUEST_OPTIONS });

        if (profileInfoDataManager.cache) {
            profileInfoData = profileInfoDataManager.cache;
        } else {
            profileInfoData = await profileInfoDataManager.fetch();
        }

        const profileWlDataManager = new DataManager(GET_PROFILE_WL_URL, { requestOptions: OPENDOTA_REQUEST_OPTIONS });

        if (profileWlDataManager.cache) {
            profileWlData = profileWlDataManager.cache;
        } else {
            profileWlData = await profileWlDataManager.fetch();
        }

        let profileInfo = {
            personaname: profileInfoData.profile.personaname,
            avatarfull: profileInfoData.profile.avatarfull,
            wl: profileWlData,
            winrate: (profileWlData.win / (profileWlData.win + profileWlData.lose) * 100).toFixed(2),
        };

        return profileInfo;
    },

    async getMatchesInfo() {
        let matchesInfoData = [];

        let heroesIdData = null;
        let itemsIdData = null;

        $.getJSON('json/heroes-id.json', function (result) {
            heroesIdData = result.result.heroes;
            //console.log(heroesIdData);
        })

        $.getJSON('json/items-id.json', function (result) {
            itemsIdData = result;
            console.log(itemsIdData);
        })

        const matchesDataManager = new DataManager(GET_MATCHES_HISTORY_URL, { params: RAPID_API_MATCHES_URL_PARAMS, requestOptions: RAPID_API_REQUEST_OPTIONS });

        const matchesData = await matchesDataManager.fetch();
        const matches = matchesData.result.matches;

        console.log(matches);

        if (matches.length === 0) {
            throw new Error("No matches!");
        }

        const callbackQueue = [];

        for (const match of matches) {
            const params = { key: RAPID_API_MATCHES_URL_PARAMS.key, account_id: '76561198950833611', match_id: match.match_id };

            const matchDetailDataManager = new DataManager(
                GET_MATCH_DETAILS_URL,
                { params, requestOptions: RAPID_API_REQUEST_OPTIONS }
            );

            if (matchDetailDataManager.cache) {
                matchesInfoData.push(matchDetailDataManager.cache)
            } else {
                const fetchCallback = matchDetailDataManager.fetch.bind(matchDetailDataManager);
                callbackQueue.push(fetchCallback);
            }
        }

        if (callbackQueue.length > 0) {
            let index = 0;
            await new Promise((resolve, reject) => {
                const intervalId = setInterval(() => {
                    matchesInfoData.push(callbackQueue[index]());
                    if (index >= callbackQueue.length - 1) {
                        clearInterval(intervalId);
                        return resolve();
                    }
                    index++;
                }, 25);
            })

            matchesInfoData = await Promise.all(matchesInfoData);
        }

        let matchesArray = [];

        for (const match of matchesInfoData) {
            console.log(match);
            let player = {
                hero: null,
                team: null,
                kills: null,
                deaths: null,
                assists: null,
                networth: null,
                gpm: null,
                xpm: null,
                heroes_damage: null,
                tower_damage: null,
                allies_heal: null,
                lasthits: null,
            }
            let result = null;
            let imgArray = [];
            let itemArray = [];
            for (let item of match.result.players) {
                for (let hero of heroesIdData) {
                    if (hero.id === item.hero_id) imgArray.push(hero.localized_name + '_minimap_icon.webp');
                }
                if (item.account_id === +PLAYER_ID) {
                    for (let hero of heroesIdData) {
                        if (hero.id === item.hero_id) player.hero = hero.localized_name + '_minimap_icon.webp';
                    }
                    player.team = item.team_number === 0 ? 'radiant' : 'dire';
                    player.kills = item.kills;
                    player.deaths = item.deaths;
                    player.assists = item.assists;
                    player.networth = item.net_worth;
                    player.gpm = item.gold_per_min;
                    player.xpm = item.xp_per_min;
                    player.heroes_damage = item.hero_damage;
                    player.tower_damage = item.tower_damage;
                    player.allies_heal = item.hero_healing;
                    player.lasthits = item.last_hits;
                }
            }
            result = ((match.result.radiant_win === true && player.team == 'radiant') || (match.result.radiant_win === false && player.team == 'dire')) ? 'won' : 'lost';
            matchesArray.push({
                player_hero: player.hero,
                player_team: player.team,
                result,
                draft: imgArray,
                networth: player.networth,
                kills: player.kills,
                deaths: player.deaths,
                assists: player.assists,
                kda: (player.kills + player.assists) / player.kills,
                lasthits: player.lasthits,
                gpm: player.gpm,
                xpm: player.xpm,
                items: itemArray,
                heroes_damage: player.heroes_damage,
                tower_damage: player.tower_damage,
                allies_heal: player.allies_heal,
                duration: match.result.duration,
                match_id: match.result.match_id,
            });
        }
        const matchesInfo = matchesArray;

        return matchesInfo;
    },

    heroes: [],

    setHeroesData(data) {
        const heroesObject = {};
        for (const match of data) {
            if (!heroesObject[match.player_hero]) {
                heroesObject[match.player_hero] = {
                    hero: match.player_hero,
                    games: 1,
                    wins: match.result === 'won' ? 1 : 0,
                    loses: match.result === 'won' ? 0 : 1,
                    networth: match.networth,
                    lasthits: match.lasthits,
                    gpm: match.gpm,
                    xpm: match.xpm,
                    kills: match.kills,
                    deaths: match.deaths,
                    assists: match.assists,
                };
            } else {
                heroesObject[match.player_hero].games++;
                match.result === 'won' ? heroesObject[match.player_hero].wins++ : heroesObject[match.player_hero].loses++;
                heroesObject[match.player_hero].networth += match.networth;
                heroesObject[match.player_hero].lasthits += match.lasthits;
                heroesObject[match.player_hero].gpm += match.gpm;
                heroesObject[match.player_hero].xpm += match.xpm;
                heroesObject[match.player_hero].kills += match.kills;
                heroesObject[match.player_hero].deaths += match.deaths;
                heroesObject[match.player_hero].assists += match.assists;
            }
        }

        for (const hero in heroesObject) {
            for (const param in heroesObject[hero]) {
                if (param !== 'hero' && param !== 'games' && param !== 'wins' && param !== 'loses') {
                    heroesObject[hero][param] /= heroesObject[hero].games;
                    console.log(param, heroesObject[hero][param]);
                }
            }
            console.log(heroesObject[hero]);
            heroesObject[hero].winrate = heroesObject[hero].wins / heroesObject[hero].games;
            this.heroes.push(heroesObject[hero]);
        }
        console.log(this.heroes);
    },

    dataSort(arr, param, relationOperator = '>') {
        if (relationOperator === '>') {
            arr.sort((a, b) => (a[param]) > (b[param]) ? 1 : -1);
        } else {
            arr.sort((a, b) => (a[param]) < (b[param]) ? 1 : -1);
        }
        return arr;
    },
}