"use strict";
// Levenshtein distance and character substitution lookalike detector
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectLookalikeDomain = detectLookalikeDomain;
const TARGET_BRANDS = [
    'microsoft', 'google', 'apple', 'amazon', 'paypal', 'netflix', 'facebook', 'meta',
    'instagram', 'twitter', 'linkedin', 'github', 'dropbox', 'adobe', 'salesforce',
    'chase', 'bankofamerica', 'wellsfargo', 'citibank', 'dhl', 'fedex', 'ups', 'usps',
    'stripe', 'coinbase', 'binance', 'zoom', 'docusign', 'okta', 'slack', 'shopify',
    'cisco', 'symantec', 'cloudflare', 'godaddy', 'outlook', 'office365', 'whatsapp'
];
const HOMOGLYPH_MAP = {
    '0': 'o',
    '1': 'l',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '8': 'b',
    '@': 'a',
    'vv': 'w',
    'rn': 'm',
    'cl': 'd',
};
function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            }
            else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                matrix[i][j - 1] + 1, // insertion
                matrix[i - 1][j] + 1 // deletion
                );
            }
        }
    }
    return matrix[b.length][a.length];
}
function detectLookalikeDomain(domain) {
    const cleanDomain = domain.toLowerCase().trim().replace(/^www\./, '');
    const sld = cleanDomain.split('.')[0] || cleanDomain;
    const indicators = [];
    // Check Punycode
    if (cleanDomain.startsWith('xn--') || cleanDomain.includes('.xn--')) {
        indicators.push('Domain uses Punycode (IDN homograph candidate)');
    }
    // Check character substitutions
    let normalizedSld = sld;
    for (const [sub, original] of Object.entries(HOMOGLYPH_MAP)) {
        if (normalizedSld.includes(sub)) {
            normalizedSld = normalizedSld.replaceAll(sub, original);
        }
    }
    const segments = sld.split(/[-_.]/);
    const normalizedSegments = normalizedSld.split(/[-_.]/);
    let bestBrand = null;
    let maxSimilarity = 0;
    for (const brand of TARGET_BRANDS) {
        // Exact match with brand is NOT a lookalike
        if (sld === brand) {
            continue;
        }
        // Direct substring or brand with hyphens
        if ((sld.includes(brand) || normalizedSld.includes(brand)) && sld !== brand) {
            const isSubstituted = normalizedSld.includes(brand) && !sld.includes(brand);
            indicators.push(isSubstituted
                ? `Domain uses homoglyph substitution mimicking protected brand "${brand}" (e.g. 0->o, 1->l)`
                : `Domain explicitly incorporates protected brand name "${brand}" in subdomain or SLD`);
            return {
                isLookalike: true,
                targetBrand: brand,
                similarity: isSubstituted ? 94 : 95,
                indicators,
            };
        }
        // Check segment Levenshtein distance
        for (const seg of [...segments, ...normalizedSegments]) {
            if (seg === brand && sld !== brand) {
                indicators.push(`Domain segment explicitly mimics protected brand "${brand}"`);
                return {
                    isLookalike: true,
                    targetBrand: brand,
                    similarity: 96,
                    indicators,
                };
            }
            const dist = levenshteinDistance(seg, brand);
            if (dist === 1 && brand.length >= 4) {
                indicators.push(`Segment "${seg}" is a typo-squatting variant of brand "${brand}" (distance: 1 edit)`);
                return {
                    isLookalike: true,
                    targetBrand: brand,
                    similarity: 90,
                    indicators,
                };
            }
        }
        // Levenshtein similarity
        const distance = levenshteinDistance(sld, brand);
        const maxLength = Math.max(sld.length, brand.length);
        const similarity = Math.round(((maxLength - distance) / maxLength) * 100);
        if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            bestBrand = brand;
        }
        if (distance === 1 && brand.length >= 4) {
            indicators.push(`Typo-squatting variant of "${brand}" (Levenshtein distance: 1 edit)`);
            return {
                isLookalike: true,
                targetBrand: brand,
                similarity,
                indicators,
            };
        }
        if (distance === 2 && brand.length >= 6 && similarity >= 75) {
            indicators.push(`High proximity lookalike variant of "${brand}" (similarity: ${similarity}%)`);
            return {
                isLookalike: true,
                targetBrand: brand,
                similarity,
                indicators,
            };
        }
    }
    return {
        isLookalike: indicators.length > 0,
        targetBrand: indicators.length > 0 ? bestBrand : null,
        similarity: maxSimilarity,
        indicators,
    };
}
