// Application PDF Template
// Generates a comprehensive Application Summary PDF with all calculator + application data
// Includes signing area for borrower consent to credit searches, GDPR, and data processing

function _buildApplicationHtml(data) {
    const {
        borrower, borrowerAddress, companyName, companyNumber, companyIncDate, companySIC,
        isCompany, individuals, brokerFirm, brokerContact, bdmName,
        caseSummary, loanPurpose, exitStrategy,
        grossLoan, netLoan, term, arrangementFee, procFee, brokerFee,
        adminFee, exitFee, interestPcm, interestPerMonth, interestOverTerm,
        monthsDeducted, totalDeducted, totalRepayment,
        propertyValue, currentFirstCharge, ltvDisplay, ltvOMV,
        ttFee, legalFees, avmFee, secondChargeFee, hasAVM, hasSecondCharge,
        conditionsPrecedent, conditionsSubsequent,
        securityProperties, totalsOutstanding, totalsMV, totals180,
        solicitorFirm, solicitorContact, solicitorEmail, solicitorPhone, solicitorAddress,
        bankAccountName, bankName, bankSortCode, bankAccountNumber,
        generalPOCName, valuationPOCName,
        todayDate, logoSrc, caseRef
    } = data;

    const isSME = !!data.isSME;
    const accent = isSME ? '#67c9ba' : '#f9a67e';
    const vpLabel = isSME ? '90 Day VP' : '180 Day VP';

    const css = `
      <style>
        @font-face{font-family:'Argent Regular';src:url('./Fonts/Argent-Regular.otf') format('opentype');font-weight:400}
        @font-face{font-family:'Argent Regular';src:url('./Fonts/Argent-Regular.otf') format('opentype');font-weight:600}

        .app-wrap *, .app-wrap *::before, .app-wrap *::after { box-sizing: border-box; }
        .app-wrap h1::before, .app-wrap h1::after,
        .app-wrap h2::before, .app-wrap h2::after { content: none !important; display: none !important; }
        .app-wrap, .app-wrap * { font-family: 'Argent Regular', serif !important; }

        .app-wrap {
          font-family: 'Argent Regular', serif !important;
          font-size: 10px;
          line-height: 1.4;
          color: #202b60;
          background: #fff;
          width: 794px;
        }

        .app-wrap .app-page {
          width: 794px;
          height: 1123px;
          padding: 50px 60px 60px 60px;
          background: #fff;
          position: relative;
          overflow: hidden;
        }

        /* Header */
        .app-wrap .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .app-wrap .header-left h1 { font-family: 'Montserrat', sans-serif !important; font-weight: 300; font-size: 26px; color: #212c60; letter-spacing: -0.02em; line-height: 1.15; margin: 0; padding: 0; }
        .app-wrap .header-left .date { font-family: 'Montserrat', sans-serif !important; font-weight: 400; font-size: 14px; color: ${accent}; margin-top: 4px; }
        .app-wrap .header-left .case-ref { font-family: 'Montserrat', sans-serif !important; font-weight: 500; font-size: 10px; color: #6c7280; margin-top: 2px; }
        .app-wrap .header-right img { max-height: 48px; width: auto; }

        .app-wrap .divider { border: none; border-top: 1px solid #e5e5e5; margin: 14px 0; }

        /* Info cards */
        .app-wrap .info-row { display: flex; gap: 12px; margin-bottom: 10px; }
        .app-wrap .info-card { background: #f9fbfc; border: 1px solid #e5e5e5; border-radius: 5px; padding: 12px 14px; flex: 1; }
        .app-wrap .info-card .label { font-size: 7px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: #6c7280; margin-bottom: 5px; font-family: 'Montserrat', sans-serif !important; }
        .app-wrap .info-card .value { font-size: 10px; font-weight: 500; color: #051f3c; line-height: 1.3; font-family: 'Montserrat', sans-serif !important; }

        /* Body text */
        .app-wrap .body-text { font-size: 9px; color: #384252; line-height: 1.6; margin-bottom: 8px; font-family: 'Montserrat', sans-serif !important; }
        .app-wrap .body-text strong { color: #051f3c; font-weight: 600; }

        /* Section headings */
        .app-wrap .section-heading { font-family: 'Argent CF', serif; font-size: 13px; color: #212c60; margin: 14px 0 6px; letter-spacing: -0.02em; font-weight: 400; }
        .app-wrap .section-divider { border: none; border-top: 0.75px solid #e5e5e5; margin-bottom: 10px; }

        /* Conditions list */
        .app-wrap .conditions-box { background: #f9fbfc; border: 1px solid #e5e5e5; border-radius: 5px; padding: 12px 14px; margin-bottom: 12px; }
        .app-wrap .condition-group-label { font-size: 7px; font-weight: 700; color: #6c7280; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px; margin-top: 8px; font-family: 'Montserrat', sans-serif !important; }
        .app-wrap .condition-group-label:first-child { margin-top: 0; }
        .app-wrap .condition-item { display: flex; gap: 6px; margin-bottom: 4px; font-size: 9px; color: #384252; line-height: 1.5; font-family: 'Montserrat', sans-serif !important; }
        .app-wrap .condition-item:last-child { margin-bottom: 0; }
        .app-wrap .condition-bullet { color: #051f3c; font-weight: 700; flex-shrink: 0; }
        .app-wrap .condition-separator { border: none; border-top: 0.5px solid #e5e5e5; margin: 8px 0; }

        /* Loan summary table (dark section) */
        .app-wrap .loan-section { background: #212c60; border-radius: 7px; padding: 16px 18px; margin-bottom: 12px; }
        .app-wrap .loan-section-title { font-family: 'Argent CF', serif; font-size: 13px; color: ${accent}; margin-bottom: 12px; letter-spacing: -0.02em; }
        .app-wrap .loan-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .app-wrap .loan-table td { padding: 6px 0; font-size: 8.5px; vertical-align: middle; border-bottom: 0.25px solid rgba(199,199,198,0.3); font-family: 'Montserrat', sans-serif !important; }
        .app-wrap .loan-table tr:last-child td { border-bottom: none; }
        .app-wrap .loan-table .col-label { font-weight: 400; color: #c7c7c6; width: 26%; padding-right: 10px; }
        .app-wrap .loan-table .col-value { font-weight: 600; color: #fff; text-align: right; width: 20%; font-size: 8.5px; padding-right: 15px; }
        .app-wrap .loan-table .col-label-right { font-weight: 400; color: #c7c7c6; width: 28%; padding-left: 50px; }
        .app-wrap .loan-table .col-value-right { font-weight: 600; color: #fff; text-align: right; width: 22%; font-size: 8.5px; }

        /* Net loan highlight bar */
        .app-wrap .net-loan-bar { background: ${accent}; border-radius: 5px; padding: 8px 16px; margin-top: 8px; display: flex; justify-content: space-between; align-items: center; }
        .app-wrap .net-loan-label { font-size: 9px; color: #051f3c; font-weight: 600; font-family: 'Montserrat', sans-serif !important; }
        .app-wrap .net-loan-value { font-family: 'Argent CF', serif; font-size: 13px; color: #051f3c; font-weight: 600; }

        /* Property table */
        .app-wrap .property-section { margin-bottom: 12px; }
        .app-wrap .property-table-wrapper { border: 1px solid #e5e5e5; border-radius: 7px; overflow: hidden; }
        .app-wrap .property-table { width: 100%; border-collapse: collapse; }
        .app-wrap .property-table thead { background: #f9fbfc; }
        .app-wrap .property-table thead th { padding: 8px 10px; text-align: left; font-weight: 600; font-size: 7px; text-transform: uppercase; letter-spacing: 0.1em; color: #061633; border-bottom: 1px solid #e5e5e5; font-family: 'Montserrat', sans-serif !important; }
        .app-wrap .property-table thead th:nth-child(n+2) { text-align: center; }
        .app-wrap .property-table thead th:last-child { text-align: right; }
        .app-wrap .property-table tbody td { padding: 9px 10px; background: #fff; color: #384252; font-size: 9px; line-height: 1.35; border-bottom: 1px solid rgba(229,229,229,0.5); font-family: 'Montserrat', sans-serif !important; }
        .app-wrap .property-table tbody td:nth-child(n+2) { text-align: center; }
        .app-wrap .property-table tbody td:last-child { text-align: right; }
        .app-wrap .property-name { font-weight: 600; color: #061633; font-size: 9px; }
        .app-wrap .property-address { color: #6c7280; font-size: 7.5px; margin-top: 2px; }
        .app-wrap .totals-row { background: ${accent} !important; }
        .app-wrap .totals-row td { background: ${accent} !important; color: #051f3c !important; font-weight: 600; font-size: 8.5px; padding: 6px 10px !important; border-bottom: none !important; font-family: 'Montserrat', sans-serif !important; }
        .app-wrap .totals-row td:first-child { text-transform: uppercase; font-size: 7.5px; letter-spacing: 0.05em; font-weight: 700; }

        /* Individual card */
        .app-wrap .individual-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .app-wrap .individual-table td { padding: 5px 10px; font-size: 9px; color: #384252; border-bottom: 0.5px solid #e5e5e5; font-family: 'Montserrat', sans-serif !important; }
        .app-wrap .individual-table td:first-child { font-weight: 600; color: #6c7280; text-transform: uppercase; font-size: 7px; letter-spacing: 0.1em; width: 30%; }
        .app-wrap .individual-table td:last-child { color: #051f3c; font-weight: 500; }

        /* Solicitor box */
        .app-wrap .solicitor-box { background: #f9fbfc; border: 1px solid #e5e5e5; border-radius: 5px; padding: 12px 14px; margin-bottom: 12px; }
        .app-wrap .solicitor-row { display: flex; gap: 20px; margin-bottom: 4px; }
        .app-wrap .solicitor-field-label { font-size: 7px; font-weight: 600; color: #6c7280; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px; font-family: 'Montserrat', sans-serif !important; }
        .app-wrap .solicitor-field-value { font-size: 9px; color: #051f3c; font-weight: 500; font-family: 'Montserrat', sans-serif !important; }

        /* Consent / signing area */
        .app-wrap .consent-section { margin-top: 16px; }
        .app-wrap .consent-text { font-size: 8.5px; color: #384252; line-height: 1.65; margin-bottom: 8px; font-family: 'Montserrat', sans-serif !important; }
        .app-wrap .consent-text strong { color: #051f3c; font-weight: 600; }

        .app-wrap .signature-block { margin-bottom: 16px; }
        .app-wrap .signature-label { font-size: 7.5px; font-weight: 600; color: #6c7280; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 4px; font-family: 'Montserrat', sans-serif !important; }
        .app-wrap .signature-line { border-bottom: 1px solid #c7c7c6; height: 26px; margin-bottom: 3px; }
        .app-wrap .signature-name { font-size: 9.5px; color: #051f3c; font-weight: 600; font-family: 'Montserrat', sans-serif !important; }
        .app-wrap .signature-title { font-size: 8.5px; color: #6c7280; font-family: 'Montserrat', sans-serif !important; }

        .app-wrap .acceptance-section { margin-top: 18px; padding-top: 14px; border-top: 1px solid #e5e5e5; }
        .app-wrap .acceptance-title { font-family: 'Argent CF', serif; font-size: 13px; color: #212c60; margin-bottom: 8px; }
        .app-wrap .acceptance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
        .app-wrap .acceptance-field { }
        .app-wrap .acceptance-field-label { font-size: 7.5px; font-weight: 600; color: #6c7280; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; font-family: 'Montserrat', sans-serif !important; }
        .app-wrap .acceptance-field-line { border-bottom: 1px solid #c7c7c6; height: 24px; }

        /* Footer */
        .app-wrap .footer-contact { position: absolute; bottom: 30px; left: 60px; right: 60px; text-align: center; padding: 8px 0 0; border-top: 1px solid #e5e5e5; }
        .app-wrap .footer-contact-text { font-size: 7.5px; color: #6c7280; font-family: 'Montserrat', sans-serif !important; }
        .app-wrap .footer-company { font-size: 7px; color: #6c7280; font-weight: 600; margin-top: 3px; font-family: 'Montserrat', sans-serif !important; }
        .app-wrap .footer-disclaimer { font-size: 7px; color: #6c7280; font-family: 'Montserrat', sans-serif !important; }
        .app-wrap .page-number { font-size: 7px; color: #6c7280; text-align: right; position: absolute; bottom: 30px; right: 60px; }

        /* Case summary */
        .app-wrap .case-summary-box { background: #f9fbfc; border: 1px solid #e5e5e5; border-radius: 5px; padding: 12px 14px; margin-bottom: 12px; }
        .app-wrap .case-summary-text { font-size: 9px; color: #384252; line-height: 1.6; font-family: 'Montserrat', sans-serif !important; }
        .app-wrap .case-summary-meta { margin-top: 10px; padding-top: 8px; border-top: 1px solid #e5e5e5; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .app-wrap .case-summary-meta-label { font-size: 7px; font-weight: 700; color: #6c7280; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px; }
        .app-wrap .case-summary-meta-value { font-size: 9px; color: #051f3c; font-weight: 500; }
      </style>`;

    // ── Conditions rendering ──
    const renderConditions = (items) => items.map(c =>
        `<div class="condition-item"><span class="condition-bullet">•</span><span>${c}</span></div>`
    ).join('');

    const hardcodedCP = [
        'Satisfactory Personal Search results',
        'Satisfactory Legal Enquiries'
    ];
    const aipCP = Array.isArray(conditionsPrecedent) ? conditionsPrecedent.filter(c => c && !hardcodedCP.some(h => h.toLowerCase() === c.toLowerCase())) : [];
    const cpItems = [...hardcodedCP, ...aipCP];
    const csItems = Array.isArray(conditionsSubsequent) && conditionsSubsequent.length > 0
        ? conditionsSubsequent : ['None'];

    // ── Security properties rows ──
    const propertyRowsHtml = (securityProperties || []).map(p =>
        `<tr>
            <td><div class="property-name">${p.name}</div><div class="property-address">${p.address}</div></td>
            <td>${p.charge}</td>
            <td>${p.outstanding}</td>
            <td>${p.mv}</td>
            <td>${p.day180}</td>
        </tr>`
    ).join('');

    // ── Individuals rendering ──
    const individualsHtml = (individuals || []).map((ind, i) => `
        <table class="individual-table">
            <tr><td>Full Name</td><td>${ind.name || '–'}</td></tr>
            <tr><td>Email</td><td>${ind.email || '–'}</td></tr>
            <tr><td>Phone</td><td>${ind.phone || '–'}</td></tr>
            <tr><td>Date of Birth</td><td>${ind.dob || '–'}</td></tr>
            <tr><td>Address</td><td>${ind.address || '–'}</td></tr>
            <tr><td>Nationality</td><td>${ind.nationality || '–'}</td></tr>
            <tr><td>Shareholding</td><td>${ind.shareholding ? ind.shareholding + '%' : '–'}</td></tr>
        </table>
    `).join('');

    // ── Solicitor section ──
    const solicitorHtml = solicitorFirm ? `
        <div class="solicitor-box">
            <div class="solicitor-row">
                <div style="flex:1;"><div class="solicitor-field-label">Firm Name</div><div class="solicitor-field-value">${solicitorFirm || '–'}</div></div>
                <div style="flex:1;"><div class="solicitor-field-label">Contact Name</div><div class="solicitor-field-value">${solicitorContact || '–'}</div></div>
            </div>
            <div class="solicitor-row">
                <div style="flex:1;"><div class="solicitor-field-label">Email</div><div class="solicitor-field-value">${solicitorEmail || '–'}</div></div>
                <div style="flex:1;"><div class="solicitor-field-label">Phone</div><div class="solicitor-field-value">${solicitorPhone || '–'}</div></div>
            </div>
            ${solicitorAddress ? `<div class="solicitor-row"><div style="flex:1;"><div class="solicitor-field-label">Address</div><div class="solicitor-field-value">${solicitorAddress}</div></div></div>` : ''}
        </div>
    ` : `<div class="body-text" style="color:#6c7280;font-style:italic;">Solicitor details not yet provided.</div>`;

    // ── Dynamic borrower label for signing ──
    const borrowerLabel = isCompany
        ? `the Borrower (${companyName || borrower}), acting by its authorised signatory`
        : individuals && individuals.length > 1
            ? `each of the Borrowers named below`
            : `the Borrower (${borrower})`;

    // ── Dynamic signing blocks ──
    const buildSignatureBlocks = () => {
        if (isCompany) {
            // Company: one block for authorised signatory + position
            return `
                <div class="acceptance-grid">
                    <div class="acceptance-field">
                        <div class="acceptance-field-label">Signed by / on behalf of ${companyName || borrower}</div>
                        <div class="acceptance-field-line"></div>
                    </div>
                    <div class="acceptance-field">
                        <div class="acceptance-field-label">Date</div>
                        <div class="acceptance-field-line"></div>
                    </div>
                    <div class="acceptance-field">
                        <div class="acceptance-field-label">Print Name</div>
                        <div class="acceptance-field-line"></div>
                    </div>
                    <div class="acceptance-field">
                        <div class="acceptance-field-label">Position / Authority</div>
                        <div class="acceptance-field-line"></div>
                    </div>
                </div>
            `;
        } else {
            // Personal: one signing block per individual
            return (individuals || [{ name: borrower }]).map(ind => `
                <div class="acceptance-grid" style="margin-bottom:14px;">
                    <div class="acceptance-field">
                        <div class="acceptance-field-label">Signed by: ${ind.name || 'Borrower'}</div>
                        <div class="acceptance-field-line"></div>
                    </div>
                    <div class="acceptance-field">
                        <div class="acceptance-field-label">Date</div>
                        <div class="acceptance-field-line"></div>
                    </div>
                </div>
            `).join('');
        }
    };

    // ── PAGE 1: Application Overview + Borrower Details ──
    const page1 = `
<div class="app-page">
  <div class="header">
    <div class="header-left">
      <h1>Application Summary</h1>
      <div class="date">${todayDate}</div>
      <div class="case-ref">Ref: ${caseRef || '–'}</div>
    </div>
    <div class="header-right"><img src="${logoSrc}" alt="Albatross Lending Group"></div>
  </div>
  <hr class="divider">

  <div class="info-row">
    <div class="info-card"><div class="label">Borrower</div><div class="value">${borrower}</div></div>
    <div class="info-card"><div class="label">BDM</div><div class="value">${bdmName || '–'}</div></div>
    <div class="info-card"><div class="label">Broker</div><div class="value">${brokerFirm || 'Direct'}</div></div>
  </div>

  <div class="section-heading">Case Summary</div>
  <hr class="section-divider">
  <div class="case-summary-box">
    <div class="case-summary-text">${caseSummary || '–'}</div>
    <div class="case-summary-meta">
      <div>
        <div class="case-summary-meta-label">Loan Purpose</div>
        <div class="case-summary-meta-value">${loanPurpose || '–'}</div>
      </div>
      <div>
        <div class="case-summary-meta-label">Repayment Method</div>
        <div class="case-summary-meta-value">${exitStrategy || '–'}</div>
      </div>
    </div>
  </div>

  ${isCompany ? `
  <div class="section-heading">Company Details</div>
  <hr class="section-divider">
  <div class="info-row">
    <div class="info-card"><div class="label">Company Name</div><div class="value">${companyName || '–'}</div></div>
    <div class="info-card"><div class="label">Company Number</div><div class="value">${companyNumber || '–'}</div></div>
  </div>
  <div class="info-row">
    <div class="info-card"><div class="label">Incorporation Date</div><div class="value">${companyIncDate || '–'}</div></div>
    <div class="info-card"><div class="label">SIC Code(s)</div><div class="value">${companySIC || '–'}</div></div>
  </div>` : ''}

  <div class="section-heading">${isCompany ? 'Directors / Individuals' : 'Borrower Details'}</div>
  <hr class="section-divider">
  <div class="case-summary-box" style="margin-bottom:10px;">
    <div class="case-summary-meta" style="margin-top:0;padding-top:0;border-top:none;">
      <div>
        <div class="case-summary-meta-label">Nominated Point of Contact</div>
        <div class="case-summary-meta-value">${(generalPOCName && !/select individual/i.test(generalPOCName)) ? generalPOCName : '–'}</div>
      </div>
      <div>
        <div class="case-summary-meta-label">Nominated Valuation Contact</div>
        <div class="case-summary-meta-value">${(valuationPOCName && !/select individual/i.test(valuationPOCName)) ? valuationPOCName : '–'}</div>
      </div>
    </div>
  </div>
  ${individualsHtml || '<div class="body-text" style="color:#6c7280;">No individuals recorded.</div>'}

  <div class="footer-contact">
    <div class="footer-company">Albatross Lending Group | www.albatrosslendinggroup.co.uk</div>
  </div>
</div>`;

    // ── PAGE 2: Loan Summary + Security Properties ──
    const page2 = `
<div class="app-page">
  <div class="header">
    <div class="header-left">
      <h1>Application Summary</h1>
      <div class="date">${todayDate}</div>
      <div class="case-ref">Ref: ${caseRef || '–'}</div>
    </div>
    <div class="header-right"><img src="${logoSrc}" alt="Albatross Lending Group"></div>
  </div>
  <hr class="divider">

  <div class="section-heading">Loan Summary</div>
  <hr class="section-divider">
  <div class="loan-section">
    <div class="loan-section-title">Breakdown of Loan</div>
    <table class="loan-table">
      <tr><td class="col-label">LTV (${isSME ? '90-day' : '180-day'})</td><td class="col-value">${ltvDisplay || '–'}</td><td class="col-label-right">Property Value</td><td class="col-value-right">${propertyValue || '–'}</td></tr>
      <tr><td class="col-label">Current First Charge</td><td class="col-value">${currentFirstCharge || '£0.00'}</td><td class="col-label-right">Gross Loan</td><td class="col-value-right">${grossLoan}</td></tr>
      <tr><td class="col-label">Monthly Interest Rate</td><td class="col-value">${interestPcm}</td><td class="col-label-right">Term</td><td class="col-value-right">${term}</td></tr>
      <tr><td class="col-label">Interest Per Month</td><td class="col-value">${interestPerMonth}</td><td class="col-label-right">Months Deducted</td><td class="col-value-right">${monthsDeducted || term}</td></tr>
      <tr><td class="col-label">Total Interest Deducted</td><td class="col-value">${totalDeducted || interestOverTerm}</td><td class="col-label-right">Interest Over Term</td><td class="col-value-right">${interestOverTerm}</td></tr>
      <tr><td class="col-label">Arrangement Fee</td><td class="col-value">${arrangementFee}</td><td class="col-label-right">Proc Fee</td><td class="col-value-right">${procFee}</td></tr>
      <tr><td class="col-label">Additional Broker Fee</td><td class="col-value">${brokerFee || '£0.00'}</td><td class="col-label-right">TT Fee</td><td class="col-value-right">${ttFee || 'TBC'}</td></tr>
      <tr><td class="col-label">Admin Fee</td><td class="col-value">${adminFee}</td><td class="col-label-right">Legal Fees</td><td class="col-value-right">${legalFees || 'TBC'}</td></tr>
      <tr><td class="col-label">Exit Fee</td><td class="col-value">${exitFee}</td><td class="col-label-right">Total Repayment</td><td class="col-value-right">${totalRepayment || '–'}</td></tr>${hasAVM ? `
      <tr><td class="col-label">AVM Fee</td><td class="col-value">${avmFee}</td><td class="col-label-right"></td><td class="col-value-right"></td></tr>` : ''}${hasSecondCharge ? `
      <tr><td class="col-label">Second Charge Consent Fee</td><td class="col-value">${secondChargeFee}</td><td class="col-label-right"></td><td class="col-value-right"></td></tr>` : ''}
    </table>
    <div class="net-loan-bar">
      <span class="net-loan-label">NET LOAN</span>
      <span class="net-loan-value">${netLoan}</span>
    </div>
  </div>

  <div class="section-heading">Security Properties</div>
  <hr class="section-divider">
  <div class="property-section">
    <div class="property-table-wrapper">
      <table class="property-table">
        <thead><tr><th>Property</th><th>Charge</th><th>Outstanding</th><th>Market Value</th><th>${vpLabel}</th></tr></thead>
        <tbody>
          ${propertyRowsHtml}
          <tr class="totals-row"><td>TOTALS</td><td></td><td>${totalsOutstanding}</td><td>${totalsMV}</td><td>${totals180}</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="section-heading">Conditions</div>
  <hr class="section-divider">
  <div class="conditions-box">
    <div class="condition-group-label">Conditions Precedent</div>
    ${renderConditions(cpItems)}
    <hr class="condition-separator">
    <div class="condition-group-label">Conditions Subsequent</div>
    ${renderConditions(csItems)}
  </div>

  <div class="section-heading">Solicitor Details (Borrower)</div>
  <hr class="section-divider">
  ${solicitorHtml}

  <div class="section-heading">Account Details</div>
  <hr class="section-divider">
  <div class="solicitor-box">
    <div class="solicitor-row">
      <div style="flex:1;"><div class="solicitor-field-label">Account Name</div><div class="solicitor-field-value">${bankAccountName || '–'}</div></div>
      <div style="flex:1;"><div class="solicitor-field-label">Bank Name</div><div class="solicitor-field-value">${bankName || '–'}</div></div>
    </div>
    <div class="solicitor-row">
      <div style="flex:1;"><div class="solicitor-field-label">Sort Code</div><div class="solicitor-field-value">${bankSortCode || '–'}</div></div>
      <div style="flex:1;"><div class="solicitor-field-label">Account Number</div><div class="solicitor-field-value">${bankAccountNumber || '–'}</div></div>
    </div>
  </div>

  ${brokerFirm ? `
  <div class="section-heading">Broker Details</div>
  <hr class="section-divider">
  <div class="solicitor-box">
    <div class="solicitor-row">
      <div style="flex:1;"><div class="solicitor-field-label">Firm</div><div class="solicitor-field-value">${brokerFirm}</div></div>
      <div style="flex:1;"><div class="solicitor-field-label">Contact</div><div class="solicitor-field-value">${brokerContact || '–'}</div></div>
    </div>
  </div>` : ''}

  <div class="footer-contact">
    <div class="footer-company">Albatross Lending Group | www.albatrosslendinggroup.co.uk</div>
  </div>
</div>`;

    // ── PAGE 3: Declaration & Consent (always new page) ──
    const page3 = `
<div class="app-page">
  <div class="header">
    <div class="header-left">
      <h1>Application Summary</h1>
      <div class="date">${todayDate}</div>
      <div class="case-ref">Ref: ${caseRef || '–'}</div>
    </div>
    <div class="header-right"><img src="${logoSrc}" alt="Albatross Lending Group"></div>
  </div>
  <hr class="divider">

  <div class="section-heading">Declaration &amp; Consent</div>
  <hr class="section-divider">

  <div class="consent-section">

    <div class="consent-text"><strong>1. Credit Search Authorisation</strong></div>
    <div class="consent-text">By signing this application, ${borrowerLabel} hereby authorise${isCompany || (individuals && individuals.length > 1) ? '' : 's'} Albatross Lending Group (the "Lender") and its associated companies to carry out credit reference searches and make such enquiries as may be necessary in connection with this loan application. This includes, but is not limited to, searches with credit reference agencies (including Experian, Equifax, and TransUnion), fraud prevention agencies, and the Electoral Register. A record of this search may be left on your credit file and may be visible to other lenders.</div>

    <div class="consent-text"><strong>2. Anti-Money Laundering &amp; Identity Verification</strong></div>
    <div class="consent-text">${borrowerLabel.charAt(0).toUpperCase() + borrowerLabel.slice(1)} consent${isCompany || (individuals && individuals.length > 1) ? '' : 's'} to the Lender carrying out all necessary identity verification and anti-money laundering checks as required by the Money Laundering, Terrorist Financing and Transfer of Funds (Information on the Payer) Regulations 2017 (as amended) and any subsequent regulations. This may include electronic identity verification, enhanced due diligence, and ongoing monitoring of the business relationship.</div>

    <div class="consent-text"><strong>3. Data Protection &amp; Privacy (GDPR)</strong></div>
    <div class="consent-text">In accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018, ${borrowerLabel} acknowledge${isCompany || (individuals && individuals.length > 1) ? '' : 's'} and consent${isCompany || (individuals && individuals.length > 1) ? '' : 's'} to the Lender collecting, processing, storing, and sharing personal data provided in this application for the purposes of:</div>
    <div class="conditions-box" style="margin-top:4px;">
      <div class="condition-item"><span class="condition-bullet">•</span><span>Assessing this loan application and any related lending decisions</span></div>
      <div class="condition-item"><span class="condition-bullet">•</span><span>Carrying out credit, fraud prevention, and anti-money laundering checks</span></div>
      <div class="condition-item"><span class="condition-bullet">•</span><span>Administering and managing any loan facility that may be provided</span></div>
      <div class="condition-item"><span class="condition-bullet">•</span><span>Complying with legal and regulatory obligations</span></div>
      <div class="condition-item"><span class="condition-bullet">•</span><span>Sharing data with our professional advisers, valuers, solicitors, and credit reference agencies as necessary</span></div>
      <div class="condition-item"><span class="condition-bullet">•</span><span>Legitimate business interests including risk management and portfolio analysis</span></div>
    </div>

    <div class="consent-text">Personal data will be retained for the duration of the lending relationship and for a minimum of six years following redemption or the date of the last interaction, in accordance with regulatory requirements. Full details of how we process your personal data, your rights as a data subject (including the right of access, rectification, erasure, restriction, and portability), and how to make a complaint to the Information Commissioner's Office are set out in our Privacy Policy, which is available at <strong>www.albatrosslendinggroup.co.uk</strong>.</div>

    <div class="consent-text"><strong>4. Applicant Declaration</strong></div>
    <div class="consent-text">${borrowerLabel.charAt(0).toUpperCase() + borrowerLabel.slice(1)} confirm${isCompany || (individuals && individuals.length > 1) ? '' : 's'} that:</div>
    <div class="conditions-box" style="margin-top:4px;">
      <div class="condition-item"><span class="condition-bullet">•</span><span>All information provided in this application is true, complete, and accurate to the best of ${isCompany ? 'the signatory\'s' : individuals && individuals.length > 1 ? 'their' : 'my'} knowledge</span></div>
      <div class="condition-item"><span class="condition-bullet">•</span><span>The loan is required for business purposes only and is not regulated by the Financial Conduct Authority under the Consumer Credit Act 1974</span></div>
      <div class="condition-item"><span class="condition-bullet">•</span><span>${isCompany ? 'The company is' : individuals && individuals.length > 1 ? 'The borrowers are' : 'I am'} not aware of any pending or threatened legal proceedings, bankruptcy petitions, or insolvency arrangements that may affect the ability to service or repay this loan</span></div>
      <div class="condition-item"><span class="condition-bullet">•</span><span>${isCompany ? 'The signatory is' : individuals && individuals.length > 1 ? 'The borrowers are' : 'I am'} aware that the property/properties offered as security may be repossessed if the loan is not repaid</span></div>
    </div>

    <div class="consent-text"><strong>5. Schedule of Fees &amp; Privacy Policy</strong></div>
    <div class="consent-text">A full schedule of fees and our Privacy Policy are available on our website at <strong>www.albatrosslendinggroup.co.uk</strong>. By signing below, ${borrowerLabel} acknowledge${isCompany || (individuals && individuals.length > 1) ? '' : 's'} having been given the opportunity to review these documents.</div>

  </div>

  <div class="acceptance-section">
    <div class="acceptance-title">Borrower Signature</div>
    <div class="consent-text" style="font-size:8.5px;">By signing below, ${borrowerLabel} consent${isCompany || (individuals && individuals.length > 1) ? '' : 's'} to the declarations above and authorise${isCompany || (individuals && individuals.length > 1) ? '' : 's'} Albatross Lending Group to proceed with credit searches and processing of personal data as described in this application.</div>
    ${buildSignatureBlocks()}
  </div>

  <div class="footer-contact">
    <div class="footer-company">Albatross Lending Group | www.albatrosslendinggroup.co.uk</div>
    <div class="footer-disclaimer">Albatross Lending Group is a trading name and its subsidiaries. Registered in England &amp; Wales. Company number 12686576.</div>
  </div>
</div>`;

    return `<div class="app-wrap">${css}${page1}${page2}${page3}</div>`;
}

console.log('✓ application-template.js loaded – _buildApplicationHtml() available');
