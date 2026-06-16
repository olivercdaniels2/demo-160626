/**
 * Albatross Activity Tracker - v2.0
 * Include on every page AFTER supabase-client.js.
 * Sends heartbeats to user_presence and logs significant actions to activity_log.
 *
 * v2 changes:
 *   - Replaces generic "Page opened/closed" with session duration insights
 *     e.g. "Session: Case Management (ALB-0042) - 12m"
 *   - Exposes logAction for micro-function tracking from page code
 *
 * Usage:
 *   <script src="activity-tracker.js"></script>
 *   ActivityTracker.logAction('Generated AIP PDF', { ref: 'ALB-0042', detail: 'v2' });
 */
(function () {
    'use strict';

    /* -- Config -- */
    const HEARTBEAT_INTERVAL = 30000;      // 30 s
    const PAGE_LABELS = {
        'pipeline.html':           'Pipeline',
        'case-management.html':    'Case Management',
        'loan-management.html':    'Loan Book',
        'login.html':              'Login',
        'activity-monitor.html':   'Activity Monitor',
        'valuation-parser.html':   'Valuation Parser'
    };

    /* -- Helpers -- */
    const _tabId = 'tab_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now();
    let _session = {};
    try { _session = JSON.parse(sessionStorage.getItem('albatross_device_auth') || '{}'); } catch (_) {}
    const _email = (_session.email || '').toLowerCase();
    const _name  = _session.name || 'Unknown';

    if (!_email || _email === 'unknown') return;   // not logged in

    function _pageName() {
        const path = window.location.pathname;
        const file = path.split('/').pop() || 'index.html';
        return PAGE_LABELS[file] || file.replace('.html', '');
    }

    function _refFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('ref') || params.get('id') || null;
    }

    /* -- Current state (mutable, updated by page logic) -- */
    let _currentAction = null;
    let _currentDetail = null;
    let _currentRef    = _refFromUrl();
    const _sessionStartedAt = Date.now();

    /* -- Heartbeat: upsert presence row -- */
    async function _heartbeat() {
        if (typeof _sb === 'undefined' && typeof window.supabaseClient !== 'undefined') {
            window._sb = window.supabaseClient;
        }
        if (typeof _sb === 'undefined') return;

        try {
            await _sb.from('user_presence').upsert({
                user_email:     _email,
                user_name:      _name,
                page:           _pageName(),
                action:         _currentAction,
                detail:         _currentDetail,
                ref_number:     _currentRef,
                is_online:      true,
                last_heartbeat: new Date().toISOString(),
                tab_id:         _tabId,
                user_agent:     navigator.userAgent.slice(0, 200)
            }, { onConflict: 'user_email,tab_id' });
        } catch (e) {
            // Silently swallow - presence is non-critical
        }
    }

    /* -- Remove presence on unload -- */
    async function _signOff() {
        if (typeof _sb === 'undefined' && typeof window.supabaseClient !== 'undefined') {
            window._sb = window.supabaseClient;
        }
        if (typeof _sb === 'undefined') return;
        try {
            await _sb.from('user_presence')
                .delete()
                .eq('user_email', _email)
                .eq('tab_id', _tabId);
        } catch (_) {}
    }

    /* -- Format duration in human-friendly form -- */
    function _fmtDuration(ms) {
        if (ms < 60000) return '<1m';
        const mins = Math.floor(ms / 60000);
        if (mins < 60) return mins + 'm';
        const hrs = Math.floor(mins / 60);
        const rem = mins % 60;
        return rem > 0 ? hrs + 'h ' + rem + 'm' : hrs + 'h';
    }

    /* -- Action logging -- */
    async function _logAction(action, opts = {}) {
        if (typeof _sb === 'undefined' && typeof window.supabaseClient !== 'undefined') {
            window._sb = window.supabaseClient;
        }
        if (typeof _sb === 'undefined') return;

        try {
            await _sb.from('activity_log').insert({
                user_email: _email,
                user_name:  _name,
                page:       opts.page || _pageName(),
                action:     action,
                detail:     opts.detail || null,
                ref_number: opts.ref || _currentRef || null,
                metadata:   opts.metadata || {}
            });
        } catch (_) {}
    }

    /* -- Visibility / Focus tracking -- */
    let _visHidden = false;
    document.addEventListener('visibilitychange', () => {
        _visHidden = document.hidden;
        if (!_visHidden) _heartbeat();          // immediate heartbeat on re-focus
    });

    /* -- Page-specific auto-detection -- */
    function _detectAction() {
        const page = _pageName();

        // Case Management: detect which case is open, what section is active
        if (page === 'Case Management') {
            const refEl = document.querySelector('#case-ref, #case-ref-display, .case-ref');
            if (refEl && refEl.textContent.trim()) {
                _currentRef = refEl.textContent.trim();
            }
            // Detect active tab / section
            const activeTab = document.querySelector('.main-nav-btn.active, .tab-btn.active, .case-tab.active');
            if (activeTab) {
                _currentAction = 'Viewing ' + activeTab.textContent.trim();
            } else {
                _currentAction = 'Managing case';
            }
            _currentDetail = _currentRef ? ('Case ' + _currentRef) : null;
            return;
        }

        // Pipeline
        if (page === 'Pipeline') {
            const selected = document.querySelector('.node.selected, .pipeline-node.selected');
            if (selected) {
                const nameEl = selected.querySelector('.node-title, .borrower-name');
                _currentAction = 'Viewing deal';
                _currentDetail = nameEl ? nameEl.textContent.trim() : null;
            } else {
                _currentAction = 'Browsing pipeline';
                _currentDetail = null;
            }
            return;
        }

        // Loan Book
        if (page === 'Loan Book') {
            _currentAction = 'Reviewing loan book';
            _currentDetail = null;
            return;
        }

        _currentAction = 'Viewing ' + page;
        _currentDetail = null;
    }

    /* -- Session duration logging on exit -- */
    function _logSessionEnd() {
        const duration = Date.now() - _sessionStartedAt;
        const page = _pageName();
        const durStr = _fmtDuration(duration);
        let detail = page;
        if (_currentRef) detail = page + ' (' + _currentRef + ')';
        // Only log if the session lasted at least 5 seconds (avoid quick navigations)
        if (duration >= 5000) {
            _logAction('Session: ' + detail + ' - ' + durStr, {
                detail: detail,
                metadata: { duration_ms: duration, duration_display: durStr }
            });
        }
    }

    /* -- Kick off -- */
    function _start() {
        // First heartbeat (no "Page opened" log - that is replaced by session duration on close)
        _detectAction();
        _heartbeat();

        // Recurring heartbeat
        setInterval(() => {
            _detectAction();
            _heartbeat();
        }, HEARTBEAT_INTERVAL);

        // Log session duration + sign off on close
        window.addEventListener('beforeunload', () => {
            _logSessionEnd();
            _signOff();
        });
        window.addEventListener('pagehide', _signOff);
    }

    // Wait for supabase client to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(_start, 500));
    } else {
        setTimeout(_start, 500);
    }

    /* -- Public API -- */
    window.ActivityTracker = {
        /** Log a named action. opts = { detail, ref, page, metadata } */
        logAction: _logAction,

        /** Update current state shown in presence (call from page code) */
        setActivity(action, detail, ref) {
            _currentAction = action || null;
            _currentDetail = detail || null;
            if (ref !== undefined) _currentRef = ref;
            _heartbeat();
        },

        /** Force heartbeat */
        ping: _heartbeat
    };
})();
