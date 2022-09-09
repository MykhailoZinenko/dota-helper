import view from "./view.mjs";
import model from "./model.mjs";

export default {
    init() {
        view.renderPlaceholders();
        model.getProfileInfo()
            .then((profileInfo) => {
                view.renderProfile(profileInfo);
            });
        model.getMatchesInfo()
            .then((matchesInfo) => {
                view.renderStats(matchesInfo);
                view.renderMatches(matchesInfo);
                model.setHeroesData(matchesInfo);
                view.renderHeroes(model.heroes);
                this.bindEvents(matchesInfo);
            })
    },

    bindEvents(data) {
        const initialMatchesData = [];
        const initialHeroesData = [];

        for (const hero of model.heroes) {
            initialHeroesData.push(hero);
        }

        for (const match of data) {
            initialMatchesData.push(match);
        }

        view.openNavButton.addEventListener('click', view.openNav);
        view.profileAnchor.addEventListener('click', view.openNav);
        view.matchesAnchor.addEventListener('click', view.openNav);
        view.heroesAnchor.addEventListener('click', view.openNav);
        view.statisticsAnchor.addEventListener('click', view.openNav);
        window.addEventListener('scroll', () => { view.toTop(view.buttonToTop, view.buttonToTopMark); });
        view.buttonToTop.addEventListener('click', () => {
            view.scrollToTop();
        })
        const matchesColumnsMap = {
            initial: 0,
            player_hero: 1,
            result: 2,
            networth: 4,
            kda: 5,
            gpm: 6,
            xpm: 7,
            duration: 9,
        };

        view.matchesSortButtonsArray[matchesColumnsMap.initial].addEventListener('click', () => {
            if (!view.matchesSortButtonsArray[matchesColumnsMap.initial].classList.contains('pressed')) {
                view.pressButtonMatches(matchesColumnsMap.initial);
                view.renderMatches(initialMatchesData);
            }
        })
        view.matchesSortButtonsArray[matchesColumnsMap.player_hero].addEventListener('click', () => {
            if (!view.matchesSortButtonsArray[matchesColumnsMap.player_hero].classList.contains('pressed')) {
                view.pressButtonMatches(matchesColumnsMap.player_hero);
                const sortedRows = model.dataSort(data, 'player_hero', '>');
                console.log(sortedRows);
                view.renderMatches(sortedRows);
            }
        });
        view.matchesSortButtonsArray[matchesColumnsMap.result].addEventListener('click', () => {
            if (!view.matchesSortButtonsArray[matchesColumnsMap.result].classList.contains('pressed')) {
                view.pressButtonMatches(matchesColumnsMap.result);
                const sortedRows = model.dataSort(data, 'result', '<');
                console.log(sortedRows);
                view.renderMatches(sortedRows);
            }
        });
        view.matchesSortButtonsArray[matchesColumnsMap.networth].addEventListener('click', () => {
            if (!view.matchesSortButtonsArray[matchesColumnsMap.networth].classList.contains('pressed')) {
                view.pressButtonMatches(matchesColumnsMap.networth);
                const sortedRows = model.dataSort(data, 'networth', '<');
                console.log(sortedRows);
                view.renderMatches(sortedRows);
            }
        });
        view.matchesSortButtonsArray[matchesColumnsMap.kda].addEventListener('click', () => {
            if (!view.matchesSortButtonsArray[matchesColumnsMap.kda].classList.contains('pressed')) {
                view.pressButtonMatches(matchesColumnsMap.kda);
                const sortedRows = model.dataSort(data, 'kda', '>');
                console.log(sortedRows);
                view.renderMatches(sortedRows);
            }
        });
        view.matchesSortButtonsArray[matchesColumnsMap.gpm].addEventListener('click', () => {
            if (!view.matchesSortButtonsArray[matchesColumnsMap.gpm].classList.contains('pressed')) {
                view.pressButtonMatches(matchesColumnsMap.gpm);
                const sortedRows = model.dataSort(data, 'gpm', '<');
                console.log(sortedRows);
                view.renderMatches(sortedRows);
            }
        });
        view.matchesSortButtonsArray[matchesColumnsMap.xpm].addEventListener('click', () => {
            if (!view.matchesSortButtonsArray[matchesColumnsMap.xpm].classList.contains('pressed')) {
                view.pressButtonMatches(matchesColumnsMap.xpm);
                const sortedRows = model.dataSort(data, 'xpm', '<');
                console.log(sortedRows);
                view.renderMatches(sortedRows);
            }
        });
        view.matchesSortButtonsArray[matchesColumnsMap.duration].addEventListener('click', () => {
            if (!view.matchesSortButtonsArray[matchesColumnsMap.duration].classList.contains('pressed')) {
                view.pressButtonMatches(matchesColumnsMap.duration);
                const sortedRows = model.dataSort(data, 'duration', '<');
                console.log(sortedRows);
                view.renderMatches(sortedRows);
            }
        });

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

        console.log(view.heroesSortButtonsArray);
        view.heroesSortButtonsArray[heroesColumnsMap.initial].addEventListener('click', () => {
            if (!view.heroesSortButtonsArray[heroesColumnsMap.initial].classList.contains('pressed')) {
                view.pressButtonHeroes(heroesColumnsMap.initial);
                view.renderHeroes(initialHeroesData);
            }
        })
        view.heroesSortButtonsArray[heroesColumnsMap.hero].addEventListener('click', () => {
            if (!view.heroesSortButtonsArray[heroesColumnsMap.hero].classList.contains('pressed')) {
                view.pressButtonHeroes(heroesColumnsMap.hero);
                const sortedRows = model.dataSort(model.heroes, 'hero', '>');
                console.log(sortedRows);
                view.renderHeroes(sortedRows);
            }
        });
        view.heroesSortButtonsArray[heroesColumnsMap.games].addEventListener('click', () => {
            if (!view.heroesSortButtonsArray[heroesColumnsMap.games].classList.contains('pressed')) {
                view.pressButtonHeroes(heroesColumnsMap.games);
                const sortedRows = model.dataSort(model.heroes, 'games', '<');
                console.log(sortedRows);
                view.renderHeroes(sortedRows);
            }
        });
        view.heroesSortButtonsArray[heroesColumnsMap.winrate].addEventListener('click', () => {
            if (!view.heroesSortButtonsArray[heroesColumnsMap.winrate].classList.contains('pressed')) {
                view.pressButtonHeroes(heroesColumnsMap.winrate);
                const sortedRows = model.dataSort(model.heroes, 'winrate', '<');
                console.log(sortedRows);
                view.renderHeroes(sortedRows);
            }
        });
        view.heroesSortButtonsArray[heroesColumnsMap.networth].addEventListener('click', () => {
            if (!view.heroesSortButtonsArray[heroesColumnsMap.networth].classList.contains('pressed')) {
                view.pressButtonHeroes(heroesColumnsMap.networth);
                const sortedRows = model.dataSort(model.heroes, 'networth', '<');
                console.log(sortedRows);
                view.renderHeroes(sortedRows);
            }
        });
        view.heroesSortButtonsArray[heroesColumnsMap.lasthits].addEventListener('click', () => {
            if (!view.heroesSortButtonsArray[heroesColumnsMap.lasthits].classList.contains('pressed')) {
                view.pressButtonHeroes(heroesColumnsMap.lasthits);
                const sortedRows = model.dataSort(model.heroes, 'lasthits', '<');
                console.log(sortedRows);
                view.renderHeroes(sortedRows);
            }
        });
        view.heroesSortButtonsArray[heroesColumnsMap.gpm].addEventListener('click', () => {
            if (!view.heroesSortButtonsArray[heroesColumnsMap.gpm].classList.contains('pressed')) {
                view.pressButtonHeroes(heroesColumnsMap.gpm);
                const sortedRows = model.dataSort(model.heroes, 'gpm', '<');
                console.log(sortedRows);
                view.renderHeroes(sortedRows);
            }
        });
        view.heroesSortButtonsArray[heroesColumnsMap.xpm].addEventListener('click', () => {
            if (!view.heroesSortButtonsArray[heroesColumnsMap.xpm].classList.contains('pressed')) {
                view.pressButtonHeroes(heroesColumnsMap.xpm);
                const sortedRows = model.dataSort(model.heroes, 'xpm', '<');
                console.log(sortedRows);
                view.renderHeroes(sortedRows);
            }
        });
        view.heroesSortButtonsArray[heroesColumnsMap.kills].addEventListener('click', () => {
            if (!view.heroesSortButtonsArray[heroesColumnsMap.kills].classList.contains('pressed')) {
                view.pressButtonHeroes(heroesColumnsMap.kills);
                const sortedRows = model.dataSort(model.heroes, 'kills', '<');
                console.log(sortedRows);
                view.renderHeroes(sortedRows);
            }
        });
        view.heroesSortButtonsArray[heroesColumnsMap.deaths].addEventListener('click', () => {
            if (!view.heroesSortButtonsArray[heroesColumnsMap.deaths].classList.contains('pressed')) {
                view.pressButtonHeroes(heroesColumnsMap.deaths);
                const sortedRows = model.dataSort(model.heroes, 'deaths', '>');
                console.log(sortedRows);
                view.renderHeroes(sortedRows);
            }
        });
        view.heroesSortButtonsArray[heroesColumnsMap.assists].addEventListener('click', () => {
            if (!view.heroesSortButtonsArray[heroesColumnsMap.assists].classList.contains('pressed')) {
                view.pressButtonHeroes(heroesColumnsMap.assists);
                const sortedRows = model.dataSort(model.heroes, 'assists', '<');
                console.log(sortedRows);
                view.renderHeroes(sortedRows);
            }
        });

        for (const button of view.matchIdCopyArray) {
            button.addEventListener('click', () => {
                view.copyIdToClipboard(button);
            });
        }
    }
}