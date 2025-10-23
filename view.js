class TranslationView {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.elements = {
            searchInput: document.getElementById('searchInput'),
            translateBtn: document.getElementById('translateBtn'),
            sourceLangSelect: document.getElementById('sourceLangSelect'),
            clearHistoryBtn: document.getElementById('clearHistoryBtn'),
            searchHistory: document.getElementById('searchHistory'),
            historySection: document.getElementById('historySection'),
            translationCards: document.getElementById('translationCards'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            countriesCount: document.getElementById('countriesCount'),
            translationsCount: document.getElementById('translationsCount'),
            searchHistoryCount: document.getElementById('searchHistoryCount'),
            notifications: document.getElementById('notifications')
        };
    }

    setupEventListeners() {
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.elements.translateBtn.click();
            }
        });
    }

    showLoading() {
        this.elements.loadingOverlay.style.display = 'flex';
    }

    hideLoading() {
        this.elements.loadingOverlay.style.display = 'none';
    }

    updateStats(stats) {
        this.elements.countriesCount.textContent = stats.countriesCount;
        this.elements.translationsCount.textContent = stats.translationsCount;
        this.elements.searchHistoryCount.textContent = stats.searchHistoryCount;
    }

        // Render translation cards
    renderTranslationCards(countries, translations, originalText, weatherMap = new Map()) {
        const container = this.elements.translationCards;
        
        if (!countries || countries.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.innerHTML = '';
        
        countries.forEach((country, index) => {
            const translation = translations.get(country.primaryLanguage) || originalText;
            const weather = weatherMap.get(country.code);
            const cardHTML = this.createTranslationCard(country, translation, originalText, weather);
            
            const column = document.createElement('div');
            column.className = 'column is-one-third';
            column.innerHTML = cardHTML;
            
            setTimeout(() => {
                column.querySelector('.translation-card').classList.add('animate-in');
            }, index * 50);
            
            container.appendChild(column);
        });

        container.style.display = 'flex';
        
        setTimeout(() => {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }

    // Create individual translation card
    createTranslationCard(country, translation, originalText, weatherData = null) {
        const flagImg = this.createFlagImage(country.flagUrl, country.flagAlt, country.code);
        const languages = country.languages.slice(0, 2).join(', ');
        const moreLanguages = country.languages.length > 2 ? ` +${country.languages.length - 2} more` : '';
        
        // Weather display
        const weatherHTML = weatherData ? `
            <div class="weather-info">
                🌡️ ${weatherData.temperature}°C - ${weatherData.description}
            </div>
        ` : '';

        return `
            <div class="translation-card" data-country="${country.code}">
                <div class="country-flag-container">
                    ${flagImg}
                </div>
                <div class="country-name">${country.name}</div>
                ${weatherHTML}
                <div class="translation-text">${translation}</div>
                <div class="original-text">Original: "${originalText}"</div>
                <div class="language-info">
                    Primary: ${country.primaryLanguage.toUpperCase()}
                </div>
                <div class="language-info">
                    Languages: ${languages}${moreLanguages}
                </div>
            </div>
        `;
    }

    createFlagImage(flagUrl, flagAlt, countryCode) {
        if (flagUrl) {
            return `
                <img class="country-flag-img" 
                     src="${flagUrl}" 
                     alt="${flagAlt}"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                     loading="lazy">
                <div class="flag-fallback" style="display: none;">
                    ${this.getCountryFlagEmoji(countryCode)}
                </div>
            `;
        } else {
            return `<div class="flag-fallback">${this.getCountryFlagEmoji(countryCode)}</div>`;
        }
    }

    getCountryFlagEmoji(countryCode) {
        if (countryCode && countryCode.length === 2) {
            const codePoints = countryCode.toUpperCase().split('').map(char => 
                0x1F1E6 + char.charCodeAt(0) - 'A'.charCodeAt(0)
            );
            try {
                return String.fromCodePoint(...codePoints);
            } catch (e) {
                return '🌍'; 
            }
        }
        return '🌍'; 
    }





    // rendering search history
    renderSearchHistory(history) {
        const container = this.elements.searchHistory;
        
        if (history.length === 0) {
            container.innerHTML = '<p class="has-text-grey-light">No searches yet. Try translating a word!</p>';
            this.elements.historySection.style.display = 'none';
            return;
        }

        const historyHTML = history.map(item => `
            <div class="history-item" data-search-id="${item.id}">
                <div class="history-content">
                    <div class="history-word">"${item.text}"</div>
                    <div class="history-lang">Source: ${item.sourceLang}</div>
                    <div class="history-date">${new Date(item.timestamp).toLocaleDateString()}</div>
                </div>
                <button class="delete-history-btn" data-search-id="${item.id}" title="Delete this search">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        container.innerHTML = historyHTML;
        this.elements.historySection.style.display = 'block';

        container.querySelectorAll('.history-content').forEach(item => {
            item.addEventListener('click', () => {
                const searchId = item.parentElement.dataset.searchId;
                const search = history.find(h => h.id == searchId);
                if (search && this.onHistoryItemSelectedCallback) {
                    this.onHistoryItemSelectedCallback(search);
                }
            });
        });

        container.querySelectorAll('.delete-history-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                const searchId = btn.dataset.searchId;
                if (this.onDeleteHistoryItemCallback) {
                    this.onDeleteHistoryItemCallback(searchId);
                }
            });
        });
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification is-${type}`;
        notification.innerHTML = `
            <button class="delete"></button>
            ${message}
        `;

        this.elements.notifications.appendChild(notification);

        const deleteBtn = notification.querySelector('.delete');
        deleteBtn.addEventListener('click', () => {
            notification.remove();
        });

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }

    getSearchData() {
        return {
            text: this.elements.searchInput.value.trim(),
            sourceLang: this.elements.sourceLangSelect.value
        };
    }

    clearSearchInput() {
        this.elements.searchInput.value = '';
    }

    setSearchInput(text, sourceLang) {
        this.elements.searchInput.value = text;
        this.elements.sourceLangSelect.value = sourceLang;
    }

    setTranslateButtonState(enabled) {
        this.elements.translateBtn.disabled = !enabled;
        if (enabled) {
            this.elements.translateBtn.innerHTML = '<i class="fas fa-language mr-1"></i>Translate';
        } else {
            this.elements.translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Translating...';
        }
    }

    hideTranslationCards() {
        this.elements.translationCards.style.display = 'none';
    }

    addCardClickListeners(callback) {
        this.elements.translationCards.addEventListener('click', (e) => {
            const card = e.target.closest('.translation-card');
            if (card && callback) {
                const countryCode = card.dataset.country;
                callback(countryCode);
            }
        });
    }

    onTranslateClick(callback) {
        this.elements.translateBtn.addEventListener('click', callback);
    }

    onClearHistoryClick(callback) {
        this.elements.clearHistoryBtn.addEventListener('click', callback);
    }

    onHistoryItemSelected(callback) {
        this.onHistoryItemSelectedCallback = callback;
    }

    onDeleteHistoryItem(callback) {
        this.onDeleteHistoryItemCallback = callback;
    }

    onCardClick(callback) {
        this.addCardClickListeners(callback);
    }
}