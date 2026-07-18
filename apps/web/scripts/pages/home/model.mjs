import {
    PLAYER_ID,
    GET_HEROES_URL,
    GET_PROFILE_URL,
    GET_MATCHES_URL,
    REQUEST_OPTIONS,
} from "../../api/api.mjs"

import {
    DataManager
} from "../../utils/dataManager.mjs"

export default {
    async getProfileInfo() {
        const profileManager = new DataManager(GET_PROFILE_URL, { requestOptions: REQUEST_OPTIONS });

        const profile = profileManager.cache ?? await profileManager.fetch();

        return {
            personaname: profile.personaname,
            avatarfull: profile.avatarfull,
            wl: {
                win: this.info.statistics.wins,
                lose: this.info.statistics.loses,
            },
            winrate: this.info.statistics.winrate ? this.info.statistics.winrate.toFixed(2) : '0.00',
            steam_id: profile.steam_id,
        };
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
        const heroesManager = new DataManager(GET_HEROES_URL, { requestOptions: REQUEST_OPTIONS });
        const heroesList = heroesManager.cache ?? await heroesManager.fetch();

        const heroesById = {};
        for (const hero of heroesList) {
            heroesById[hero.id] = hero;
        }

        const matchesManager = new DataManager(GET_MATCHES_URL, { requestOptions: REQUEST_OPTIONS });
        const matches = matchesManager.cache ?? await matchesManager.fetch();

        if (!matches || matches.length === 0) {
            throw new Error("No matches!");
        }

        for (const match of matches) {
            const player = match.players.find((p) => p.account_id === +PLAYER_ID);
            if (!player) continue;

            const isRadiant = player.player_slot < 128;
            const result = (match.radiant_win === isRadiant) ? 'won' : 'lost';

            const draft = match.players.map((p) => heroesById[p.hero_id]);

            this.info.matches.push({
                player_hero: heroesById[player.hero_id],
                player_team: isRadiant ? 'radiant' : 'dire',
                result,
                draft,
                networth: player.net_worth,
                kills: player.kills,
                deaths: player.deaths,
                assists: player.assists,
                kda: (player.kills + player.assists) / player.deaths,
                lasthits: player.last_hits,
                gpm: player.gold_per_min,
                xpm: player.xp_per_min,
                items: [],
                heroes_damage: player.hero_damage,
                tower_damage: player.tower_damage,
                allies_heal: player.hero_healing,
                duration: match.duration,
                match_id: match.match_id,
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
                    this.info.statistics.max[key].hero = match.player_hero;
                }
            }
        }

        for (const key in this.info.statistics.average) {
            this.info.statistics.average[key] = Math.round(this.info.statistics.average[key] / data.length);
        }

        this.info.statistics.winrate = this.info.statistics.wins / (this.info.statistics.wins + this.info.statistics.loses) * 100;
    },

    setHeroesData(data) {
        const heroesObject = {};
        for (const match of data) {
            if (!heroesObject[match.player_hero.name]) {
                heroesObject[match.player_hero.name] = {
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
                heroesObject[match.player_hero.name].games++;
                match.result === 'won' ? heroesObject[match.player_hero.name].wins++ : heroesObject[match.player_hero.name].loses++;
                heroesObject[match.player_hero.name].networth += match.networth;
                heroesObject[match.player_hero.name].lasthits += match.lasthits;
                heroesObject[match.player_hero.name].gpm += match.gpm;
                heroesObject[match.player_hero.name].xpm += match.xpm;
                heroesObject[match.player_hero.name].kills += match.kills;
                heroesObject[match.player_hero.name].deaths += match.deaths;
                heroesObject[match.player_hero.name].assists += match.assists;
            }
        }

        for (const hero in heroesObject) {
            for (const param in heroesObject[hero]) {
                if (param !== 'hero' && param !== 'games' && param !== 'wins' && param !== 'loses') {
                    heroesObject[hero][param] /= heroesObject[hero].games;
                }
            }
            heroesObject[hero].winrate = heroesObject[hero].wins / heroesObject[hero].games;
            this.info.heroes.push(heroesObject[hero]);
        }
    },

    async getInfo() {
        await this.getMatchesInfo();
        this.setStatisticsData(this.info.matches);
        this.setHeroesData(this.info.matches);
    },

    getSortedData(arr, params, relationOperator = '>') {
        params = params.split('.');

        if (relationOperator === '>') {
            arr.sort((a, b) => {
                for (let param of params) {
                    a = a[param];
                    b = b[param];
                }
                return a > b ? 1 : -1;
            });
        } else if (relationOperator === '<') {
            arr.sort((a, b) => {
                for (let param of params) {
                    a = a[param];
                    b = b[param];
                }
                return a < b ? 1 : -1;
            });
        }
        return arr;
    },
}
