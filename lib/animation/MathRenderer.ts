/**
 * Math Renderer - Renders LaTeX-style equations on Canvas
 * Converts common LaTeX notation to properly formatted mathematical symbols
 */

// Unicode mathematical symbols mapping
const MATH_SYMBOLS: Record<string, string> = {
    // Greek letters (lowercase)
    '\\alpha': 'α',
    '\\beta': 'β',
    '\\gamma': 'γ',
    '\\delta': 'δ',
    '\\epsilon': 'ε',
    '\\zeta': 'ζ',
    '\\eta': 'η',
    '\\theta': 'θ',
    '\\iota': 'ι',
    '\\kappa': 'κ',
    '\\lambda': 'λ',
    '\\mu': 'μ',
    '\\nu': 'ν',
    '\\xi': 'ξ',
    '\\pi': 'π',
    '\\rho': 'ρ',
    '\\sigma': 'σ',
    '\\tau': 'τ',
    '\\upsilon': 'υ',
    '\\phi': 'φ',
    '\\chi': 'χ',
    '\\psi': 'ψ',
    '\\omega': 'ω',
    // Greek letters (uppercase)
    '\\Alpha': 'Α',
    '\\Beta': 'Β',
    '\\Gamma': 'Γ',
    '\\Delta': 'Δ',
    '\\Epsilon': 'Ε',
    '\\Zeta': 'Ζ',
    '\\Eta': 'Η',
    '\\Theta': 'Θ',
    '\\Iota': 'Ι',
    '\\Kappa': 'Κ',
    '\\Lambda': 'Λ',
    '\\Mu': 'Μ',
    '\\Nu': 'Ν',
    '\\Xi': 'Ξ',
    '\\Pi': 'Π',
    '\\Rho': 'Ρ',
    '\\Sigma': 'Σ',
    '\\Tau': 'Τ',
    '\\Upsilon': 'Υ',
    '\\Phi': 'Φ',
    '\\Chi': 'Χ',
    '\\Psi': 'Ψ',
    '\\Omega': 'Ω',
    // Mathematical operators
    '\\times': '×',
    '\\div': '÷',
    '\\pm': '±',
    '\\mp': '∓',
    '\\cdot': '·',
    '\\circ': '∘',
    '\\bullet': '•',
    '\\star': '★',
    '\\ast': '∗',
    // Relations
    '\\leq': '≤',
    '\\le': '≤',
    '\\geq': '≥',
    '\\ge': '≥',
    '\\neq': '≠',
    '\\ne': '≠',
    '\\approx': '≈',
    '\\equiv': '≡',
    '\\sim': '∼',
    '\\propto': '∝',
    // Arrows
    '\\rightarrow': '→',
    '\\leftarrow': '←',
    '\\Rightarrow': '⇒',
    '\\Leftarrow': '⇐',
    '\\leftrightarrow': '↔',
    '\\Leftrightarrow': '⇔',
    '\\uparrow': '↑',
    '\\downarrow': '↓',
    '\\mapsto': '↦',
    // Set theory
    '\\in': '∈',
    '\\notin': '∉',
    '\\subset': '⊂',
    '\\supset': '⊃',
    '\\subseteq': '⊆',
    '\\supseteq': '⊇',
    '\\cup': '∪',
    '\\cap': '∩',
    '\\emptyset': '∅',
    // Logic
    '\\forall': '∀',
    '\\exists': '∃',
    '\\nexists': '∄',
    '\\land': '∧',
    '\\lor': '∨',
    '\\lnot': '¬',
    '\\neg': '¬',
    // Calculus
    '\\partial': '∂',
    '\\nabla': '∇',
    '\\infty': '∞',
    '\\int': '∫',
    '\\iint': '∬',
    '\\iiint': '∭',
    '\\oint': '∮',
    '\\sum': '∑',
    '\\prod': '∏',
    '\\coprod': '∐',
    // Miscellaneous
    '\\sqrt': '√',
    '\\surd': '√',
    '\\degree': '°',
    '\\angle': '∠',
    '\\triangle': '△',
    '\\square': '□',
    '\\diamond': '◇',
    '\\prime': '′',
    '\\dprime': '″',
    '\\hbar': 'ℏ',
    '\\ell': 'ℓ',
    '\\Re': 'ℜ',
    '\\Im': 'ℑ',
    '\\aleph': 'ℵ',
    '\\beth': 'ℶ',
    // Special
    '\\ldots': '…',
    '\\cdots': '⋯',
    '\\vdots': '⋮',
    '\\ddots': '⋱',
};

// Superscript characters
const SUPERSCRIPTS: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
    '+': '⁺',
    '-': '⁻',
    '=': '⁼',
    '(': '⁽',
    ')': '⁾',
    'n': 'ⁿ',
    'i': 'ⁱ',
    'x': 'ˣ',
    'y': 'ʸ',
    'a': 'ᵃ',
    'b': 'ᵇ',
    'c': 'ᶜ',
    'd': 'ᵈ',
    'e': 'ᵉ',
    'f': 'ᶠ',
    'g': 'ᵍ',
    'h': 'ʰ',
    'j': 'ʲ',
    'k': 'ᵏ',
    'l': 'ˡ',
    'm': 'ᵐ',
    'o': 'ᵒ',
    'p': 'ᵖ',
    'r': 'ʳ',
    's': 'ˢ',
    't': 'ᵗ',
    'u': 'ᵘ',
    'v': 'ᵛ',
    'w': 'ʷ',
    'z': 'ᶻ',
};

// Subscript characters
const SUBSCRIPTS: Record<string, string> = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
    '+': '₊',
    '-': '₋',
    '=': '₌',
    '(': '₍',
    ')': '₎',
    'a': 'ₐ',
    'e': 'ₑ',
    'h': 'ₕ',
    'i': 'ᵢ',
    'j': 'ⱼ',
    'k': 'ₖ',
    'l': 'ₗ',
    'm': 'ₘ',
    'n': 'ₙ',
    'o': 'ₒ',
    'p': 'ₚ',
    'r': 'ᵣ',
    's': 'ₛ',
    't': 'ₜ',
    'u': 'ᵤ',
    'v': 'ᵥ',
    'x': 'ₓ',
};

export class MathRenderer {
    /**
     * Convert LaTeX-style equation to Unicode string for canvas rendering
     */
    public static toUnicode(latex: string): string {
        let result = latex;

        // Replace LaTeX symbols with Unicode equivalents
        for (const [tex, unicode] of Object.entries(MATH_SYMBOLS)) {
            result = result.replace(new RegExp(tex.replace(/\\/g, '\\\\'), 'g'), unicode);
        }

        // Handle superscripts: ^{...} or ^x
        result = result.replace(/\^{([^}]+)}/g, (_, content) => {
            return MathRenderer.toSuperscript(content);
        });
        result = result.replace(/\^([a-zA-Z0-9])/g, (_, char) => {
            return SUPERSCRIPTS[char] || `^${char}`;
        });

        // Handle subscripts: _{...} or _x
        result = result.replace(/_{([^}]+)}/g, (_, content) => {
            return MathRenderer.toSubscript(content);
        });
        result = result.replace(/_([a-zA-Z0-9])/g, (_, char) => {
            return SUBSCRIPTS[char] || `_${char}`;
        });

        // Handle fractions: \frac{a}{b} -> a/b (simplified)
        result = result.replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1)/($2)');

        // Handle square roots: \sqrt{x} -> √x
        result = result.replace(/\\sqrt{([^}]+)}/g, '√($1)');
        result = result.replace(/\\sqrt\s*([a-zA-Z0-9])/g, '√$1');

        // Clean up remaining braces
        result = result.replace(/{([^}]+)}/g, '$1');

        // Clean up extra spaces
        result = result.replace(/\s+/g, ' ').trim();

        return result;
    }

    /**
     * Convert a string to superscript Unicode characters
     */
    public static toSuperscript(text: string): string {
        return text.split('').map(char => SUPERSCRIPTS[char.toLowerCase()] || char).join('');
    }

    /**
     * Convert a string to subscript Unicode characters
     */
    public static toSubscript(text: string): string {
        return text.split('').map(char => SUBSCRIPTS[char.toLowerCase()] || char).join('');
    }

    /**
     * Render an equation on a canvas context
     */
    public static render(
        ctx: CanvasRenderingContext2D,
        equation: string,
        x: number,
        y: number,
        options: {
            fontSize?: number;
            fontFamily?: string;
            fillColor?: string;
            textAlign?: CanvasTextAlign;
            textBaseline?: CanvasTextBaseline;
        } = {}
    ): void {
        const {
            fontSize = 32,
            fontFamily = "'Cambria Math', 'Latin Modern Math', 'STIX Two Math', Georgia, serif",
            fillColor = '#ece6e2',
            textAlign = 'center',
            textBaseline = 'middle',
        } = options;

        const unicodeEquation = MathRenderer.toUnicode(equation);

        ctx.font = `italic ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = fillColor;
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;
        ctx.fillText(unicodeEquation, x, y);
    }

    /**
     * Measure the width of a rendered equation
     */
    public static measureWidth(
        ctx: CanvasRenderingContext2D,
        equation: string,
        fontSize: number = 32,
        fontFamily: string = "'Cambria Math', Georgia, serif"
    ): number {
        const unicodeEquation = MathRenderer.toUnicode(equation);
        ctx.font = `italic ${fontSize}px ${fontFamily}`;
        return ctx.measureText(unicodeEquation).width;
    }
}

export default MathRenderer;
