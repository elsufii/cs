class TranslationModel {
    constructor() {
        this.countries = [];
        this.translations = new Map();
        this.searchHistory = this.loadSearchHistory();
        this.currentSearch = null;
        this.apiKey = this.loadApiKey(); 
        this.apiStatus = 'unknown'; 
    }

    async loadCountries() {
        try {
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,languages,translations,flags');
            const data = await response.json();
            
            this.countries = data.map(country => ({
                name: country.name.common,
                code: country.cca2,
                code3: country.cca3,
                languages: country.languages ? Object.values(country.languages) : ['English'],
                primaryLanguage: this.selectBestLanguage(country.languages, country.cca2),
                flagUrl: country.flags ? (country.flags.svg || country.flags.png) : null,
                flagAlt: country.flags ? country.flags.alt : `Flag of ${country.name.common}`
            }));
            
            return this.countries;
        } catch (error) {
            console.error('Error loading these countries data:', error);
            throw error;
        }
    }

    selectBestLanguage(languages, countryCode) {
        if (!languages) return 'en';
        
        const langCodes = Object.keys(languages);
        
        //Country-specific
        const countryPreferences = {
            'TZ': ['sw', 'swa', 'en', 'eng'], 
            'AR': ['es', 'spa'],
            'PY': ['es', 'spa'],  
            'BO': ['es', 'spa'], 
            'PE': ['es', 'spa'], 
            'EC': ['es', 'spa'], 
            'GT': ['es', 'spa'], 
            'CH': ['de', 'deu', 'fr', 'fra'], 
            'BE': ['nl', 'nld', 'fr', 'fra'],
            'CA': ['en', 'eng', 'fr', 'fra'], 
            'ZA': ['en', 'eng'], 
            'IN': ['hi', 'hin', 'en', 'eng'], 
            'PK': ['ur', 'urd', 'en', 'eng'], 
            'AF': ['fa', 'fas', 'ps', 'pus'], 
            'IR': ['fa', 'fas'], 
            'IQ': ['ar', 'ara'], 
            'SY': ['ar', 'ara'], 
            'LB': ['ar', 'ara'], 
            'EG': ['ar', 'ara'], 
            'MA': ['ar', 'ara'], 
            'DZ': ['ar', 'ara'], 
        };
        
        // Check country-specific preferences first
        if (countryPreferences[countryCode]) {
            for (const preferred of countryPreferences[countryCode]) {
                const found = langCodes.find(code => this.mapLanguageCode(code) === preferred);
                if (found) {
                    return preferred;
                }
            }
        }
        
        const supportedLanguages = [
            'en', 'eng', 
            'es', 'spa',  
            'fr', 'fra', 
            'de', 'deu', 
            'it', 'ita', 
            'pt', 'por', 
            'ru', 'rus', 
            'zh', 'zho', 'cmn', 
            'ja', 'jpn', 
            'ko', 'kor', 
            'ar', 'ara', 
            'hi', 'hin', 
            'nl', 'nld', 
            'sv', 'swe',
            'no', 'nor', 
            'da', 'dan', 
            'fi', 'fin', 
            'pl', 'pol', 
            'tr', 'tur',
            'he', 'heb', 
            'th', 'tha', 
            'vi', 'vie',
        ];
        
        //find first supported language
        for (const supported of supportedLanguages) {
            const found = langCodes.find(code => this.mapLanguageCode(code) === this.mapLanguageCode(supported));
            if (found) {
                return this.mapLanguageCode(found);
            }
        }
        
        //first language or English
        const firstLang = this.mapLanguageCode(langCodes[0]);
        return firstLang || 'en';
    }

    mapLanguageCode(code) {
        if (!code) return 'en';
        
        const languageMap = {
            'ara': 'ar', 'ben': 'bn', 'bul': 'bg', 'cat': 'ca', 'ces': 'cs', 'swa': 'sw', 
            'swh': 'sw', 'dan': 'da', 'deu': 'de', 'ell': 'el', 'eng': 'en', 'spa': 'es',
            'est': 'et', 'fin': 'fi', 'fra': 'fr', 'guj': 'gu', 'heb': 'he',
            'hin': 'hi', 'hrv': 'hr', 'hun': 'hu', 'ind': 'id', 'ita': 'it',
            'jpn': 'ja', 'kor': 'ko', 'lit': 'lt', 'lav': 'lv', 'mkd': 'mk',
            'msa': 'ms', 'mlt': 'mt', 'nld': 'nl', 'nor': 'no', 'pol': 'pl',
            'por': 'pt', 'ron': 'ro', 'rus': 'ru', 'slk': 'sk', 'slv': 'sl',
            'srp': 'sr', 'swe': 'sv', 'tam': 'ta', 'tel': 'te', 'tha': 'th',
            'tur': 'tr', 'ukr': 'uk', 'urd': 'ur', 'vie': 'vi', 'zho': 'zh',
            'cmn': 'zh', 'fas': 'fa', 'per': 'fa', 'pus': 'ps',
            
            'grn': 'es',
            'que': 'es',
            'aym': 'es',
            'ber': 'ar',
            'amh': 'en',
            'orm': 'en',
            'hau': 'en',
            'yor': 'en',
            'ibo': 'en',
            'swa': 'en',
            'mlg': 'fr',
            'nya': 'en',
            'sna': 'en',
            'som': 'ar',
            'tir': 'ar',
            'kin': 'en',
            'run': 'en',
            'lug': 'en',
            'div': 'ar',
            'dzo': 'en',
            'tuk': 'ru',
            'uzb': 'ru',
            'kaz': 'ru',
            'kir': 'ru',
            'tgk': 'ru',
            'mon': 'ru',
            'lao': 'th',
            'khm': 'th',
            'mya': 'th',
            'sin': 'hi',
            'nep': 'hi',
            'ben': 'hi',
            'tam': 'hi',
            'tel': 'hi',
            'kan': 'hi',
            'mal': 'hi',
            'pan': 'hi',
            'guj': 'hi',
            'ori': 'hi',
            'asm': 'hi',
            'mar': 'hi'

        };
        
        const lowerCode = code.toLowerCase();
        
        // return the mapped code or original if already 2-letter, or fallback to English
        return languageMap[lowerCode] || (lowerCode.length === 2 ? lowerCode : 'en');
    }

    loadApiKey() {
        try {
            const savedKey = localStorage.getItem('googleTranslateApiKey');
            if (savedKey && savedKey !== 'api' && savedKey.trim() !== '') {
                return savedKey;
            }
        } catch (error) {
            console.warn('Could not load API key from localStorage:', error);
        }
        return null;
    }

    saveApiKey(apiKey) {
        try {
            if (apiKey && apiKey.trim() !== '') {
                localStorage.setItem('googleTranslateApiKey', apiKey.trim());
                this.apiKey = apiKey.trim();
                this.apiStatus = 'unknown'; 
                return true;
            }
        } catch (error) {
            console.error('Could not save API key:', error);
        }
        return false;
    }

    async testApiKey(apiKey = null) {
        const keyToTest = apiKey || this.apiKey;
        if (!keyToTest) {
            this.apiStatus = 'invalid';
            return false;
        }

        try {
            const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${keyToTest}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: 'test',
                    target: 'es',
                    source: 'en',
                    format: 'text'
                })
            });

            if (response.ok) {
                this.apiStatus = 'valid';
                if (apiKey) {
                    this.apiKey = apiKey;
                    this.saveApiKey(apiKey);
                }
                return true;
            } else {
                this.apiStatus = 'invalid';
                return false;
            }
        } catch (error) {
            console.warn('API key test failed:', error);
            this.apiStatus = 'error';
            return false;
        }
    }

    async translateText(text, targetLang, sourceLang = 'auto') {
        try {
            if (this.apiKey && this.apiStatus === 'valid') {
                const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        q: text,
                        target: targetLang,
                        source: sourceLang === 'auto' ? undefined : sourceLang,
                        format: 'text'
                    })
                });

                if (!response.ok) {
                    if (response.status === 403) {
                        this.apiStatus = 'invalid';
                        throw new Error('Invalid API key or insufficient permissions');
                    } else if (response.status === 429) {
                        throw new Error('API quota exceeded. Please try again later.');
                    } else {
                        throw new Error(`Translation API request failed: ${response.status}`);
                    }
                }

                const data = await response.json();
                return data.data.translations[0].translatedText;
            } else if (this.apiKey && this.apiStatus === 'unknown') {
                const isValid = await this.testApiKey();
                if (isValid) {
                    return await this.translateText(text, targetLang, sourceLang);
                } else {
                    throw new Error('Invalid API key. Please check your Google Cloud Translation API key.');
                }
            } else {
                return `[${targetLang.toUpperCase()}] ${text}`;
            }
        } catch (error) {
            console.warn('Translation API failed:', error);
            throw error; 
        }
    }

    async translateForAllCountries(text, sourceLang = 'auto') {
        const translations = new Map();
        const uniqueLanguages = new Set();
        const failedTranslations = [];
        
        this.countries.forEach(country => {
            uniqueLanguages.add(country.primaryLanguage);
        });

        for (const lang of uniqueLanguages) {
            if (lang !== sourceLang) {
                try {
                    const translation = await this.translateText(text, lang, sourceLang);
                    translations.set(lang, translation);
                } catch (error) {
                    console.error(`Translation failed for language ${lang}:`, error);
                    translations.set(lang, text); 
                    failedTranslations.push({ language: lang, error: error.message });
                }
            } else {
                translations.set(lang, text);
            }
        }

        this.translations = translations;
        
        if (failedTranslations.length > 0) {
            this.lastFailedTranslations = failedTranslations;
        }
        
        return translations;
    }

    getCountryTranslation(countryCode) {
        const country = this.countries.find(c => c.code === countryCode);
        if (!country) return null;

        const translation = this.translations.get(country.primaryLanguage);
        return {
            country: country.name,
            translation: translation || this.currentSearch,
            originalText: this.currentSearch,
            language: country.primaryLanguage,
            languages: country.languages
        };
    }

    saveSearch(text, sourceLang) {
        const search = {
            text,
            sourceLang,
            timestamp: new Date().toISOString(),
            id: Date.now()
        };

        this.searchHistory.unshift(search);
        
        if (this.searchHistory.length > 10) {
            this.searchHistory = this.searchHistory.slice(0, 10);
        }

        this.saveSearchHistory();
        this.currentSearch = text;
        return search;
    }

    loadSearchHistory() {
        try {
            const history = localStorage.getItem('translationHistory');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error loading search history:', error);
            return [];
        }
    }

    saveSearchHistory() {
        try {
            localStorage.setItem('translationHistory', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    }

    deleteSearch(searchId) {
        this.searchHistory = this.searchHistory.filter(search => search.id != searchId);
        this.saveSearchHistory();
        return this.searchHistory;
    }

    clearSearchHistory() {
        this.searchHistory = [];
        try {
            localStorage.removeItem('translationHistory');
        } catch (error) {
            console.error('Error clearing search history:', error);
        }
    }

    getApiStatus() {
        return {
            status: this.apiStatus,
            hasKey: !!this.apiKey,
            keyPreview: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'None'
        };
    }

    getStats() {
        return {
            countriesCount: this.countries.length,
            translationsCount: this.translations.size,
            searchHistoryCount: this.searchHistory.length,
            apiStatus: this.getApiStatus()
        };
    }
}
