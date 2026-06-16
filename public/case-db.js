/* ══════════════════════════════════════════════════════════════════
   CASE-DB.JS — Supabase data layer for Case Management v2
   Requires: supabase-client.js loaded first (provides window.db, window.supabaseClient)
   ══════════════════════════════════════════════════════════════════ */

(async function () {
    'use strict';

    try { await (window._sbInit || Promise.resolve()); } catch (_) {}
    let _sb = window.supabaseDbClient || window.supabaseClient;
    if (!_sb && window.supabase && typeof window.supabase.createClient === 'function') {
        try {
            const res = await fetch('api/supabase-init.php', {
                headers: { 'X-Proxy-Token': 'alb_prx_42f260bda84f1abaa7d90c10' }
            });
            const raw = await res.text();

            let cfg = null;
            try {
                cfg = JSON.parse(raw);
            } catch (_) {
                cfg = null;
            }

            // Fallback for non-PHP runtime: endpoint may return raw PHP source
            if ((!cfg || !cfg.u || !cfg.k) && raw && raw.includes('<?php')) {
                const urlEnc = (raw.match(/SUPABASE_URL\s*['\"]?\s*,\s*_d_php\('([^']+)'\)/) || [])[1] || null;
                const keyEnc = (raw.match(/SUPABASE_ANON_KEY\s*['\"]?\s*,\s*_d_php\('([^']+)'\)/) || [])[1] || null;

                const decodePhpObf = (v) => {
                    if (!v) return '';
                    try {
                        const a = atob(v);
                        const b = a.split('').reverse().join('');
                        return atob(b);
                    } catch {
                        return '';
                    }
                };

                const u = decodePhpObf(urlEnc);
                const k = decodePhpObf(keyEnc);
                if (u && k) cfg = { u, k };
            }

            if (cfg?.u && cfg?.k) {
                _sb = window.supabase.createClient(cfg.u, cfg.k);
                window.supabaseDbClient = _sb;
                window.supabaseClient = _sb;
            } else {
                throw new Error('Supabase init payload missing credentials');
            }
        } catch (e) {
            console.error('case-db.js: fallback supabase init failed', e);
        }
    }
    if (!_sb) { console.error('case-db.js: Supabase client not found'); return; }

    function _check({ data, error }) { if (error) throw error; return data; }

    /* ── In-memory cache with TTL ── */
    const _cache = new Map();
    function cacheGet(key, ttlMs = 60000) {
        const e = _cache.get(key);
        if (!e) return null;
        if (Date.now() - e.ts > ttlMs) { _cache.delete(key); return null; }
        return e.data;
    }
    function cacheSet(key, data) { _cache.set(key, { data, ts: Date.now() }); }
    function cacheInvalidate(prefix) {
        for (const k of _cache.keys()) { if (k.startsWith(prefix)) _cache.delete(k); }
    }

    /* ── Current user helper ── */
    function _currentUser() {
        try {
            const s = JSON.parse(sessionStorage.getItem('albatross_device_auth') || '{}');
            return { email: s.email || 'unknown', name: s.name || 'Unknown' };
        } catch { return { email: 'unknown', name: 'Unknown' }; }
    }

    /* ══════════════════════════════════════════
       CASES — main case CRUD
       ══════════════════════════════════════════ */
    const CASE_COLS = 'id,ref_number,preferred_entities,assigned_entity,loan_id,borrower_name,primary_address,loan_amount,interest_rate,product,status,stage,sub_stage,term,minimum_term,net_loan,gross_loan,ltv,ltgdv,interest_type,arr_fee_pct,arr_fee_amt,broker_fee_pct,broker_fee_amt,proc_fee_pct,proc_fee_amt,exit_fee_pct,exit_fee_amt,admin_fee,dd_fee,avm_value,avm_confidence,is_second_pass,decision,refer_history,draft_version,terms_version,aip_version,fo_version,fo_issued_at,draft_saved_at,form_state,created_by,updated_by,created_at,updated_at';

    const cases = {
        /** Fetch all cases (for queue). Light version without form_state */
        async getAll(filters = {}) {
            const fKey = 'cases:all:' + JSON.stringify(filters);
            const cached = cacheGet(fKey, 30000);    // 30s cache for queue
            if (cached) return cached;

            const lightCols = 'id,ref_number,preferred_entities,assigned_entity,borrower_name,primary_address,loan_amount,interest_rate,product,status,stage,sub_stage,term,minimum_term,net_loan,gross_loan,ltv,ltgdv,interest_type,arr_fee_pct,arr_fee_amt,broker_fee_pct,broker_fee_amt,proc_fee_pct,proc_fee_amt,exit_fee_pct,exit_fee_amt,admin_fee,dd_fee,avm_value,avm_confidence,is_second_pass,draft_version,terms_version,aip_version,fo_version,fo_issued_at,draft_saved_at,decision,created_by,created_at,updated_at';
            let q = _sb.from('cases').select(lightCols).order('created_at', { ascending: false });
            if (filters.status) q = q.eq('status', filters.status);
            if (filters.stage) q = q.eq('stage', filters.stage);
            if (filters.product) q = q.eq('product', filters.product);
            if (filters.created_by) q = q.eq('created_by', filters.created_by);
            const data = _check(await q);
            cacheSet(fKey, data);
            return data;
        },

        /** Fetch single case WITH full form_state */
        async getById(id) {
            const cKey = 'cases:id:' + id;
            const cached = cacheGet(cKey, 15000);   // 15s  – stale quickly for multi-user
            if (cached) return cached;
            const { data } = await _sb.from('cases').select(CASE_COLS).eq('id', id).maybeSingle();
            if (data) cacheSet(cKey, data);
            return data;
        },

        async getByRef(ref) {
            const { data } = await _sb.from('cases').select(CASE_COLS).eq('ref_number', ref).maybeSingle();
            return data;
        },

        /** Create new case, auto-increment XXXXX ref (entity prefix stored separately) */
        async create(overrides = {}) {
            const user = _currentUser();
            // Increment reference counter — store just the 5-digit number
            let ref;
            try {
                const counter = await db.refCounters.increment('case');
                ref = String(counter.current_value).padStart(5, '0');
            } catch (e) {
                // Fallback: timestamp-based ref
                ref = String(Date.now() % 100000).padStart(5, '0');
            }
            const row = {
                ref_number: ref,
                borrower_name: overrides.borrower_name || 'New Case',
                primary_address: overrides.primary_address || '—',
                loan_amount: overrides.loan_amount || 0,
                interest_rate: overrides.interest_rate || 1.1,
                product: overrides.product || 'standard',
                status: 'draft',
                stage: 'draft',
                draft_version: 0,
                terms_version: 0,
                aip_version: 0,
                fo_version: 0,
                form_state: overrides.form_state || null,
                created_by: user.email,
                updated_by: user.email
            };
            const data = _check(await _sb.from('cases').insert(row).select(CASE_COLS).single());
            cacheInvalidate('cases:');
            return data;
        },

        /** Update case fields (merges supplied fields) */
        async update(id, fields) {
            const user = _currentUser();
            const data = _check(await _sb.from('cases')
                .update({ ...fields, updated_by: user.email, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select(CASE_COLS)
                .single());
            cacheInvalidate('cases:');
            return data;
        },

        /** Save full form state + update queue display fields in one call */
        async saveFormState(id, formState, displayFields = {}) {
            const payload = {
                form_state: formState,
                draft_saved_at: new Date().toISOString()
            };
            // Sync queue-visible fields from form state
            if (displayFields.borrower_name) payload.borrower_name = displayFields.borrower_name;
            if (displayFields.primary_address) payload.primary_address = displayFields.primary_address;
            if (displayFields.loan_amount !== undefined) payload.loan_amount = displayFields.loan_amount;
            if (displayFields.interest_rate !== undefined) payload.interest_rate = displayFields.interest_rate;
            if (displayFields.product) payload.product = displayFields.product;
            if (displayFields.status) payload.status = displayFields.status;
            if (displayFields.stage) payload.stage = displayFields.stage;
            if (displayFields.sub_stage !== undefined) payload.sub_stage = displayFields.sub_stage;
            if (displayFields.draft_version !== undefined) payload.draft_version = displayFields.draft_version;
            if (displayFields.terms_version !== undefined) payload.terms_version = displayFields.terms_version;
            if (displayFields.aip_version !== undefined) payload.aip_version = displayFields.aip_version;
            if (displayFields.fo_version !== undefined) payload.fo_version = displayFields.fo_version;
            if (displayFields.decision !== undefined) payload.decision = displayFields.decision;
            if (displayFields.is_second_pass !== undefined) payload.is_second_pass = displayFields.is_second_pass;
            if (displayFields.refer_history !== undefined) payload.refer_history = displayFields.refer_history;
            // Calculation columns
            if (displayFields.term !== undefined) payload.term = displayFields.term;
            if (displayFields.minimum_term !== undefined) payload.minimum_term = displayFields.minimum_term;
            if (displayFields.net_loan !== undefined) payload.net_loan = displayFields.net_loan;
            if (displayFields.gross_loan !== undefined) payload.gross_loan = displayFields.gross_loan;
            if (displayFields.ltv !== undefined) payload.ltv = displayFields.ltv;
            if (displayFields.ltgdv !== undefined) payload.ltgdv = displayFields.ltgdv;
            if (displayFields.interest_type !== undefined) payload.interest_type = displayFields.interest_type;
            // Fee columns
            if (displayFields.arr_fee_pct !== undefined) payload.arr_fee_pct = displayFields.arr_fee_pct;
            if (displayFields.arr_fee_amt !== undefined) payload.arr_fee_amt = displayFields.arr_fee_amt;
            if (displayFields.broker_fee_pct !== undefined) payload.broker_fee_pct = displayFields.broker_fee_pct;
            if (displayFields.broker_fee_amt !== undefined) payload.broker_fee_amt = displayFields.broker_fee_amt;
            if (displayFields.proc_fee_pct !== undefined) payload.proc_fee_pct = displayFields.proc_fee_pct;
            if (displayFields.proc_fee_amt !== undefined) payload.proc_fee_amt = displayFields.proc_fee_amt;
            if (displayFields.exit_fee_pct !== undefined) payload.exit_fee_pct = displayFields.exit_fee_pct;
            if (displayFields.exit_fee_amt !== undefined) payload.exit_fee_amt = displayFields.exit_fee_amt;
            if (displayFields.admin_fee !== undefined) payload.admin_fee = displayFields.admin_fee;
            if (displayFields.dd_fee !== undefined) payload.dd_fee = displayFields.dd_fee;
            // AVM columns
            if (displayFields.avm_value !== undefined) payload.avm_value = displayFields.avm_value;
            if (displayFields.avm_confidence !== undefined) payload.avm_confidence = displayFields.avm_confidence;
            // Preferred entities (from AIP popup)
            if (displayFields.preferred_entities) payload.preferred_entities = displayFields.preferred_entities;

            return await cases.update(id, payload);
        },

        /** Delete case (draft only) */
        async remove(id) {
            _check(await _sb.from('cases').delete().eq('id', id));
            cacheInvalidate('cases:');
        },

        /** Subscribe to realtime changes on cases table */
        subscribe(callback) {
            return _sb.channel('cases_realtime')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, callback)
                .subscribe();
        },
        unsubscribe(channel) { if (channel) _sb.removeChannel(channel); },

        invalidateCache() { cacheInvalidate('cases:'); }
    };

    /* ══════════════════════════════════════════
       CASE VERSIONS — immutable snapshots
       ══════════════════════════════════════════ */
    const caseVersions = {
        /** Get all versions for a case, newest first */
        async getByCase(caseId) {
            return _check(await _sb.from('case_versions')
                .select('*')
                .eq('case_id', caseId)
                .order('created_at', { ascending: false }));
        },

        /** Get specific version */
        async get(caseId, versionType, versionNumber) {
            const { data } = await _sb.from('case_versions')
                .select('*')
                .eq('case_id', caseId)
                .eq('version_type', versionType)
                .eq('version_number', versionNumber)
                .maybeSingle();
            return data;
        },

        /** Save a new version snapshot.
         *  Accepts either positional args or a single object:
         *    create(caseId, versionType, versionNumber, formState)
         *    create({ case_id, version_type, version_number, snapshot, label, saved_by })
         */
        async create(caseIdOrObj, versionType, versionNumber, formState) {
            const user = _currentUser();
            let row;
            if (typeof caseIdOrObj === 'object' && caseIdOrObj !== null && !Array.isArray(caseIdOrObj) && caseIdOrObj.case_id) {
                // Object form — map to DB columns
                const o = caseIdOrObj;
                row = {
                    case_id: o.case_id,
                    version_type: o.version_type,
                    version_number: o.version_number,
                    form_state: o.snapshot || o.form_state || o.formState,
                    created_by: o.saved_by || o.created_by || user.email
                };
            } else {
                // Positional form
                row = {
                    case_id: caseIdOrObj,
                    version_type: versionType,
                    version_number: versionNumber,
                    form_state: formState,
                    created_by: user.email
                };
            }
            return _check(await _sb.from('case_versions').insert(row).select().single());
        },

        /** Count versions by type for a case */
        async countByType(caseId, versionType) {
            const { count } = await _sb.from('case_versions')
                .select('*', { count: 'exact', head: true })
                .eq('case_id', caseId)
                .eq('version_type', versionType);
            return count || 0;
        }
    };

    /* ══════════════════════════════════════════
       CASE LOGS — per-case activity log
       ══════════════════════════════════════════ */
    const caseLogs = {
        /** Get logs for a case (newest first, max 200) */
        async getByCase(caseId, limit = 200) {
            return _check(await _sb.from('case_logs')
                .select('*')
                .eq('case_id', caseId)
                .order('created_at', { ascending: false })
                .limit(limit));
        },

        /** Add a log entry */
        async add(caseId, logText, logType = 'action', snapshot = null) {
            const user = _currentUser();
            const now = new Date();
            return _check(await _sb.from('case_logs').insert({
                case_id: caseId,
                log_text: logText,
                log_type: logType,
                snapshot: snapshot,
                user_name: user.name,
                user_email: user.email,
                log_time: now.toTimeString().slice(0, 8),
                log_date: now.toISOString().slice(0, 10)
            }).select().single());
        },

        /** Batch insert logs (for migration / import) */
        async addBatch(caseId, logs) {
            if (!logs?.length) return [];
            const user = _currentUser();
            const rows = logs.map(l => ({
                case_id: caseId,
                log_text: l.text || l.log_text,
                log_type: l.type || l.log_type || 'action',
                snapshot: l.snapshot || null,
                user_name: l.user || l.user_name || user.name,
                user_email: l.user_email || user.email,
                log_time: l.time || l.log_time || null,
                log_date: l.date || l.log_date || null
            }));
            return _check(await _sb.from('case_logs').insert(rows).select());
        }
    };

    /* ══════════════════════════════════════════
       CASE PROPERTIES — normalised rows w/ AVM
       ══════════════════════════════════════════ */
    const caseProperties = {
        async getByCase(caseId) {
            return _check(await _sb.from('case_properties')
                .select('*')
                .eq('case_id', caseId)
                .order('sort_order'));
        },

        /** Replace all properties for a case (delete + insert) */
        async upsertForCase(caseId, properties) {
            await _sb.from('case_properties').delete().eq('case_id', caseId);
            if (!properties?.length) return [];
            const rows = properties.map((p, i) => ({
                case_id: caseId,
                sort_order: i,
                address: p.addr || p.address || '',
                property_type: p.type || p.property_type || '',
                charge_position: p.charge || p.charge_position || 'None',
                omv: parseFloat(p.omv) || 0,
                mv180: parseFloat(p.mv180) || 0,
                existing_debt: parseFloat(p['existing-debt'] || p.existing_debt) || 0,
                gdv: parseFloat(p.gdv) || 0,
                cost_of_works: parseFloat(p.cw || p.cost_of_works) || 0,
                avm_value: parseFloat(p.avm || p.avm_value) || null,
                works_active: p.worksActive !== false,
                avm_estimate: p.avmEstimate || p.avm_estimate || null,
                avm_margin: p.avmMargin || p.avm_margin || null,
                avm_confidence: p.avmConfidence || p.avm_confidence || null,
                avm_property_type: p.avmDetails?.propertyType || p.avm_property_type || null,
                avm_construction_date: p.avmDetails?.constructionDate || p.avm_construction_date || null,
                avm_condition: p.avmDetails?.condition || p.avm_condition || null,
                avm_outdoor_space: p.avmDetails?.outdoor_space || p.avm_outdoor_space || null,
                avm_parking: p.avmDetails?.parking || p.avm_parking || null,
                avm_gia: p.avmDetails?.gia || p.avm_gia || null
            }));
            return _check(await _sb.from('case_properties').insert(rows).select());
        }
    };

    /* ══════════════════════════════════════════
       CASE INDIVIDUALS — normalised rows
       ══════════════════════════════════════════ */
    const caseIndividuals = {
        async getByCase(caseId) {
            return _check(await _sb.from('case_individuals')
                .select('*')
                .eq('case_id', caseId)
                .order('sort_order'));
        },

        async upsertForCase(caseId, individuals) {
            await _sb.from('case_individuals').delete().eq('case_id', caseId);
            if (!individuals?.length) return [];
            const rows = individuals.map((ind, i) => ({
                case_id: caseId,
                sort_order: i,
                full_name: ind.name || ind.full_name || '',
                email: ind.email || '',
                phone: ind.phone || '',
                date_of_birth: ind.dob || ind.date_of_birth || '',
                nationality: ind.nationality || '',
                shareholding: ind.shareholding || '',
                address: ind.address || '',
                source: ind.source || 'manual'
            }));
            return _check(await _sb.from('case_individuals').insert(rows).select());
        }
    };

    /* ══════════════════════════════════════════
       CASE VALUATIONS — workflow state
       ══════════════════════════════════════════ */
    const caseValuations = {
        async getByCase(caseId) {
            const { data } = await _sb.from('case_valuations')
                .select('*')
                .eq('case_id', caseId)
                .maybeSingle();
            return data;
        },

        /** Create or update valuation state */
        async upsert(caseId, valState) {
            const user = _currentUser();
            // Support new multi-property format: extract first property for DB columns
            const props = valState.properties || [];
            const first = props[0] || {};
            const row = {
                case_id: caseId,
                val_stage: first.stage || valState.stage || 'valuation',
                quote_rows: first.rows || valState.rows || [],
                instructed_at: first.instructedAt || valState.instructedAt || null,
                booked_inspection: first.bookedInspection || valState.bookedInspection || null,
                booked_delivery: first.bookedDelivery || valState.bookedDelivery || null,
                delivered_values: first.deliveredValues || valState.deliveredValues || {},
                reviewed: first.reviewed || valState.reviewed || false,
                full_val_state: valState,
                updated_by: user.email
            };
            // Try update first, then insert
            const { data: existing } = await _sb.from('case_valuations')
                .select('id')
                .eq('case_id', caseId)
                .maybeSingle();

            if (existing) {
                return _check(await _sb.from('case_valuations')
                    .update(row)
                    .eq('case_id', caseId)
                    .select()
                    .single());
            } else {
                return _check(await _sb.from('case_valuations')
                    .insert(row)
                    .select()
                    .single());
            }
        }
    };

    /* ══════════════════════════════════════════
       CASE CONDITIONS — precedent / subsequent
       ══════════════════════════════════════════ */
    const caseConditions = {
        async getByCase(caseId) {
            return _check(await _sb.from('case_conditions')
                .select('*')
                .eq('case_id', caseId)
                .order('condition_type')
                .order('sort_order'));
        },

        async upsertForCase(caseId, conditionsCP = [], conditionsCS = []) {
            await _sb.from('case_conditions').delete().eq('case_id', caseId);
            const rows = [];
            conditionsCP.forEach((text, i) => {
                rows.push({ case_id: caseId, condition_type: 'precedent', condition_text: text, sort_order: i });
            });
            conditionsCS.forEach((text, i) => {
                rows.push({ case_id: caseId, condition_type: 'subsequent', condition_text: text, sort_order: i });
            });
            if (!rows.length) return [];
            return _check(await _sb.from('case_conditions').insert(rows).select());
        }
    };

    /* ══════════════════════════════════════════
       CH CACHE — Companies House API cache
       ══════════════════════════════════════════ */
    const chCache = {
        /** Get cached CH data (returns null if stale or missing) */
        async get(companyNumber, endpoint, maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
            const { data } = await _sb.from('ch_cache')
                .select('*')
                .eq('company_number', companyNumber)
                .eq('endpoint', endpoint)
                .maybeSingle();
            if (!data) return null;
            // Check staleness
            if (maxAgeMs > 0) {
                const age = Date.now() - new Date(data.fetched_at).getTime();
                if (age > maxAgeMs) return null;   // stale
            }
            return data.response_data;
        },

        /** Save/update CH data */
        async upsert(companyNumber, endpoint, responseData) {
            return _check(await _sb.from('ch_cache').upsert({
                company_number: companyNumber,
                endpoint: endpoint,
                response_data: responseData,
                fetched_at: new Date().toISOString()
            }, { onConflict: 'company_number,endpoint' }).select().single());
        }
    };

    /* ══════════════════════════════════════════
       ADDRESS CACHE — Postcoder API cache
       ══════════════════════════════════════════ */
    const addressCache = {
        async get(queryText) {
            const { data } = await _sb.from('address_cache')
                .select('response_data')
                .eq('query_text', queryText.toLowerCase().trim())
                .maybeSingle();
            return data ? data.response_data : null;
        },

        async upsert(queryText, responseData) {
            return _check(await _sb.from('address_cache').upsert({
                query_text: queryText.toLowerCase().trim(),
                response_data: responseData,
                fetched_at: new Date().toISOString()
            }, { onConflict: 'query_text' }).select().single());
        }
    };

    /* ══════════════════════════════════════════
       PRESENCE — concurrent editing detection
       Uses Supabase Realtime Presence to track who is viewing/editing a case.
       ══════════════════════════════════════════ */
    let _presenceChannel = null;
    const presence = {
        /** Join a case's presence channel. Returns the channel. */
        join(caseId, userName) {
            presence.leave(); // leave previous
            _presenceChannel = _sb.channel(`case-presence:${caseId}`, {
                config: { presence: { key: userName || _currentUser().name } }
            });
            _presenceChannel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await _presenceChannel.track({
                        user: userName || _currentUser().name,
                        email: _currentUser().email,
                        joined_at: new Date().toISOString()
                    });
                }
            });
            return _presenceChannel;
        },
        /** Leave current presence channel */
        leave() {
            if (_presenceChannel) {
                _presenceChannel.untrack();
                _sb.removeChannel(_presenceChannel);
                _presenceChannel = null;
            }
        },
        /** Get current channel (for listening to sync events) */
        channel() { return _presenceChannel; },
        /** Get list of present users (excluding self) */
        getOthers(selfName) {
            if (!_presenceChannel) return [];
            const state = _presenceChannel.presenceState();
            const others = [];
            for (const [key, presences] of Object.entries(state)) {
                presences.forEach(p => {
                    if (p.user !== selfName) others.push(p);
                });
            }
            return others;
        }
    };

    /* ══════════════════════════════════════════
       OPTIMISTIC CONCURRENCY — updated_at check
       ══════════════════════════════════════════ */
    const concurrency = {
        /** Fetch the current updated_at + updated_by for a case */
        async getState(caseId) {
            const { data } = await _sb.from('cases')
                .select('updated_at,updated_by')
                .eq('id', caseId)
                .single();
            return { updatedAt: data?.updated_at || null, updatedBy: data?.updated_by || null };
        },
        /**
         * Check if a *different* user modified the case since we loaded it.
         * @param {string} caseId
         * @param {string} loadedAt  — ISO timestamp we recorded when we opened/last-saved
         * @param {string} currentUserEmail  — the logged-in user's email; own saves are never conflicts
         */
        async hasConflict(caseId, loadedAt, currentUserEmail) {
            if (!loadedAt) return false;
            const { updatedAt, updatedBy } = await concurrency.getState(caseId);
            if (!updatedAt) return false;
            // If the DB record hasn't changed since we loaded it, no conflict
            if (new Date(updatedAt).getTime() <= new Date(loadedAt).getTime()) return false;
            // Timestamp is newer — only a real conflict if a *different* user caused it
            if (currentUserEmail && updatedBy && updatedBy === currentUserEmail) return false;
            return true;
        }
    };

    /* ══════════════════════════════════════════
       EXPORT
       ══════════════════════════════════════════ */
    window.CaseDB = {
        cases,
        versions: caseVersions,
        logs: caseLogs,
        properties: caseProperties,
        individuals: caseIndividuals,
        valuations: caseValuations,
        conditions: caseConditions,
        chCache,
        addressCache,
        presence,
        concurrency,
        invalidateAllCaches() { _cache.clear(); }
    };

    console.log('[case-db] Service layer loaded');
})();
