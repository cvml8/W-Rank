const Router = {
    currentRoute: null,
    previousRoute: null,
    isInitialized: false,
    routeOrder: ['/', '/builds', '/about'],
    routes: {
        '/': 'tracker',
        '/builds': 'builds',
        '/about': 'about'
    },
    
    init() {
        this.updateRouterPadding();
        window.addEventListener('resize', () => this.updateRouterPadding());
        this.handleRoute();
        this.isInitialized = true;
        window.addEventListener('hashchange', () => this.handleRoute());
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-route]');
            if (link) {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                this.navigate(route);
            }
        });
    },
    
    updateRouterPadding() {
        const header = document.querySelector('.header');
        const routerView = document.getElementById('router-view');
        if (header && routerView) {
            const headerHeight = header.offsetHeight;
            routerView.style.paddingTop = `${headerHeight}px`;
            
            const thead = document.querySelector('thead');
            if (thead) {
                thead.style.top = `${headerHeight}px`;
            }
        }
    },
    
    navigate(route) {
        window.location.hash = route;
        this.handleRoute();
    },
    
    getRoute() {
        const hash = window.location.hash.slice(1) || '/';
        return hash;
    },
    
    handleRoute() {
        const route = this.getRoute();
        
        if (route === this.currentRoute && this.isInitialized) {
            return;
        }
        
        this.previousRoute = this.currentRoute;
        this.currentRoute = route;
        this.updateActiveLink();
        
        const viewName = this.routes[route] || 'tracker';
        this.renderView(viewName);
    },
    
    getSlideDirection() {
        const currentIndex = this.routeOrder.indexOf(this.currentRoute);
        const previousIndex = this.routeOrder.indexOf(this.previousRoute);
        
        if (currentIndex === -1 || previousIndex === -1) {
            return 'right';
        }
        
        return currentIndex > previousIndex ? 'left' : 'right';
    },
    
    updateActiveLink() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-route') === this.currentRoute) {
                link.classList.add('active');
            }
        });
    },
    
    renderView(viewName) {
        const routerView = document.getElementById('router-view');
        if (!routerView) return;
        
        const headerInfo = document.getElementById('header-info');
        const needsHeaderInfo = viewName === 'tracker';
        const hasHeaderInfo = headerInfo && headerInfo.innerHTML.trim() !== '';
        
        if (hasHeaderInfo && !needsHeaderInfo) {
            headerInfo.style.maxHeight = '0';
            headerInfo.style.opacity = '0';
            headerInfo.style.padding = '0';
            headerInfo.style.margin = '0';
        }
        
        const slideDirection = this.getSlideDirection();
        const slideOutClass = slideDirection === 'left' ? 'slide-out-left' : 'slide-out-right';
        
        routerView.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-left', 'slide-out-right');
        
        requestAnimationFrame(() => {
            routerView.offsetHeight;
            routerView.classList.add(slideOutClass);
            
            setTimeout(() => {
                if (headerInfo && !needsHeaderInfo) {
                    headerInfo.innerHTML = '';
                }
                
                routerView.innerHTML = '';
                
                if (viewName === 'tracker') {
                    document.body.classList.remove('has-page-container');
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.classList.add('has-page-container');
                    document.body.style.overflow = 'auto';
                }
                
                switch(viewName) {
                    case 'tracker':
                        this.renderTracker();
                        break;
                    case 'builds':
                        this.renderBuilds();
                        break;
                    case 'about':
                        this.renderAbout();
                        break;
                }
                
                if (headerInfo && needsHeaderInfo && !hasHeaderInfo) {
                    headerInfo.style.maxHeight = '0';
                    headerInfo.style.opacity = '0';
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            headerInfo.style.maxHeight = '';
                            headerInfo.style.opacity = '';
                            headerInfo.style.padding = '';
                            headerInfo.style.margin = '';
                        });
                    });
                }
                
                this.updateRouterPadding();
                
                const slideInClass = slideDirection === 'left' ? 'slide-in-left' : 'slide-in-right';
                
                requestAnimationFrame(() => {
                    routerView.offsetHeight;
                    routerView.classList.remove(slideOutClass);
                    routerView.classList.add(slideInClass);
                    
                    setTimeout(() => {
                        routerView.classList.remove('slide-in-left', 'slide-in-right');
                    }, 400);
                });
                
                document.title = this.getPageTitle(viewName);
            }, 150);
        });
    },
    
    getPageTitle(viewName) {
        const titles = {
            'tracker': 'W Rank',
            'builds': 'Builds - W Rank',
            'about': 'About - W Rank'
        };
        return titles[viewName] || 'W Rank';
    },
    
    renderTracker() {
        const routerView = document.getElementById('router-view');
        const headerInfo = document.getElementById('header-info');
        
        routerView.className = '';
        routerView.innerHTML = '';
        
        if (headerInfo) {
            headerInfo.innerHTML = `
            <div class="info-item">
                <span class="info-label">Character</span>
                <input type="text" id="character-name" placeholder="Name" class="character-input">
            </div>
            <div class="info-item">
                <span class="info-label">Echoes</span>
                <span class="info-value" id="total-echoes">0</span>
            </div>
            <div class="info-item">
                <span class="info-label">Triumphs</span>
                <span class="info-value"><span id="completed-tasks">0</span>/<span id="total-tasks">28</span></span>
            </div>
            <div class="info-item">
                <span class="info-label">Attempts</span>
                <div class="attempts-control">
                    <button id="decrease-attempts" class="btn-icon">−</button>
                    <span id="attempts-count">0</span>
                    <button id="increase-attempts" class="btn-icon">+</button>
                </div>
            </div>
            <button id="reset-btn" class="btn-reset">Reset</button>
        `;
        
        routerView.innerHTML = `
            <div class="table-wrapper">
                <table id="echo-tasks" class="table-progress-tracking sortable">
                    <thead>
                        <tr>
                            <th class="table-progress-tracking-header headerSort" rowspan="1" tabindex="0" role="columnheader button" title="Ordenar ascendente">
                                <div class="header_icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="currentColor">
                                        <path d="M9.95044 0C14.921 0 18.9504 4.02944 18.9504 9C18.9504 13.9706 14.921 18 9.95044 18C4.97988 18 0.950439 13.9706 0.950439 9C0.950439 4.02944 4.97988 0 9.95044 0ZM9.95044 2C6.08445 2 2.95044 5.13401 2.95044 9C2.95044 12.866 6.08445 16 9.95044 16C13.8164 16 16.9504 12.866 16.9504 9C16.9504 5.13401 13.8164 2 9.95044 2ZM12.2434 6.29297C12.6343 5.90205 13.2665 5.90222 13.6575 6.29297C14.0485 6.68397 14.0485 7.31603 13.6575 7.70703L9.65747 11.707C9.46247 11.902 9.20644 12 8.95044 12C8.69452 11.9999 8.43834 11.902 8.24341 11.707L6.24341 9.70703C5.85266 9.31601 5.85249 8.68389 6.24341 8.29297C6.63433 7.90205 7.26645 7.90222 7.65747 8.29297L8.95044 9.58594L12.2434 6.29297Z"></path>
                                    </svg>
                                </div>
                            </th>
                            <th class="unsortable">Echo Reward</th>
                            <th class="unsortable">Triumphs</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-0" data-row-id="food">
                                    <label for="checkbox-0"></label>
                                </div>
                            </td>
                            <td data-row-id="food" style="text-align:center;">1</td>
                            <td>Craft a Food item.</td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-1" data-row-id="fishing">
                                    <label for="checkbox-1"></label>
                                </div>
                            </td>
                            <td data-row-id="fishing" style="text-align:center;">1</td>
                            <td>Catch a Fish.<br><small>Catching anything with a Fishing Rod counts.</small></td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-2" data-row-id="modify-mantra">
                                    <label for="checkbox-2"></label>
                                </div>
                            </td>
                            <td data-row-id="modify-mantra" style="text-align:center;">1</td>
                            <td>Modify a Mantra.</td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-3" data-row-id="pure-ore">
                                    <label for="checkbox-3"></label>
                                </div>
                            </td>
                            <td data-row-id="pure-ore" style="text-align:center;">1</td>
                            <td>Turn in a Pure Ore to a Blacksmith.<br><small>Pure Iron does not count.</small></td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-4" data-row-id="chime-win">
                                    <label for="checkbox-4"></label>
                                </div>
                            </td>
                            <td data-row-id="chime-win" style="text-align:center;">1</td>
                            <td>Win a Chime of Conflict match.</td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-5" data-row-id="attribute-flask">
                                    <label for="checkbox-5"></label>
                                </div>
                            </td>
                            <td data-row-id="attribute-flask" style="text-align:center;">2</td>
                            <td>Drink an Attribute Flask.<br><small>Attunement Potions do not count.</small></td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-6" data-row-id="master-armor">
                                    <label for="checkbox-6"></label>
                                </div>
                            </td>
                            <td data-row-id="master-armor" style="text-align:center;">2</td>
                            <td>Craft a Master Armor.</td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-7" data-row-id="deep-shrine">
                                    <label for="checkbox-7"></label>
                                </div>
                            </td>
                            <td data-row-id="deep-shrine" style="text-align:center;">2</td>
                            <td>Use a Deep Shrine.</td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-8" data-row-id="miserables">
                                    <label for="checkbox-8"></label>
                                </div>
                            </td>
                            <td data-row-id="miserables" style="text-align:center;">2</td>
                            <td>Make a deal with Misérables.</td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-9" data-row-id="yunshul">
                                    <label for="checkbox-9"></label>
                                </div>
                            </td>
                            <td data-row-id="yunshul" style="text-align:center;">2</td>
                            <td>Bargain with Yun'Shul.<br><small>E.g. rerolling Resonance. Also the Idol of Yun'Shul counts for this Triumph.</small></td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-10" data-row-id="unbound-attribute">
                                    <label for="checkbox-10"></label>
                                </div>
                            </td>
                            <td data-row-id="unbound-attribute" style="text-align:center;">5</td>
                            <td>Unbound an Attribute.</td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-11" data-row-id="oath">
                                    <label for="checkbox-11"></label>
                                </div>
                            </td>
                            <td data-row-id="oath" style="text-align:center;">5</td>
                            <td>Obtain an Oath.</td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-12" data-row-id="soulbound-enchant">
                                    <label for="checkbox-12"></label>
                                </div>
                            </td>
                            <td data-row-id="soulbound-enchant" style="text-align:center;">5</td>
                            <td>Soul-bound an enchanted or legendary item.</td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-13" data-row-id="enchant-item">
                                    <label for="checkbox-13"></label>
                                </div>
                            </td>
                            <td data-row-id="enchant-item" style="text-align:center;">5</td>
                            <td>Enchant an Item with an Enchant Stone or Enchant Grease.<br><small>Do not use these items on an already enchanted item.</small></td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-14" data-row-id="laplace-enchant">
                                    <label for="checkbox-14"></label>
                                </div>
                            </td>
                            <td data-row-id="laplace-enchant" style="text-align:center;">5</td>
                            <td>Obtain an enchant from Laplace.</td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-15" data-row-id="world-event">
                                    <label for="checkbox-15"></label>
                                </div>
                            </td>
                            <td data-row-id="world-event" style="text-align:center;">5</td>
                            <td>Clear a World Event.<br><small>Defeat Interluminary Parasol OR The Doom of Caeranthil OR complete the Carnival of Hearts.</small></td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-16" data-row-id="pluripotent-alloy">
                                    <label for="checkbox-16"></label>
                                </div>
                            </td>
                            <td data-row-id="pluripotent-alloy" style="text-align:center;">5</td>
                            <td>Use a Pluripotent Alloy to alloy a weapon.<br><small>Most alloyed weapons have a 75 weapon requirement.</small></td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-17" data-row-id="murmur">
                                    <label for="checkbox-17"></label>
                                </div>
                            </td>
                            <td data-row-id="murmur" style="text-align:center;">5</td>
                            <td>Obtain a Murmur.</td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-18" data-row-id="serpents">
                                    <label for="checkbox-18"></label>
                                </div>
                            </td>
                            <td data-row-id="serpents" style="text-align:center;">5</td>
                            <td>Defeat the Dread Serpent OR the Doom of Caeranthil.</td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-19" data-row-id="duke">
                                    <label for="checkbox-19"></label>
                                </div>
                            </td>
                            <td data-row-id="duke" style="text-align:center;">5</td>
                            <td>Defeat Duke Erisia.</td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-20" data-row-id="ferryman">
                                    <label for="checkbox-20"></label>
                                </div>
                            </td>
                            <td data-row-id="ferryman" style="text-align:center;">5</td>
                            <td>Defeat The Ferryman.</td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-21" data-row-id="chaser">
                                    <label for="checkbox-21"></label>
                                </div>
                            </td>
                            <td data-row-id="chaser" style="text-align:center;">5</td>
                            <td>Defeat Chaser, Scholar of the Crimson Contract.</td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-22" data-row-id="primadon">
                                    <label for="checkbox-22"></label>
                                </div>
                            </td>
                            <td data-row-id="primadon" style="text-align:center;">5</td>
                            <td>Defeat Primadon, Titan of the East OR Elder Primadon, The Titan Warlord.</td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-23" data-row-id="scion">
                                    <label for="checkbox-23"></label>
                                </div>
                            </td>
                            <td data-row-id="scion" style="text-align:center;">10</td>
                            <td>Defeat the Scion of Ethiron.</td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-24" data-row-id="hell-mode">
                                    <label for="checkbox-24"></label>
                                </div>
                            </td>
                            <td data-row-id="hell-mode" style="text-align:center;">10</td>
                            <td>Complete Hell Mode.</td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-25" data-row-id="layer2-no-hook">
                                    <label for="checkbox-25"></label>
                                </div>
                            </td>
                            <td data-row-id="layer2-no-hook" style="text-align:center;">10</td>
                            <td>Complete Layer 2 floor 1 without a Light Hook.<br><small>You will need to leave through Chaser's escape portal for this to count.</small></td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-26" data-row-id="power-level">
                                    <label for="checkbox-26"></label>
                                </div>
                            </td>
                            <td data-row-id="power-level" style="text-align:center;">15</td>
                            <td>Power up.<br><small>Every Power level up will award you with 0.75 Echoes, totaling to 15 Echoes at Power 20</small></td>
                        </tr>
                        <tr>
                            <td class="table-progress-checkbox-cell" data-sort-value="0">
                                <div class="wds-checkbox checkbox_wrapper">
                                    <input type="checkbox" id="checkbox-27" data-row-id="resonance">
                                    <label for="checkbox-27"></label>
                                </div>
                            </td>
                            <td data-row-id="resonance" style="text-align:center;">15</td>
                            <td>Obtain a Resonance.<br><small>You must CHOOSE it. If you reroll in Fragments of Self, it resets the task, even if you had one before.</small></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        }
        
        if (typeof initTracker === 'function') {
            setTimeout(() => initTracker(), 0);
        }
    },
    
    renderBuilds() {
        const routerView = document.getElementById('router-view');
        const headerInfo = document.getElementById('header-info');
        
        routerView.className = 'page-container';
        if (headerInfo) {
            headerInfo.innerHTML = '';
        }
        
        routerView.innerHTML = `
            <main class="main-content">
                <div class="page-header">
                    <h2 class="page-title">Builds</h2>
                    <p class="page-subtitle">Recommended builds for W Rank obtainment</p>
                </div>
            </main>
        `;
    },
    
    renderAbout() {
        const routerView = document.getElementById('router-view');
        const headerInfo = document.getElementById('header-info');
        
        routerView.className = 'page-container';
        if (headerInfo) {
            headerInfo.innerHTML = '';
        }
        
        routerView.innerHTML = `
            <main class="main-content">
                <div class="page-header">
                    <h2 class="page-title">About</h2>
                    <p class="page-subtitle">Credits</p>
                </div>
                <div class="content-section">
                    <div class="credits-list">
                        <div class="credit-item">
                            <div class="credit-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 71 55" fill="currentColor">
                                    <path d="M60.104 5.017c-5.569-2.421-11.314-4.167-17.114-5.214a.074.074 0 0 0-.079.037c-.211.375-.445.864-.608 1.25-5.357-1.196-10.703-1.196-16.06 0-.163-.393-.397-.881-.608-1.25a.077.077 0 0 0-.079-.037c-5.8 1.047-11.545 2.793-17.114 5.214a.07.07 0 0 0-.032.027C.533 9.75-.319 13.249.099 16.728c2.226 22.103 11.015 42.62 25.82 55.773a.076.076 0 0 0 .08.01c3.643-1.53 7.068-3.376 10.214-5.498a.077.077 0 0 0 .033-.055c.25-2.305.427-4.625.527-6.951a.074.074 0 0 0-.032-.07c-2.933-2.15-5.787-4.48-8.449-6.984a.076.076 0 0 1-.009-.1c.125-.15.251-.301.371-.456a.076.076 0 0 1 .086-.02c10.319 4.75 21.519 4.75 31.838 0a.077.077 0 0 1 .086.02c.12.155.246.305.371.456a.076.076 0 0 1-.009.1c-2.662 2.504-5.516 4.834-8.449 6.984a.074.074 0 0 0-.032.07c.1 2.326.277 4.646.527 6.951a.076.076 0 0 0 .033.055c3.146 2.122 6.571 3.968 10.214 5.498a.076.076 0 0 0 .08-.01c14.805-13.153 23.594-33.67 25.82-55.773.416-3.447-.49-6.925-1.92-10.163a.061.061 0 0 0-.031-.03z"/>
                                </svg>
                            </div>
                            <span class="credit-text">TuUsuarioDiscord</span>
                        </div>
                        <div class="credit-item">
                            <div class="credit-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 166 166" fill="currentColor">
                                    <path d="M152.015 0H13.985C6.26 0 0 6.26 0 13.985v138.03C0 159.74 6.26 166 13.985 166h138.03C159.74 166 166 159.74 166 152.015V13.985C166 6.26 159.74 0 152.015 0zm-8.828 133.333H22.813V32.667h120.374v100.666z"/>
                                    <path d="M58.333 83h49.334v8.333H58.333V83zm0-16.667h49.334v8.334H58.333V66.333zm0-16.666h49.334v8.333H58.333V49.667z"/>
                                </svg>
                            </div>
                            <span class="credit-text">TuUsuarioRoblox</span>
                        </div>
                        <div class="credit-item">
                            <div class="credit-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                            </div>
                            <span class="credit-text">TuUsuarioGitHub</span>
                        </div>
                    </div>
                </div>
            </main>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Router.init();
});
