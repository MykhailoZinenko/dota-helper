import { RAPID_API_MATCHES_URL_PARAMS } from "../../api/api.mjs";

export default {

    matchesTemplate: document.querySelector('.matches-table__template'),
    matchesTable: document.getElementsByTagName('tbody')[0],
    heroesTemplate: document.querySelector('.heroes-table__template'),
    heroesTable: document.getElementsByTagName('tbody')[1],
    body: document.getElementsByTagName('body')[0],
    buttonToTop: document.querySelector('#to-top'),
    buttonToTopMark: document.querySelector('.mark'),
    openNavButton: document.getElementById('openbtn'),
    profileAnchor: document.getElementById('profile'),
    matchesAnchor: document.getElementById('matches'),
    matchesSortButtonsArray: document.getElementsByClassName('matches-table__sort-button'),
    heroesSortButtonsArray: document.getElementsByClassName('heroes-table__sort-button'),
    heroesAnchor: document.getElementById('heroes'),
    statisticsAnchor: document.getElementById('statistics'),
    matchIdCopyArray: document.getElementsByClassName('text-copy'),

    matchesLastPressedIndex: null,
    heroesLastPressedIndex: null,

    renderPlaceholders() {
        for (let i = 0; i < 25; i++) {
            this.matchesTable.append(this.matchesTemplate.content.cloneNode(true));
            i < 8 ? this.heroesTable.append(this.heroesTemplate.content.cloneNode(true)) : null;
        }
    },

    openNav() {
        let navbar = document.querySelector('.navbar');
        navbar.classList.toggle('active');
        console.log("ok");
    },

    scrollToTop() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    },

    toTop(buttonToTop, buttonToTopMark) {
        if (window.scrollY > 300) {
            buttonToTop.classList.add('show');
        } else {
            buttonToTop.classList.remove('show');
            buttonToTopMark.classList.remove('show');
        }
    },

    copyIdToClipboard(button) {
        let temp = document.createElement('textarea');
        temp.style.position = "fixed";
        temp.style.opcity = "0";
        temp.textContent = button.getAttribute("data-label");
        console.log(button.getAttribute("data-label"));

        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
    },

    pressButtonMatches(buttonIndex) {
        console.log(buttonIndex, this.matchesLastPressedIndex);

        this.matchesSortButtonsArray[buttonIndex].classList.add('pressed');

        if (this.matchesLastPressedIndex !== null) {
            this.matchesSortButtonsArray[this.matchesLastPressedIndex].classList.remove('pressed');
        }

        this.matchesLastPressedIndex = buttonIndex;

        console.log(buttonIndex, this.matchesLastPressedIndex);
    },

    pressButtonHeroes(buttonIndex) {
        console.log(buttonIndex, this.heroesLastPressedIndex);

        this.heroesSortButtonsArray[buttonIndex].classList.add('pressed');

        if (this.heroesLastPressedIndex !== null) {
            this.heroesSortButtonsArray[this.heroesLastPressedIndex].classList.remove('pressed');
        }

        this.heroesLastPressedIndex = buttonIndex;

        console.log(buttonIndex, this.heroesLastPressedIndex);
    },

    renderProfile(data) {
        const profileInfo = document.getElementsByClassName('profile-info')[0];

        profileInfo.innerHTML = `
        <img class="profile-info__logo skeleton" src="${data.avatarfull}">
        <div class="profile-info__content profile-content">
            <div class="profile-content__buttons profile-buttons">
                <a class="profile-buttons__title">${data.personaname}</a>
                <a class="profile-buttons__picture" href="https://steamcommunity.com/profiles/${RAPID_API_MATCHES_URL_PARAMS.account_id}/" target="blank"><img src="image/steam_icon.png" alt=""></a>
            </div>
            <div class="profile-info__stats stats">
                <div class="stats__container wins">
                    <span class="stats__container_text-muted">
                        WINS
                    </span>
                    <span class="stats__container_text-succes">
                        ${data.wl.win}
                    </span>
                </div>
                <div class="stats__container loses">
                    <span class="stats__container_text-muted">
                        LOSES
                    </span>
                    <span class="stats__container_text-danger">
                        ${data.wl.lose}
                    </span>
                </div>
                <div class="stats__container winrate">
                    <span class="stats__container_text-muted">
                        WIN RATE
                    </span>
                    <span class="stats__container_text-info">
                        ${data.winrate}%
                    </span>
                </div>
            </div>
        </div>
        <div class="profile-info__rank"><img src="/image/rank_image-removebg-preview.png" alt="" height="124px"
                width="124px"></div>`;
    },

    renderStats(data) {
        let wins = 0, loses = 0;
        let average = {
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
        };

        let max = {
            kills: {
                value: null,
                hero_img: null
            },
            deaths: {
                value: null,
                hero_img: null
            },
            assists: {
                value: null,
                hero_img: null
            },
            gpm: {
                value: null,
                hero_img: null
            },
            xpm: {
                value: null,
                hero_img: null
            },
            lasthits: {
                value: null,
                hero_img: null
            },
            heroes_damage: {
                value: null,
                hero_img: null
            },
            allies_heal: {
                value: null,
                hero_img: null
            },
            tower_damage: {
                value: null,
                hero_img: null
            },
            duration: {
                value: null,
                hero_img: null
            },
        };


        for (const match of data) {
            if (match.result === 'won') wins++;
            else loses++;

            for (const key in average) {
                match[key] ? average[key] += match[key] : average[key] += 0;
                if (match[key] > max[key].value) {
                    max[key].value = match[key];
                    max[key].hero_img = match.player_hero;
                }
            }
        }

        for (const key in average) {
            console.log(average[key]);
            average[key] = Math.round(average[key] / data.length);
        }

        console.log(average, max);

        const winrate = wins / (wins + loses) * 100;

        const Stats = document.getElementsByClassName('recently-played')[0];
        Stats.innerHTML = `
        <ul class="recently-played__list recent-matches-list">
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        WINRATE
                    </span>
                    <p>
                        ${winrate}%
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        KILLS
                    </span>
                    <p class="_text-succes">
                        ${average.kills}
                        <span class="_text-muted">${max.kills.value}</span>
                        <img src="image/minimap_icons/${max.kills.hero_img}" alt="">
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        DEATHS
                    </span>
                    <p class="_text-danger">
                        ${average.deaths}
                        <span class="_text-muted">${max.deaths.value}</span>
                        <img src="image/minimap_icons/${max.deaths.hero_img}" alt="">
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        ASSISTS
                    </span>
                    <p>
                        ${average.assists}
                        <span class="_text-muted">${max.assists.value}</span>
                        <img src="image/minimap_icons/${max.assists.hero_img}" alt="">
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        GPM
                    </span>
                    <p>
                        ${average.gpm > 1000 ? (average.gpm / 1000).toFixed(1) + 'k' : average.gpm}
                        <span class="_text-muted">${max.gpm.value > 1000 ? (max.gpm.value / 1000).toFixed(1) + 'k' : max.gpm.value}</span>
                        <img src="image/minimap_icons/${max.gpm.hero_img}" alt="">
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        XPM
                    </span>
                    <p>
                        ${average.xpm > 1000 ? (average.xpm / 1000).toFixed(1) + 'k' : average.xpm}
                        <span class="_text-muted">${max.xpm.value > 1000 ? (max.xpm.value / 1000).toFixed(1) + 'k' : max.xpm.value}</span>
                        <img src="image/minimap_icons/${max.xpm.hero_img}" alt="">
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        LASTHITS
                    </span>
                    <p>
                        ${average.lasthits > 1000 ? (average.lasthits / 1000).toFixed(1) + 'k' : average.lasthits}
                        <span class="_text-muted">${max.lasthits.value > 1000 ? (max.lasthits.value / 1000).toFixed(1) + 'k' : max.lasthits.value}</span>
                        <img src="image/minimap_icons/${max.lasthits.hero_img}" alt="">
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        HERO DAMAGE
                    </span>
                    <p>
                        ${average.heroes_damage > 1000 ? (average.heroes_damage / 1000).toFixed(1) + 'k' : average.heroes_damage}
                        <span class="_text-muted">${max.heroes_damage.value > 1000 ? (max.heroes_damage.value / 1000).toFixed(1) + 'k' : max.heroes_damage.value}</span>
                        <img src="image/minimap_icons/${max.heroes_damage.hero_img}" alt="">
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        ALLIES HEAL
                    </span>
                    <p>
                        ${average.allies_heal > 1000 ? (average.allies_heal / 1000).toFixed(1) + 'k' : average.allies_heal}
                        <span class="_text-muted">${max.allies_heal.value > 1000 ? (max.allies_heal.value / 1000).toFixed(1) + 'k' : max.allies_heal.value}</span>
                        <img src="image/minimap_icons/${max.allies_heal.hero_img}" alt="">
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        TOWER DAMAGE
                    </span>
                    <p>
                        ${average.tower_damage > 1000 ? (average.tower_damage / 1000).toFixed(1) + 'k' : average.tower_damage}
                        <span class="_text-muted">${max.tower_damage.value > 1000 ? (max.tower_damage.value / 1000).toFixed(1) + 'k' : max.tower_damage.value}</span>
                        <img src="image/minimap_icons/${max.tower_damage.hero_img}" alt="${max.tower_damage.hero_img}">
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        MATCH DURATION
                    </span>
                    <p>
                        ${Math.floor(average.duration / 60) + ':' + average.duration % 60}
                        <span class="_text-muted">${Math.floor(max.duration.value / 60) + ':' + max.duration.value % 60}</span>
                        <img src="image/minimap_icons/${max.duration.hero_img}" alt="${max.duration.hero_img}">
                    </p>
                </li>
            </ul>`;
    },

    renderMatches(data) {
        const matchesTable = document.getElementsByTagName('tbody')[0];
        matchesTable.innerHTML = `<tr class="matches-table__tr-start"></tr>`;
        let iterator = 0;
        for (const match of data) {
            const current_tr = document.createElement('tr');
            current_tr.classList.add('match-info');

            let current_td = document.createElement('td');
            current_td.classList.add('matches-table__td', 'match-info__num');
            current_td.setAttribute('data-label', '№');

            let text = document.createElement('span');
            text.innerHTML = `${iterator + 1}`;

            current_td.append(text);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('matches-table__td', 'match-info__hero');
            current_td.setAttribute('data-label', 'Hero');

            const playerIconLink = document.createElement('a');
            playerIconLink.setAttribute('target', 'blank');
            playerIconLink.href = `https://dota2.fandom.com/wiki/${match.player_hero.slice(0, -18)}`

            const playerIcon = document.createElement('img');
            playerIcon.src = `image/minimap_icons/${match.player_hero}`;

            playerIconLink.append(playerIcon);
            current_td.append(playerIconLink);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('matches-table__td', 'match-info__result');
            current_td.setAttribute('data-label', 'Result');

            const result = document.createElement('div');

            text = document.createElement('span');
            text.innerHTML = `team_${match.player_team}: `;

            let resultText = document.createElement('span');
            if (match.result === 'won')
                resultText.classList.add('_text-succes');
            else {
                resultText.classList.add('_text-danger');
            }
            resultText.innerHTML = match.result;

            result.append(text, resultText);
            current_td.append(result);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('matches-table__td', 'match-info__draft');
            current_td.setAttribute('data-label', 'Draft');

            const draft = document.createElement('div');
            draft.classList.add('draft');

            const teamRadiant = document.createElement('div');
            teamRadiant.classList.add('team', 'team-radiant');


            const teamDire = document.createElement('div');
            teamDire.classList.add('team', 'team-dire');

            for (let i = 0; i < 10; i++) {
                let icon = document.createElement('img');
                if (match.draft[i] === match.player_hero) icon.classList.add('player-hero');
                icon.src = `image/minimap_icons/${match.draft[i]}`
                if (i < 5) {
                    teamRadiant.append(icon);
                } else {
                    teamDire.append(icon);
                }
            }

            draft.append(teamRadiant, teamDire);
            current_td.append(draft);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('matches-table__td', 'match-info__networth');
            current_td.setAttribute('data-label', 'Networth');

            const networth = document.createElement('span');
            networth.innerHTML = `${match.networth}`;

            current_td.append(networth);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('matches-table__td', 'match-info__kda');
            current_td.setAttribute('data-label', 'K/D/A');

            const kda = document.createElement('span');
            kda.innerHTML = `${match.kills}/${match.deaths}/${match.kills}`;
            text = document.createElement('span');
            text.style.display = "none";
            text.innerHTML = `${(match.kills + match.kills) / match.deaths}`;

            current_td.append(kda, text);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('matches-table__td', 'match-info__gpm');
            current_td.setAttribute('data-label', 'GPM');

            text = document.createElement('span');
            text.innerHTML = match.gpm;

            current_td.append(text);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('matches-table__td', 'match-info__xpm');
            current_td.setAttribute('data-label', 'XPM');

            text = document.createElement('span');
            text.innerHTML = match.xpm;

            current_td.append(text);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('matches-table__td', 'match-info__items');
            current_td.setAttribute('data-label', 'Items');

            text = document.createElement('span');
            if (match.player_hero == "Lone_Druid_minimap_icon.webp") {
                text.innerHTML = "12 items";
            } else {
                text.innerHTML = "6 items";
            }
            current_td.append(text);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('matches-table__td', 'match-info__duration');
            current_td.setAttribute('data-label', 'Duration');

            text = document.createElement('span');
            text.innerHTML = `${Math.floor(match.duration / 60) < 10 ? '0' + Math.floor(match.duration / 60) : Math.floor(match.duration / 60)}:${match.duration % 60 < 10 ? '0' + match.duration % 60 : match.duration % 60}`;

            current_td.append(text);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('matches-table__td', 'match-info__match-id');
            current_td.setAttribute('data-label', 'ID');

            const idLink = document.createElement('button');
            idLink.classList.add('id-link', 'text-copy');
            idLink.setAttribute("data-label", match.match_id);

            const idImg = document.createElement('img');
            idImg.src = 'image/external-link-squared.png';

            idLink.append(idImg);
            current_td.append(idLink);
            current_tr.append(current_td);

            matchesTable.append(current_tr);
            iterator++;
        }
    },

    renderHeroes(data) {
        const heroesTable = document.getElementsByTagName('tbody')[1];
        heroesTable.innerHTML = "";

        let iterator = 0;
        for (const hero of data) {
            const current_tr = document.createElement('tr');
            current_tr.classList.add('heroes-info');

            let current_td = document.createElement('td');
            current_td.classList.add('matches-table__td', 'match-info__num');
            current_td.setAttribute('data-label', '№');

            let text = document.createElement('span');
            text.innerHTML = `${iterator + 1}`;

            current_td.append(text);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('heroes-table__td', 'heroes-info__hero');
            current_td.setAttribute('data-label', 'Hero');

            const playerIconLink = document.createElement('a');
            playerIconLink.setAttribute('target', 'blank');
            playerIconLink.href = `https://dota2.fandom.com/wiki/${hero.hero.slice(0, -18)}`

            const playerIcon = document.createElement('img');
            playerIcon.src = `image/minimap_icons/${hero.hero}`;

            playerIconLink.append(playerIcon);
            current_td.append(playerIconLink);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('heroes-table__td', 'heroes-info__matches');
            current_td.setAttribute('data-label', 'Hero');

            text = document.createElement('span');
            text.innerHTML = hero.games;

            current_td.append(text);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('heroes-table__td', 'heroes-info__winrate');
            current_td.setAttribute('data-label', 'Winrate');

            text = document.createElement('span');

            text.innerHTML = Math.round((hero.wins / hero.games * 100)) + '%';

            if (Math.round((hero.wins / hero.games * 100)) >= 60) {
                text.classList.add('_text-succes');
            } else if (Math.round((hero.wins / hero.games * 100)) < 40) {
                text.classList.add('_text-danger');
            }
            current_td.append(text);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('heroes-table__td', 'heroes-info__networth');
            current_td.setAttribute('data-label', 'Networth (avg)');

            text = document.createElement('span');
            text.innerHTML = Math.round(hero.networth) > 1000 ? (Math.round(hero.networth) / 1000).toFixed(1) + 'k' : Math.round(hero.networth);

            current_td.append(text);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('heroes-table__td', 'heroes-info__lasthits');
            current_td.setAttribute('data-label', 'Lasthits (avg)');

            text = document.createElement('span');
            text.innerHTML = Math.round(hero.lasthits) > 1000 ? (Math.round(hero.lasthits) / 1000).toFixed(1) + 'k' : Math.round(hero.lasthits);

            current_td.append(text);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('heroes-table__td', 'heroes-info__gpm');
            current_td.setAttribute('data-label', 'GPM (avg)');

            text = document.createElement('span');
            text.innerHTML = Math.round(hero.gpm) > 1000 ? (Math.round(hero.gpm) / 1000).toFixed(1) + 'k' : Math.round(hero.gpm);

            current_td.append(text);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('heroes-table__td', 'heroes-info__xpm');
            current_td.setAttribute('data-label', 'XPM (avg)');

            text = document.createElement('span');
            text.innerHTML = Math.round(hero.xpm) > 1000 ? (Math.round(hero.xpm) / 1000).toFixed(1) + 'k' : Math.round(hero.xpm);

            current_td.append(text);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('heroes-table__td', 'heroes-info__kills');
            current_td.setAttribute('data-label', 'Kills');

            text = document.createElement('span');
            text.innerHTML = Math.round(hero.kills);

            current_td.append(text);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('heroes-table__td', 'heroes-info__deaths');
            current_td.setAttribute('data-label', 'Deaths');

            text = document.createElement('span');
            text.innerHTML = Math.round(hero.deaths);

            current_td.append(text);
            current_tr.append(current_td);

            current_td = document.createElement('td');
            current_td.classList.add('heroes-table__td', 'heroes-info__assists');
            current_td.setAttribute('data-label', 'Assists');

            text = document.createElement('span');
            text.innerHTML = Math.round(hero.assists);

            current_td.append(text);
            current_tr.append(current_td);

            heroesTable.append(current_tr);
            iterator++;
        }
    }
}