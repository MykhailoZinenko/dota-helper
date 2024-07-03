import { HEROES_ICONS_URL, ITEMS_ICONS_URL } from "../../api/api.mjs";

export default {
    matchesTemplate: document.querySelector('.matches-table__template'),
    matchesTable: document.querySelector('#matchesTable'),
    heroesTemplate: document.querySelector('.heroes-table__template'),
    heroesTable: document.querySelector('#heroesTable'),
    body: document.querySelector('body'),
    buttonToTop: document.querySelector('#to-top'),
    buttonToTopMark: document.querySelector('.mark'),
    openNavButton: document.querySelector('#openbtn'),
    profileAnchor: document.querySelector('#profile'),
    matchesAnchor: document.querySelector('#matches'),
    matchesSortButtons: document.getElementsByClassName('matches-table__sort-button'),
    heroesSortButtons: document.getElementsByClassName('heroes-table__sort-button'),
    heroesAnchor: document.querySelector('#heroes'),
    statisticsAnchor: document.querySelector('#statistics'),
    matchIdCopyArray: document.getElementsByClassName('text-copy'),

    matchesLastPressedIndex: null,
    heroesLastPressedIndex: null,

    renderPlaceholders() {
        for (let i = 0; i < 25; i++) {
            this.matchesTable.append(this.matchesTemplate.content.cloneNode(true));
        }
    },

    openNav() {
        let navbar = document.querySelector('.navbar');
        navbar.classList.toggle('active');
    },

    scrollToTop() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    },

    buttonToTopClassToggler(buttonToTop, buttonToTopMark) {
        if (window.scrollY > 300) {
            buttonToTop.classList.add('show');
        } else {
            buttonToTop.classList.remove('show');
            buttonToTopMark.classList.remove('show');
        }
    },

    copyIdToClipboard(button) {
        navigator.clipboard.writeText(button.getAttribute("data-label"));
    },

    handleSortMatches(buttonIndex) {
        this.matchesSortButtons[buttonIndex].classList.add('active');

        if (this.matchesLastPressedIndex !== null) {
            this.matchesSortButtons[this.matchesLastPressedIndex].classList.remove('active');
        }

        this.matchesLastPressedIndex = buttonIndex;
    },

    handleSortHeroes(buttonIndex) {
        this.heroesSortButtons[buttonIndex].classList.add('active');

        if (this.heroesLastPressedIndex !== null) {
            this.heroesSortButtons[this.heroesLastPressedIndex].classList.remove('active');
        }

        this.heroesLastPressedIndex = buttonIndex;
    },

    loadImageWithSkeleton(imgElement, src, width = 24, height = 24) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton';
        skeleton.style.cssText = `width: ${width}px; height: ${height}px; margin: 2px;`;
        imgElement.parentNode.insertBefore(skeleton, imgElement);
        imgElement.style.display = 'none';
    
        imgElement.src = src;
        imgElement.onload = () => {
            skeleton.remove();
            imgElement.style.display = '';
        };
    },

    renderProfile(data) {
        const profileInfo = document.getElementsByClassName('profile-info')[0];

        profileInfo.innerHTML = `
        <img class="profile-info__logo skeleton" src="${data.avatarfull}">
        <div class="profile-info__content profile-content">
            <div class="profile-content__buttons profile-buttons">
                <a class="profile-buttons__title">${data.personaname}</a>
                <a class="profile-buttons__picture" href="https://steamcommunity.com/profiles/${data.steam_id}/" target="blank"><img src="image/steam_icon.png" alt=""></a>
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
        const Stats = document.getElementsByClassName('recently-played')[0];
        Stats.innerHTML = `
        <ul class="recently-played__list recent-matches-list">
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        WINRATE
                    </span>
                    <p>
                        ${data.winrate}%
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        KILLS
                    </span>
                    <p class="_text-succes">
                        ${data.average.kills}
                        <span class="_text-muted">${data.max.kills.value}</span>
                        <img src="${HEROES_ICONS_URL}/${data.max.kills.hero.icon}" alt="">
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        DEATHS
                    </span>
                    <p class="_text-danger">
                        ${data.average.deaths}
                        <span class="_text-muted">${data.max.deaths.value}</span>
                        <img src="${HEROES_ICONS_URL}/${data.max.deaths.hero.icon}" alt="">
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        ASSISTS
                    </span>
                    <p>
                        ${data.average.assists}
                        <span class="_text-muted">${data.max.assists.value}</span>
                        <img src="${HEROES_ICONS_URL}/${data.max.assists.hero.icon}" alt="">
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        GPM
                    </span>
                    <p>
                        ${data.average.gpm > 1000 ? (data.average.gpm / 1000).toFixed(1) + 'k' : data.average.gpm}
                        <span class="_text-muted">${data.max.gpm.value > 1000 ? (data.max.gpm.value / 1000).toFixed(1) + 'k' : data.max.gpm.value}</span>
                        <img src="${HEROES_ICONS_URL}/${data.max.gpm.hero.icon}" alt="">
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        XPM
                    </span>
                    <p>
                        ${data.average.xpm > 1000 ? (data.average.xpm / 1000).toFixed(1) + 'k' : data.average.xpm}
                        <span class="_text-muted">${data.max.xpm.value > 1000 ? (data.max.xpm.value / 1000).toFixed(1) + 'k' : data.max.xpm.value}</span>
                        <img src="${HEROES_ICONS_URL}/${data.max.xpm.hero.icon}" alt="">
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        LASTHITS
                    </span>
                    <p>
                        ${data.average.lasthits > 1000 ? (data.average.lasthits / 1000).toFixed(1) + 'k' : data.average.lasthits}
                        <span class="_text-muted">${data.max.lasthits.value > 1000 ? (data.max.lasthits.value / 1000).toFixed(1) + 'k' : data.max.lasthits.value}</span>
                        <img src="${HEROES_ICONS_URL}/${data.max.lasthits.hero.icon}" alt="">
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        HERO DAMAGE
                    </span>
                    <p>
                        ${data.average.heroes_damage > 1000 ? (data.average.heroes_damage / 1000).toFixed(1) + 'k' : data.average.heroes_damage}
                        <span class="_text-muted">${data.max.heroes_damage.value > 1000 ? (data.max.heroes_damage.value / 1000).toFixed(1) + 'k' : data.max.heroes_damage.value}</span>
                        <img src="${HEROES_ICONS_URL}/${data.max.heroes_damage.hero.icon}" alt="">
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        ALLIES HEAL
                    </span>
                    <p>
                        ${data.average.allies_heal > 1000 ? (data.average.allies_heal / 1000).toFixed(1) + 'k' : data.average.allies_heal}
                        <span class="_text-muted">${data.max.allies_heal.value > 1000 ? (data.max.allies_heal.value / 1000).toFixed(1) + 'k' : data.max.allies_heal.value}</span>
                        <img src="${HEROES_ICONS_URL}/${data.max.allies_heal.hero.icon}" alt="">
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        TOWER DAMAGE
                    </span>
                    <p>
                        ${data.average.tower_damage > 1000 ? (data.average.tower_damage / 1000).toFixed(1) + 'k' : data.average.tower_damage}
                        <span class="_text-muted">${data.max.tower_damage.value > 1000 ? (data.max.tower_damage.value / 1000).toFixed(1) + 'k' : data.max.tower_damage.value}</span>
                        <img src="${HEROES_ICONS_URL}/${data.max.tower_damage.hero.icon}" alt="${data.max.tower_damage.hero.icon}">
                    </p>
                </li>
                <li class="recent-matches-list__item ">
                    <span class="_text-muted">
                        MATCH DURATION
                    </span>
                    <p>
                        ${Math.floor(data.average.duration / 60) + ':' + data.average.duration % 60}
                        <span class="_text-muted">${Math.floor(data.max.duration.value / 60) + ':' + data.max.duration.value % 60}</span>
                        <img src="${HEROES_ICONS_URL}/${data.max.duration.hero.icon}" alt="${data.max.duration.hero.icon}">
                    </p>
                </li>
            </ul>`;
    },

    renderMatches(data) {
        this.matchesTable.innerHTML = `<tr class="matches-table__tr-start"></tr>`;
        let iterator = 0;
        for (const match of data) {
            const current_tr = document.createElement('tr');

            current_tr.classList.add('match-info');
            current_tr.innerHTML = `
            <tr class="match-info" style="width: 100%">
                <td class="matches-table__td match-info__match-id" data-label="№">
                    ${iterator + 1}
                </td>
                <td class="matches-table__td match-info__hero" data-label="Hero">
                    <a href="https://dota2.fandom.com/wiki/${match.player_hero.localized_name}" target="blank">
                        <img alt="${match.player_hero.localized_name}">
                    </a>
                </td>
                <td class="matches-table__td match-info__result" data-label="Result">
                    <div>
                        <span>team_${match.playerTeam}: </span>
                        <span class="${match.result === 'won' ? "_text-succes" : "_text-danger"}">${match.result}</span>
                    </div>
                </td>
                <td class="matches-table__td match-info__draft" data-label="Draft">
                    <div class="draft">
                        <div class="team team-radiant">
                            ${match.draft.slice(0, 5).map((hero, index) => `
                                <img class="${hero === match.player_hero ? "player-hero" : ""}" 
                                     alt="Hero ${index + 1}">
                            `).join('')}
                        </div>
                        <div class="team team-dire">
                            ${match.draft.slice(5, 10).map((hero, index) => `
                                <img class="${hero === match.player_hero ? "player-hero" : ""}" 
                                     alt="Hero ${index + 6}">
                            `).join('')}
                        </div>
                    </div>
                </td>
                <td class="matches-table__td match-info__networth" data-label="Networth">
                    <span>${match.networth}</span>
                </td>
                <td class="matches-table__td match-info__kda" data-label="K/D/A">
                    <span>${match.kills}/${match.deaths}/${match.assists}</span>
                    <span style="display: none;">${(match.kills + match.assits) / match.deaths}</span>
                </td>
                <td class="matches-table__td match-info__gpm" valign="center"
                    data-label="GPM">
                    <span>${match.gpm}</span>
                </td>
                <td class="matches-table__td match-info__xpm" data-label="XPM">
                    <span>${match.xpm}</span>
                </td>
                <td class="matches-table__td match-info__items" data-label="Items">
                    <div class="items-container">
                        ${match.items.map((item, index) => `
                            <img class="${!item ? "empty" : ""}" 
                                 alt="Item ${index + 1}">
                        `).join('')}
                    </div>
                </td>
                <td class="matches-table__td match-info__duration" data-label="Duration">
                    <span>
                    ${Math.floor(match.duration / 60) < 10 ? '0' + Math.floor(match.duration / 60) : Math.floor(match.duration / 60)}:${match.duration % 60 < 10 ? '0' + match.duration % 60 : match.duration % 60}
                    </span>
                </td>
                <td class="matches-table__td match-info__match-id" data-label="ID">
                    <button class="id-link text-copy" data-label="${match.match_id}">
                        <img src="image/external-link-squared.png"></img>
                    </button>
                </td>
                </tr>
            `;
            this.matchesTable.append(current_tr);

            this.loadImageWithSkeleton(
                current_tr.querySelector('.match-info__hero img'),
                `${HEROES_ICONS_URL}/${match.player_hero.icon}`, 32, 32
            );
    
            current_tr.querySelectorAll('.draft img').forEach((img, index) => {
                this.loadImageWithSkeleton(img, `${HEROES_ICONS_URL}/${match.draft[index].icon}`);
            });
    
            current_tr.querySelectorAll('.match-info__items img').forEach((img, index) => {
                if (match.items[index]) {
                    this.loadImageWithSkeleton(img, `${ITEMS_ICONS_URL}/${match.items[index].icon}`, 34, 24);
                }
            });

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
            current_tr.innerHTML = `
            <tr class="heroes-info">
                <td class="heroes-table__td heroes-info__hero" data-label="№">
                   <span>${iterator + 1}</span>
                </td>
                <td class="heroes-table__td heroes-info__hero" data-label="Hero">
                    <a href="https://dota2.fandom.com/wiki/${hero.hero.localized_name}" target="blank">
                        <img alt="${hero.hero.localized_name}"></img>
                    </a>
                </td>
                <td class="heroes-table__td heroes-info__matches" data-label="Matches">
                    <span>${hero.games}</span>
                </td>
                <td class="heroes-table__td heroes-info__winrate" data-label="Winrate">
                    <span>${Math.round((hero.wins / hero.games * 100)) + '%'}</span>
                </td>
                <td class="heroes-table__td heroes-info__networth" data-label="Networth">
                    <span>${Math.round(hero.networth) > 1000 ? (Math.round(hero.networth) / 1000).toFixed(1) + 'k' : Math.round(hero.networth)}</span>
                </td>
                <td class="heroes-table__td heroes-info__lasthits" data-label="Lasthits">
                    <span>${Math.round(hero.lasthits) > 1000 ? (Math.round(hero.lasthits) / 1000).toFixed(1) + 'k' : Math.round(hero.lasthits)}</span>
                </td>
                <td class="heroes-table__td heroes-info__gpm" data-label="GPM (avg)">
                    <span>${Math.round(hero.gpm) > 1000 ? (Math.round(hero.gpm) / 1000).toFixed(1) + 'k' : Math.round(hero.gpm)}</span>
                </td>
                <td class="heroes-table__td heroes-info__xpm" data-label="XPM (avg)">
                    <span>${Math.round(hero.xpm) > 1000 ? (Math.round(hero.xpm) / 1000).toFixed(1) + 'k' : Math.round(hero.xpm)}</span>
                </td>
                <td class="heroes-table__td heroes-info__kills" data-label="Kills">
                    <span>${Math.round(hero.kills)}</span>
                </td>
                <td class="heroes-table__td heroes-info__deathes" data-label="Deathes">
                    <span>${Math.round(hero.deaths)}</span>
                </td>
                <td class="heroes-table__td heroes-info__assists" data-label="Assists">
                    <span>${Math.round(hero.assists)}</span>
                </td>
            </tr>`;

            this.loadImageWithSkeleton(
                current_tr.querySelector('.heroes-info__hero img'),
                `${HEROES_ICONS_URL}/${hero.hero.icon}`, 32, 32
            );

            heroesTable.append(current_tr);
            iterator++;
        }
    }
}