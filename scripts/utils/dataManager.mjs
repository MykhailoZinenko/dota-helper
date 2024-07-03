import {
    buildUrlWithParams,
} from "../api/api.mjs"

export class DataManager {
    url;
    requestOptions = {};

    constructor(url, { params, requestOptions } = {}) {
        this.url = buildUrlWithParams(url, params);
        this.requestOptions = requestOptions;
        this.cache = JSON.parse(localStorage.getItem(this.url));
    }

    cache = null;

    loadEventListeners = [];
    errorEventListeners = [];

    async fetch() {
        try {
            const response = await fetch(this.url, this.requestOptions);

            const data = await response.json();

            localStorage.setItem(this.url, JSON.stringify(data));

            return data;
        } catch (error) {
            throw new Error(error);
        }
    }
}