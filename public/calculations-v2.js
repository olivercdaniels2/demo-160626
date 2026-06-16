/**
 * ═══════════════════════════════════════════════════════════════════
 *  Albatross Capital — Loan Calculation Engine v2
 *  Standard · Refurbishment · SME
 *  Modes: Max | LTV | Net | Gross
 *  Interest: Retained (serviced) | Rolled
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Reference: CALCULATION_LOGIC.tex (canonical source)
 *
 *  This file is a pure-logic module — no DOM reads/writes.
 *  The CMS HTML calls CalcEngine.calculate(inputs) and receives a
 *  fully resolved result object it can render into the UI.
 * ═══════════════════════════════════════════════════════════════════
 */

const CalcEngine = (() => {
    'use strict';

    // ─── Constants ──────────────────────────────────────────────
    const CONVERGENCE_TOL    = 0.01;     // £0.01
    const MAX_ITER_RETAINED  = 10;
    const MAX_ITER_ROLLED    = 200;
    const MAX_ITER_BINARY    = 60;
    const CHAPS_FEE          = 25;       // £ per loan
    const AVM_FEE_PER_PROP   = 100;      // £ per AVM property
    const SECOND_CHARGE_FEE  = 70;       // £ per 2nd-charge property
    const EXISTING_DEBT_LIMIT = 0.45;    // 45 % of MV180

    // ─── Helpers ────────────────────────────────────────────────
    function smartRound(v) {
        const r = Math.round(v);
        return Math.abs(v - r) < 0.02 ? r : v;
    }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    // ─── Property aggregation ───────────────────────────────────
    /**
     * properties[] = [{
     *   type: 'residential'|'commercial'|'semi-commercial',
     *   charge: 1|2,
     *   omv, mv180, gdv, cw,
     *   existingDebt: 0,
     *   worksEnabled: true|false,
     *   valuationType: 'avm'|'desktop'|'short-form'|'long-form'|''
     * }]
     */
    function aggregateProperties(properties) {
        const agg = {
            totalMV180: 0, totalOMV: 0, totalGDV: 0, totalCW: 0,
            mv180_1st: 0, mv180_2nd: 0,
            gdv_1st: 0, gdv_2nd: 0,
            existingDebt_2nd: 0,
            numAVM: 0, num2ndCharge: 0,
            has1st: false, has2nd: false,
            properties: []
        };
        properties.forEach(p => {
            const mv  = p.mv180 || 0;
            const gdv = p.gdv   || 0;
            const cw  = (p.worksEnabled !== false ? (p.cw || 0) : 0);
            const ed  = p.existingDebt || 0;

            agg.totalOMV  += (p.omv || 0);
            agg.totalMV180 += mv;
            agg.totalGDV  += gdv;
            agg.totalCW   += cw;

            if (p.charge === 2) {
                agg.mv180_2nd += mv;
                agg.gdv_2nd  += gdv;
                agg.existingDebt_2nd += ed;
                agg.num2ndCharge++;
                agg.has2nd = true;
            } else {
                agg.mv180_1st += mv;
                agg.gdv_1st  += gdv;
                agg.has1st = true;
            }

            if ((p.valuationType || '').toLowerCase() === 'avm') agg.numAVM++;

            agg.properties.push({
                ...p,
                mv: mv,
                gdv: gdv,
                cw: cw,
                existingDebt: ed
            });
        });
        return agg;
    }

    // ─── Blended covenants ──────────────────────────────────────
    function blendedMaxLTV(mv1st, mv2nd, maxLtv1st, maxLtv2nd) {
        const total = mv1st + mv2nd;
        if (total === 0) return maxLtv1st;
        return (mv1st * maxLtv1st + mv2nd * maxLtv2nd) / total;
    }
    function blendedMaxLTGDV(gdv1st, gdv2nd, maxLtgdv1st, maxLtgdv2nd) {
        const total = gdv1st + gdv2nd;
        if (total === 0) return maxLtgdv1st;
        return (gdv1st * maxLtgdv1st + gdv2nd * maxLtgdv2nd) / total;
    }

    // ─── Effective covenants (handles blended) ──────────────────
    function effectiveCovenants(agg, settings) {
        let maxLTV, maxLTGDV;
        if (agg.has1st && agg.has2nd) {
            maxLTV   = blendedMaxLTV(agg.mv180_1st, agg.mv180_2nd,
                                     settings.maxLTV1st, settings.maxLTV2nd);
            maxLTGDV = blendedMaxLTGDV(agg.gdv_1st, agg.gdv_2nd,
                                       settings.maxLTGDV1st, settings.maxLTGDV2nd);
        } else if (agg.has2nd) {
            maxLTV   = settings.maxLTV2nd;
            maxLTGDV = settings.maxLTGDV2nd;
        } else {
            maxLTV   = settings.maxLTV1st;
            maxLTGDV = settings.maxLTGDV1st;
        }
        return { maxLTV, maxLTGDV };
    }

    // ─── Additional fees (net-to-client deductions) ─────────────
    function additionalFees(agg) {
        return {
            chaps:        CHAPS_FEE,
            avm:          agg.numAVM * AVM_FEE_PER_PROP,
            secondCharge: agg.num2ndCharge * SECOND_CHARGE_FEE,
            get total() { return this.chaps + this.avm + this.secondCharge; }
        };
    }

    // ─── Second-charge validation ───────────────────────────────
    function validate2ndChargeProperties(agg) {
        const warnings = [];
        agg.properties.forEach((p, i) => {
            if (p.charge !== 2) return;
            const ratio = p.mv > 0 ? (p.existingDebt / p.mv) : 0;
            if (ratio > EXISTING_DEBT_LIMIT) {
                warnings.push(`Property ${i + 1}: existing debt ${(ratio * 100).toFixed(1)}% exceeds 45 % limit`);
            }
            if (p.cw > 0) {
                warnings.push(`Property ${i + 1}: 2nd charge cannot have cost of works`);
            }
            if (p.type !== 'residential') {
                warnings.push(`Property ${i + 1}: 2nd charge only available for residential`);
            }
        });
        return warnings;
    }

    // ═════════════════════════════════════════════════════════════
    //  CORE ITERATIVE SOLVERS
    // ═════════════════════════════════════════════════════════════

    /**
     * Retained/Serviced mode solver (Standard + Refurb).
     *
     * gross_initial = (netInitial + adminFee + arrFeeAmt + brokerFeeAmt)
     *                 / (1 − rm × retainedMonths)
     *
     * For each drawdown month m ≥ 2:
     *   remaining = term − m + 1
     *   grossDraw = (netDraw + ddFee) / (1 − rm × remaining)
     *
     * gross_loan = gross_initial + Σ grossDraw_m
     *
     * Iterate until arr/broker fees converge (% of gross_loan).
     */
    function solveRetained(netInitial, params) {
        const { rm, term, retainedMonths, adminFee,
                arrPct, brokerPct, drawdowns, ddFee } = params;

        let arrFeeAmt    = 0;
        let brokerFeeAmt = 0;

        let grossInitial = 0, grossLoan = 0;
        const drawdownDetails = []; // [{month, netDraw, grossDraw, interest}]

        for (let iter = 0; iter < MAX_ITER_RETAINED; iter++) {
            const baseInitial = netInitial + adminFee + arrFeeAmt + brokerFeeAmt;
            const denom = 1 - rm * retainedMonths;
            grossInitial = denom > 0 ? baseInitial / denom : baseInitial;

            let totalGrossDraw = 0;
            drawdownDetails.length = 0;

            if (drawdowns && drawdowns.length) {
                drawdowns.forEach(dd => {
                    const remaining = term - dd.month + 1;
                    const denomDD = 1 - rm * remaining;
                    const gd = denomDD > 0 ? (dd.net + ddFee) / denomDD : (dd.net + ddFee);
                    const intDD = gd * rm * remaining;
                    totalGrossDraw += gd;
                    drawdownDetails.push({
                        month: dd.month, netDraw: dd.net,
                        grossDraw: gd, interest: intDD, fee: ddFee
                    });
                });
            }

            grossLoan = grossInitial + totalGrossDraw;
            arrFeeAmt    = arrPct * grossLoan;
            brokerFeeAmt = brokerPct * grossLoan;
        }

        const retainedInterest   = grossInitial * rm * retainedMonths;
        const monthlyInterest    = grossInitial * rm;
        const servicedMonths     = term - retainedMonths;
        const totalServicedInt   = monthlyInterest * servicedMonths;
        const totalInterestInitial = retainedInterest + totalServicedInt;

        // Drawdown interest totals
        let totalDrawInterest = 0;
        drawdownDetails.forEach(dd => { totalDrawInterest += dd.interest; });

        const totalInterest = totalInterestInitial + totalDrawInterest;

        return {
            grossInitial, grossLoan,
            arrFeeAmt, brokerFeeAmt,
            retainedInterest, monthlyInterest,
            servicedMonths, totalServicedInt,
            totalInterest,
            totalGrossDrawdowns: grossLoan - grossInitial,
            drawdownDetails
        };
    }

    /**
     * Rolled mode solver (Refurb only — interest compounds monthly).
     *
     * Month 1: gross_initial = (netInitial + adminFee + arrFeeAmt + brokerFeeAmt) / (1 − rm)
     * Month m ≥ 2: tempBalance = B[m-1] + netDraw + ddFee; I = tempBalance × rm; B = temp + I
     * gross_loan = B[T]
     *
     * Iterate arr/broker fees.
     */
    function solveRolled(netInitial, params) {
        const { rm, term, adminFee, arrPct, brokerPct,
                drawdowns, ddFee } = params;

        let arrFeeAmt    = 0;
        let brokerFeeAmt = 0;
        let grossInitial = 0, grossLoan = 0;

        // Build drawdown lookup {month → netDraw}
        const ddMap = {};
        if (drawdowns) drawdowns.forEach(dd => { ddMap[dd.month] = dd.net; });

        let prevGrossInitial = -Infinity;
        for (let iter = 0; iter < MAX_ITER_ROLLED; iter++) {
            grossInitial = (netInitial + adminFee + arrFeeAmt + brokerFeeAmt) / (1 - rm);

            let balance = grossInitial;
            for (let m = 2; m <= term; m++) {
                const netDraw = ddMap[m] || 0;
                const fee     = netDraw > 0 ? ddFee : 0;
                const temp    = balance + netDraw + fee;
                const interest = temp * rm;
                balance = temp + interest;
            }

            grossLoan = balance;
            arrFeeAmt    = arrPct * grossLoan;
            brokerFeeAmt = brokerPct * grossLoan;

            if (Math.abs(grossInitial - prevGrossInitial) < CONVERGENCE_TOL) break;
            prevGrossInitial = grossInitial;
        }

        // Rerun to collect per-month data
        grossInitial = (netInitial + adminFee + arrFeeAmt + brokerFeeAmt) / (1 - rm);
        const interestMonth1 = grossInitial * rm;

        let balance = grossInitial;
        let totalInterest = interestMonth1;
        const drawdownDetails = [];

        for (let m = 2; m <= term; m++) {
            const netDraw = ddMap[m] || 0;
            const fee     = netDraw > 0 ? ddFee : 0;
            const temp    = balance + netDraw + fee;
            const interest = temp * rm;
            balance = temp + interest;
            totalInterest += interest;
            if (netDraw > 0) {
                drawdownDetails.push({
                    month: m, netDraw, grossDraw: netDraw + fee + interest,
                    interest, fee
                });
            }
        }

        grossLoan = balance;

        return {
            grossInitial, grossLoan,
            arrFeeAmt, brokerFeeAmt,
            retainedInterest: interestMonth1,
            monthlyInterest: null, // varies each month in rolled
            servicedMonths: 0,
            totalServicedInt: 0,
            totalInterest,
            totalGrossDrawdowns: grossLoan - grossInitial,
            drawdownDetails
        };
    }

    // ═════════════════════════════════════════════════════════════
    //  CASHFLOW GENERATORS
    // ═════════════════════════════════════════════════════════════

    function cashflowRetained(solved, params) {
        const { rm, term, retainedMonths } = params;
        const { grossInitial, drawdownDetails } = solved;
        const rows = [];
        let balance = grossInitial;

        // Build drawdown lookup
        const ddByMonth = {};
        drawdownDetails.forEach(dd => { ddByMonth[dd.month] = dd; });

        for (let m = 1; m <= term; m++) {
            const opening = balance;
            let interest = 0, drawNet = 0, facilityFee = 0;

            if (m === 1) {
                interest = grossInitial * rm * retainedMonths;
                // balance unchanged — interest was front-loaded
            } else if (ddByMonth[m]) {
                const dd = ddByMonth[m];
                interest   = dd.interest;
                drawNet    = dd.netDraw;
                facilityFee = dd.fee;
                balance   += dd.grossDraw;
            }

            rows.push({
                month: m, opening, interest, drawNet,
                facilityFee, closing: balance
            });
        }

        return rows;
    }

    function cashflowRolled(solved, params) {
        const { rm, term, ddFee } = params;
        const { grossInitial, drawdownDetails } = solved;
        const rows = [];
        let balance = grossInitial;

        const ddMap = {};
        drawdownDetails.forEach(dd => { ddMap[dd.month] = dd; });

        for (let m = 1; m <= term; m++) {
            const opening = balance;
            if (m === 1) {
                const interest = grossInitial * rm;
                rows.push({
                    month: 1, opening: grossInitial, interest,
                    drawNet: 0, facilityFee: 0, closing: grossInitial
                });
                // balance stays grossInitial (interest already in it)
            } else {
                const dd       = ddMap[m];
                const netDraw  = dd ? dd.netDraw : 0;
                const fee      = dd ? ddFee : 0;
                const temp     = balance + netDraw + fee;
                const interest = temp * rm;
                balance = temp + interest;
                rows.push({
                    month: m, opening, interest,
                    drawNet: netDraw, facilityFee: fee, closing: balance
                });
            }
        }

        return rows;
    }

    function cashflowServiced(solved, params) {
        // For standard mode with serviced interest
        const { rm, term, retainedMonths } = params;
        const { grossInitial } = solved;
        const servicedMonths = term - retainedMonths;
        const rows = [];

        for (let m = 1; m <= term; m++) {
            const opening = grossInitial;
            let interest = 0, servicedPayment = 0;

            if (m === 1) {
                interest = grossInitial * rm * retainedMonths;
            } else if (m > retainedMonths) {
                servicedPayment = grossInitial * rm;
            }

            rows.push({
                month: m, opening, interest,
                drawNet: 0, facilityFee: 0,
                closing: grossInitial,
                servicedPayment
            });
        }

        return rows;
    }

    // ═════════════════════════════════════════════════════════════
    //  PERFORMANCE METRICS
    // ═════════════════════════════════════════════════════════════

    function calcIRR(cashflows, timesYears) {
        let irr = 0.1;
        for (let i = 0; i < 100; i++) {
            let npv = 0, dnpv = 0;
            for (let j = 0; j < cashflows.length; j++) {
                const t = timesYears[j];
                npv  += cashflows[j] / Math.pow(1 + irr, t);
                dnpv -= cashflows[j] * t / Math.pow(1 + irr, t + 1);
            }
            if (Math.abs(dnpv) < 1e-12) break;
            const next = irr - npv / dnpv;
            if (Math.abs(next - irr) < 1e-6) { irr = next; break; }
            irr = next;
        }
        return irr * 100;
    }

    function performanceMetrics(solved, params, exitFeeAmt) {
        const { grossLoan, arrFeeAmt, brokerFeeAmt, totalInterest } = solved;
        const { adminFee, procPct, term, minTerm } = params;
        const procFeeAmt = procPct * grossLoan;

        // Full term
        const cashReturnFull = totalInterest + arrFeeAmt + brokerFeeAmt
                             + adminFee + exitFeeAmt - procFeeAmt;
        const roiFull = grossLoan > 0 ? (cashReturnFull / grossLoan) * 100 : 0;

        // Min term (pro-rata interest & exit)
        const intMin  = totalInterest * (minTerm / term);
        const exitMin = exitFeeAmt * (minTerm / term);
        const cashReturnMin = intMin + arrFeeAmt + brokerFeeAmt
                            + adminFee + exitMin - procFeeAmt;
        const roiMin = grossLoan > 0 ? (cashReturnMin / grossLoan) * 100 : 0;

        // IRR — full term (annualised): include full lender cash return,
        // not only the exit fee.
        const irrFullInflow = grossLoan + cashReturnFull;
        const irrFull = (grossLoan > 0 && irrFullInflow > 0 && term > 0)
            ? calcIRR([-grossLoan, irrFullInflow], [0, term / 12])
            : 0;

        // IRR — min term (annualised): include pro-rata min-term cash return.
        const irrMinInflow = grossLoan + cashReturnMin;
        const irrMin = (grossLoan > 0 && irrMinInflow > 0 && minTerm > 0)
            ? calcIRR([-grossLoan, irrMinInflow], [0, minTerm / 12])
            : 0;

        return {
            cashReturnFull, cashReturnMin,
            roiFull, roiMin,
            irrFull, irrMin,
            procFeeAmt
        };
    }

    // ═════════════════════════════════════════════════════════════
    //  SME COVENANT RESOLVER
    // ═════════════════════════════════════════════════════════════
    //  SME = standard calc but uses lower of:
    //    maxMV% × MV   or   max90d% × MV_90d
    //  blended across properties by charge position

    function smeEffectiveLTV(properties, settings) {
        // For SME: each property's cap is min(smeMV% × mv, sme90d% × mv90d)
        // Then blend across the portfolio
        let totalMV = 0;
        let totalCapMV = 0;
        let totalCap90d = 0;

        properties.forEach(p => {
            const mv  = p.mv180 || 0;
            // For SME, MV 90d is the mv180 field when product=sme (since
            // the UI header shows MV(90d) for SME; the user enters 90d value there).
            // But for mixed-type properties we also have OMV.
            // SME covenant: lower of (smeMV% × OMV, sme90d% × MV_90d)
            // In the UI, MV(90d) is entered in mv180 field for SME.
            const mv90d = mv;   // mv180 field contains 90d value for SME
            const omv   = p.omv || mv;

            const capMV   = omv * (settings.smeMaxMV / 100);
            const cap90d  = mv90d * (settings.smeMax90d / 100);

            totalMV     += mv;
            totalCapMV  += capMV;
            totalCap90d += cap90d;
        });

        const totalCap = Math.min(totalCapMV, totalCap90d);
        const binding  = totalCapMV <= totalCap90d ? 'mv' : '90d';
        const ltv      = totalMV > 0 ? (totalCap / totalMV) * 100 : 0;

        return { ltv, binding };
    }

    // ═════════════════════════════════════════════════════════════
    //  MAX LOAN (binary search)
    // ═════════════════════════════════════════════════════════════

    function findMaxNetInitial(agg, settings, params, mode) {
        const { maxLTV, maxLTGDV } = effectiveCovenants(agg, settings);
        const isRefurb = mode === 'refurb';

        // Upper bound estimate
        let high = Math.max(
            agg.totalMV180 * (maxLTV / 100) * 1.5,
            agg.totalGDV > 0 ? agg.totalGDV * (maxLTGDV / 100) * 1.5 : 0,
            1000000
        );
        let low = 0, best = 0;

        for (let iter = 0; iter < MAX_ITER_BINARY; iter++) {
            const mid = (low + high) / 2;
            const solved = params.interestType === 'rolled'
                ? solveRolled(mid, params)
                : solveRetained(mid, params);

            const ltv = agg.totalMV180 > 0
                ? (solved.grossInitial + agg.existingDebt_2nd) / agg.totalMV180 * 100
                : 0;
            const ltgdv = agg.totalGDV > 0 && isRefurb
                ? (solved.grossLoan + agg.existingDebt_2nd) / agg.totalGDV * 100
                : 0;

            const ltvOk   = ltv <= maxLTV + 0.000001;
            const ltgdvOk = !isRefurb || ltgdv <= maxLTGDV + 0.000001;

            if (ltvOk && ltgdvOk) {
                best = mid;
                low = mid;
            } else {
                high = mid;
            }
            if (high - low < 0.01) break;
        }

        return best;
    }

    // ═════════════════════════════════════════════════════════════
    //  DRAWDOWN SCHEDULE BUILDER
    // ═════════════════════════════════════════════════════════════

    function buildDrawdownSchedule(totalCW, term, ddMode, numDD, manualDDs) {
        const drawdowns = [];

        if (ddMode === 'manual' && manualDDs && manualDDs.length) {
            manualDDs.forEach(dd => {
                if (dd.cost > 0 && dd.month >= 2 && dd.month <= term) {
                    drawdowns.push({ month: dd.month, net: dd.cost });
                }
            });
        } else {
            // Auto: spread totalCW evenly across numDD drawdowns
            if (totalCW > 0 && numDD > 0) {
                const perDD = totalCW / numDD;
                for (let i = 0; i < numDD; i++) {
                    const month = Math.min(2 + i, term);
                    drawdowns.push({ month, net: perDD });
                }
            }
        }

        return drawdowns;
    }

    // ═════════════════════════════════════════════════════════════
    //  MAIN ENTRY POINT
    // ═════════════════════════════════════════════════════════════
    /**
     * @param {Object} inputs
     *   .product      'standard'|'refurb'|'sme'
     *   .loanMode     'max'|'ltv'|'net'|'gross'
     *   .properties   [{type, charge, omv, mv180, gdv, cw, existingDebt,
     *                   worksEnabled, valuationType}]
     *   .term         integer months
     *   .minTerm      integer months
     *   .rate         monthly rate as decimal percentage (e.g. 1.1)
     *   .intDeduction integer months (interest deduction / retained period)
     *   .interestType 'retained'|'rolled'  (from settings, refurb only)
     *   .fees         {arrPct, brokerPct, procPct, exitPct, adminFee, ddFee}
     *   .settings     {maxLTV1st, maxLTV2nd, maxLTGDV1st, maxLTGDV2nd,
     *                  smeMaxMV, smeMax90d}
     *   .drawdownMode 'auto'|'manual'
     *   .numDrawdowns integer
     *   .manualDrawdowns [{month, cost}]
     *   .userNetInitial  number|null  (for mode=net)
     *   .userGrossLoan   number|null  (for mode=gross)
     *   .userLTV         number|null  (for mode=ltv)
     */
    function calculate(inputs) {
        const {
            product, loanMode,
            properties: rawProperties,
            term, minTerm, rate, intDeduction,
            interestType: intTypeRaw,
            fees, settings,
            drawdownMode, numDrawdowns, manualDrawdowns,
            userNetInitial, userGrossLoan, userLTV
        } = inputs;

        // ── Aggregate properties ────────────────────────────────
        const agg = aggregateProperties(rawProperties || []);
        const warnings = validate2ndChargeProperties(agg);

        // ── Product-specific overrides ──────────────────────────
        const isRefurb  = product === 'refurb';
        const isSME     = product === 'sme';
        const isStandard = product === 'standard';

        // SME: override effective max LTV
        let effectiveSettings = { ...settings };
        let smeBinding = null;
        if (isSME) {
            const smeResult = smeEffectiveLTV(rawProperties || [], settings);
            effectiveSettings.maxLTV1st = smeResult.ltv;
            smeBinding = smeResult.binding;
            // SME has no 2nd charge, no LTGDV, no drawdowns
            effectiveSettings.maxLTV2nd   = 0;
            effectiveSettings.maxLTGDV1st = 999;
            effectiveSettings.maxLTGDV2nd = 999;
        }

        const covenants = effectiveCovenants(agg, effectiveSettings);

        // ── Interest type ───────────────────────────────────────
        // Rolled only for refurb; standard/SME always retained/serviced
        const interestType = (isRefurb && intTypeRaw === 'rolled') ? 'rolled' : 'retained';

        // ── Retained months (serviced interest) ─────────────────
        // Standard/SME: use intDeduction (1..term). Refurb retained: full term.
        // Refurb rolled: N/A.
        let retainedMonths = term;    // default fully retained
        if (!isRefurb && intDeduction >= 1 && intDeduction <= term) {
            retainedMonths = intDeduction;
        }
        // Refurb retained: always full term
        if (isRefurb && interestType === 'retained') {
            retainedMonths = term;
        }

        // ── Monthly rate ────────────────────────────────────────
        const rm = rate / 100;

        // ── Fee percentages (as decimals) ───────────────────────
        const arrPct    = (fees.arrPct || 0) / 100;
        const brokerPct = (fees.brokerPct || 0) / 100;
        const procPct   = (fees.procPct || 0) / 100;
        const exitPct   = (fees.exitPct || 0) / 100;
        const adminFee  = fees.adminFee || 0;
        const ddFee     = isRefurb ? (fees.ddFee || 0) : 0;

        // ── Drawdowns (refurb only) ─────────────────────────────
        const drawdowns = isRefurb
            ? buildDrawdownSchedule(agg.totalCW, term,
                                    drawdownMode, numDrawdowns, manualDrawdowns)
            : [];

        // ── Solver params ───────────────────────────────────────
        const solverParams = {
            rm, term, retainedMonths, adminFee,
            arrPct, brokerPct, procPct,
            drawdowns, ddFee,
            interestType, minTerm
        };

        // ── Determine netInitial based on loanMode ──────────────
        let netInitial = 0;

        if (loanMode === 'max') {
            netInitial = findMaxNetInitial(agg, effectiveSettings, solverParams,
                                           product);
        } else if (loanMode === 'ltv') {
            const targetLTV = userLTV || 0;
            // target grossInitial from LTV
            const targetGross = agg.totalMV180 * (targetLTV / 100) - agg.existingDebt_2nd;
            // Reverse: netInitial = grossInitial × (1 - rm × retained) - adminFee - arrFee - brokerFee
            // Since arrFee depends on grossLoan, use binary search
            netInitial = reverseFromGrossInitial(targetGross, solverParams, interestType);
        } else if (loanMode === 'net') {
            netInitial = userNetInitial || 0;
        } else if (loanMode === 'gross') {
            // Reverse from gross loan
            netInitial = reverseFromGrossLoan(userGrossLoan || 0, solverParams,
                                              interestType, agg, isRefurb);
        }

        if (netInitial < 0) netInitial = 0;

        // Explicit loan requests (net/gross) should take precedence,
        // but must be capped back to max leverage if covenants are breached.
        if (loanMode === 'net' || loanMode === 'gross') {
            const maxPermittedNetInitial = findMaxNetInitial(agg, effectiveSettings, solverParams, product);
            if (netInitial > maxPermittedNetInitial + 0.000001) {
                const maxNetText = `£${Math.round(maxPermittedNetInitial).toLocaleString('en-GB')}`;
                warnings.push(
                    `Requested ${loanMode} amount exceeds max leverage; capped to ${maxNetText} net initial`
                );
                netInitial = maxPermittedNetInitial;
            }
        }

        // ── Solve ───────────────────────────────────────────────
        const solved = interestType === 'rolled'
            ? solveRolled(netInitial, solverParams)
            : solveRetained(netInitial, solverParams);

        // ── Exit fee (on final balance, not included in gross) ──
        const finalBalance = solved.grossLoan;
        const exitFeeAmt = finalBalance * exitPct;

        const totalRepayment = finalBalance + exitFeeAmt;

        // ── LTV / LTGDV ────────────────────────────────────────
        const ltv = agg.totalMV180 > 0
            ? ((solved.grossInitial + agg.existingDebt_2nd) / agg.totalMV180) * 100
            : 0;        const ltvOMV = agg.totalOMV > 0
            ? ((solved.grossInitial + agg.existingDebt_2nd) / agg.totalOMV) * 100
            : 0;        const ltgdv = agg.totalGDV > 0
            ? ((solved.grossLoan + agg.existingDebt_2nd) / agg.totalGDV) * 100
            : 0;

        // Covenant check
        let refurbBinding = null;
        if (isRefurb && covenants.maxLTV > 0 && covenants.maxLTGDV > 0) {
            const ltvUtil   = ltv / covenants.maxLTV;
            const ltgdvUtil = ltgdv / covenants.maxLTGDV;
            refurbBinding = ltvUtil >= ltgdvUtil ? 'ltv' : 'ltgdv';
        } else if (isRefurb) {
            refurbBinding = 'ltv';
        }
        if (ltv > covenants.maxLTV + 0.000001) {
            warnings.push(`LTV ${ltv.toFixed(2)}% exceeds max ${covenants.maxLTV.toFixed(1)}%`);
        }
        if (isRefurb && ltgdv > covenants.maxLTGDV + 0.000001) {
            warnings.push(`LTGDV ${ltgdv.toFixed(2)}% exceeds max ${covenants.maxLTGDV.toFixed(1)}%`);
        }

        // ── Net to client ───────────────────────────────────────
        const extraFees = additionalFees(agg);
        const netToClient = solved.grossInitial
            - solved.arrFeeAmt - solved.brokerFeeAmt - adminFee
            - solved.retainedInterest
            - extraFees.total;

        // ── Drawdown summary ────────────────────────────────────
        const numDDs     = solved.drawdownDetails.length;
        const totalNetDD = solved.drawdownDetails.reduce((s, d) => s + d.netDraw, 0);
        const totalDDFees = numDDs * ddFee;
        const grossDrawdowns = solved.totalGrossDrawdowns;
        const netDrawdowns   = totalNetDD;

        // ── Cashflow ────────────────────────────────────────────
        let cashflow;
        if (interestType === 'rolled') {
            cashflow = cashflowRolled(solved, solverParams);
        } else if (!isRefurb && retainedMonths < term) {
            cashflow = cashflowServiced(solved, solverParams);
        } else {
            cashflow = cashflowRetained(solved, solverParams);
        }

        // Apply exit fee to final month
        if (cashflow.length > 0 && exitFeeAmt > 0) {
            const last = cashflow[cashflow.length - 1];
            last.facilityFee += exitFeeAmt;
            last.closing     += exitFeeAmt;
        }

        // ── Performance ─────────────────────────────────────────
        const perf = performanceMetrics(solved, solverParams, exitFeeAmt);

        // ── Dev metrics (refurb) ────────────────────────────────
        let devMetrics = null;
        if (isRefurb && agg.totalGDV > 0) {
            const devProfit = agg.totalGDV - agg.totalMV180 - agg.totalCW
                            - solved.totalInterest - solved.arrFeeAmt
                            - solved.brokerFeeAmt - adminFee - exitFeeAmt
                            - totalDDFees;
            const ltc = (solved.grossLoan) / (agg.totalMV180 + agg.totalCW) * 100;
            const totalCost = agg.totalMV180 + agg.totalCW
                            + solved.totalInterest + solved.arrFeeAmt
                            + solved.brokerFeeAmt + adminFee + exitFeeAmt
                            + totalDDFees;
            const profitOnCost = totalCost > 0 ? (devProfit / totalCost) * 100 : 0;
            devMetrics = {
                ltgdv: ltgdv,
                ltc: ltc,
                devProfit: devProfit,
                profitOnCost: profitOnCost,
                totalCW: agg.totalCW,
                totalGDV: agg.totalGDV
            };
        }

        // ── Assemble result ─────────────────────────────────────
        return {
            // Top-level loan figures
            netInitial: smartRound(netInitial),
            grossInitial: smartRound(solved.grossInitial),
            grossLoan: smartRound(solved.grossLoan),
            netToClient: smartRound(netToClient),
            totalRepayment: smartRound(totalRepayment),

            // LTV / LTGDV
            ltv, ltvOMV, ltgdv,
            covenants,
            smeBinding,
            refurbBinding,

            // Fees
            arrFeeAmt:    smartRound(solved.arrFeeAmt),
            brokerFeeAmt: smartRound(solved.brokerFeeAmt),
            procFeeAmt:   smartRound(perf.procFeeAmt),
            adminFee,
            exitFeeAmt: smartRound(exitFeeAmt),
            exitPct:    fees.exitPct || 0,

            // Interest
            retainedInterest:  smartRound(solved.retainedInterest),
            monthlyInterest:   solved.monthlyInterest != null
                                 ? smartRound(solved.monthlyInterest) : null,
            totalInterest:     smartRound(solved.totalInterest),
            servicedMonths:    solved.servicedMonths,
            totalServicedInt:  smartRound(solved.totalServicedInt),
            interestType,
            retainedMonths,

            // Drawdowns (refurb)
            grossDrawdowns: smartRound(grossDrawdowns),
            netDrawdowns:   smartRound(netDrawdowns),
            totalCW:        agg.totalCW,
            totalDDFees:    smartRound(totalDDFees),
            numDrawdowns:   numDDs,
            drawdownDetails: solved.drawdownDetails,

            // Additional fees
            extraFees,

            // Cashflow
            cashflow,

            // Performance
            performance: {
                roiFull:  perf.roiFull,
                roiMin:   perf.roiMin,
                irrFull:  perf.irrFull,
                irrMin:   perf.irrMin,
                cashReturnFull: perf.cashReturnFull,
                cashReturnMin:  perf.cashReturnMin
            },

            // Dev metrics (refurb only)
            devMetrics,

            // Security
            security: {
                totalMV180: agg.totalMV180,
                totalOMV:   agg.totalOMV,
                totalGDV:   agg.totalGDV,
                totalCW:    agg.totalCW,
                existingDebt: agg.existingDebt_2nd,
                has1st:  agg.has1st,
                has2nd:  agg.has2nd,
                blendedMaxLTV:   covenants.maxLTV,
                blendedMaxLTGDV: covenants.maxLTGDV
            },

            // Warnings
            warnings,

            // Product / mode
            product, loanMode, interestType
        };
    }

    // ═════════════════════════════════════════════════════════════
    //  REVERSE SOLVERS (gross → net)
    // ═════════════════════════════════════════════════════════════

    /**
     * Given a target grossInitial, find the netInitial that produces it.
     * Uses iterative approach since fees depend on gross_loan.
     */
    function reverseFromGrossInitial(targetGrossInitial, params, intType) {
        if (targetGrossInitial <= 0) return 0;

        // Initial estimate by rearranging formula
        const { rm, retainedMonths, adminFee, arrPct, brokerPct } = params;
        const denom = intType === 'rolled' ? (1 - rm) : (1 - rm * retainedMonths);

        // First pass: assume no %-based fees
        let netEst = targetGrossInitial * denom - adminFee;

        // Iterate to converge with fee circularity
        for (let i = 0; i < 20; i++) {
            const solved = intType === 'rolled'
                ? solveRolled(netEst, params)
                : solveRetained(netEst, params);

            const diff = solved.grossInitial - targetGrossInitial;
            if (Math.abs(diff) < 1) break;

            // Adjust proportionally
            const ratio = targetGrossInitial / solved.grossInitial;
            netEst *= ratio;
            if (netEst < 0) { netEst = 0; break; }
        }

        return Math.max(0, netEst);
    }

    /**
     * Given a target grossLoan, find the netInitial that produces it.
     * Binary search.
     */
    function reverseFromGrossLoan(targetGrossLoan, params, intType, agg, isRefurb) {
        if (targetGrossLoan <= 0) return 0;

        let low = 0, high = targetGrossLoan * 1.5, best = 0;

        for (let iter = 0; iter < MAX_ITER_BINARY; iter++) {
            const mid = (low + high) / 2;
            const solved = intType === 'rolled'
                ? solveRolled(mid, params)
                : solveRetained(mid, params);

            if (solved.grossLoan < targetGrossLoan) {
                best = mid;
                low = mid;
            } else {
                high = mid;
            }
            if (high - low < 0.01) break;
        }

        return best;
    }

    // ═════════════════════════════════════════════════════════════
    //  PUBLIC API
    // ═════════════════════════════════════════════════════════════

    return {
        calculate,
        // Expose helpers for testing / advanced use
        aggregateProperties,
        solveRetained,
        solveRolled,
        findMaxNetInitial,
        effectiveCovenants,
        blendedMaxLTV,
        blendedMaxLTGDV,
        performanceMetrics,
        buildDrawdownSchedule,
        smeEffectiveLTV,
        additionalFees,
        validate2ndChargeProperties
    };

})();
