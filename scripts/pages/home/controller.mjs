import view from "./view.mjs";
import model from "./model.mjs";

export default {
    async init() {
        view.renderPlaceholders();
        model.getProfileInfo()
            .then((profileInfo) => {
                view.renderProfile(profileInfo);
            });
        await model.getInfo();
        view.renderStats(model.info.statistics);
        view.renderMatches(model.info.matches);
        view.renderHeroes(model.info.heroes);
        this.bindEvents(model.info.matches);
        this.bindMatchesSortButtons(model.info.matches);
        this.bindHeroesSortButtons();
        this.bindCopyMatchIdButtons();
    },

    bindEvents(data) {
        view.openNavButton.addEventListener('click', view.openNav);
        view.profileAnchor.addEventListener('click', view.openNav);
        view.matchesAnchor.addEventListener('click', view.openNav);
        view.heroesAnchor.addEventListener('click', view.openNav);
        view.statisticsAnchor.addEventListener('click', view.openNav);
        window.addEventListener('scroll', () => { view.buttonToTopClassToggler(view.buttonToTop, view.buttonToTopMark); });
        view.buttonToTop.addEventListener('click', () => {
            view.scrollToTop();
        })
    },

    bindMatchesSortButtons(data) {
        const initialMatchesData = [];

        for (const match of data) {
            initialMatchesData.push(match);
        }

        const matchesColumnsMap = {
            numeration: 0,
            playerHero: 1,
            result: 2,
            networth: 4,
            kda: 5,
            gpm: 6,
            xpm: 7,
            duration: 9,
        };

        view.matchesSortButtons[matchesColumnsMap.numeration].addEventListener('click', () => {
            if (view.matchesSortButtons[matchesColumnsMap.numeration].classList.contains('active')) return;
            view.handleSortMatches(matchesColumnsMap.numeration);
            view.renderMatches(initialMatchesData);
        })
        view.matchesSortButtons[matchesColumnsMap.playerHero].addEventListener('click', () => {
            if (view.matchesSortButtons[matchesColumnsMap.playerHero].classList.contains('active')) return;
            view.handleSortMatches(matchesColumnsMap.playerHero);
            const sortedRows = model.getSortedData(data, 'player_hero', '>');
            view.renderMatches(sortedRows);
        });
        view.matchesSortButtons[matchesColumnsMap.result].addEventListener('click', () => {
            if (view.matchesSortButtons[matchesColumnsMap.result].classList.contains('active')) return;
            view.handleSortMatches(matchesColumnsMap.result);
            const sortedRows = model.getSortedData(data, 'result', '<');
            view.renderMatches(sortedRows);
        });
        view.matchesSortButtons[matchesColumnsMap.networth].addEventListener('click', () => {
            if (view.matchesSortButtons[matchesColumnsMap.networth].classList.contains('active')) return;
            view.handleSortMatches(matchesColumnsMap.networth);
            const sortedRows = model.getSortedData(data, 'networth', '<');
            view.renderMatches(sortedRows);
        });
        view.matchesSortButtons[matchesColumnsMap.kda].addEventListener('click', () => {
            if (view.matchesSortButtons[matchesColumnsMap.kda].classList.contains('active')) return;
            view.handleSortMatches(matchesColumnsMap.kda);
            const sortedRows = model.getSortedData(data, 'kda', '>');
            view.renderMatches(sortedRows);
        });
        view.matchesSortButtons[matchesColumnsMap.gpm].addEventListener('click', () => {
            if (view.matchesSortButtons[matchesColumnsMap.gpm].classList.contains('active')) return;
            view.handleSortMatches(matchesColumnsMap.gpm);
            const sortedRows = model.getSortedData(data, 'gpm', '<');
            view.renderMatches(sortedRows);
        });
        view.matchesSortButtons[matchesColumnsMap.xpm].addEventListener('click', () => {
            if (view.matchesSortButtons[matchesColumnsMap.xpm].classList.contains('active')) return;
            view.handleSortMatches(matchesColumnsMap.xpm);
            const sortedRows = model.getSortedData(data, 'xpm', '<');
            view.renderMatches(sortedRows);
        });
        view.matchesSortButtons[matchesColumnsMap.duration].addEventListener('click', () => {
            if (view.matchesSortButtons[matchesColumnsMap.duration].classList.contains('active')) return;
            view.handleSortMatches(matchesColumnsMap.duration);
            const sortedRows = model.getSortedData(data, 'duration', '<');
            view.renderMatches(sortedRows);
        });
    },

    bindHeroesSortButtons() {
        const initialHeroesData = [];

        for (const hero of model.info.heroes) {
            initialHeroesData.push(hero);
        }

        const heroesColumnsMap = {
            initial: 0,
            hero: 1,
            games: 2,
            winrate: 3,
            networth: 4,
            lasthits: 5,
            gpm: 6,
            xpm: 7,
            kills: 8,
            deaths: 9,
            assists: 10
        };

        console.log(view.heroesSortButtons);
        view.heroesSortButtons[heroesColumnsMap.initial].addEventListener('click', () => {
            if (view.heroesSortButtons[heroesColumnsMap.initial].classList.contains('active')) return;
            view.handleSortHeroes(heroesColumnsMap.initial);
            view.renderHeroes(initialHeroesData);
        })
        view.heroesSortButtons[heroesColumnsMap.hero].addEventListener('click', () => {
            if (view.heroesSortButtons[heroesColumnsMap.hero].classList.contains('active')) return;
            view.handleSortHeroes(heroesColumnsMap.hero);
            const sortedRows = model.getSortedData(model.heroes, 'hero', '>');
            view.renderHeroes(sortedRows);
        });
        view.heroesSortButtons[heroesColumnsMap.games].addEventListener('click', () => {
            if (view.heroesSortButtons[heroesColumnsMap.games].classList.contains('active')) return;
            view.handleSortHeroes(heroesColumnsMap.games);
            const sortedRows = model.getSortedData(model.heroes, 'games', '<');
            view.renderHeroes(sortedRows);
        });
        view.heroesSortButtons[heroesColumnsMap.winrate].addEventListener('click', () => {
            if (view.heroesSortButtons[heroesColumnsMap.winrate].classList.contains('active')) return;
            view.handleSortHeroes(heroesColumnsMap.winrate);
            const sortedRows = model.getSortedData(model.heroes, 'winrate', '<');
            view.renderHeroes(sortedRows);
        });
        view.heroesSortButtons[heroesColumnsMap.networth].addEventListener('click', () => {
            if (view.heroesSortButtons[heroesColumnsMap.networth].classList.contains('active')) return;
            view.handleSortHeroes(heroesColumnsMap.networth);
            const sortedRows = model.getSortedData(model.heroes, 'networth', '<');
            view.renderHeroes(sortedRows);
        });
        view.heroesSortButtons[heroesColumnsMap.lasthits].addEventListener('click', () => {
            if (view.heroesSortButtons[heroesColumnsMap.lasthits].classList.contains('active')) return;
            view.handleSortHeroes(heroesColumnsMap.lasthits);
            const sortedRows = model.getSortedData(model.heroes, 'lasthits', '<');
            view.renderHeroes(sortedRows);
        });
        view.heroesSortButtons[heroesColumnsMap.gpm].addEventListener('click', () => {
            if (view.heroesSortButtons[heroesColumnsMap.gpm].classList.contains('active')) return;
            view.handleSortHeroes(heroesColumnsMap.gpm);
            const sortedRows = model.getSortedData(model.heroes, 'gpm', '<');
            view.renderHeroes(sortedRows);
        });
        view.heroesSortButtons[heroesColumnsMap.xpm].addEventListener('click', () => {
            if (view.heroesSortButtons[heroesColumnsMap.xpm].classList.contains('active')) return;
            view.handleSortHeroes(heroesColumnsMap.xpm);
            const sortedRows = model.getSortedData(model.heroes, 'xpm', '<');
            view.renderHeroes(sortedRows);
        });
        view.heroesSortButtons[heroesColumnsMap.kills].addEventListener('click', () => {
            if (view.heroesSortButtons[heroesColumnsMap.kills].classList.contains('active')) return;
            view.handleSortHeroes(heroesColumnsMap.kills);
            const sortedRows = model.getSortedData(model.heroes, 'kills', '<');
            view.renderHeroes(sortedRows);
        });
        view.heroesSortButtons[heroesColumnsMap.deaths].addEventListener('click', () => {
            if (view.heroesSortButtons[heroesColumnsMap.deaths].classList.contains('active')) return;
            view.handleSortHeroes(heroesColumnsMap.deaths);
            const sortedRows = model.getSortedData(model.heroes, 'deaths', '>');
            view.renderHeroes(sortedRows);
        });
        view.heroesSortButtons[heroesColumnsMap.assists].addEventListener('click', () => {
            if (view.heroesSortButtons[heroesColumnsMap.assists].classList.contains('active')) return;
            view.handleSortHeroes(heroesColumnsMap.assists);
            const sortedRows = model.getSortedData(model.heroes, 'assists', '<');
            view.renderHeroes(sortedRows);
        });
    },

    bindCopyMatchIdButtons() {
        for (const button of view.matchIdCopyArray) {
            button.addEventListener('click', () => {
                view.copyIdToClipboard(button);
            });
        }
    }
}