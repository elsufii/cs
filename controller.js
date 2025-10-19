class TranslationController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.isTranslating = false;
        this.setupEventHandlers();
    }

    async initialize() {
        try {
            this.view.showNotification('Loading countries data...', 'info');
            
            await this.model.loadCountries();
            this.updateStats();
            
            this.renderSearchHistory();
            
            this.view.showNotification('Application ready! Try translating a word.', 'success');
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.view.showNotification('Failed to load countries data', 'danger');
        }
    }

    setupEventHandlers() {
        this.view.onTranslateClick(async () => {
            await this.handleTranslate();
        });

        this.view.onClearHistoryClick(() => {
            this.handleClearHistory();
        });

        this.view.onHistoryItemSelected((searchItem) => {
            this.handleHistoryItemSelection(searchItem);
        });

        this.view.onDeleteHistoryItem((searchId) => {
            this.handleDeleteHistoryItem(searchId);
        });

        this.view.onCardClick((countryCode) => {
            this.handleCardClick(countryCode);
        });
    }

    async handleTranslate() {
        if (this.isTranslating) return;

        const searchData = this.view.getSearchData();
        
        const validation = this.validateInput(searchData.text);
        if (!validation.valid) {
            this.view.showNotification(validation.message, 'warning');
            return;
        }

        try {
            this.isTranslating = true;
            this.view.setTranslateButtonState(false);
            this.view.showLoading();
            
            this.model.saveSearch(searchData.text, searchData.sourceLang);
            
            await this.model.translateForAllCountries(searchData.text, searchData.sourceLang);
            
            this.view.renderTranslationCards(
                this.model.countries,
                this.model.translations,
                searchData.text
            );
            
            this.updateStats();
            this.renderSearchHistory();
            
            const translationCount = this.model.translations.size;
            this.view.showNotification(
                `Successfully translated "${searchData.text}" into ${translationCount} languages!`, 
                'success'
            );
            
        } catch (error) {
            console.error('Translation error:', error);
            this.view.showNotification('Translation failed. Please try again.', 'danger');
        } finally {
            this.isTranslating = false;
            this.view.setTranslateButtonState(true);
            this.view.hideLoading();
        }
    }

    handleDeleteHistoryItem(searchId) {
        if (confirm('Are you sure you want to delete this search?')) {
            this.model.deleteSearch(searchId);
            this.renderSearchHistory();
            this.updateStats();
            this.view.showNotification('Search deleted', 'success');
        }
    }

    handleClearHistory() {
        if (this.model.searchHistory.length === 0) {
            this.view.showNotification('Search history is already empty', 'info');
            return;
        }

        if (confirm('Are you sure you want to clear all search history?')) {
            this.model.clearSearchHistory();
            this.renderSearchHistory();
            this.updateStats();
            this.view.hideTranslationCards();
            this.view.showNotification('Search history cleared', 'success');
        }
    }

    async handleHistoryItemSelection(searchItem) {
        this.view.setSearchInput(searchItem.text, searchItem.sourceLang);
        
        try {
            this.view.showLoading();
            
            await this.model.translateForAllCountries(searchItem.text, searchItem.sourceLang);
            
            this.model.currentSearch = searchItem.text;
            
            this.view.renderTranslationCards(
                this.model.countries,
                this.model.translations,
                searchItem.text
            );
            
            this.view.showNotification(`Showing translations for: "${searchItem.text}"`, 'success');
            
        } catch (error) {
            console.error('Error loading historical search:', error);
            this.view.showNotification('Failed to load search results', 'danger');
        } finally {
            this.view.hideLoading();
        }
    }

    handleCardClick(countryCode) {
        const country = this.model.countries.find(c => c.code === countryCode);
        if (country && this.model.currentSearch) {
            const translationData = this.model.getCountryTranslation(country.code);
            const message = `${country.name}: "${translationData.translation}" (${translationData.language.toUpperCase()})`;
            this.view.showNotification(message, 'info', 8000);
        }
    }

    updateStats() {
        const stats = this.model.getStats();
        this.view.updateStats(stats);
    }

    renderSearchHistory() {
        this.view.renderSearchHistory(this.model.searchHistory);
    }

    validateInput(text) {
        if (!text || text.trim().length === 0) {
            return { valid: false, message: 'Please enter a word to translate' };
        }
        
        if (text.length > 100) {
            return { valid: false, message: 'Text is too long. Maximum 100 characters allowed.' };
        }
        
        const prohibitedPatterns = [/<script>/i, /javascript:/i, /on\w+=/i];
        if (prohibitedPatterns.some(pattern => pattern.test(text))) {
            return { valid: false, message: 'Invalid characters detected' };
        }
        
        return { valid: true };
    }

    handleError(error, userMessage = 'An error occurred') {
        console.error('Application error:', error);
        this.view.showNotification(userMessage, 'danger');
        
        this.isTranslating = false;
        this.view.setTranslateButtonState(true);
        this.view.hideLoading();
    }

    getState() {
        return {
            countries: this.model.countries.length,
            translations: this.model.translations.size,
            searchHistory: this.model.searchHistory.length,
            currentSearch: this.model.currentSearch,
            isTranslating: this.isTranslating
        };
    }

    // reset application state
    reset() {
        this.model.translations.clear();
        this.model.currentSearch = null;
        this.view.hideTranslationCards();
        this.updateStats();
        this.view.showNotification('Application state reset', 'info');
    }
}