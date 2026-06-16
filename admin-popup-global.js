/**
 * Tools Menu Permission Handler
 * Shows the Tools dropdown only for users with credit_view or admin_view.
 * BDM-only users will not see the Tools menu.
 */
(function () {
    'use strict';

    function getSession() {
        try {
            return JSON.parse(sessionStorage.getItem('albatross_device_auth') || '{}');
        } catch (_) {
            return {};
        }
    }

    function hasToolsAccess() {
        const session = getSession();
        const email = String(session.email || session.user_email || '').trim().toLowerCase();
        const role = String(session.role || '').trim().toLowerCase();
        const adminEmails = new Set([
            'oliver@albatrosslending.co.uk',
            'sophie@albatrosslending.co.uk',
        ]);
        
        // Admin users always have access
        const isAdmin = !!(
            session.adminView ||
            session.admin_view ||
            session.is_admin ||
            session.isAdmin ||
            role === 'admin' ||
            adminEmails.has(email)
        );
        
        // Credit users have access
        const isCredit = !!(
            session.creditView ||
            session.credit_view ||
            session.is_credit ||
            session.isCredit ||
            role === 'credit' ||
            role === 'senior_credit'
        );
        
        return isAdmin || isCredit;
    }

    function showToolsMenu() {
        const menu = document.getElementById('tools-menu-wrap');
        if (menu && hasToolsAccess()) {
            menu.style.display = '';
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showToolsMenu);
    } else {
        showToolsMenu();
    }
})();
