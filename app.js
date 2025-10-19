
let app = null;

class TranslationApp {
    constructor() {
        this.model = null;
        this.view = null;
        this.controller = null;
        this.isInitialized = false;
    }

    async init() {
        try {
            console.log('Initializing Translation Cards Application...');
            
            this.showInitialLoading();
            
            this.model = new TranslationModel();
            this.view = new TranslationView();
            this.controller = new TranslationController(this.model, this.view);
            
            this.checkBrowserSupport();
            
            await this.controller.initialize();
            
            this.isInitialized = true;
            this.hideInitialLoading();
            
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Application initialization failed:', error);
            this.showInitializationError(error);
        }
    }

    checkBrowserSupport() {
        const requiredFeatures = [
            'fetch',
            'Promise',
            'localStorage',
            'Map',
            'Set'
        ];
        
        const unsupportedFeatures = requiredFeatures.filter(feature => {
            switch (feature) {
                case 'fetch':
                    return typeof fetch === 'undefined';
                case 'Promise':
                    return typeof Promise === 'undefined';
                case 'localStorage':
                    return typeof localStorage === 'undefined';
                case 'Map':
                    return typeof Map === 'undefined';
                case 'Set':
                    return typeof Set === 'undefined';
                default:
                    return false;
            }
        });
        
        if (unsupportedFeatures.length > 0) {
            throw new Error(`Browser missing required features: ${unsupportedFeatures.join(', ')}`);
        }
    }

    showInitialLoading() {
        const loadingHTML = `
            <div id="initial-loading" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: #1a1a1a;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                color: #e0e0e0;
            ">
                <div style="text-align: center;">
                    <i class="fas fa-language fa-3x" style="animation: pulse 2s infinite;"></i>
                    <h2 style="margin-top: 20px; font-size: 1.5rem;">Loading Translation Cards...</h2>
                    <p style="margin-top: 10px; color: #b0b0b0;">Preparing country data</p>
                </div>
            </div>
            <style>
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            </style>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', loadingHTML);
    }

    hideInitialLoading() {
        const loadingElement = document.getElementById('initial-loading');
        if (loadingElement) {
            loadingElement.style.opacity = '0';
            loadingElement.style.transition = 'opacity 0.3s';
            setTimeout(() => loadingElement.remove(), 300);
        }
    }

    showInitializationError(error) {
        this.hideInitialLoading();
        
        const errorHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: #2a2a2a;
                padding: 2rem;
                border-radius: 8px;
                border: 1px solid #404040;
                text-align: center;
                color: #e0e0e0;
                max-width: 400px;
                z-index: 9999;
            ">
                <i class="fas fa-exclamation-triangle fa-3x" style="color: #e53e3e; margin-bottom: 1rem;"></i>
                <h3 style="margin-bottom: 1rem;">Initialization Failed</h3>
                <p style="margin-bottom: 1rem; color: #b0b0b0;">
                    The application failed to load properly. Please refresh the page and try again.
                </p>
                <p style="font-size: 0.8rem; color: #888;">
                    Error: ${error.message}
                </p>
                <button onclick="window.location.reload()" style="
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background-color: #4a5568;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                ">
                    Reload Page
                </button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', errorHTML);
    }

    getStatus() {
        return {
            isInitialized: this.isInitialized,
            modelReady: !!this.model,
            viewReady: !!this.view,
            controllerReady: !!this.controller
        };
    }

    cleanup() {
        if (this.controller) {
            this.controller.isTranslating = false;
        }
        
        if (this.view) {
            this.view.hideLoading();
        }
        
        console.log('Application cleanup completed');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    app = new TranslationApp();
    await app.init();
    
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        if (app && app.view) {
            app.view.showNotification('An unexpected error occurred', 'danger');
        }
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        if (app && app.view) {
            app.view.showNotification('An unexpected error occurred', 'danger');
        }
    });
    
    window.addEventListener('beforeunload', () => {
        if (app) {
            app.cleanup();
        }
    });
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TranslationApp };
}