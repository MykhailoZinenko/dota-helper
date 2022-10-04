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

    info: {
        matches: [],
        heroes: [],
        statistics: {
            average: {
                kills: null,
                deaths: null,
                assists: null,
                gpm: null,
                xpm: null,
                lasthits: null,
                heroes_damage: null,
                allies_heal: null,
                tower_damage: null,
                duration: null
            },
            max: {
                kills: {
                    value: null,
                    heroImg: null
                },
                deaths: {
                    value: null,
                    heroImg: null
                },
                assists: {
                    value: null,
                    heroImg: null
                },
                gpm: {
                    value: null,
                    heroImg: null
                },
                xpm: {
                    value: null,
                    heroImg: null
                },
                lasthits: {
                    value: null,
                    heroImg: null
                },
                heroes_damage: {
                    value: null,
                    heroImg: null
                },
                allies_heal: {
                    value: null,
                    heroImg: null
                },
                tower_damage: {
                    value: null,
                    heroImg: null
                },
                duration: {
                    value: null,
                    heroImg: null
                },
            },
            wins: 0,
            loses: 0,
            winrate: null,
        }
    },

    async getMatchesInfo() {
        let matchesInfoData = [];

        let heroesIdData = null;
        let itemsIdData = null;

        heroesIdData = await (await fetch('json/heroes-id.json')).json();
        heroesIdData = heroesIdData.result.heroes;

        itemsIdData = await (await fetch('json/items-id.json')).json();

        const matchesDataManager = new DataManager(GET_MATCHES_HISTORY_URL, { params: RAPID_API_MATCHES_URL_PARAMS, requestOptions: RAPID_API_REQUEST_OPTIONS });

        const matchesData = await matchesDataManager.fetch();
        const matches = matchesData.result.matches;

        if (matches.length === 0) {
            throw new Error("No matches!");
        }

        /*
        The array below consists of fetching callbacks to be executed in order
         with a delay to prevent the API provider from blocking them */

        const fetchQueue = [];

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
                fetchQueue.push(fetchCallback);
            }
        }

        if (fetchQueue.length > 0) {
            let index = 0;
            await new Promise((resolve, reject) => {
                const intervalId = setInterval(() => {
                    matchesInfoData.push(fetchQueue[index]());
                    if (index >= fetchQueue.length - 1) {
                        clearInterval(intervalId);
                        return resolve();
                    }
                    index++;
                }, 25);
            })

            matchesInfoData = await Promise.all(matchesInfoData);
        }

        let matchesInfo = [];

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
            this.info.matches.push({
                playerHero: player.hero,
                playerTeam: player.team,
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
    },

    setStatisticsData(data) {
        for (const match of data) {
            if (match.result === 'won') this.info.statistics.wins++;
            else this.info.statistics.loses++;

            for (const key in this.info.statistics.average) {
                match[key] ? this.info.statistics.average[key] += match[key] : this.info.statistics.average[key] += 0;
                if (match[key] > this.info.statistics.max[key].value) {
                    this.info.statistics.max[key].value = match[key];
                    this.info.statistics.max[key].heroImg = match.playerHero;
                }
            }
        }

        for (const key in this.info.statistics.average) {
            console.log(this.info.statistics.average[key]);
            this.info.statistics.average[key] = Math.round(this.info.statistics.average[key] / data.length);
        }

        console.log(this.info.statistics.average, this.info.statistics.max);

        this.info.statistics.winrate = this.info.statistics.wins / (this.info.statistics.wins + this.info.statistics.loses) * 100;
    },

    setHeroesData(data) {
        const heroesObject = {};
        for (const match of data) {
            if (!heroesObject[match.playerHero]) {
                heroesObject[match.playerHero] = {
                    hero: match.playerHero,
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
                heroesObject[match.playerHero].games++;
                match.result === 'won' ? heroesObject[match.playerHero].wins++ : heroesObject[match.playerHero].loses++;
                heroesObject[match.playerHero].networth += match.networth;
                heroesObject[match.playerHero].lasthits += match.lasthits;
                heroesObject[match.playerHero].gpm += match.gpm;
                heroesObject[match.playerHero].xpm += match.xpm;
                heroesObject[match.playerHero].kills += match.kills;
                heroesObject[match.playerHero].deaths += match.deaths;
                heroesObject[match.playerHero].assists += match.assists;
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
            this.info.heroes.push(heroesObject[hero]);
        }
        console.log(this.info.heroes);
    },

    async getInfo() {
        await this.getMatchesInfo();
        this.setStatisticsData(this.info.matches);
        this.setHeroesData(this.info.matches);
    },

    getSortedData(arr, param, relationOperator = '>') {
        if (relationOperator === '>') {
            arr.sort((a, b) => (a[param]) > (b[param]) ? 1 : -1);
        } else {
            arr.sort((a, b) => (a[param]) < (b[param]) ? 1 : -1);
        }
        return arr;
    },
}