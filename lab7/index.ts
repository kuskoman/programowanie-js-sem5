interface WeatherResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: [
    {
      id: number;
      main: string;
      description: string;
      icon: string;
    }
  ];
  base: string;
  main: {
    temp: number;
    pressure: number;
    humidity: number;
    temp_min: number;
    temp_max: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  rain: {
    "3h": number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    message: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  id: number;
  name: string;
  cod: number;
}

type Weather = WeatherResponse & { city: string };

interface Coordinates {
  lon: number;
  lat: number;
  name: string;
}

abstract class BaseClient {
  protected readonly apiKey: string;
  protected readonly apiUrl: string;
  private readonly cacheBaseKey: string;

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.cacheBaseKey = `api:${btoa(apiUrl)}`;
  }

  protected async get<T>(
    path: string,
    params: Record<string, string>
  ): Promise<T> {
    const paramsWithApiKey = { ...params, appid: this.apiKey };
    const query = new URLSearchParams(paramsWithApiKey).toString();
    const url = `${this.apiUrl}${path}?${query}`;

    const cachedResponse = this.getCachedResponse<T>(url);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await fetch(url);
    const parsedResponse = await response.json();
    this.cacheResponse(url, parsedResponse);
    return parsedResponse;
  }

  private cacheResponse<T>(url: string, response: T): void {
    const cacheKey = this.getResponseCacheKey(url);
    sessionStorage.setItem(cacheKey, JSON.stringify(response));
  }

  private getCachedResponse<T>(url: string): T | null {
    const cacheKey = this.getResponseCacheKey(url);
    const cachedResponse = sessionStorage.getItem(cacheKey);

    if (cachedResponse) {
      return JSON.parse(cachedResponse);
    }

    return null;
  }

  private getResponseCacheKey(url: string): string {
    const base64Path = btoa(url);
    return `${this.cacheBaseKey}:${base64Path}`;
  }
}

class GeocodingApiClient extends BaseClient {
  constructor(
    apiKey: string,
    apiUrl = "https://api.openweathermap.org/geo/1.0"
  ) {
    super(apiKey, apiUrl);
  }

  public async getCoordinates(city: string): Promise<Coordinates[]> {
    const path = "/direct";
    const params = { q: city };
    const response = await this.get<Array<Coordinates>>(path, params);
    return response;
  }
}

class OpenWeatherMapApiClient extends BaseClient {
  private readonly geocodingClient: GeocodingApiClient;

  constructor(
    apiKey: string,
    apiUrl = "https://api.openweathermap.org/data/2.5"
  ) {
    super(apiKey, apiUrl);
    this.geocodingClient = new GeocodingApiClient(apiKey);
  }

  public async getWeather(city: string): Promise<Weather> {
    const coordinates = await this.getCoordinates(city);
    const { lat, lon } = coordinates[0];
    const path = "/weather";
    const params = { lat: String(lat), lon: String(lon) };
    const response = await this.get<WeatherResponse>(path, params);
    const weather = { ...response, city };
    return weather;
  }

  public async getCityAutocomplete(city: string): Promise<string[]> {
    const coordinates = await this.getCoordinates(city);
    return coordinates.map((c) => c.name);
  }

  private async getCoordinates(city: string): Promise<Coordinates[]> {
    return this.geocodingClient.getCoordinates(city);
  }
}

class CitiesStorage {
  private readonly cacheKey = "cities";

  public saveCity(city: string): void {
    const cities = this.getCities();
    if (cities.includes(city)) {
      return;
    }
    cities.push(city);
    this.saveCities(cities);
  }

  public removeCity(city: string): void {
    const cities = this.getCities();
    const index = cities.indexOf(city);
    if (index === -1) {
      return;
    }
    cities.splice(index, 1);
    this.saveCities(cities);
  }

  public getCities(): string[] {
    const citiesString = localStorage.getItem(this.cacheKey);
    if (!citiesString) {
      return [];
    }

    return JSON.parse(citiesString);
  }

  private saveCities(cities: string[]): void {
    localStorage.setItem(this.cacheKey, JSON.stringify(cities));
  }
}

class WeatherCache {
  private readonly cacheTime = 60 * 1000 * 5; // 5 minutes
  private readonly cacheKeyBase = "weatherCache";

  public saveWeather(weather: Weather): void {
    const city = weather.city;
    console.log(`Saving weather for ${city}`);
    console.log(JSON.stringify(weather));
    this.saveToCache(city, weather);
  }

  public getWeather(city: string): Weather | null {
    return this.getFromCache(city);
  }

  private saveToCache<T>(resource: string, data: T): void {
    const cacheKey = this.getCacheKey(resource);
    const cacheData = {
      timestamp: Date.now(),
      data,
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
  }

  private getFromCache<T>(resource: string): T | null {
    const cacheKey = this.getCacheKey(resource);
    const cachedData = sessionStorage.getItem(cacheKey);
    if (!cachedData) {
      return null;
    }

    const parsedData = JSON.parse(cachedData);
    const { timestamp, data } = parsedData;
    const now = Date.now();
    if (now - timestamp > this.cacheTime) {
      return null;
    }

    return data;
  }

  private getCacheKey(resource: string): string {
    return `${this.cacheKeyBase}:${resource}`;
  }
}

const API_KEY_CACHE_KEY = "apiKey";

const getAndCacheApiKey = (): string | null => {
  const apiKeyInput = document.getElementById("api-key") as HTMLInputElement;
  const apiKey = apiKeyInput.value;

  const savedApiKey = localStorage.getItem(API_KEY_CACHE_KEY);

  if (apiKey) {
    localStorage.setItem(API_KEY_CACHE_KEY, apiKey);
    return apiKey;
  }

  if (savedApiKey) {
    apiKeyInput.value = savedApiKey;
    localStorage.setItem(API_KEY_CACHE_KEY, savedApiKey);
    return savedApiKey;
  }

  return null;
};

const getWeatherClient = (() => {
  let client: OpenWeatherMapApiClient | null = null;
  let apiKey: string | null = null;

  return async (): Promise<OpenWeatherMapApiClient> => {
    if (!client) {
      apiKey = getAndCacheApiKey();
      if (!apiKey) {
        throw new Error("No API key");
      }

      client = new OpenWeatherMapApiClient(apiKey);
    }

    return client;
  };
})();

const citiesStorage = new CitiesStorage();
const weatherCache = new WeatherCache();

const handleGetWeather = async () => {
  const cityInput = document.getElementById("city") as HTMLInputElement;
  const city = cityInput.value;
  if (!city) {
    alert("Please enter a city");
    return;
  }

  const client = await getWeatherClient();
  try {
    const weather = await client.getWeather(city);
    weatherCache.saveWeather(weather);
    citiesStorage.saveCity(city);
    renderWeather();
  } catch (e) {
    alert("Error getting weather");
    console.error(e);
  }
};

const handleCityAutocomplete = async () => {
  let client: OpenWeatherMapApiClient | null = null;
  try {
    client = await getWeatherClient();
  } catch (e) {
    console.log("Could not get client");
    console.error(e);
    return;
  }

  const cityInput = document.getElementById("city") as HTMLInputElement;
  const city = cityInput.value;
  if (!city) {
    return;
  }

  const dataList = document.getElementById("cities") as HTMLDataListElement;
  const cities = await client.getCityAutocomplete(city);
  dataList.innerHTML = "";
  cities.forEach((c) => {
    const option = document.createElement("option");
    option.value = c;
    dataList.appendChild(option);
  });
};

const isNotNull = <T>(value: T | null): value is T => {
  return value !== null;
};

const renderSingleWeather = (weather: Weather) => {
  const appDiv = document.getElementById("app") as HTMLDivElement;
  const weatherDiv = document.createElement("div");
  weatherDiv.innerHTML = `
    <h2>${weather.city}</h2>
    <p>${weather.weather[0].description}</p>
    <p>${weather.main.temp}</p>
    <button id="remove-${weather.city}">Remove</button>
  `;
  const removeButton = weatherDiv.querySelector(
    `#remove-${weather.city}`
  ) as HTMLButtonElement;
  removeButton.addEventListener("click", () => removeCity(weather.city));
  appDiv.appendChild(weatherDiv);
};

const removeCity = (city: string) => {
  citiesStorage.removeCity(city);
  renderWeather();
};

const getCurrentWeather = async (city: string) => {
  const cachedWeather = weatherCache.getWeather(city);
  if (cachedWeather) {
    return cachedWeather;
  }

  const client = await getWeatherClient();
  const weather = await client.getWeather(city);
  weatherCache.saveWeather(weather);
  return weather;
};

const renderWeather = async () => {
  const appDiv = document.getElementById("app") as HTMLDivElement;

  appDiv.innerHTML = "";

  const weatherPromises = citiesStorage.getCities().map(getCurrentWeather);

  const weathers = await Promise.all(weatherPromises);
  weathers.filter(isNotNull).forEach(renderSingleWeather);
};

renderWeather();
