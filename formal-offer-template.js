// Formal Offer PDF Template Functions
// This file contains the template and generation logic for Formal Offer PDFs
// Styled consistently with AIP and Indicative Terms templates

function _buildFormalOfferHtml(data) {
    const {
        borrower, borrowerAddress, securityAddress, todayDate, logoSrc,
        grossLoan, netLoan, term, arrangementFee, procFee, brokerFee,
        adminFee, exitFee, interestPcm, interestPerMonth, interestOverTerm,
        monthsDeducted, totalDeducted, propertyValue, currentFirstCharge,
        ltvDisplay, ttFee, legalFees, avmFee, secondChargeFee, hasAVM, hasSecondCharge,
        conditionsPrecedent, conditionsSubsequent,
        securityProperties, totalsOutstanding, totalsMV, totals180,
        validityDays, validityExpiryDate, signatoryName, signatoryTitle
    } = data;

    const isSME = !!data.isSME;
    const accent = isSME ? '#67c9ba' : '#f9a67e';
    const vpLabel = isSME ? '90 Day VP' : '180 Day VP';

    const css = `
      <style>
        @font-face{font-family:'Argent Regular';src:url('./Fonts/Argent-Regular.otf') format('opentype');font-weight:400}
        @font-face{font-family:'Argent Regular';src:url('./Fonts/Argent-Regular.otf') format('opentype');font-weight:600}

        .fo-wrap *, .fo-wrap *::before, .fo-wrap *::after { box-sizing: border-box; }
        .fo-wrap h1::before, .fo-wrap h1::after,
        .fo-wrap h2::before, .fo-wrap h2::after { content: none !important; display: none !important; }
        .fo-wrap, .fo-wrap * { font-family: 'Argent Regular', serif !important; }

        .fo-wrap {
          font-family: 'Argent Regular', serif !important;
          font-size: 10px;
          line-height: 1.4;
          color: #202b60;
          background: #fff;
          width: 794px;
        }

        .fo-wrap .fo-page {
          width: 794px;
          height: 1123px;
          padding: 50px 60px 60px 60px;
          background: #fff;
          position: relative;
          overflow: hidden;
        }

        /* Header */
        .fo-wrap .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .fo-wrap .header-left h1 { font-family: 'Montserrat', sans-serif !important; font-weight: 300; font-size: 26px; color: #212c60; letter-spacing: -0.02em; line-height: 1.15; margin: 0; padding: 0; }
        .fo-wrap .header-left .date { font-family: 'Montserrat', sans-serif !important; font-weight: 400; font-size: 14px; color: ${accent}; margin-top: 4px; }
        .fo-wrap .header-right img { max-height: 48px; width: auto; }

        .fo-wrap .divider { border: none; border-top: 1px solid #e5e5e5; margin: 14px 0; }

        /* Addressee block */
        .fo-wrap .addressee { margin-bottom: 14px; }
        .fo-wrap .addressee-line { font-size: 10px; color: #384252; line-height: 1.6; font-family: 'Montserrat', sans-serif !important; }
        .fo-wrap .addressee-line.bold { font-weight: 600; color: #051f3c; }

        /* Info cards */
        .fo-wrap .info-row { display: flex; gap: 12px; margin-bottom: 12px; }
        .fo-wrap .info-card { background: #f9fbfc; border: 1px solid #e5e5e5; border-radius: 5px; padding: 14px 16px; flex: 1; }
        .fo-wrap .info-card .label { font-size: 7.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: #6c7280; margin-bottom: 6px; font-family: 'Montserrat', sans-serif !important; }
        .fo-wrap .info-card .value { font-size: 10.5px; font-weight: 500; color: #051f3c; line-height: 1.3; font-family: 'Montserrat', sans-serif !important; }

        /* Body text */
        .fo-wrap .body-text { font-size: 9.5px; color: #384252; line-height: 1.7; margin-bottom: 10px; font-family: 'Montserrat', sans-serif !important; }
        .fo-wrap .body-text strong { color: #051f3c; font-weight: 600; }

        /* Section headings */
        .fo-wrap .section-heading { font-family: 'Montserrat', sans-serif !important; font-size: 13.5px; color: #212c60; margin: 16px 0 8px; letter-spacing: -0.02em; font-weight: 600; }
        .fo-wrap .section-divider { border: none; border-top: 0.75px solid #e5e5e5; margin-bottom: 12px; }

        /* Conditions list */
        .fo-wrap .conditions-box { background: #f9fbfc; border: 1px solid #e5e5e5; border-radius: 5px; padding: 14px 16px; margin-bottom: 14px; }
        .fo-wrap .condition-group-label { font-size: 7.5px; font-weight: 700; color: #6c7280; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; margin-top: 10px; font-family: 'Montserrat', sans-serif !important; }
        .fo-wrap .condition-group-label:first-child { margin-top: 0; }
        .fo-wrap .condition-item { display: flex; gap: 8px; margin-bottom: 6px; font-size: 9.5px; color: #384252; line-height: 1.5; font-family: 'Montserrat', sans-serif !important; }
        .fo-wrap .condition-item:last-child { margin-bottom: 0; }
        .fo-wrap .condition-bullet { color: #051f3c; font-weight: 700; flex-shrink: 0; }
        .fo-wrap .condition-separator { border: none; border-top: 0.5px solid #e5e5e5; margin: 10px 0; }

        /* Loan summary table (dark section) */
        .fo-wrap .loan-section { background: #212c60; border-radius: 7px; padding: 18px 20px; margin-bottom: 14px; }
        .fo-wrap .loan-section-title { font-family: 'Argent CF', serif; font-size: 14px; color: ${accent}; margin-bottom: 14px; letter-spacing: -0.02em; }
        .fo-wrap .loan-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .fo-wrap .loan-table td { padding: 7px 0; font-size: 9px; vertical-align: middle; border-bottom: 0.25px solid rgba(199,199,198,0.3); font-family: 'Montserrat', sans-serif !important; }
        .fo-wrap .loan-table tr:last-child td { border-bottom: none; }
        .fo-wrap .loan-table .col-label { font-weight: 400; color: #c7c7c6; width: 26%; padding-right: 10px; }
        .fo-wrap .loan-table .col-value { font-weight: 600; color: #fff; text-align: right; width: 20%; font-size: 9px; padding-right: 15px; }
        .fo-wrap .loan-table .col-label-right { font-weight: 400; color: #c7c7c6; width: 28%; padding-left: 50px; }
        .fo-wrap .loan-table .col-value-right { font-weight: 600; color: #fff; text-align: right; width: 22%; font-size: 9px; }

        /* Net loan highlight bar */
        .fo-wrap .net-loan-bar { background: ${accent}; border-radius: 5px; padding: 10px 18px; margin-top: 10px; display: flex; justify-content: space-between; align-items: center; }
        .fo-wrap .net-loan-label { font-size: 9.75px; color: #051f3c; font-weight: 600; font-family: 'Montserrat', sans-serif !important; }
        .fo-wrap .net-loan-value { font-family: 'Argent CF', serif; font-size: 14px; color: #051f3c; font-weight: 600; }

        /* Property table */
        .fo-wrap .property-section { margin-bottom: 14px; }
        .fo-wrap .property-table-wrapper { border: 1px solid #e5e5e5; border-radius: 7px; overflow: hidden; }
        .fo-wrap .property-table { width: 100%; border-collapse: collapse; }
        .fo-wrap .property-table thead { background: #f9fbfc; }
        .fo-wrap .property-table thead th { padding: 10px 12px; text-align: left; font-weight: 600; font-size: 7.5px; text-transform: uppercase; letter-spacing: 0.1em; color: #061633; border-bottom: 1px solid #e5e5e5; font-family: 'Montserrat', sans-serif !important; }
        .fo-wrap .property-table thead th:nth-child(n+2) { text-align: center; }
        .fo-wrap .property-table thead th:last-child { text-align: right; }
        .fo-wrap .property-table tbody td { padding: 11px 12px; background: #fff; color: #384252; font-size: 9.75px; line-height: 1.35; border-bottom: 1px solid rgba(229,229,229,0.5); font-family: 'Montserrat', sans-serif !important; }
        .fo-wrap .property-table tbody td:nth-child(n+2) { text-align: center; }
        .fo-wrap .property-table tbody td:last-child { text-align: right; }
        .fo-wrap .property-name { font-weight: 600; color: #061633; font-size: 9.75px; }
        .fo-wrap .property-address { color: #6c7280; font-size: 8.25px; margin-top: 2px; }
        .fo-wrap .totals-row { background: ${accent} !important; }
        .fo-wrap .totals-row td { background: ${accent} !important; color: #051f3c !important; font-weight: 600; font-size: 9px; padding: 8px 12px !important; border-bottom: none !important; font-family: 'Montserrat', sans-serif !important; }
        .fo-wrap .totals-row td:first-child { text-transform: uppercase; font-size: 8px; letter-spacing: 0.05em; font-weight: 700; }

        /* Warning box */
        .fo-wrap .warning-box { background: #fff8f0; border: 1px solid #f0dcc8; border-radius: 5px; padding: 12px 16px; margin: 12px 0; }
        .fo-wrap .warning-text { font-size: 9px; color: #8b5e3c; line-height: 1.6; font-weight: 500; font-family: 'Montserrat', sans-serif !important; }

        /* Validity box */
        .fo-wrap .validity-box { background: #f9fbfc; border: 1px solid #e5e5e5; border-radius: 5px; padding: 12px; text-align: center; margin-bottom: 14px; }
        .fo-wrap .validity-text { font-size: 9.75px; color: #384252; font-weight: 500; font-family: 'Montserrat', sans-serif !important; }
        .fo-wrap .validity-date { font-weight: 600; color: #212c60; }

        /* Signature section */
        .fo-wrap .signature-section { margin-top: 20px; }
        .fo-wrap .signature-block { margin-bottom: 20px; }
        .fo-wrap .signature-label { font-size: 8px; font-weight: 600; color: #6c7280; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 6px; font-family: 'Montserrat', sans-serif !important; }
        .fo-wrap .signature-line { border-bottom: 1px solid #c7c7c6; height: 30px; margin-bottom: 4px; }
        .fo-wrap .signature-name { font-size: 10px; color: #051f3c; font-weight: 600; font-family: 'Montserrat', sans-serif !important; }
        .fo-wrap .signature-title { font-size: 9px; color: #6c7280; font-family: 'Montserrat', sans-serif !important; }
        .fo-wrap .signature-company { font-size: 9px; color: #6c7280; font-family: 'Montserrat', sans-serif !important; }

        /* Acceptance section */
        .fo-wrap .acceptance-section { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e5e5; }
        .fo-wrap .acceptance-title { font-family: 'Argent CF', serif; font-size: 13.5px; color: #212c60; margin-bottom: 10px; }
        .fo-wrap .acceptance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 14px; }
        .fo-wrap .acceptance-field { }
        .fo-wrap .acceptance-field-label { font-size: 8px; font-weight: 600; color: #6c7280; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; font-family: 'Montserrat', sans-serif !important; }
        .fo-wrap .acceptance-field-line { border-bottom: 1px solid #c7c7c6; height: 28px; }

        /* Footer */
        .fo-wrap .footer-contact { position: absolute; bottom: 30px; left: 60px; right: 60px; text-align: center; padding: 10px 0 0; border-top: 1px solid #e5e5e5; }
        .fo-wrap .footer-contact-text { font-size: 8px; color: #6c7280; font-family: 'Montserrat', sans-serif !important; }
        .fo-wrap .footer-company { font-size: 7.5px; color: #6c7280; font-weight: 600; margin-top: 4px; font-family: 'Montserrat', sans-serif !important; }
        .fo-wrap .footer-disclaimer { font-size: 7.5px; color: #6c7280; font-family: 'Montserrat', sans-serif !important; }
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

    // ── Page 1: Cover letter + conditions + loan summary ──
    const page1 = `
<div class="fo-page">
  <div class="header">
    <div class="header-left">
      <h1>Formal Offer</h1>
      <div class="date">${todayDate}</div>
    </div>
    <div class="header-right"><img src="${logoSrc}" alt="Albatross Lending Group"></div>
  </div>
  <hr class="divider">

  <div class="addressee">
    <div class="addressee-line bold">${borrower}</div>
    <div class="addressee-line">${borrowerAddress || ''}</div>
  </div>

  <div class="body-text">Dear Sirs,</div>

  <div class="info-row">
    <div class="info-card"><div class="label">Borrower</div><div class="value">${borrower}</div></div>
    <div class="info-card"><div class="label">Property Address</div><div class="value">${securityAddress || 'As per schedule'}</div></div>
  </div>

  <div class="body-text">Albatross offers specialist finance fit for the purposes of Non-Regulated short-term loans.</div>

  <div class="body-text">Thank you for the details you have already provided on application of this loan, we are pleased to advise that your application for Albatross lending ("The Loan") has been approved subject to the following:</div>

  <div class="conditions-box">
    <div class="condition-group-label">Conditions Precedent</div>
    ${renderConditions(cpItems)}
    <hr class="condition-separator"/><div class="condition-group-label">Conditions Subsequent</div>${renderConditions(csItems)}
  </div>

  <div class="body-text">Please note that We reserve the right to amend or withdraw this loan offer, should any of the above prove to be unsatisfactory (this is at our sole discretion).</div>

  <div class="section-heading">Loan Amount: ${grossLoan}</div>
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
      <tr><td class="col-label">Exit Fee</td><td class="col-value">${exitFee}</td><td class="col-label-right"></td><td class="col-value-right"></td></tr>${hasAVM ? `
      <tr><td class="col-label">AVM Fee</td><td class="col-value">${avmFee}</td><td class="col-label-right"></td><td class="col-value-right"></td></tr>` : ''}${hasSecondCharge ? `
      <tr><td class="col-label">Second Charge Consent Fee</td><td class="col-value">${secondChargeFee}</td><td class="col-label-right"></td><td class="col-value-right"></td></tr>` : ''}
    </table>
    <div class="net-loan-bar">
      <span class="net-loan-label">NET LOAN</span>
      <span class="net-loan-value">${netLoan}</span>
    </div>
  </div>

  <div class="footer-contact">
    <div class="footer-company">Albatross Lending Group | www.albatrosslendinggroup.co.uk</div>
  </div>
</div>`;

    // ── Page 2: Security Properties + How the Loan Works + Loan Purpose + Valuation/Legal Fees + Withdrawal ──
    const page2 = `
<div class="fo-page">
  <div class="header">
    <div class="header-left">
      <h1>Formal Offer</h1>
      <div class="date">${todayDate}</div>
    </div>
    <div class="header-right"><img src="${logoSrc}" alt="Albatross Lending Group"></div>
  </div>
  <hr class="divider">

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

  <div class="section-heading">How the Loan Works</div>
  <hr class="section-divider">
  <div class="body-text">This document sets out the proposed terms of the loan but does not include all of the terms and conditions of our Lending. Before drawing down of this loan, you will need to sign a legal mortgage which will be provided during legals to your solicitors. Your solicitors will advise you on that document and provide replies to our legal enquiries for the transaction. Please note that the mortgage deed will set out the commercial terms of the loan and will also provide the full terms and conditions of The Loan.</div>

  <div class="warning-box">
    <div class="warning-text">It is important to note that your property may be repossessed if you do not keep up with payments, or repay the loan facility on time.</div>
  </div>

  <div class="section-heading">Loan Purpose</div>
  <hr class="section-divider">
  <div class="body-text">The Loan is being provided solely and predominantly for business purposes and the Borrower hereby confirms that The Loan is for business purposes as per the requirements under the Financial Services and Markets Act 2000 and Consumer Credit Act 1974.</div>

  <div class="section-heading">Valuation Fees and Legal Fees</div>
  <hr class="section-divider">
  <div class="body-text">If Albatross have not yet received a valuation report for the above security property/s, the cost of this will be payable by The Borrower. A cost undertaking will be required in relation to this application, if the loan doesn't proceed The Borrower will be liable for the cost of legal work undertaken to date.</div>

  <div class="body-text">We shall arrange an inspection of the property(ies) with our allocated valuer, who will contact the Borrower directly to arrange for an inspection date and collection of fees for the valuation. Unless, we have been advised of otherwise we shall provide our valuer with The Borrowers contact details provided on application.</div>

  <div class="body-text">The legal fees stated in the table above are based on your solicitor providing a complete and full pack of the title documentation and supporting information. In the event all information is not supplied in one bundle, and or it becomes necessary for our solicitor to undertake additional or unforeseen legal work additional fees will be incurred — You will be notified of any additional charges or change in fees.</div>

  <div class="section-heading">Withdrawal of Loan Offer</div>
  <hr class="section-divider">
  <div class="body-text">Albatross have the right at any time to withdraw or revoke this offer of loan at any time prior to the Loan being advanced. Albatross are not under any obligation to notify you that the Loan offer contained in this letter has been revoked.</div>

  <div class="footer-contact">
    <div class="footer-company">Albatross Lending Group | www.albatrosslendinggroup.co.uk</div>
  </div>
</div>`;

    // ── Page 3: Validity + Acceptance + Signature ──
    const page3 = `
<div class="fo-page">
  <div class="header">
    <div class="header-left">
      <h1>Formal Offer</h1>
      <div class="date">${todayDate}</div>
    </div>
    <div class="header-right"><img src="${logoSrc}" alt="Albatross Lending Group"></div>
  </div>
  <hr class="divider">

  <div class="section-heading">Validity</div>
  <hr class="section-divider">
  <div class="validity-box">
    <div class="validity-text">This offer is valid for <strong>${validityDays || 30}</strong> days from the date of issue. Valid until <span class="validity-date">${validityExpiryDate}</span>.</div>
  </div>
  <div class="body-text">Please note that only Albatross are at full discretion to keep this Offer valid after this date.</div>

  <div class="section-heading">Acceptance</div>
  <hr class="section-divider">
  <div class="body-text">This offer may be accepted only by the Borrower, by signing a copy of this letter at the execution clause below.</div>

  <div class="body-text">Please note that this offer of Loan is not binding until such time as all of the final Loan documentation has been executed and approved by us.</div>

  <div class="body-text">This Formal Offer for the facility requested does not constitute or imply a commitment on the part of the lender to provide a facility, or a representation that the facility will be made available. Any facility will be subject to Albatross' full due diligence process and perfection of security.</div>

  <div class="signature-section">
    <div class="body-text">Yours Sincerely,</div>
    <div class="signature-block">
      <div class="signature-name">${signatoryName || 'Joshua Field'}</div>
      <div class="signature-title">${signatoryTitle || 'Chief Operating Officer'}</div>
      <div class="signature-company">Albatross Lending Group</div>
    </div>
  </div>

  <div class="acceptance-section">
    <div class="acceptance-title">Borrower Acceptance</div>
    <div class="body-text" style="font-size:9px;">By signing below, the Borrower accepts the terms and conditions of this Formal Offer of Loan.</div>
    <div class="acceptance-grid">
      <div class="acceptance-field">
        <div class="acceptance-field-label">Signed by / on behalf of Borrower</div>
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
  </div>

  <div class="footer-contact">
    <div class="footer-company">Albatross Lending Group | www.albatrosslendinggroup.co.uk</div>
  </div>
</div>`;

    return `<div class="fo-wrap">${css}${page1}${page2}${page3}</div>`;
}
