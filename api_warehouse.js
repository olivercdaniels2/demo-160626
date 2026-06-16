// ============================================================
// API Warehouse – Centralised API access layer
// ============================================================
// All external API calls are routed through this file so that
// keys, endpoints and response-parsing logic live in one place.
// ============================================================
(function(){var _1x=window.atob||function(s){var e={},i=0,b=0,r='',a,c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';for(;a=s.charAt(i++);~a&&(b=r?b*64+a:a,r++%4)?e[String.fromCharCode(255&b>>(-2*r&6))]=0:0)a=c.indexOf(a);return Object.keys(e).length?s:atob(s)};if(!window._d)window._d=function(v){try{var a=_1x(v);var b=a.split('').reverse().join('');return _1x(b)}catch(e){return v}};})();
const ApiWarehouse = (() => {

    // ── Proxy token (grants access to server-side proxy only, not to underlying APIs) ──
    const _PT = _d('PUFUTWpCVE9rZFRZaEpXWXhZR040RUdaaUJqTnlZbU0wOEZleUIzWGl4V1k=');

    // ── Local dev: route PHP proxies through php -S localhost:8000 ──────────────
    const _phpBase = () => {
        const h = window.location.hostname;
        return (h === 'localhost' || h === '127.0.0.1') ? 'http://localhost:8000/' : '/';
    };

    // ── Postcoder (Address Lookup – via server-side PHP proxy) ──────────────────

    /**
     * Search for UK addresses via server-side PostCoder proxy.
     * @param {string} query  – partial address / postcode typed by user
     * @param {number} [maxResults=5]
     * @returns {Promise<Array<{formatted: string, raw: object}>>}
     */
    async function searchAddress(query, maxResults = 5) {
        if (!query || query.trim().length < 3) return [];
        const url = `${_phpBase()}api/postcoder.php?q=${encodeURIComponent(query)}&lines=2`;
        try {
            const res = await fetch(url, {
                headers: { 'X-Proxy-Token': _PT }
            });
            if (!res.ok) {
                if (res.status === 429) {
                    return [{ formatted: 'Rate limit reached - please wait and try again', raw: null, isError: true }];
                }
                // PHP proxy unavailable — fall back to Nominatim
                return await _searchAddressFallback(query, maxResults);
            }
            const text = await res.text();
            // If the server returned raw PHP source (no PHP runtime), use fallback
            if (text.trim().startsWith('<?')) return await _searchAddressFallback(query, maxResults);
            const data = JSON.parse(text);
            if (!data || !Array.isArray(data) || data.length === 0) return [];
            return data.slice(0, maxResults).map(item => ({
                formatted: _formatPostcoderAddress(item),
                raw: item
            }));
        } catch (error) {
            return await _searchAddressFallback(query, maxResults);
        }
    }

    /** Fallback address search via Nominatim (OpenStreetMap) — no key required, CORS-enabled */
    async function _searchAddressFallback(query, maxResults = 5) {
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=gb&q=${encodeURIComponent(query)}&limit=${maxResults}&addressdetails=1`;
            const res = await fetch(url, {
                headers: { 'Accept': 'application/json', 'Accept-Language': 'en-GB,en' }
            });
            if (!res.ok) return [{ formatted: 'Address lookup temporarily unavailable', raw: null, isError: true }];
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) return [];
            return data.map(item => ({
                formatted: item.display_name || '',
                raw: item
            }));
        } catch {
            return [{ formatted: 'Address lookup temporarily unavailable', raw: null, isError: true }];
        }
    }

    /** Format Postcoder result into a display string */
    function _formatPostcoderAddress(item) {
        if (!item) return '';
        
        // Use summaryline if available (already formatted by Postcoder)
        if (item.summaryline) return item.summaryline;
        
        // Fallback: build from individual components
        const parts = [];
        if (item.addressline1) parts.push(item.addressline1);
        if (item.addressline2) parts.push(item.addressline2);
        if (item.posttown) parts.push(item.posttown);
        if (item.postcode) parts.push(item.postcode);
        return parts.join(', ');
    }

    // ── Monday.com API ────────────────────────────────────────
    const Monday = (() => {
        // Keys live server-side in api/config.php — proxy token used here instead
        const API_URL = `${_phpBase()}api/monday.php`;
        const BOARD_ID = '5040517919';

        /** Monday.com user name → person ID mapping */
        const USERS = {
            'Jordan Fearnley Brown': '80137318',
            'Lewis Casserley': '80137411',
            'Sophie Ambrose': '79834286',
            'Nils Raber': '80137439',
            'Joshua Field': '80137420',
            'Oliver Daniels': '79836363',
            'David Cardoso': '80137260',
            'Cameron Linnell': '80137454',
            'Geoff Cooney': '80137447',
            'Ema Sileviciute': '80143514',
            'Jigar Patel': '89452798'
        };

        /** Board column key → Monday column ID mapping */
        const COLUMN_MAPPING = {
            address: 'text_mkwps99y',          // Address
            reference: 'text_mkwp44a1',        // Reference
            team: 'multiple_person_mkwpsjcm',  // Team Member
            dateIssued: 'date_mkwpt5yy',       // Terms Issued
            grossLoan: 'numeric_mkwp7p13',     // Gross Loan
            retention: 'numeric_mkwp1mck',     // Retention
            ltv: 'numeric_mkwphb1n',           // LTV
            broker: 'text_mkwpvw66',           // Broker
            rate: 'numeric_mkwp8ve1',          // Rate
            status: 'color_mkwpdm2e'           // Status
        };

        /** Whitelist of allowed column IDs for create_item */
        const ALLOWED_COLUMNS = new Set([
            'text_mkwps99y',            // Address
            'text_mkwp44a1',            // Reference
            'multiple_person_mkwpsjcm', // Team
            'date_mkwpt5yy',            // Terms Issued
            'numeric_mkwp7p13',         // Gross Loan
            'numeric_mkwp1mck',         // Retention
            'numeric_mkwphb1n',         // LTV
            'text_mkwpvw66',            // Broker
            'numeric_mkwp8ve1',         // Rate
            'color_mkwpdm2e'            // Status
        ]);

        /**
         * Execute a GraphQL query/mutation against Monday.com API.
         * @param {string} query – GraphQL query string
         * @param {object} [variables] – optional variables object
         * @returns {Promise<object>} parsed JSON response
         */
        async function graphql(query, variables = null) {
            const body = { query };
            if (variables) body.variables = variables;
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Proxy-Token': _PT
                },
                body: JSON.stringify(body)
            });
            return res.json();
        }

        /**
         * Fetch board column metadata (id, title, type, settings_str).
         * @param {string} [boardId]
         * @returns {Promise<Array|null>}
         */
        async function fetchBoardColumns(boardId = BOARD_ID) {
            const q = `query { boards(ids: ${boardId}) { columns { id title type settings_str } } }`;
            const result = await graphql(q);
            return result?.data?.boards?.[0]?.columns || null;
        }

        /**
         * Create a Monday.com item with column values.
         * @param {string} itemName
         * @param {object} columnValues – pre-built column values object
         * @param {string} [boardId]
         * @returns {Promise<object>} parsed JSON response
         */
        async function createItem(itemName, columnValues, boardId = BOARD_ID) {
            const columnValuesString = JSON.stringify(columnValues).replace(/\n\s*/g, '');
            const escapedColumnValues = columnValuesString.replace(/"/g, '\\"');
            const mutation = `mutation {
                create_item (
                    board_id: ${boardId},
                    item_name: "${itemName.replace(/"/g, '\\"')}",
                    column_values: "${escapedColumnValues}"
                ) {
                    id
                    name
                }
            }`;
            return graphql(mutation);
        }

        /**
         * Create a Monday.com item with name only (no column values).
         * Used as fallback when createItem fails.
         * @param {string} itemName
         * @param {string} [boardId]
         * @returns {Promise<object>}
         */
        async function createItemNameOnly(itemName, boardId = BOARD_ID) {
            const mutation = `mutation {\n  create_item (\n    board_id: ${boardId},\n    item_name: "${itemName.replace(/"/g, '\\"')}"\n  ) { id name }\n}`;
            return graphql(mutation);
        }

        /**
         * Update a single column value on an existing item.
         * @param {string|number} itemId
         * @param {string} columnId
         * @param {string} value – JSON string payload for the column
         * @param {string} [boardId]
         * @returns {Promise<object>}
         */
        async function updateColumn(itemId, columnId, value, boardId = BOARD_ID) {
            const mutation = `mutation ChangeCol($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {\n  change_column_value(board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) { id }\n}`;
            return graphql(mutation, {
                boardId: Number(boardId),
                itemId: Number(itemId),
                columnId: String(columnId),
                value: value
            });
        }

        /**
         * Validate user auth and return Monday.com user details.
         * @param {string} auth – JSON string from sessionStorage
         * @returns {{ userId: string, userName: string }}
         */
        function validateUser(auth) {
            if (!auth) throw new Error('User not authenticated');
            try {
                const userObj = JSON.parse(auth);
                const userName = userObj.name;
                const userId = USERS[userName];
                if (!userId) {
throw new Error('Unauthorized user');
                }
                return { userId, userName };
            } catch (error) {
throw new Error('Unauthorized user');
            }
        }

        /** Parse Monday.com column settings_str safely */
        function parseSettings(settingsStr) {
            try {
                return settingsStr ? JSON.parse(settingsStr) : null;
            } catch (e) {
                return null;
            }
        }

        /** Check if a column value object is non-empty */
        function isNonEmptyValue(val) {
            if (!val || typeof val !== 'object') return false;
            if ('text' in val) return String(val.text ?? '').trim().length > 0;
            if ('number' in val) return Number.isFinite(val.number);
            if ('date' in val) return String(val.date ?? '').trim().length > 0;
            if ('labels' in val) return Array.isArray(val.labels) && val.labels.length > 0 && String(val.labels[0] ?? '').trim().length > 0;
            if ('label' in val) return String(val.label ?? '').trim().length > 0;
            if ('personsAndTeams' in val) return Array.isArray(val.personsAndTeams) && val.personsAndTeams.length > 0;
            return true;
        }

        return {
            API_URL, BOARD_ID,
            USERS, COLUMN_MAPPING, ALLOWED_COLUMNS,
            graphql, fetchBoardColumns,
            createItem, createItemNameOnly, updateColumn,
            validateUser, parseSettings, isNonEmptyValue
        };
    })();

    // -- Companies House API (via server-side PHP proxy) --

    /** Fetch from Companies House via server-side proxy. Key never leaves server. */
    async function chFetch(path) {
        try {
            return await fetch(`${_phpBase()}api/ch.php?path=${encodeURIComponent(path)}`, {
                headers: { 'X-Proxy-Token': _PT }
            });
        } catch (err) {
            console.warn('[CH] Proxy fetch failed:', err?.message || err);
            return new Response(null, { status: 503, statusText: 'Proxy unavailable' });
        }
    }

    /**
     * Parse officer name from Companies House format to proper case.
     * "CASSERLEY, Lewis Paul" → "Lewis Casserley"
     * "SMITH, John" → "John Smith"
     * Strips titles: Mr, Mrs, Ms, Miss, Dr, Prof, Sir, Dame, Lord, Lady
     */
    function parseOfficerName(rawName) {
        if (!rawName) return '';
        const titles = /\b(Mr|Mrs|Ms|Miss|Dr|Prof|Professor|Sir|Dame|Lord|Lady)\b\.?\s*/gi;
        const cleaned = rawName.replace(titles, '').trim();
        
        // Split by comma
        const parts = cleaned.split(',').map(p => p.trim());
        if (parts.length < 2) {
            // No comma, just capitalize each word
            return parts[0].split(' ')
                .filter(w => w.length > 0)
                .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(' ');
        }
        // parts[0] = LASTNAME, parts[1] = Firstname Middle
        const lastName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
        const firstNames = parts[1].split(' ')
            .filter(w => w.length > 0)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
        return `${firstNames} ${lastName}`;
    }

    /**
     * Search Companies House for a company by name.
     * Returns array of {name, number, incorporatedDate, status, address}.
     */
    async function searchCompany(companyName) {
        if (!companyName || companyName.trim().length < 2) return [];

        try {
            const res = await chFetch(`/search/companies?q=${encodeURIComponent(companyName)}&items_per_page=10`);
            
            if (!res.ok) {
return [];
            }
            
            const data = await parseCompaniesHouseJson(res);
            if (!data.items || data.items.length === 0) return [];

            return data.items.map(item => ({
                name: item.title || '',
                number: item.company_number || '',
                status: item.company_status || '',
                incorporatedDate: item.date_of_creation || '',
                address: formatAddress(item.address),
                addressSnippet: item.address_snippet || ''
            }));
        } catch (err) {
return [];
        }
    }

    /**
     * Get full company profile by company number.
     */
    async function getCompanyProfile(companyNumber) {
        try {
            const res = await chFetch(`/company/${companyNumber}`);
            
            if (!res.ok) {
return null;
            }
            
            const data = await parseCompaniesHouseJson(res);
            if (!data) return null;
            return {
                name: data.company_name || '',
                number: data.company_number || '',
                incorporatedDate: data.date_of_creation || '',
                cessationDate: data.date_of_cessation || null,
                status: data.company_status || '',
                sicCodes: (data.sic_codes || []),
                registeredAddress: formatAddress(data.registered_office_address),
                type: data.type || '',
                hasCharges: data.has_charges || false,
                hasInsolvencyHistory: data.has_insolvency_history || false
            };
        } catch (err) {
return null;
        }
    }

    /**
     * Get officers (directors/secretaries) for a company.
     */
    async function getCompanyOfficers(companyNumber) {
        try {
            const res = await chFetch(`/company/${companyNumber}/officers`);
            
            if (!res.ok) {
return [];
            }
            
            const data = await parseCompaniesHouseJson(res);
            if (!data.items) return [];

            return data.items.map(item => ({
                name: parseOfficerName(item.name || ''),
                rawName: item.name || '',
                role: item.officer_role || '',
                appointedDate: item.appointed_on || '',
                resignedDate: item.resigned_on || null,
                nationality: item.nationality || '',
                occupation: item.occupation || '',
                address: formatAddress(item.address),
                dateOfBirth: item.date_of_birth ? {
                    month: item.date_of_birth.month,
                    year: item.date_of_birth.year
                } : null
            }));
        } catch (err) {
return [];
        }
    }

    /**
     * Get persons with significant control (shareholders).
     */
    async function getCompanyPSC(companyNumber) {
        try {
            const res = await chFetch(`/company/${companyNumber}/persons-with-significant-control`);
            
            if (!res.ok) {
return [];
            }
            
            const data = await parseCompaniesHouseJson(res);
            if (!data.items) return [];

            return data.items.map(item => {
                // Parse shareholding percentage from natures_of_control
                // e.g., "ownership-of-shares-75-to-100-percent" → use lower bound: "75"
                // e.g., "ownership-of-shares-25-to-50-percent" → use lower bound: "25"
                let shareholding = '';
                if (item.natures_of_control && item.natures_of_control.length > 0) {
                    const ownershipControl = item.natures_of_control.find(n => n.includes('ownership-of-shares'));
                    if (ownershipControl) {
                        const rangeMatch = ownershipControl.match(/(\d+)-to-(\d+)-percent/);
                        if (rangeMatch) {
                            // Use lower bound of range for input field
                            shareholding = rangeMatch[1];
                        } else {
                            const singleMatch = ownershipControl.match(/(\d+)/);
                            if (singleMatch) shareholding = singleMatch[1];
                        }
                    }
                }

                return {
                    name: parseOfficerName(item.name || ''),
                    rawName: item.name || '',
                    shareholding: shareholding,
                    shareholdingRange: shareholding ? (item.natures_of_control.find(n => n.includes('ownership-of-shares')) || '') : '',
                    naturesOfControl: item.natures_of_control || [],
                    notifiedDate: item.notified_on || '',
                    nationality: item.nationality || '',
                    address: formatAddress(item.address),
                    dateOfBirth: item.date_of_birth ? {
                        month: item.date_of_birth.month,
                        year: item.date_of_birth.year
                    } : null
                };
            });
        } catch (err) {
return [];
        }
    }

    /**
     * Search for officer appointments by person name.
     * Uses CH /search/officers endpoint.
     * Returns array of { name, appointmentLink, companyNumber, companyName, companyStatus,
     *   role, appointedDate, resignedDate, dobMonth, dobYear, address }.
     * @param {string} name – full name to search
     * @returns {Promise<Array>}
     */
    async function searchOfficers(name) {
        if (!name || name.trim().length < 2) return [];
        try {
            const cleanedName = name.replace(/\b(Mr|Mrs|Ms|Miss|Dr|Prof|Professor|Sir|Dame|Lord|Lady)\.?\s*/gi, '').trim();
            const searchName = cleanedName || name.trim();
            console.log('[CH] searchOfficers: query="' + searchName + '" (raw="' + name + '")');
            const path = `/search/officers?q=${encodeURIComponent(searchName)}&items_per_page=30`;
            const res = await chFetch(path);
            console.log('[CH] searchOfficers: HTTP ' + res.status + ' ' + res.statusText);
            if (!res.ok) {
                const errText = await res.text().catch(() => '');
                console.warn('[CH] searchOfficers: non-OK response:', res.status, errText.substring(0, 300));
                return [];
            }
            const data = await parseCompaniesHouseJson(res);
            if (!data || !data.items || !data.items.length) {
                console.log('[CH] searchOfficers: no items in response. data:', JSON.stringify(data).substring(0, 300));
                return [];
            }
            console.log('[CH] searchOfficers: ' + data.items.length + ' officers found (total_results=' + (data.total_results || '?') + ')');
            const results = [];
            for (const item of data.items) {
                const officerName = parseOfficerName(item.title || '');
                const dob = item.date_of_birth || null;
                const appointLink = item?.links?.officer?.appointments || item?.links?.self || null;
                results.push({
                    name: officerName,
                    rawName: item.title || '',
                    appointmentLink: appointLink,
                    appointmentCount: item.appointment_count || 0,
                    address: item.address_snippet || '',
                    dobMonth: dob ? dob.month : null,
                    dobYear: dob ? dob.year : null
                });
            }
            return results;
        } catch (err) {
            console.warn('[CH] searchOfficers error:', err);
            return [];
        }
    }

    function normalizeOfficerAppointmentsPath(officerPath) {
        if (!officerPath) return '';
        let path = String(officerPath).trim();
        if (!path) return '';

        // Convert absolute CH URLs to relative API path.
        if (/^https?:\/\//i.test(path)) {
            try {
                const u = new URL(path);
                path = u.pathname + (u.search || '');
            } catch (e) {
                // keep original if URL parsing fails
            }
        }

        if (!path.startsWith('/')) path = '/' + path;

        // Split query safely.
        const qIndex = path.indexOf('?');
        const basePath = qIndex >= 0 ? path.slice(0, qIndex) : path;
        const query = qIndex >= 0 ? path.slice(qIndex + 1) : '';
        const cleanedBase = basePath.replace(/\/+$/, '');

        let finalBase = cleanedBase;
        if (!/\/appointments$/i.test(finalBase)) {
            finalBase += '/appointments';
        }

        const params = new URLSearchParams(query);
        if (!params.has('items_per_page')) params.set('items_per_page', '50');
        const qs = params.toString();
        return finalBase + (qs ? ('?' + qs) : '');
    }

    function buildOfficerAppointmentsFallbackPath(officerPath) {
        if (!officerPath) return '';
        let p = String(officerPath).trim();
        if (!p) return '';
        if (/^https?:\/\//i.test(p)) {
            try {
                const u = new URL(p);
                p = u.pathname + (u.search || '');
            } catch (e) {}
        }
        const match = p.match(/\/officers\/([^/?]+)(?:\/appointments)?/i);
        if (!match || !match[1]) return '';
        return `/officers/${match[1]}/appointments?items_per_page=50`;
    }

    /**
     * Get officer appointments (companies) from officer self-link.
     * @param {string} officerPath – e.g. "/officers/abc123/appointments"
     * @returns {Promise<Array<{companyNumber, companyName, companyStatus, role, appointedDate, resignedDate}>>}
     */
    async function getOfficerAppointments(officerPath) {
        if (!officerPath) return [];
        try {
            let path = normalizeOfficerAppointmentsPath(officerPath);
            console.log('[CH] getOfficerAppointments: path=' + path);
            let res = await chFetch(path);
            console.log('[CH] getOfficerAppointments: HTTP ' + res.status);
            if (res.status === 404) {
                const retryPath = buildOfficerAppointmentsFallbackPath(officerPath);
                if (retryPath && retryPath !== path) {
                    console.warn('[CH] getOfficerAppointments: retrying on 404 with alternate path=' + retryPath);
                    path = retryPath;
                    res = await chFetch(path);
                    console.log('[CH] getOfficerAppointments retry: HTTP ' + res.status);
                }
            }
            if (!res.ok) {
                const errText = await res.text().catch(() => '');
                console.warn('[CH] getOfficerAppointments: non-OK response:', res.status, errText.substring(0, 300));
                return [];
            }
            const data = await parseCompaniesHouseJson(res);
            if (!data || !data.items) {
                console.log('[CH] getOfficerAppointments: no items. data:', JSON.stringify(data).substring(0, 300));
                return [];
            }
            console.log('[CH] getOfficerAppointments: ' + data.items.length + ' appointments returned');
            return data.items.map(item => ({
                companyNumber: item.appointed_to ? item.appointed_to.company_number : '',
                companyName: item.appointed_to ? item.appointed_to.company_name : (item.name || ''),
                companyStatus: item.appointed_to ? (item.appointed_to.company_status || '') : '',
                role: item.officer_role || '',
                appointedDate: item.appointed_on || '',
                resignedDate: item.resigned_on || null,
                nameElements: item.name_elements || null
            }));
        } catch (err) {
            console.warn('[CH] getOfficerAppointments error:', err);
            return [];
        }
    }

    async function searchOfficersDebug(name) {
        const cleanedName = (name || '').replace(/\b(Mr|Mrs|Ms|Miss|Dr|Prof|Professor|Sir|Dame|Lord|Lady)\.?\s*/gi, '').trim();
        const searchName = cleanedName || (name || '').trim();
        if (!searchName || searchName.length < 2) {
            return { ok: false, status: 0, path: '', query: searchName, error: 'Name too short', rawText: '', data: null, items: [] };
        }
        const path = `/search/officers?q=${encodeURIComponent(searchName)}&items_per_page=30`;
        try {
            const res = await chFetch(path);
            const rawText = await res.text().catch(() => '');
            let data = null;
            try {
                data = rawText ? JSON.parse(rawText) : null;
                if (data && typeof data === 'object' && typeof data.contents === 'string') {
                    data = JSON.parse(data.contents);
                }
            } catch (e) {
                data = null;
            }
            const items = (data && Array.isArray(data.items)) ? data.items.map(item => {
                const dob = item.date_of_birth || null;
                return {
                    name: parseOfficerName(item.title || ''),
                    rawName: item.title || '',
                    appointmentLink: item?.links?.officer?.appointments || item?.links?.self || null,
                    appointmentCount: item.appointment_count || 0,
                    address: item.address_snippet || '',
                    dobMonth: dob ? dob.month : null,
                    dobYear: dob ? dob.year : null
                };
            }) : [];
            return {
                ok: !!res.ok,
                status: res.status,
                statusText: res.statusText,
                path,
                query: searchName,
                rawText,
                data,
                items
            };
        } catch (err) {
            return { ok: false, status: 503, path, query: searchName, error: err?.message || String(err), rawText: '', data: null, items: [] };
        }
    }

    async function getOfficerAppointmentsDebug(officerPath) {
        if (!officerPath) {
            return { ok: false, status: 0, path: '', error: 'Missing officer path', rawText: '', data: null, items: [] };
        }
        let path = normalizeOfficerAppointmentsPath(officerPath);
        try {
            let res = await chFetch(path);
            let attemptedPath = path;
            if (res.status === 404) {
                const retryPath = buildOfficerAppointmentsFallbackPath(officerPath);
                if (retryPath && retryPath !== path) {
                    attemptedPath = attemptedPath + ' | retry: ' + retryPath;
                    path = retryPath;
                    res = await chFetch(path);
                }
            }
            const rawText = await res.text().catch(() => '');
            let data = null;
            try {
                data = rawText ? JSON.parse(rawText) : null;
                if (data && typeof data === 'object' && typeof data.contents === 'string') {
                    data = JSON.parse(data.contents);
                }
            } catch (e) {
                data = null;
            }
            const items = (data && Array.isArray(data.items)) ? data.items.map(item => ({
                companyNumber: item.appointed_to ? item.appointed_to.company_number : '',
                companyName: item.appointed_to ? item.appointed_to.company_name : (item.name || ''),
                companyStatus: item.appointed_to ? (item.appointed_to.company_status || '') : '',
                role: item.officer_role || '',
                appointedDate: item.appointed_on || '',
                resignedDate: item.resigned_on || null,
                nameElements: item.name_elements || null
            })) : [];
            return {
                ok: !!res.ok,
                status: res.status,
                statusText: res.statusText,
                path: attemptedPath,
                rawText,
                data,
                items
            };
        } catch (err) {
            return { ok: false, status: 503, path, error: err?.message || String(err), rawText: '', data: null, items: [] };
        }
    }

    /**
     * Get company charges (mortgages/debentures).
     */
    async function getCompanyCharges(companyNumber) {
        try {
            const res = await chFetch(`/company/${companyNumber}/charges`);
            
            if (!res.ok) {
return [];
            }
            
            const data = await parseCompaniesHouseJson(res);
            if (!data.items) return [];

            return data.items.map(item => ({
                chargeCode: item.charge_code || '',
                chargeNumber: item.charge_number || 0,
                classification: item.classification || {
                    type: '',
                    description: ''
                },
                chargeStatus: item.status || '',
                createdOn: item.created_on || '',
                deliveredOn: item.delivered_on || '',
                satisfiedOn: item.satisfied_on || null,
                description: item.particulars?.description || '',
                particulars: item.particulars || {},
                personsEntitled: item.persons_entitled || [],
                transactions: item.transactions || [],
                insolvencyCases: item.insolvency_cases || [],
                securitedDetails: item.secured_details || {
                    type: '',
                    description: ''
                }
            }));
        } catch (err) {
return [];
        }
    }

    /**
     * Helper to format address object from Companies House API.
     */
    function formatAddress(addr) {
        if (!addr) return '';
        const parts = [
            addr.premises,
            addr.address_line_1,
            addr.address_line_2,
            addr.locality,
            addr.region,
            addr.postal_code,
            addr.country
        ].filter(p => p);
        return parts.join(', ');
    }

    async function parseCompaniesHouseJson(res) {
        if (!res) return null;
        try {
            const text = await res.text();
            if (!text) return null;

            let parsed = null;
            try {
                parsed = JSON.parse(text);
            } catch (e) {
                return null;
            }

            if (parsed && typeof parsed === 'object' && typeof parsed.contents === 'string') {
                try {
                    return JSON.parse(parsed.contents);
                } catch (e) {
                    return null;
                }
            }

            return parsed;
        } catch (e) {
            return null;
        }
    }

    // ── Land Registry ─────────────────────────────────────────
    /**
     * Query Land Registry SPARQL endpoint for property type by full address.
     * Returns property type from Price Paid Data, matching the specific property.
     */
    async function getLandRegistryPropertyType(fullAddress) {
        // Extract postcode from address
        const postcodeMatch = fullAddress.match(/\b([A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})\b/i);
        if (!postcodeMatch) {
return null;
        }
        
        const postcode = postcodeMatch[1].replace(/\s+/g, '').toUpperCase();
        
        // Query for multiple results to find best match
        const query = `
            PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
            PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>

            SELECT ?propertyType ?paon ?saon ?street WHERE {
                ?transx lrppi:pricePaid ?amount ;
                        lrppi:transactionDate ?date ;
                        lrppi:propertyAddress ?addr .
                ?addr lrcommon:postcode "${postcode}"^^xsd:string ;
                      lrcommon:propertyType ?propertyType .
                OPTIONAL { ?addr lrcommon:paon ?paon . }
                OPTIONAL { ?addr lrcommon:saon ?saon . }
                OPTIONAL { ?addr lrcommon:street ?street . }
            }
            ORDER BY DESC(?date)
            LIMIT 20
        `;

        try {
            const url = 'http://landregistry.data.gov.uk/landregistry/query';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/sparql-query',
                    'Accept': 'application/sparql-results+json'
                },
                body: query
            });

            if (!response.ok) {
return null;
            }

            const data = await response.json();
            if (!data.results?.bindings?.length) {
                return null;
            }
            
            // Try to match the specific property from results
            let bestMatch = null;
            let bestScore = 0;
            
            for (const binding of data.results.bindings) {
                const lrAddress = [
                    binding.saon?.value,
                    binding.paon?.value,
                    binding.street?.value,
                    postcode
                ].filter(x => x).join(' ');
                
                const score = addressSimilarity(fullAddress, lrAddress);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = binding;
                }
            }
            
            if (bestMatch) {
                const propertyTypeUri = bestMatch.propertyType.value;
                const typeMatch = propertyTypeUri.match(/\/([^/]+)$/);
                const propertyType = typeMatch ? typeMatch[1] : null;
return propertyType;
            }
            
            return null;
        } catch (err) {
return null;
        }
    }

    /**
     * Search Land Registry for title information.
     * PLACEHOLDER – returns mock data.
     */
    async function searchLandRegistry(address) {
return {
            titleNumber: 'AB123456',
            tenure: 'Freehold',
            registeredOwner: 'Example Owner',
            lastSalePrice: 500000,
            lastSaleDate: '2020-01-15'
        };
    }

    // ── EPC (Energy Performance Certificate) ─────────────────

    /**
     * Simple address matching - removes punctuation, extra spaces, and compares normalized strings.
     */
    function normalizeAddress(address) {
        return address
            .toLowerCase()
            .replace(/[.,]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Calculate similarity score between two addresses (0-1, higher is better).
     */
    function addressSimilarity(addr1, addr2) {
        const norm1 = normalizeAddress(addr1);
        const norm2 = normalizeAddress(addr2);
        
        if (norm1 === norm2) return 1.0;
        
        // Check if one contains the other
        if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.9;
        
        // Count matching words
        const words1 = norm1.split(' ');
        const words2 = norm2.split(' ');
        const matchingWords = words1.filter(w => words2.includes(w) && w.length > 2);
        
        if (words1.length === 0 || words2.length === 0) return 0;
        return matchingWords.length / Math.max(words1.length, words2.length);
    }

    /**
     * Get EPC data for a specific property by full address.
     * Queries by postcode and matches the specific property from results.
     */
    async function getEPCData(fullAddress) {
        // Extract postcode from address
        const postcodeMatch = fullAddress.match(/\b([A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})\b/i);
        if (!postcodeMatch) {
return null;
        }
        
        const postcode = postcodeMatch[1].replace(/\s+/g, '').toUpperCase();
        
        try {
            // Proxy call – credentials injected server-side
            const response = await fetch(`${_phpBase()}api/epc.php?postcode=${encodeURIComponent(postcode)}`, {
                headers: { 'X-Proxy-Token': _PT }
            });

            if (!response.ok) {
return null;
            }

            const data = await response.json();
            if (!data.rows || data.rows.length === 0) {
return null;
            }

            // Find best matching property by address
            let bestMatch = data.rows[0];
            let bestScore = 0;
            
            for (const row of data.rows) {
                const epcAddress = row['address'] || '';
                const score = addressSimilarity(fullAddress, epcAddress);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = row;
                }
            }
return {
                propertyType: bestMatch['property-type'] || '',
                builtForm: bestMatch['built-form'] || '',
                constructionAgeBand: bestMatch['construction-age-band'] || '',
                totalFloorArea: bestMatch['total-floor-area'] || '',
                bedrooms: extractEpcBedrooms(bestMatch),
                rating: bestMatch['current-energy-rating'] || '',
                address: bestMatch['address'] || '',
                matchScore: bestScore
            };
        } catch (err) {
return null;
        }
    }

    /**
     * Get EPC rating for a property address (legacy function for backwards compatibility).
     * PLACEHOLDER – returns mock data.
     */
    async function getEPCRating(address) {
return {
            rating: 'C',
            score: 72,
            validUntil: '2032-06-15',
            propertyType: 'Semi-Detached House',
            floorArea: 95
        };
    }

    // ── AVM Property Data Auto-Fill ───────────────────────────
    /**
     * Map EPC/Land Registry property types to AVM dropdown values.
     * Dropdown options: Flat, Detached House, Terraced House, Semi-Detached House
     */
    function mapPropertyType(epcPropertyType, epcBuiltForm, lrPropertyType) {
        // Land Registry provides: detached, semi-detached, terraced, flat
        if (lrPropertyType) {
            if (lrPropertyType.includes('flat')) return 'Flat';
            if (lrPropertyType.includes('detached') && !lrPropertyType.includes('semi')) return 'Detached House';
            if (lrPropertyType.includes('semi-detached') || lrPropertyType.includes('semi_detached')) return 'Semi-Detached House';
            if (lrPropertyType.includes('terraced')) return 'Terraced House';
        }

        // Fallback to EPC data
        if (epcPropertyType && epcPropertyType.toLowerCase().includes('flat')) return 'Flat';
        if (epcPropertyType && epcPropertyType.toLowerCase().includes('maisonette')) return 'Flat';
        
        if (epcBuiltForm) {
            const builtFormLower = epcBuiltForm.toLowerCase();
            if (builtFormLower.includes('detached') && !builtFormLower.includes('semi')) return 'Detached House';
            if (builtFormLower.includes('semi-detached') || builtFormLower.includes('semi detached')) return 'Semi-Detached House';
            if (builtFormLower.includes('terrace') || builtFormLower.includes('end-terrace')) return 'Terraced House';
        }

        // If EPC says "House" but no built-form, return empty and let user choose
        return '';
    }

    /**
     * Map EPC construction age band to dropdown values.
     * Dropdown options: Pre 1914, 1914-2000, Post 2000
     */
    function mapConstructionDate(constructionAgeBand) {
        if (!constructionAgeBand) return '';
        
        const band = constructionAgeBand.toLowerCase();
        
        // Pre 1914
        if (band.includes('before 1900') || 
            band.includes('1900-1929') || 
            band.includes('1900-1918') ||
            band.includes('england and wales: before 1900')) {
            return 'Pre 1914';
        }
        
        // Post 2000
        if (band.includes('2007') || 
            band.includes('2012') ||
            band.includes('2022') ||
            band.includes('england and wales: 2007') ||
            band.includes('england and wales: 2012 onwards')) {
            return 'Post 2000';
        }
        
        // 1914-2000 (default for everything in between)
        return '1914-2000';
    }

    function extractEpcBedrooms(epcRow) {
        if (!epcRow || typeof epcRow !== 'object') return '';

        const directKeys = [
            'number-of-bedrooms',
            'number-bedrooms',
            'number_bedrooms',
            'bedrooms'
        ];
        for (const key of directKeys) {
            const n = parseInt(epcRow[key], 10);
            if (Number.isFinite(n) && n > 0) return String(n);
        }

        // EPC commonly provides habitable/heated rooms rather than explicit bedrooms.
        // Use a conservative approximation as an optional hint.
        const roomsRaw = epcRow['number-habitable-rooms'] || epcRow['number-heated-rooms'] || epcRow['number_heated_rooms'];
        const rooms = parseInt(roomsRaw, 10);
        if (Number.isFinite(rooms) && rooms > 1) {
            return String(Math.max(1, rooms - 1));
        }

        return '';
    }

    /**
     * Get property data for AVM auto-fill by full address.
     * Returns object with propertyType, constructionDate, and gia (in sqm).
     * Sets defaults: condition='Average', outdoor_space='None', parking='No'
     */
    async function getPropertyDataForAVM(fullAddress) {
// Fetch both APIs in parallel
        const [epcData, lrPropertyType] = await Promise.all([
            getEPCData(fullAddress),
            getLandRegistryPropertyType(fullAddress)
        ]);

        const result = {
            propertyType: '',
            constructionDate: '',
            gia: '',
            bedrooms: '',
            condition: 'Average',
            outdoor_space: 'None',
            parking: 'No'
        };

        if (!epcData && !lrPropertyType) {
return result;
        }

        // Map property type
        if (epcData || lrPropertyType) {
            result.propertyType = mapPropertyType(
                epcData?.propertyType,
                epcData?.builtForm,
                lrPropertyType
            );
        }

        // Map construction date
        if (epcData?.constructionAgeBand) {
            result.constructionDate = mapConstructionDate(epcData.constructionAgeBand);
        }

        // Extract GIA (Gross Internal Area) in sqm
        if (epcData?.totalFloorArea) {
            // EPC returns floor area in sqm
            result.gia = String(epcData.totalFloorArea);
        }

        if (epcData?.bedrooms) {
            result.bedrooms = String(epcData.bedrooms);
        }

        // Include EPC matched address for display purposes
        if (epcData?.address) {
            result.epcAddress = epcData.address;
        }
return result;
    }

    // ── PropertyData.co.uk AVM ────────────────────────────────

    /**
     * Map property type from dropdown to PropertyData API format.
     */
    function mapPropertyTypeToAPI(propertyType) {
        const mapping = {
            'Flat': 'flat',
            'Detached House': 'detached_house',
            'Terraced House': 'terraced_house',
            'Semi-Detached House': 'semi_detached_house'
        };
        return mapping[propertyType] || '';
    }

    /**
     * Map construction date from dropdown to PropertyData API format.
     */
    function mapConstructionDateToAPI(constructionDate) {
        const mapping = {
            'Pre 1914': 'pre_1914',
            '1914-2000': '1914_2000',
            'Post 2000': '2000_onwards'
        };
        return mapping[constructionDate] || '';
    }

    /**
     * Map condition/finish quality from dropdown to PropertyData API format.
     */
    function mapFinishQualityToAPI(condition) {
        const mapping = {
            'High': 'high',
            'Average': 'average',
            'Unmodernised': 'unmodernised'
        };
        return mapping[condition] || 'average';
    }

    /**
     * Map outdoor space from dropdown to PropertyData API format.
     */
    function mapOutdoorSpaceToAPI(outdoorSpace) {
        const mapping = {
            'None': 'none',
            'Garden': 'garden'
        };
        return mapping[outdoorSpace] || 'none';
    }

    /**
     * Map parking Yes/No to number of spaces (0-3).
     */
    function mapParkingToAPI(parking) {
        // Default: No parking = 0, Yes = 1 space
        return parking === 'Yes' ? 1 : 0;
    }

    /**
     * Convert square meters to square feet.
     */
    function sqmToSqft(sqm) {
        return Math.round(parseFloat(sqm) * 10.764);
    }

    /**
     * Get property valuation from PropertyData.co.uk AVM API.
     * 
     * @param {Object} params - Valuation parameters
     * @param {string} params.postcode - Full UK postcode (required)
     * @param {string} params.propertyType - Property type from dropdown
     * @param {string} params.constructionDate - Construction date from dropdown
     * @param {string} params.gia - Internal area in sqm
     * @param {number} params.bedrooms - Number of bedrooms (0-5)
     * @param {number} params.bathrooms - Number of bathrooms (0-5)
     * @param {string} params.condition - Finish quality/condition
     * @param {string} params.outdoor_space - Outdoor space type
     * @param {string} params.parking - Parking availability
     * 
     * @returns {Object} { estimate, margin, confidence } or null on error
     */
    async function getPropertyValuation(params) {
        try {
            // Extract postcode from full address if needed
            let postcode = params.postcode;
            if (!postcode) {
return null;
            }

            // Clean postcode
            const postcodeMatch = postcode.match(/\b([A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})\b/i);
            if (!postcodeMatch) {
return null;
            }
            postcode = postcodeMatch[1].replace(/\s+/g, '').toUpperCase();

            // Convert parameters to API format
            const propertyType = mapPropertyTypeToAPI(params.propertyType);
            const constructionDate = mapConstructionDateToAPI(params.constructionDate);
            const finishQuality = mapFinishQualityToAPI(params.condition);
            const outdoorSpace = mapOutdoorSpaceToAPI(params.outdoor_space);
            const offStreetParking = mapParkingToAPI(params.parking);

            // Convert GIA from sqm to sqft
            const internalArea = params.gia ? sqmToSqft(params.gia) : null;

            // Validate required parameters
            if (!propertyType || !constructionDate || !internalArea) {
return null;
            }

            // Minimum area check
            if (internalArea < 300) {
return null;
            }

            // Default bedrooms/bathrooms if not provided
            const bedrooms = params.bedrooms || 2;
            const bathrooms = params.bathrooms || 1;

            // Build proxy URL – API key injected server-side
            const proxyParams = new URLSearchParams({
                endpoint: 'valuation-sale',
                postcode,
                property_type: propertyType,
                construction_date: constructionDate,
                internal_area: internalArea,
                bedrooms,
                bathrooms,
                finish_quality: finishQuality,
                outdoor_space: outdoorSpace,
                off_street_parking: offStreetParking
            });
const response = await fetch(`${_phpBase()}api/propertydata.php?${proxyParams.toString()}`, {
                headers: { 'X-Proxy-Token': _PT }
            });

            if (!response.ok) {
return null;
            }

            const data = await response.json();

            if (data.status !== 'success') {
return null;
            }
return {
                estimate: data.result.estimate,
                margin: data.result.margin,
                confidence: data.result.confidence,
                processTime: data.process_time
            };

        } catch (err) {
return null;
        }
    }

    function parseMoneyStringToNumber(v) {
        if (v === null || v === undefined) return null;
        const n = Number(String(v).replace(/[^0-9.\-]/g, ''));
        return Number.isFinite(n) ? n : null;
    }

    /**
     * Get HMO valuation from PropertyData.co.uk valuation-hmo endpoint.
     *
     * @param {Object} params
     * @param {string} params.postcode
     * @param {string} [params.finish_quality='average'] one of very_low|low|average|high|very_high
     * @param {boolean} [params.living_room=true]
     * @param {boolean} [params.parking=false]
     * @param {boolean} [params.outside_space=false]
     * @param {number} [params.room_double_en_suite=0]
     * @param {number} [params.room_double=0]
     * @param {number} [params.room_single_en_suite=0]
     * @param {number} [params.room_single=0]
     * @param {number} [params.internal_area_sqf]
     */
    async function getHMOValuation(params) {
        try {
            let postcode = params?.postcode || '';
            const postcodeMatch = String(postcode).match(/\b([A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})\b/i);
            if (!postcodeMatch) return null;
            postcode = postcodeMatch[1].replace(/\s+/g, '').toUpperCase();

            const roomDoubleEnSuite = Math.max(0, parseInt(params?.room_double_en_suite || 0, 10) || 0);
            const roomDouble = Math.max(0, parseInt(params?.room_double || 0, 10) || 0);
            const roomSingleEnSuite = Math.max(0, parseInt(params?.room_single_en_suite || 0, 10) || 0);
            const roomSingle = Math.max(0, parseInt(params?.room_single || 0, 10) || 0);
            const totalRooms = roomDoubleEnSuite + roomDouble + roomSingleEnSuite + roomSingle;
            if (totalRooms < 2) return null;

            const finishQuality = String(params?.finish_quality || 'average').toLowerCase();
            const livingRoom = params?.living_room === false ? 'false' : 'true';
            const parking = params?.parking === true ? 'true' : 'false';
            const outsideSpace = params?.outside_space === true ? 'true' : 'false';
            const internalAreaSqf = parseInt(params?.internal_area_sqf || 0, 10) || null;

            const proxyParams = new URLSearchParams({
                endpoint: 'valuation-hmo',
                postcode,
                finish_quality: finishQuality,
                living_room: livingRoom,
                parking,
                outside_space: outsideSpace,
                room_double_en_suite: String(roomDoubleEnSuite),
                room_double: String(roomDouble),
                room_single_en_suite: String(roomSingleEnSuite),
                room_single: String(roomSingle)
            });
            if (internalAreaSqf && internalAreaSqf > 0) {
                proxyParams.set('internal_area_sqf', String(internalAreaSqf));
            }

            const response = await fetch(`${_phpBase()}api/propertydata.php?${proxyParams.toString()}`, {
                headers: { 'X-Proxy-Token': _PT }
            });
            if (!response.ok) return null;

            const data = await response.json();
            if (data.status !== 'success') return null;

            const saleEstimateRaw = data?.result?.sale?.estimate || null;
            const saleMarginRaw = data?.result?.sale?.margin || null;
            return {
                estimate: parseMoneyStringToNumber(saleEstimateRaw),
                estimateRaw: saleEstimateRaw,
                margin: saleMarginRaw,
                summary: data.summary || null,
                params: data.params || null,
                processTime: data.process_time || null,
                raw: data
            };
        } catch (err) {
            return null;
        }
    }

    /**
     * Query the National HMO Register for a postcode.
     * Returns array of HMO objects, or null on error.
     */
    async function getHMORegister(postcode, results = 20) {
        try {
            const cleanPostcode = String(postcode || '').replace(/\s+/g, '').toUpperCase();
            if (!cleanPostcode) return null;
            const proxyParams = new URLSearchParams({
                endpoint: 'national-hmo-register',
                postcode: cleanPostcode,
                results
            });
            const response = await fetch(`${_phpBase()}api/propertydata.php?${proxyParams.toString()}`, {
                headers: { 'X-Proxy-Token': _PT }
            });
            if (!response.ok) return null;
            const data = await response.json();
            if (data.status !== 'success') return null;
            return data.data?.hmos || [];
        } catch (err) {
            return null;
        }
    }

    // ── Public API ────────────────────────────────────────────
    return {
        // Address (Postcoder)
        searchAddress,

        // Monday.com
        Monday,

        // Companies House
        searchCompany,
        getCompanyProfile,
        getCompanyOfficers,
        getCompanyPSC,
        getCompanyCharges,
        searchOfficers,
        getOfficerAppointments,
        searchOfficersDebug,
        getOfficerAppointmentsDebug,

        // Land Registry
        searchLandRegistry,
        getLandRegistryPropertyType,

        // EPC
        getEPCRating,
        getEPCData,

        // AVM Property Data
        getPropertyDataForAVM,
        
        // PropertyData.co.uk AVM
        getPropertyValuation,

        // PropertyData.co.uk HMO AVM
        getHMOValuation,

        // National HMO Register
        getHMORegister
    };

})();
