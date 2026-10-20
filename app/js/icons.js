/* RSuta — Icônes SVG embarquées (aucune ressource externe) */
(function (G) {
  const s = (d, w, extra) => `<svg width="${w || 24}" height="${w || 24}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra || ''}>${d}</svg>`;
  const I = {
    home: (w) => `<svg width="${w || 26}" height="${w || 26}" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 2.5 11.2c-.4.4-.1 1 .4 1H5v7.3c0 .6.4 1 1 1h4v-5.5h4v5.5h4c.6 0 1-.4 1-1v-7.3h2.1c.5 0 .8-.6.4-1z"/></svg>`,
    book: (w) => s('<path d="M2 5.5c3-1.5 6.5-1.5 10 1 3.5-2.5 7-2.5 10-1V19c-3-1.5-6.5-1.5-10 1-3.5-2.5-7-2.5-10-1z"/><path d="M12 6.5V20"/><path d="M5 9h4M5 12h4M15 9h4M15 12h4"/>', w || 26),
    list: (w) => s('<circle cx="4.5" cy="6" r="1.6"/><circle cx="4.5" cy="12" r="1.6"/><circle cx="4.5" cy="18" r="1.6"/><path d="M9 6h12M9 12h12M9 18h12"/>', w || 26),
    user: (w) => `<svg width="${w || 26}" height="${w || 26}" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7.5" r="4.5"/><path d="M3.5 21c0-4.7 3.8-8 8.5-8s8.5 3.3 8.5 8c0 .5-.4.9-.9.9H4.4c-.5 0-.9-.4-.9-.9z"/></svg>`,
    scan: (w) => s('<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor"/>', w || 26),
    camera: (w) => `<svg width="${w || 26}" height="${w || 26}" viewBox="0 0 24 24" fill="currentColor"><path d="M9 3.5 7.6 5.5H4.5A2.5 2.5 0 0 0 2 8v10a2.5 2.5 0 0 0 2.5 2.5h15A2.5 2.5 0 0 0 22 18V8a2.5 2.5 0 0 0-2.5-2.5h-3.1L15 3.5z"/><circle cx="12" cy="13" r="4.2" fill="#fff"/><circle cx="12" cy="13" r="2.6"/></svg>`,
    bell: (w) => `<svg width="${w || 30}" height="${w || 30}" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5a1.4 1.4 0 0 0-1.4 1.4v.6A6.5 6.5 0 0 0 5.5 11v4.2L3.8 17.6c-.4.6 0 1.4.8 1.4h14.8c.8 0 1.2-.8.8-1.4l-1.7-2.4V11a6.5 6.5 0 0 0-5.1-6.5v-.6A1.4 1.4 0 0 0 12 2.5z"/><path d="M9.5 20a2.5 2.5 0 0 0 5 0z"/></svg>`,
    back: (w) => s('<path d="M20 12H5M11 5l-7 7 7 7"/>', w || 30, 'stroke-width="2.6"'),
    chev: (w) => s('<path d="m9 6 6 6-6 6"/>', w || 20),
    play: (w) => `<svg width="${w || 22}" height="${w || 22}" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15c0 .8.9 1.3 1.6.8l11.5-7.5c.6-.4.6-1.2 0-1.6L8.6 3.7C7.9 3.2 7 3.7 7 4.5z"/></svg>`,
    pause: (w) => `<svg width="${w || 22}" height="${w || 22}" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>`,
    stop: (w) => `<svg width="${w || 22}" height="${w || 22}" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`,
    speaker: (w) => `<svg width="${w || 28}" height="${w || 28}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9.5h3l5-4v13l-5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>`,
    clip: (w) => s('<path d="m21 11.5-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l8-8"/>', w || 24),
    mic: (w) => s('<rect x="9" y="2.5" width="6" height="12" rx="3" fill="currentColor"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5"/>', w || 24),
    send: (w) => s('<path d="M4 12 20 4l-6 16-2.5-6.5z" fill="currentColor"/>', w || 20),
    info: (w) => s('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', w || 18),
    check: (w) => s('<path d="m5 12.5 4.5 4.5L19 7.5"/>', w || 18, 'stroke-width="3"'),
    chat: (w) => s('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5z"/>', w || 26),
    homework: (w) => s('<rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8.5 11 2 2 4-4"/><path d="M9 17h6"/>', w || 26),
    copyright: (w) => s('<circle cx="12" cy="12" r="9"/><path d="M14.5 9.5a3.5 3.5 0 1 0 0 5"/>', w || 26),
    doc: (w) => s('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>', w || 24),
    settings: (w) => s('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>', w || 24),
    logout: (w) => s('<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/>', w || 22),
    eye: (w) => s('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', w || 20),
    upload: (w) => s('<path d="M12 16V4M7 9l5-5 5 5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>', w || 20),
    download: (w) => s('<path d="M12 4v12M7 11l5 5 5-5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>', w || 20),
    edit: (w) => s('<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/>', w || 20),
    trash: (w) => s('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', w || 20),
    up: (w) => s('<path d="M12 19V5M5 12l7-7 7 7"/>', w || 22, 'stroke-width="2.6"'),
    star: (w) => `<svg width="${w || 20}" height="${w || 20}" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z"/></svg>`,
    share: (w) => s('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>', w || 22),
    group: (w) => s('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.6"/><path d="M16.5 14.1c2.9.2 5 2.3 5 5.4"/>', w || 22),
    flame: (w) => `<svg width="${w || 22}" height="${w || 22}" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c.6 3.2-1 4.9-2.6 6.6C7.8 10.8 6 12.6 6 15.5A6 6 0 0 0 18 15.5c0-2.6-1.2-4.4-2.4-5.6-.2 1.6-.9 2.7-2 3.2.5-3.6-.2-7.8-1.6-10.6z"/></svg>`,
    qr: (w) => s('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 17h4v4h-4"/>', w || 22),
    trophy: (w) => s('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/>', w || 22),
    shield: (w) => s('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>', w || 22),
    search: (w) => s('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', w || 20),
    plus: (w) => s('<path d="M12 5v14M5 12h14"/>', w || 20, 'stroke-width="2.6"'),
    moon: (w) => s('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>', w || 20),
    clock: (w) => s('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', w || 18),
    image: (w) => s('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>', w || 22),
    keyboard: (w) => s('<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>', w || 22),
    lock: (w) => s('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>', w || 20),
    mail: (w) => s('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', w || 20),
    sparkle: (w) => `<svg width="${w || 22}" height="${w || 22}" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.5c.6 4.6 3.9 7.9 8.5 8.5-4.6.6-7.9 3.9-8.5 8.5-.6-4.6-3.9-7.9-8.5-8.5 4.6-.6 7.9-3.9 8.5-8.5z"/></svg>`,
    wifi: (w) => s('<path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01"/>', w || 18),
    film: (w) => s('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 9 5 3-5 3z" fill="currentColor"/>', w || 30)
  };
  // Logo RSuta
  I.logoMark = (w) => `<svg width="${w || 40}" height="${w || 40}" viewBox="0 0 40 40" fill="none" stroke="#fff" stroke-width="1.8"><rect x="2" y="2" width="36" height="36" rx="3"/><path d="M2 2l36 36M38 2 2 38M20 2v36M2 20h36"/><path d="M20 6 34 20 20 34 6 20z"/><path d="M20 12 28 20 20 28 12 20z" fill="rgba(255,255,255,.25)"/></svg>`;
  I.logo = (size) => `<span class="logo" style="${size ? 'font-size:' + size + 'px' : ''}">${I.logoMark(size ? size * 1.15 : 40)}<span>RSuta</span><span class="spark">${I.sparkle(size ? size * .62 : 22)}</span></span>`;
  // Motif africain (bogolan / kente stylisé)
  let pid = 0;
  I.pattern = () => { const id = 'pt' + (++pid); return `<svg class="pattern" width="100%" height="100%" preserveAspectRatio="none"><defs><pattern id="${id}" width="64" height="40" patternUnits="userSpaceOnUse"><g fill="none" stroke="#fff" stroke-width="1.6"><path d="M0 20 8 8l8 12 8-12 8 12 8-12 8 12 8-12 8 12"/><path d="M0 36h64M0 4h64" stroke-dasharray="4 4"/><path d="M28 26l4 6 4-6z"/></g></pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/></svg>`; };
  // Avatar du Prof IA (robot)
  I.robot = (w) => `<svg width="${w || 48}" height="${w || 48}" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#f8c42f"/><rect x="11" y="15" width="26" height="21" rx="9" fill="#fff" stroke="#1f4fd1" stroke-width="2"/><rect x="15" y="19" width="18" height="11" rx="5.5" fill="#0d2260"/><circle cx="20" cy="24.5" r="2.3" fill="#5ee7ff"/><circle cx="28" cy="24.5" r="2.3" fill="#5ee7ff"/><path d="M21 33h6" stroke="#1f4fd1" stroke-width="2" stroke-linecap="round"/><rect x="7" y="21" width="4" height="9" rx="2" fill="#1f4fd1"/><rect x="37" y="21" width="4" height="9" rx="2" fill="#1f4fd1"/><path d="M24 15V10" stroke="#1f4fd1" stroke-width="2"/><circle cx="24" cy="9" r="2.6" fill="#1f4fd1"/><path d="M12 40c3-3 7-4 12-4s9 1 12 4" fill="#1f4fd1"/></svg>`;
  // Icônes des parcours (style trait marine + accents jaunes)
  const N = '#0d2260';
  I.pBook = () => `<svg width="66" height="56" viewBox="0 0 66 56" fill="none" stroke="${N}" stroke-width="2.6" stroke-linejoin="round"><path d="M4 10c9-4 19-4 29 3 10-7 20-7 29-3v38c-9-4-19-4-29 3-10-7-20-7-29-3z" fill="#fff8"/><path d="M33 13v38"/><path d="M8 6v40M58 6v40" stroke-width="2"/><path d="m18 18 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="${N}"/><path d="M39 21h15M39 28h15M39 35h11"/></svg>`;
  I.pCap = () => `<svg width="70" height="58" viewBox="0 0 70 58" fill="none" stroke="${N}" stroke-width="2.6" stroke-linejoin="round"><path d="M35 6 3 20l32 14 32-14z" fill="#f8c42f"/><path d="M15 26v13c0 5 9 10 20 10s20-5 20-10V26l-20 8z" fill="#ffe08a"/><path d="M61 22v16"/><circle cx="61" cy="41" r="3" fill="${N}"/></svg>`;
  I.pDiploma = () => `<svg width="62" height="60" viewBox="0 0 62 60" fill="none" stroke="${N}" stroke-width="2.6" stroke-linejoin="round"><rect x="6" y="5" width="38" height="46" rx="3" fill="#fff8"/><path d="M13 15h24M13 22h24M13 29h16"/><path d="m45 30 4.3 8.7 9.6 1.4-7 6.8 1.7 9.6-8.6-4.5-8.6 4.5 1.7-9.6-7-6.8 9.6-1.4z" fill="#f8c42f"/></svg>`;
  I.pBank = () => `<svg width="62" height="58" viewBox="0 0 62 58" fill="${N}"><path d="M31 3 4 17v5h54v-5z"/><path d="m31 7 1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="#f8c42f"/><rect x="9" y="25" width="6" height="20" rx="1"/><rect x="21" y="25" width="6" height="20" rx="1"/><rect x="35" y="25" width="6" height="20" rx="1"/><rect x="47" y="25" width="6" height="20" rx="1"/><rect x="5" y="47" width="52" height="4" rx="1"/><rect x="2" y="52" width="58" height="4" rx="1"/></svg>`;
  G.I = I;
})(window);
