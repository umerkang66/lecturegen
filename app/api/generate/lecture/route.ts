import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { title, duration } = await request.json();

    if (!title || !duration) {
      return NextResponse.json(
        { error: 'Title and duration are required' },
        { status: 400 },
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 },
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const durationMinutes = parseInt(duration);
    const sceneCount =
      durationMinutes === 2 ? 5 : durationMinutes === 5 ? 10 : 18;
    const sceneDuration = Math.floor(
      (durationMinutes * 60 * 1000) / sceneCount,
    );

    const prompt = `Generate a ${durationMinutes}-minute educational video lecture in 3Blue1Brown style about: "${title}"

OUTPUT: Valid JSON only. No markdown, no code blocks.

STRUCTURE:
{
  "title": "${title}",
  "totalDuration": ${durationMinutes * 60 * 1000},
  "scenes": [${sceneCount} scenes here]
}

SCENE FORMAT:
{
  "id": "scene-N",
  "duration": ${sceneDuration},
  "narration": "2-3 sentences for narrator",
  "background": "#1c1c1c",
  "elements": [8-12 elements]
}

LAYOUT RULES (CRITICAL - NO OVERLAPPING):
- Title: y: 80-120 (centered at x: 400)
- Equation: y: 180-220 (centered at x: 400)
- Main visuals: y: 280-450 (centered)
- Labels MUST be positioned OUTSIDE the visual elements, not on top
- Space ALL text elements minimum 60px apart vertically
- For diagrams with multiple labels:
  * Position labels on DIFFERENT SIDES (left/right/top/bottom) of the diagram
  * Use staggered y positions (e.g., 260, 330, 400, 470)
  * Labels pointing to left side: x: 100-200
  * Labels pointing to right side: x: 600-700
  * Top labels: y: 200-250
  * Bottom labels: y: 480-550
- NEVER place text labels directly over lines, shapes, or other text

=== MATH & PHYSICS ELEMENTS ===
1. TEXT: {"id":"t1","type":"text","props":{"text":"Title","x":400,"y":100},"style":{"fillColor":"#ece6e2","fontSize":36},"animation":{"type":"fadeIn","duration":800,"delay":0}}
2. EQUATION: {"id":"eq1","type":"equation","props":{"equation":"E = mc²","x":400,"y":200},"style":{"fillColor":"#58c4dd","fontSize":42},"animation":{"type":"fadeIn","duration":1000,"delay":500}}
3. CIRCLE: {"id":"c1","type":"circle","props":{"x":400,"y":380,"radius":60},"style":{"strokeColor":"#5cd0b3","strokeWidth":3},"animation":{"type":"draw","duration":1200,"delay":200}}
4. ARROW: {"id":"a1","type":"arrow","props":{"x1":200,"y1":350,"x2":400,"y2":350},"style":{"strokeColor":"#fc6255","strokeWidth":3},"animation":{"type":"draw","duration":800,"delay":400}}
5. GRAPH (functions: sin(x), cos(x), x^2, log(x), exp(x)): {"id":"g1","type":"graph","props":{"fn":"sin(x)","xMin":-6,"xMax":6,"xScale":40,"yScale":40,"originX":400,"originY":400},"style":{"strokeColor":"#58c4dd","strokeWidth":3},"animation":{"type":"draw","duration":2000,"delay":600}}
6. SHAPE: {"id":"s1","type":"shape","props":{"points":[{"x":250,"y":500},{"x":550,"y":500},{"x":400,"y":320}]},"style":{"strokeColor":"#ffff00","strokeWidth":2},"animation":{"type":"draw","duration":1200,"delay":300}}

=== CHEMISTRY ELEMENTS ===
7. ATOM (with element symbol): {"id":"atom1","type":"atom","props":{"x":300,"y":350,"radius":40,"symbol":"C","electrons":4},"style":{"fillColor":"#2a4a6a","strokeColor":"#58c4dd","textColor":"#fff"},"animation":{"type":"scale","duration":800,"delay":200}}
8. MOLECULE (group of atoms with bonds): {"id":"mol1","type":"molecule","props":{"atoms":[{"x":300,"y":350,"symbol":"H","color":"#58c4dd"},{"x":400,"y":350,"symbol":"O","color":"#fc6255"},{"x":500,"y":350,"symbol":"H","color":"#58c4dd"}],"bonds":[{"from":0,"to":1,"type":1},{"from":1,"to":2,"type":1}]},"style":{},"animation":{"type":"fadeIn","duration":1500,"delay":400}}
9. BOND (single/double/triple): {"id":"b1","type":"bond","props":{"x1":300,"y1":350,"x2":400,"y2":350,"type":2},"style":{"strokeColor":"#888"},"animation":{"type":"draw","duration":600,"delay":200}}
10. REACTION ARROW: {"id":"rxn1","type":"reactionArrow","props":{"x1":200,"y1":350,"x2":600,"y2":350,"reversible":false,"label":"heat"},"style":{"strokeColor":"#ece6e2"},"animation":{"type":"draw","duration":1000,"delay":500}}

=== BIOLOGY ELEMENTS ===
11. ELLIPSE (for cells): {"id":"cell1","type":"ellipse","props":{"x":400,"y":350,"radiusX":150,"radiusY":80},"style":{"fillColor":"rgba(92,208,179,0.2)","strokeColor":"#5cd0b3","strokeWidth":3},"animation":{"type":"scale","duration":1000,"delay":200}}
12. RECT (for organelles, boxes): {"id":"r1","type":"rect","props":{"x":400,"y":350,"width":120,"height":60,"cornerRadius":8},"style":{"fillColor":"rgba(88,196,221,0.3)","strokeColor":"#58c4dd"},"animation":{"type":"scale","duration":800,"delay":400}}
13. DNA HELIX: {"id":"dna1","type":"dna","props":{"x":400,"y":350,"width":80,"height":200,"turns":3},"style":{"strokeColor":"#888"},"animation":{"type":"draw","duration":2500,"delay":300}}
14. FLOWBOX (for processes): {"id":"fb1","type":"flowbox","props":{"x":400,"y":350,"width":140,"height":50,"label":"Transcription","type":"rect"},"style":{"fillColor":"rgba(88,196,221,0.2)","strokeColor":"#58c4dd","textColor":"#ece6e2"},"animation":{"type":"scale","duration":800,"delay":200}}

COLORS: #58c4dd (blue), #5cd0b3 (teal), #83c167 (green), #ffff00 (yellow), #e1a158 (gold), #fc6255 (red), #9a72ac (purple), #ece6e2 (white)

DOMAIN RULES (STRICT - MUST FOLLOW):
- MATH/PHYSICS/COMPUTER SCIENCE topics: ONLY use these elements: text, equation, circle, line, arrow, graph, shape, number, grid, rect, flowbox
  * DO NOT use: atom, molecule, bond, dna, reactionArrow, ellipse (as cell)
  * For CS: Use flowbox for algorithms, rect for data structures, graph for complexity
- CHEMISTRY topics: Use atom, molecule, bond, reactionArrow + text, equation, arrow
- BIOLOGY topics: Use ellipse (cells), dna, flowbox (processes), rect (organelles) + text, arrow

REQUIREMENTS:
1. Generate EXACTLY ${sceneCount} scenes
2. STRICTLY match element types to the topic domain (see DOMAIN RULES above)
3. NEVER use atom/molecule/bond/dna in math, physics, or computer science lectures
4. Space elements properly - NO OVERLAPPING
5. Use Unicode: ², ³, π, θ, α, β, Σ, →

Create visually rich, educational content using ONLY elements appropriate for the topic domain.`;

    // Retry logic with exponential backoff for handling intermittent empty responses
    const MAX_RETRIES = 3;
    let text = '';
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Gemini API attempt ${attempt}/${MAX_RETRIES}...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();

        // Check if response is valid
        if (text && text.trim().length >= 10) {
          console.log(`Gemini returned valid response on attempt ${attempt} (${text.length} chars)`);
          break;
        } else {
          throw new Error(`Empty or too short response (length: ${text?.length || 0})`);
        }
      } catch (retryError) {
        lastError = retryError as Error;
        console.warn(`Gemini API attempt ${attempt} failed:`, (retryError as Error).message);

        if (attempt < MAX_RETRIES) {
          // Exponential backoff: 1s, 2s, 4s...
          const backoffMs = Math.pow(2, attempt - 1) * 1000;
          console.log(`Retrying in ${backoffMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }

    // Parse JSON with multiple fallback methods
    let lectureScript;
    try {
      let cleanText = text.trim();

      // Check if response is empty or too short after all retries
      if (!cleanText || cleanText.length < 10) {
        console.warn(`Gemini returned empty or very short response after ${MAX_RETRIES} attempts, using fallback`);
        console.warn('Last error:', lastError?.message);
        throw new Error('Empty response from Gemini after retries');
      }

      // Remove markdown code blocks
      if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
      else if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
      if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);
      cleanText = cleanText.trim();

      // Try to find JSON object if there's extra text
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }

      // Fix common JSON issues
      cleanText = cleanText
        .replace(/,\s*}/g, '}')  // Remove trailing commas before }
        .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
        .replace(/\n/g, ' ')     // Replace newlines with spaces
        .replace(/\r/g, '')      // Remove carriage returns
        .replace(/\t/g, ' ');    // Replace tabs with spaces

      // Attempt to repair truncated JSON by balancing braces/brackets
      cleanText = repairTruncatedJson(cleanText);

      lectureScript = JSON.parse(cleanText);

      // Ensure we have scenes
      if (!lectureScript.scenes || lectureScript.scenes.length < 2) {
        lectureScript = createFallbackLecture(title, sceneCount, sceneDuration);
      }

      // Filter out domain-inappropriate elements (e.g., biology/chemistry in math lectures)
      lectureScript = filterDomainElements(lectureScript, title);

      // Post-process to fix any overlapping elements
      lectureScript = fixOverlappingElements(lectureScript);
    } catch (parseError) {
      console.error('Failed to parse Gemini response, using fallback. Error:', parseError);
      console.error('Response length:', text.length);
      console.error('Response start:', text.substring(0, 200));
      console.error('Response end:', text.substring(Math.max(0, text.length - 200)));
      lectureScript = createFallbackLecture(title, sceneCount, sceneDuration);
    }

    return NextResponse.json(lectureScript);
  } catch (error) {
    console.error('Error generating lecture:', error);
    return NextResponse.json(
      { error: 'Failed to generate lecture script' },
      { status: 500 },
    );
  }
}

// Attempt to repair truncated JSON by balancing braces and brackets
function repairTruncatedJson(json: string): string {
  // First, try to parse as-is - if it works, no repair needed
  try {
    JSON.parse(json);
    return json;
  } catch {
    // Continue with repair logic
  }

  let result = json.trim();

  // Remove any trailing incomplete string (ends without closing quote)
  // This handles cases like: {"key": "incomplete text
  const lastQuote = result.lastIndexOf('"');
  const lastColon = result.lastIndexOf(':');
  const lastBrace = Math.max(result.lastIndexOf('}'), result.lastIndexOf(']'));

  // If the last meaningful character looks like an incomplete value, truncate
  if (lastQuote > lastBrace && lastQuote > lastColon) {
    // Check if we're in an incomplete string
    const afterLastQuote = result.substring(lastQuote + 1).trim();
    if (!afterLastQuote.startsWith(',') && !afterLastQuote.startsWith('}') && !afterLastQuote.startsWith(']')) {
      // Find a good truncation point
      const truncateAt = Math.max(
        result.lastIndexOf('},'),
        result.lastIndexOf('}]'),
        result.lastIndexOf('"}'),
        result.lastIndexOf('"]'),
        result.lastIndexOf('",'),
        result.lastIndexOf('"],'),
        result.lastIndexOf('"},')
      );

      if (truncateAt > 0) {
        result = result.substring(0, truncateAt + 1);
      }
    }
  }

  // Remove trailing comma if present
  result = result.replace(/,\s*$/, '');

  // Count unbalanced braces and brackets
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < result.length; i++) {
    const char = result[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\' && inString) {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') openBraces++;
      else if (char === '}') openBraces--;
      else if (char === '[') openBrackets++;
      else if (char === ']') openBrackets--;
    }
  }

  // Close any unclosed strings (if we're still in a string)
  if (inString) {
    result += '"';
  }

  // Add missing closing brackets and braces
  // Brackets should be closed before braces since arrays are usually inside objects
  for (let i = 0; i < openBrackets; i++) {
    result += ']';
  }
  for (let i = 0; i < openBraces; i++) {
    result += '}';
  }

  return result;
}

function createFallbackLecture(
  title: string,
  sceneCount: number,
  sceneDuration: number,
) {
  const cx = 400, cy = 350;
  const titleLower = title.toLowerCase();

  // Detect topic type
  const isChemistry = /chem|atom|molecule|bond|reaction|element|compound|ion|acid|base|electron|proton/.test(titleLower);
  const isBiology = /bio|cell|dna|rna|protein|gene|organism|evolution|photosynthesis|mitosis|enzyme/.test(titleLower);

  interface SceneElement {
    id: string;
    type: string;
    props: Record<string, unknown>;
    style: Record<string, unknown>;
    animation: { type: string; duration: number; delay: number };
  }

  interface SceneTemplate {
    narration: string;
    elements: SceneElement[];
  }

  let sceneTemplates: SceneTemplate[];

  if (isChemistry) {
    sceneTemplates = [
      {
        narration: `Welcome to our exploration of ${title}. Let's dive into the fascinating world of chemistry.`,
        elements: [
          { id: 'title', type: 'text', props: { text: title, x: cx, y: 100 }, style: { fillColor: '#ece6e2', fontSize: 36 }, animation: { type: 'fadeIn', duration: 1200, delay: 0 } },
          { id: 'subtitle', type: 'text', props: { text: 'Chemistry Fundamentals', x: cx, y: 160 }, style: { fillColor: '#58c4dd', fontSize: 24 }, animation: { type: 'fadeIn', duration: 800, delay: 600 } },
          { id: 'atom1', type: 'atom', props: { x: 200, y: 350, radius: 40, symbol: 'C', electrons: 4 }, style: { fillColor: '#2a4a6a', strokeColor: '#58c4dd', textColor: '#fff' }, animation: { type: 'scale', duration: 1000, delay: 1000 } },
          { id: 'atom2', type: 'atom', props: { x: 330, y: 350, radius: 40, symbol: 'O', electrons: 6 }, style: { fillColor: '#4a2a2a', strokeColor: '#fc6255', textColor: '#fff' }, animation: { type: 'scale', duration: 1000, delay: 1300 } },
          { id: 'atom3', type: 'atom', props: { x: 460, y: 350, radius: 40, symbol: 'N', electrons: 5 }, style: { fillColor: '#3a3a5a', strokeColor: '#9a72ac', textColor: '#fff' }, animation: { type: 'scale', duration: 1000, delay: 1600 } },
          { id: 'atom4', type: 'atom', props: { x: 590, y: 350, radius: 40, symbol: 'H', electrons: 1 }, style: { fillColor: '#3a4a3a', strokeColor: '#5cd0b3', textColor: '#fff' }, animation: { type: 'scale', duration: 1000, delay: 1900 } },
          { id: 'label1', type: 'text', props: { text: 'Carbon', x: 200, y: 420 }, style: { fillColor: '#58c4dd', fontSize: 14 }, animation: { type: 'fadeIn', duration: 500, delay: 2200 } },
          { id: 'label2', type: 'text', props: { text: 'Oxygen', x: 330, y: 420 }, style: { fillColor: '#fc6255', fontSize: 14 }, animation: { type: 'fadeIn', duration: 500, delay: 2400 } },
          { id: 'label3', type: 'text', props: { text: 'Nitrogen', x: 460, y: 420 }, style: { fillColor: '#9a72ac', fontSize: 14 }, animation: { type: 'fadeIn', duration: 500, delay: 2600 } },
          { id: 'label4', type: 'text', props: { text: 'Hydrogen', x: 590, y: 420 }, style: { fillColor: '#5cd0b3', fontSize: 14 }, animation: { type: 'fadeIn', duration: 500, delay: 2800 } },
        ],
      },
      {
        narration: `Atoms bond together to form molecules. The arrangement determines properties.`,
        elements: [
          { id: 'heading', type: 'text', props: { text: 'Molecular Structure', x: cx, y: 80 }, style: { fillColor: '#ece6e2', fontSize: 32 }, animation: { type: 'fadeIn', duration: 800, delay: 0 } },
          { id: 'molecule', type: 'molecule', props: { atoms: [{ x: 280, y: 300, symbol: 'H', color: '#58c4dd' }, { x: 400, y: 300, symbol: 'O', color: '#fc6255' }, { x: 520, y: 300, symbol: 'H', color: '#58c4dd' }], bonds: [{ from: 0, to: 1, type: 1 }, { from: 1, to: 2, type: 1 }] }, style: {}, animation: { type: 'fadeIn', duration: 1500, delay: 400 } },
          { id: 'label1', type: 'text', props: { text: 'H₂O - Water', x: cx, y: 380 }, style: { fillColor: '#5cd0b3', fontSize: 24 }, animation: { type: 'fadeIn', duration: 800, delay: 1800 } },
          { id: 'molecule2', type: 'molecule', props: { atoms: [{ x: 280, y: 480, symbol: 'O', color: '#fc6255' }, { x: 400, y: 480, symbol: 'C', color: '#888' }, { x: 520, y: 480, symbol: 'O', color: '#fc6255' }], bonds: [{ from: 0, to: 1, type: 2 }, { from: 1, to: 2, type: 2 }] }, style: {}, animation: { type: 'fadeIn', duration: 1500, delay: 2200 } },
          { id: 'label2', type: 'text', props: { text: 'CO₂ - Carbon Dioxide', x: cx, y: 550 }, style: { fillColor: '#e1a158', fontSize: 24 }, animation: { type: 'fadeIn', duration: 800, delay: 3600 } },
        ],
      },
      {
        narration: `Chemical reactions transform reactants into products through bond changes.`,
        elements: [
          { id: 'heading', type: 'text', props: { text: 'Chemical Reaction', x: cx, y: 80 }, style: { fillColor: '#ece6e2', fontSize: 32 }, animation: { type: 'fadeIn', duration: 800, delay: 0 } },
          { id: 'reactant1', type: 'atom', props: { x: 150, y: 300, radius: 35, symbol: 'Na', electrons: 1 }, style: { fillColor: '#2a4a6a', strokeColor: '#58c4dd', textColor: '#fff' }, animation: { type: 'scale', duration: 800, delay: 400 } },
          { id: 'plus', type: 'text', props: { text: '+', x: 250, y: 300 }, style: { fillColor: '#ece6e2', fontSize: 36 }, animation: { type: 'fadeIn', duration: 400, delay: 800 } },
          { id: 'reactant2', type: 'atom', props: { x: 350, y: 300, radius: 35, symbol: 'Cl', electrons: 7 }, style: { fillColor: '#3a5a3a', strokeColor: '#5cd0b3', textColor: '#fff' }, animation: { type: 'scale', duration: 800, delay: 1000 } },
          { id: 'arrow', type: 'reactionArrow', props: { x1: 420, y1: 300, x2: 520, y2: 300, reversible: false, label: '' }, style: { strokeColor: '#ffff00' }, animation: { type: 'draw', duration: 1000, delay: 1400 } },
          { id: 'product', type: 'molecule', props: { atoms: [{ x: 600, y: 300, symbol: 'Na', color: '#58c4dd' }, { x: 700, y: 300, symbol: 'Cl', color: '#5cd0b3' }], bonds: [{ from: 0, to: 1, type: 1 }] }, style: {}, animation: { type: 'fadeIn', duration: 1200, delay: 2000 } },
          { id: 'label', type: 'text', props: { text: 'Na + Cl → NaCl (Table Salt)', x: cx, y: 420 }, style: { fillColor: '#e1a158', fontSize: 24 }, animation: { type: 'fadeIn', duration: 800, delay: 3000 } },
          { id: 'note', type: 'text', props: { text: 'Ionic Bond Formation', x: cx, y: 480 }, style: { fillColor: '#888', fontSize: 18 }, animation: { type: 'fadeIn', duration: 600, delay: 3600 } },
        ],
      },
      {
        narration: `The periodic table organizes elements by their atomic structure and properties.`,
        elements: [
          { id: 'heading', type: 'text', props: { text: 'Periodic Table Elements', x: cx, y: 80 }, style: { fillColor: '#ece6e2', fontSize: 32 }, animation: { type: 'fadeIn', duration: 800, delay: 0 } },
          { id: 'atom1', type: 'atom', props: { x: 150, y: 280, radius: 50, symbol: 'Li', electrons: 1 }, style: { fillColor: '#5a2a2a', strokeColor: '#fc6255', textColor: '#fff' }, animation: { type: 'scale', duration: 1000, delay: 400 } },
          { id: 'atom2', type: 'atom', props: { x: 300, y: 280, radius: 50, symbol: 'Be', electrons: 2 }, style: { fillColor: '#5a4a2a', strokeColor: '#e1a158', textColor: '#fff' }, animation: { type: 'scale', duration: 1000, delay: 700 } },
          { id: 'atom3', type: 'atom', props: { x: 450, y: 280, radius: 50, symbol: 'B', electrons: 3 }, style: { fillColor: '#4a5a2a', strokeColor: '#83c167', textColor: '#fff' }, animation: { type: 'scale', duration: 1000, delay: 1000 } },
          { id: 'atom4', type: 'atom', props: { x: 600, y: 280, radius: 50, symbol: 'C', electrons: 4 }, style: { fillColor: '#2a4a6a', strokeColor: '#58c4dd', textColor: '#fff' }, animation: { type: 'scale', duration: 1000, delay: 1300 } },
          { id: 'arrow1', type: 'arrow', props: { x1: 150, y1: 350, x2: 150, y2: 420 }, style: { strokeColor: '#fc6255', strokeWidth: 2 }, animation: { type: 'draw', duration: 600, delay: 1800 } },
          { id: 'arrow2', type: 'arrow', props: { x1: 300, y1: 350, x2: 300, y2: 420 }, style: { strokeColor: '#e1a158', strokeWidth: 2 }, animation: { type: 'draw', duration: 600, delay: 2000 } },
          { id: 'arrow3', type: 'arrow', props: { x1: 450, y1: 350, x2: 450, y2: 420 }, style: { strokeColor: '#83c167', strokeWidth: 2 }, animation: { type: 'draw', duration: 600, delay: 2200 } },
          { id: 'arrow4', type: 'arrow', props: { x1: 600, y1: 350, x2: 600, y2: 420 }, style: { strokeColor: '#58c4dd', strokeWidth: 2 }, animation: { type: 'draw', duration: 600, delay: 2400 } },
          { id: 'info1', type: 'text', props: { text: '3 protons', x: 150, y: 450 }, style: { fillColor: '#fc6255', fontSize: 14 }, animation: { type: 'fadeIn', duration: 500, delay: 2600 } },
          { id: 'info2', type: 'text', props: { text: '4 protons', x: 300, y: 450 }, style: { fillColor: '#e1a158', fontSize: 14 }, animation: { type: 'fadeIn', duration: 500, delay: 2800 } },
          { id: 'info3', type: 'text', props: { text: '5 protons', x: 450, y: 450 }, style: { fillColor: '#83c167', fontSize: 14 }, animation: { type: 'fadeIn', duration: 500, delay: 3000 } },
          { id: 'info4', type: 'text', props: { text: '6 protons', x: 600, y: 450 }, style: { fillColor: '#58c4dd', fontSize: 14 }, animation: { type: 'fadeIn', duration: 500, delay: 3200 } },
          { id: 'note', type: 'text', props: { text: 'Atomic number increases →', x: cx, y: 520 }, style: { fillColor: '#888', fontSize: 18 }, animation: { type: 'fadeIn', duration: 800, delay: 3600 } },
        ],
      },
      {
        narration: `Electron orbitals determine how atoms bond and react with each other.`,
        elements: [
          { id: 'heading', type: 'text', props: { text: 'Electron Configuration', x: cx, y: 80 }, style: { fillColor: '#ece6e2', fontSize: 32 }, animation: { type: 'fadeIn', duration: 800, delay: 0 } },
          { id: 'nucleus', type: 'circle', props: { x: cx, y: 350, radius: 25 }, style: { fillColor: '#fc6255', strokeColor: '#fc6255', strokeWidth: 2 }, animation: { type: 'scale', duration: 800, delay: 400 } },
          { id: 'nLabel', type: 'text', props: { text: 'O', x: cx, y: 350 }, style: { fillColor: '#fff', fontSize: 20 }, animation: { type: 'fadeIn', duration: 400, delay: 800 } },
          { id: 'shell1', type: 'circle', props: { x: cx, y: 350, radius: 60 }, style: { strokeColor: '#58c4dd', strokeWidth: 2 }, animation: { type: 'draw', duration: 1000, delay: 1000 } },
          { id: 'shell2', type: 'circle', props: { x: cx, y: 350, radius: 100 }, style: { strokeColor: '#5cd0b3', strokeWidth: 2 }, animation: { type: 'draw', duration: 1000, delay: 1400 } },
          { id: 'e1', type: 'circle', props: { x: cx + 60, y: 350, radius: 8 }, style: { fillColor: '#58c4dd', strokeColor: '#58c4dd', strokeWidth: 1 }, animation: { type: 'scale', duration: 400, delay: 1800 } },
          { id: 'e2', type: 'circle', props: { x: cx - 60, y: 350, radius: 8 }, style: { fillColor: '#58c4dd', strokeColor: '#58c4dd', strokeWidth: 1 }, animation: { type: 'scale', duration: 400, delay: 2000 } },
          { id: 'e3', type: 'circle', props: { x: cx, y: 250, radius: 8 }, style: { fillColor: '#5cd0b3', strokeColor: '#5cd0b3', strokeWidth: 1 }, animation: { type: 'scale', duration: 400, delay: 2200 } },
          { id: 'e4', type: 'circle', props: { x: cx + 70, y: 280, radius: 8 }, style: { fillColor: '#5cd0b3', strokeColor: '#5cd0b3', strokeWidth: 1 }, animation: { type: 'scale', duration: 400, delay: 2400 } },
          { id: 'e5', type: 'circle', props: { x: cx - 70, y: 280, radius: 8 }, style: { fillColor: '#5cd0b3', strokeColor: '#5cd0b3', strokeWidth: 1 }, animation: { type: 'scale', duration: 400, delay: 2600 } },
          { id: 'e6', type: 'circle', props: { x: cx + 70, y: 420, radius: 8 }, style: { fillColor: '#5cd0b3', strokeColor: '#5cd0b3', strokeWidth: 1 }, animation: { type: 'scale', duration: 400, delay: 2800 } },
          { id: 'label1', type: 'text', props: { text: 'K shell: 2e⁻', x: 620, y: 350 }, style: { fillColor: '#58c4dd', fontSize: 16 }, animation: { type: 'fadeIn', duration: 600, delay: 3000 } },
          { id: 'label2', type: 'text', props: { text: 'L shell: 6e⁻', x: 620, y: 250 }, style: { fillColor: '#5cd0b3', fontSize: 16 }, animation: { type: 'fadeIn', duration: 600, delay: 3300 } },
          { id: 'config', type: 'text', props: { text: 'Oxygen: 1s² 2s² 2p⁴', x: cx, y: 520 }, style: { fillColor: '#e1a158', fontSize: 22 }, animation: { type: 'fadeIn', duration: 800, delay: 3600 } },
        ],
      },
      {
        narration: `Covalent bonds form when atoms share electrons to achieve stability.`,
        elements: [
          { id: 'heading', type: 'text', props: { text: 'Covalent Bonding', x: cx, y: 80 }, style: { fillColor: '#ece6e2', fontSize: 32 }, animation: { type: 'fadeIn', duration: 800, delay: 0 } },
          { id: 'atom1', type: 'atom', props: { x: 280, y: 320, radius: 50, symbol: 'C', electrons: 4 }, style: { fillColor: '#2a4a6a', strokeColor: '#58c4dd', textColor: '#fff' }, animation: { type: 'scale', duration: 1000, delay: 400 } },
          { id: 'atom2', type: 'atom', props: { x: 520, y: 320, radius: 50, symbol: 'C', electrons: 4 }, style: { fillColor: '#2a4a6a', strokeColor: '#58c4dd', textColor: '#fff' }, animation: { type: 'scale', duration: 1000, delay: 800 } },
          { id: 'bond1', type: 'bond', props: { x1: 330, y1: 310, x2: 470, y2: 310, type: 1 }, style: { strokeColor: '#ffff00' }, animation: { type: 'draw', duration: 800, delay: 1400 } },
          { id: 'bond2', type: 'bond', props: { x1: 330, y1: 330, x2: 470, y2: 330, type: 1 }, style: { strokeColor: '#ffff00' }, animation: { type: 'draw', duration: 800, delay: 1700 } },
          { id: 'label', type: 'text', props: { text: 'Double Bond (C=C)', x: cx, y: 420 }, style: { fillColor: '#ffff00', fontSize: 24 }, animation: { type: 'fadeIn', duration: 800, delay: 2200 } },
          { id: 'shared', type: 'text', props: { text: '4 electrons shared', x: cx, y: 480 }, style: { fillColor: '#888', fontSize: 18 }, animation: { type: 'fadeIn', duration: 600, delay: 2800 } },
          { id: 'e1', type: 'circle', props: { x: 380, y: 310, radius: 6 }, style: { fillColor: '#e1a158', strokeColor: '#e1a158', strokeWidth: 1 }, animation: { type: 'scale', duration: 300, delay: 3200 } },
          { id: 'e2', type: 'circle', props: { x: 420, y: 310, radius: 6 }, style: { fillColor: '#e1a158', strokeColor: '#e1a158', strokeWidth: 1 }, animation: { type: 'scale', duration: 300, delay: 3400 } },
          { id: 'e3', type: 'circle', props: { x: 380, y: 330, radius: 6 }, style: { fillColor: '#e1a158', strokeColor: '#e1a158', strokeWidth: 1 }, animation: { type: 'scale', duration: 300, delay: 3600 } },
          { id: 'e4', type: 'circle', props: { x: 420, y: 330, radius: 6 }, style: { fillColor: '#e1a158', strokeColor: '#e1a158', strokeWidth: 1 }, animation: { type: 'scale', duration: 300, delay: 3800 } },
        ],
      },
    ];
  } else if (isBiology) {
    sceneTemplates = [
      {
        narration: `Welcome to our exploration of ${title}. Let's discover the building blocks of life.`,
        elements: [
          { id: 'title', type: 'text', props: { text: title, x: cx, y: 80 }, style: { fillColor: '#ece6e2', fontSize: 36 }, animation: { type: 'fadeIn', duration: 1200, delay: 0 } },
          { id: 'subtitle', type: 'text', props: { text: 'Biology Fundamentals', x: cx, y: 140 }, style: { fillColor: '#5cd0b3', fontSize: 24 }, animation: { type: 'fadeIn', duration: 800, delay: 600 } },
          { id: 'cell', type: 'ellipse', props: { x: cx, y: 350, radiusX: 200, radiusY: 120 }, style: { fillColor: 'rgba(92,208,179,0.1)', strokeColor: '#5cd0b3', strokeWidth: 3 }, animation: { type: 'scale', duration: 1500, delay: 1000 } },
          { id: 'membrane', type: 'text', props: { text: 'Cell Membrane', x: 680, y: 350 }, style: { fillColor: '#5cd0b3', fontSize: 14 }, animation: { type: 'fadeIn', duration: 500, delay: 1800 } },
          { id: 'nucleus', type: 'ellipse', props: { x: cx, y: 350, radiusX: 60, radiusY: 45 }, style: { fillColor: 'rgba(88,196,221,0.25)', strokeColor: '#58c4dd', strokeWidth: 2 }, animation: { type: 'scale', duration: 1000, delay: 2200 } },
          { id: 'nucleusLabel', type: 'text', props: { text: 'Nucleus', x: cx, y: 420 }, style: { fillColor: '#58c4dd', fontSize: 14 }, animation: { type: 'fadeIn', duration: 500, delay: 2800 } },
          { id: 'mito1', type: 'ellipse', props: { x: 280, y: 300, radiusX: 30, radiusY: 15 }, style: { fillColor: 'rgba(252,98,85,0.3)', strokeColor: '#fc6255', strokeWidth: 2 }, animation: { type: 'scale', duration: 800, delay: 3200 } },
          { id: 'mito2', type: 'ellipse', props: { x: 520, y: 380, radiusX: 30, radiusY: 15 }, style: { fillColor: 'rgba(252,98,85,0.3)', strokeColor: '#fc6255', strokeWidth: 2 }, animation: { type: 'scale', duration: 800, delay: 3500 } },
          { id: 'mitoLabel', type: 'text', props: { text: 'Mitochondria', x: 280, y: 330 }, style: { fillColor: '#fc6255', fontSize: 12 }, animation: { type: 'fadeIn', duration: 500, delay: 3800 } },
        ],
      },
      {
        narration: `DNA carries genetic information in its famous double helix structure.`,
        elements: [
          { id: 'heading', type: 'text', props: { text: 'DNA Structure', x: cx, y: 80 }, style: { fillColor: '#ece6e2', fontSize: 32 }, animation: { type: 'fadeIn', duration: 800, delay: 0 } },
          { id: 'dna', type: 'dna', props: { x: cx, y: 340, width: 120, height: 300, turns: 5 }, style: { strokeColor: '#888' }, animation: { type: 'draw', duration: 3500, delay: 400 } },
          { id: 'backbone1', type: 'text', props: { text: 'Sugar-Phosphate', x: 220, y: 280 }, style: { fillColor: '#58c4dd', fontSize: 14 }, animation: { type: 'fadeIn', duration: 600, delay: 2000 } },
          { id: 'backbone2', type: 'text', props: { text: 'Backbone', x: 220, y: 300 }, style: { fillColor: '#58c4dd', fontSize: 14 }, animation: { type: 'fadeIn', duration: 600, delay: 2200 } },
          { id: 'bases', type: 'text', props: { text: 'Base Pairs', x: 580, y: 340 }, style: { fillColor: '#fc6255', fontSize: 14 }, animation: { type: 'fadeIn', duration: 600, delay: 2600 } },
          { id: 'arrow1', type: 'arrow', props: { x1: 280, y1: 290, x2: 340, y2: 290 }, style: { strokeColor: '#58c4dd', strokeWidth: 2 }, animation: { type: 'draw', duration: 500, delay: 3000 } },
          { id: 'arrow2', type: 'arrow', props: { x1: 520, y1: 340, x2: 460, y2: 340 }, style: { strokeColor: '#fc6255', strokeWidth: 2 }, animation: { type: 'draw', duration: 500, delay: 3300 } },
          { id: 'label1', type: 'text', props: { text: 'A-T', x: cx - 30, y: 520 }, style: { fillColor: '#5cd0b3', fontSize: 18 }, animation: { type: 'fadeIn', duration: 500, delay: 3600 } },
          { id: 'label2', type: 'text', props: { text: 'G-C', x: cx + 30, y: 520 }, style: { fillColor: '#e1a158', fontSize: 18 }, animation: { type: 'fadeIn', duration: 500, delay: 3800 } },
        ],
      },
      {
        narration: `Proteins are synthesized through transcription and translation processes.`,
        elements: [
          { id: 'heading', type: 'text', props: { text: 'Protein Synthesis', x: cx, y: 80 }, style: { fillColor: '#ece6e2', fontSize: 32 }, animation: { type: 'fadeIn', duration: 800, delay: 0 } },
          { id: 'dna', type: 'flowbox', props: { x: 150, y: 200, width: 100, height: 50, label: 'DNA', type: 'rect' }, style: { fillColor: 'rgba(88,196,221,0.2)', strokeColor: '#58c4dd', textColor: '#ece6e2' }, animation: { type: 'scale', duration: 800, delay: 400 } },
          { id: 'arrow1', type: 'arrow', props: { x1: 200, y1: 225, x2: 280, y2: 225 }, style: { strokeColor: '#ffff00', strokeWidth: 2 }, animation: { type: 'draw', duration: 600, delay: 900 } },
          { id: 'mRNA', type: 'flowbox', props: { x: 350, y: 200, width: 100, height: 50, label: 'mRNA', type: 'rect' }, style: { fillColor: 'rgba(92,208,179,0.2)', strokeColor: '#5cd0b3', textColor: '#ece6e2' }, animation: { type: 'scale', duration: 800, delay: 1200 } },
          { id: 'transcription', type: 'text', props: { text: 'Transcription', x: 250, y: 180 }, style: { fillColor: '#ffff00', fontSize: 14 }, animation: { type: 'fadeIn', duration: 500, delay: 1600 } },
          { id: 'arrow2', type: 'arrow', props: { x1: 400, y1: 225, x2: 480, y2: 225 }, style: { strokeColor: '#fc6255', strokeWidth: 2 }, animation: { type: 'draw', duration: 600, delay: 1900 } },
          { id: 'ribosome', type: 'flowbox', props: { x: 550, y: 200, width: 100, height: 50, label: 'Ribosome', type: 'rect' }, style: { fillColor: 'rgba(252,98,85,0.2)', strokeColor: '#fc6255', textColor: '#ece6e2' }, animation: { type: 'scale', duration: 800, delay: 2200 } },
          { id: 'translation', type: 'text', props: { text: 'Translation', x: 450, y: 180 }, style: { fillColor: '#fc6255', fontSize: 14 }, animation: { type: 'fadeIn', duration: 500, delay: 2600 } },
          { id: 'arrow3', type: 'arrow', props: { x1: 550, y1: 250, x2: 550, y2: 320 }, style: { strokeColor: '#e1a158', strokeWidth: 2 }, animation: { type: 'draw', duration: 600, delay: 2900 } },
          { id: 'protein', type: 'flowbox', props: { x: 550, y: 380, width: 120, height: 50, label: 'Protein', type: 'rect' }, style: { fillColor: 'rgba(225,161,88,0.2)', strokeColor: '#e1a158', textColor: '#ece6e2' }, animation: { type: 'scale', duration: 800, delay: 3200 } },
          { id: 'chain', type: 'text', props: { text: 'Amino Acid Chain', x: 550, y: 450 }, style: { fillColor: '#888', fontSize: 14 }, animation: { type: 'fadeIn', duration: 500, delay: 3600 } },
        ],
      },
      {
        narration: `Cell division through mitosis ensures genetic continuity.`,
        elements: [
          { id: 'heading', type: 'text', props: { text: 'Mitosis Phases', x: cx, y: 80 }, style: { fillColor: '#ece6e2', fontSize: 32 }, animation: { type: 'fadeIn', duration: 800, delay: 0 } },
          { id: 'phase1', type: 'ellipse', props: { x: 150, y: 280, radiusX: 50, radiusY: 50 }, style: { fillColor: 'rgba(88,196,221,0.2)', strokeColor: '#58c4dd', strokeWidth: 2 }, animation: { type: 'scale', duration: 800, delay: 400 } },
          { id: 'label1', type: 'text', props: { text: 'Prophase', x: 150, y: 350 }, style: { fillColor: '#58c4dd', fontSize: 14 }, animation: { type: 'fadeIn', duration: 500, delay: 800 } },
          { id: 'arrow1', type: 'arrow', props: { x1: 200, y1: 280, x2: 250, y2: 280 }, style: { strokeColor: '#888', strokeWidth: 2 }, animation: { type: 'draw', duration: 400, delay: 1000 } },
          { id: 'phase2', type: 'ellipse', props: { x: 300, y: 280, radiusX: 50, radiusY: 50 }, style: { fillColor: 'rgba(92,208,179,0.2)', strokeColor: '#5cd0b3', strokeWidth: 2 }, animation: { type: 'scale', duration: 800, delay: 1200 } },
          { id: 'label2', type: 'text', props: { text: 'Metaphase', x: 300, y: 350 }, style: { fillColor: '#5cd0b3', fontSize: 14 }, animation: { type: 'fadeIn', duration: 500, delay: 1600 } },
          { id: 'arrow2', type: 'arrow', props: { x1: 350, y1: 280, x2: 400, y2: 280 }, style: { strokeColor: '#888', strokeWidth: 2 }, animation: { type: 'draw', duration: 400, delay: 1800 } },
          { id: 'phase3', type: 'ellipse', props: { x: 450, y: 280, radiusX: 50, radiusY: 50 }, style: { fillColor: 'rgba(252,98,85,0.2)', strokeColor: '#fc6255', strokeWidth: 2 }, animation: { type: 'scale', duration: 800, delay: 2000 } },
          { id: 'label3', type: 'text', props: { text: 'Anaphase', x: 450, y: 350 }, style: { fillColor: '#fc6255', fontSize: 14 }, animation: { type: 'fadeIn', duration: 500, delay: 2400 } },
          { id: 'arrow3', type: 'arrow', props: { x1: 500, y1: 280, x2: 550, y2: 280 }, style: { strokeColor: '#888', strokeWidth: 2 }, animation: { type: 'draw', duration: 400, delay: 2600 } },
          { id: 'phase4', type: 'ellipse', props: { x: 600, y: 280, radiusX: 50, radiusY: 50 }, style: { fillColor: 'rgba(225,161,88,0.2)', strokeColor: '#e1a158', strokeWidth: 2 }, animation: { type: 'scale', duration: 800, delay: 2800 } },
          { id: 'label4', type: 'text', props: { text: 'Telophase', x: 600, y: 350 }, style: { fillColor: '#e1a158', fontSize: 14 }, animation: { type: 'fadeIn', duration: 500, delay: 3200 } },
          { id: 'result', type: 'text', props: { text: '→ 2 Identical Daughter Cells', x: cx, y: 450 }, style: { fillColor: '#9a72ac', fontSize: 20 }, animation: { type: 'fadeIn', duration: 800, delay: 3600 } },
        ],
      },
      {
        narration: `Photosynthesis converts light energy into chemical energy in plants.`,
        elements: [
          { id: 'heading', type: 'text', props: { text: 'Photosynthesis', x: cx, y: 80 }, style: { fillColor: '#ece6e2', fontSize: 32 }, animation: { type: 'fadeIn', duration: 800, delay: 0 } },
          { id: 'chloroplast', type: 'ellipse', props: { x: cx, y: 340, radiusX: 180, radiusY: 100 }, style: { fillColor: 'rgba(131,193,103,0.15)', strokeColor: '#83c167', strokeWidth: 3 }, animation: { type: 'scale', duration: 1200, delay: 400 } },
          { id: 'thylakoid', type: 'ellipse', props: { x: cx, y: 340, radiusX: 80, radiusY: 40 }, style: { fillColor: 'rgba(131,193,103,0.3)', strokeColor: '#83c167', strokeWidth: 2 }, animation: { type: 'scale', duration: 800, delay: 1200 } },
          { id: 'sun', type: 'circle', props: { x: 120, y: 200, radius: 40 }, style: { fillColor: '#ffff00', strokeColor: '#e1a158', strokeWidth: 3 }, animation: { type: 'scale', duration: 800, delay: 1600 } },
          { id: 'sunLabel', type: 'text', props: { text: 'Light', x: 120, y: 260 }, style: { fillColor: '#ffff00', fontSize: 14 }, animation: { type: 'fadeIn', duration: 500, delay: 2000 } },
          { id: 'arrow1', type: 'arrow', props: { x1: 160, y1: 220, x2: 220, y2: 300 }, style: { strokeColor: '#ffff00', strokeWidth: 2 }, animation: { type: 'draw', duration: 600, delay: 2200 } },
          { id: 'co2', type: 'text', props: { text: 'CO₂', x: 120, y: 400 }, style: { fillColor: '#58c4dd', fontSize: 20 }, animation: { type: 'fadeIn', duration: 600, delay: 2500 } },
          { id: 'h2o', type: 'text', props: { text: 'H₂O', x: 120, y: 440 }, style: { fillColor: '#58c4dd', fontSize: 20 }, animation: { type: 'fadeIn', duration: 600, delay: 2800 } },
          { id: 'arrow2', type: 'arrow', props: { x1: 160, y1: 420, x2: 220, y2: 380 }, style: { strokeColor: '#58c4dd', strokeWidth: 2 }, animation: { type: 'draw', duration: 600, delay: 3100 } },
          { id: 'glucose', type: 'text', props: { text: 'C₆H₁₂O₆', x: 650, y: 340 }, style: { fillColor: '#e1a158', fontSize: 24 }, animation: { type: 'fadeIn', duration: 800, delay: 3400 } },
          { id: 'o2', type: 'text', props: { text: 'O₂', x: 650, y: 400 }, style: { fillColor: '#5cd0b3', fontSize: 24 }, animation: { type: 'fadeIn', duration: 600, delay: 3700 } },
          { id: 'arrow3', type: 'arrow', props: { x1: 580, y1: 340, x2: 620, y2: 340 }, style: { strokeColor: '#e1a158', strokeWidth: 2 }, animation: { type: 'draw', duration: 600, delay: 4000 } },
        ],
      },
    ];
  } else {
    sceneTemplates = [
      {
        narration: `Welcome to our exploration of ${title}. This is going to be a fascinating journey.`,
        elements: [
          { id: 'title', type: 'text', props: { text: title, x: cx, y: 80 }, style: { fillColor: '#ece6e2', fontSize: 38 }, animation: { type: 'fadeIn', duration: 1200, delay: 0 } },
          { id: 'subtitle', type: 'text', props: { text: 'A Visual Journey', x: cx, y: 140 }, style: { fillColor: '#888888', fontSize: 22 }, animation: { type: 'fadeIn', duration: 800, delay: 600 } },
          { id: 'circle1', type: 'circle', props: { x: 200, y: 350, radius: 50 }, style: { strokeColor: '#58c4dd', strokeWidth: 3 }, animation: { type: 'draw', duration: 1200, delay: 1000 } },
          { id: 'circle2', type: 'circle', props: { x: 400, y: 350, radius: 50 }, style: { strokeColor: '#5cd0b3', strokeWidth: 3 }, animation: { type: 'draw', duration: 1200, delay: 1400 } },
          { id: 'circle3', type: 'circle', props: { x: 600, y: 350, radius: 50 }, style: { strokeColor: '#fc6255', strokeWidth: 3 }, animation: { type: 'draw', duration: 1200, delay: 1800 } },
          { id: 'line1', type: 'line', props: { x1: 250, y1: 350, x2: 350, y2: 350 }, style: { strokeColor: '#e1a158', strokeWidth: 2 }, animation: { type: 'draw', duration: 600, delay: 2400 } },
          { id: 'line2', type: 'line', props: { x1: 450, y1: 350, x2: 550, y2: 350 }, style: { strokeColor: '#e1a158', strokeWidth: 2 }, animation: { type: 'draw', duration: 600, delay: 2800 } },
          { id: 'note', type: 'text', props: { text: 'Connected Concepts', x: cx, y: 480 }, style: { fillColor: '#9a72ac', fontSize: 20 }, animation: { type: 'fadeIn', duration: 800, delay: 3200 } },
        ],
      },
      {
        narration: `Let's visualize how functions behave on a coordinate system.`,
        elements: [
          { id: 'heading', type: 'text', props: { text: 'Function Visualization', x: cx, y: 70 }, style: { fillColor: '#ece6e2', fontSize: 28 }, animation: { type: 'fadeIn', duration: 800, delay: 0 } },
          { id: 'grid', type: 'grid', props: { originX: cx, originY: 360, width: 550, height: 320, spacing: 50 }, style: { strokeColor: '#333333', opacity: 0.3 }, animation: { type: 'fadeIn', duration: 400, delay: 300 } },
          { id: 'xAxis', type: 'arrow', props: { x1: 100, y1: 360, x2: 700, y2: 360 }, style: { strokeColor: '#666', strokeWidth: 2 }, animation: { type: 'draw', duration: 600, delay: 500 } },
          { id: 'yAxis', type: 'arrow', props: { x1: cx, y1: 520, x2: cx, y2: 180 }, style: { strokeColor: '#666', strokeWidth: 2 }, animation: { type: 'draw', duration: 600, delay: 700 } },
          { id: 'graph', type: 'graph', props: { fn: 'sin(x)', xMin: -6, xMax: 6, xScale: 45, yScale: 70, originX: cx, originY: 360 }, style: { strokeColor: '#58c4dd', strokeWidth: 3 }, animation: { type: 'draw', duration: 2500, delay: 1000 } },
          { id: 'label', type: 'equation', props: { equation: 'f(x) = sin(x)', x: cx, y: 140 }, style: { fillColor: '#58c4dd', fontSize: 28 }, animation: { type: 'fadeIn', duration: 800, delay: 3200 } },
          { id: 'xLabel', type: 'text', props: { text: 'x', x: 720, y: 360 }, style: { fillColor: '#888', fontSize: 18 }, animation: { type: 'fadeIn', duration: 400, delay: 3500 } },
          { id: 'yLabel', type: 'text', props: { text: 'y', x: cx, y: 160 }, style: { fillColor: '#888', fontSize: 18 }, animation: { type: 'fadeIn', duration: 400, delay: 3700 } },
        ],
      },
      {
        narration: `The Pythagorean theorem shows a beautiful relationship in right triangles.`,
        elements: [
          { id: 'heading', type: 'text', props: { text: 'Pythagorean Theorem', x: cx, y: 70 }, style: { fillColor: '#ece6e2', fontSize: 28 }, animation: { type: 'fadeIn', duration: 800, delay: 0 } },
          { id: 'equation', type: 'equation', props: { equation: 'a² + b² = c²', x: cx, y: 150 }, style: { fillColor: '#58c4dd', fontSize: 42 }, animation: { type: 'fadeIn', duration: 1200, delay: 500 } },
          { id: 'triangle', type: 'shape', props: { points: [{ x: 200, y: 480 }, { x: 500, y: 480 }, { x: 200, y: 260 }] }, style: { strokeColor: '#5cd0b3', strokeWidth: 3 }, animation: { type: 'draw', duration: 1500, delay: 1400 } },
          { id: 'rightAngle', type: 'rect', props: { x: 220, y: 460, width: 20, height: 20, cornerRadius: 0 }, style: { strokeColor: '#ffff00', fillColor: 'transparent', strokeWidth: 2 }, animation: { type: 'fadeIn', duration: 400, delay: 2600 } },
          { id: 'labelA', type: 'text', props: { text: 'a', x: 180, y: 370 }, style: { fillColor: '#fc6255', fontSize: 24 }, animation: { type: 'fadeIn', duration: 500, delay: 2900 } },
          { id: 'labelB', type: 'text', props: { text: 'b', x: 350, y: 510 }, style: { fillColor: '#e1a158', fontSize: 24 }, animation: { type: 'fadeIn', duration: 500, delay: 3200 } },
          { id: 'labelC', type: 'text', props: { text: 'c', x: 380, y: 350 }, style: { fillColor: '#9a72ac', fontSize: 24 }, animation: { type: 'fadeIn', duration: 500, delay: 3500 } },
          { id: 'hypotenuse', type: 'text', props: { text: '(hypotenuse)', x: 480, y: 350 }, style: { fillColor: '#888', fontSize: 14 }, animation: { type: 'fadeIn', duration: 400, delay: 3800 } },
        ],
      },
      {
        narration: `Euler's identity connects five fundamental mathematical constants in one elegant equation.`,
        elements: [
          { id: 'heading', type: 'text', props: { text: "Euler's Identity", x: cx, y: 70 }, style: { fillColor: '#ece6e2', fontSize: 28 }, animation: { type: 'fadeIn', duration: 800, delay: 0 } },
          { id: 'equation', type: 'equation', props: { equation: 'e^(iπ) + 1 = 0', x: cx, y: 200 }, style: { fillColor: '#58c4dd', fontSize: 56 }, animation: { type: 'fadeIn', duration: 2000, delay: 600 } },
          { id: 'e', type: 'text', props: { text: 'e ≈ 2.718', x: 180, y: 340 }, style: { fillColor: '#5cd0b3', fontSize: 18 }, animation: { type: 'fadeIn', duration: 600, delay: 2200 } },
          { id: 'i', type: 'text', props: { text: 'i = √(-1)', x: 340, y: 340 }, style: { fillColor: '#fc6255', fontSize: 18 }, animation: { type: 'fadeIn', duration: 600, delay: 2600 } },
          { id: 'pi', type: 'text', props: { text: 'π ≈ 3.14159', x: 500, y: 340 }, style: { fillColor: '#e1a158', fontSize: 18 }, animation: { type: 'fadeIn', duration: 600, delay: 3000 } },
          { id: 'one', type: 'text', props: { text: '1 (unity)', x: 620, y: 340 }, style: { fillColor: '#9a72ac', fontSize: 18 }, animation: { type: 'fadeIn', duration: 600, delay: 3400 } },
          { id: 'zero', type: 'text', props: { text: '0 (additive identity)', x: cx, y: 400 }, style: { fillColor: '#ffff00', fontSize: 18 }, animation: { type: 'fadeIn', duration: 600, delay: 3800 } },
          { id: 'note', type: 'text', props: { text: '"The most beautiful equation"', x: cx, y: 500 }, style: { fillColor: '#888', fontSize: 20 }, animation: { type: 'fadeIn', duration: 800, delay: 4200 } },
        ],
      },
      {
        narration: `Vectors help us represent quantities that have both magnitude and direction.`,
        elements: [
          { id: 'heading', type: 'text', props: { text: 'Vector Addition', x: cx, y: 70 }, style: { fillColor: '#ece6e2', fontSize: 28 }, animation: { type: 'fadeIn', duration: 800, delay: 0 } },
          { id: 'grid', type: 'grid', props: { originX: cx, originY: 350, width: 500, height: 300, spacing: 50 }, style: { strokeColor: '#333333', opacity: 0.2 }, animation: { type: 'fadeIn', duration: 400, delay: 300 } },
          { id: 'origin', type: 'circle', props: { x: 250, y: 400, radius: 6 }, style: { fillColor: '#ece6e2', strokeColor: '#ece6e2', strokeWidth: 1 }, animation: { type: 'scale', duration: 400, delay: 500 } },
          { id: 'vectorA', type: 'arrow', props: { x1: 250, y1: 400, x2: 450, y2: 300 }, style: { strokeColor: '#58c4dd', strokeWidth: 4 }, animation: { type: 'draw', duration: 1000, delay: 800 } },
          { id: 'labelA', type: 'text', props: { text: 'A', x: 360, y: 330 }, style: { fillColor: '#58c4dd', fontSize: 20 }, animation: { type: 'fadeIn', duration: 400, delay: 1500 } },
          { id: 'vectorB', type: 'arrow', props: { x1: 450, y1: 300, x2: 550, y2: 450 }, style: { strokeColor: '#5cd0b3', strokeWidth: 4 }, animation: { type: 'draw', duration: 1000, delay: 1800 } },
          { id: 'labelB', type: 'text', props: { text: 'B', x: 520, y: 360 }, style: { fillColor: '#5cd0b3', fontSize: 20 }, animation: { type: 'fadeIn', duration: 400, delay: 2500 } },
          { id: 'vectorR', type: 'arrow', props: { x1: 250, y1: 400, x2: 550, y2: 450 }, style: { strokeColor: '#fc6255', strokeWidth: 4 }, animation: { type: 'draw', duration: 1200, delay: 2800 } },
          { id: 'labelR', type: 'text', props: { text: 'A + B', x: 420, y: 450 }, style: { fillColor: '#fc6255', fontSize: 20 }, animation: { type: 'fadeIn', duration: 400, delay: 3800 } },
          { id: 'equation', type: 'equation', props: { equation: 'R = A + B', x: cx, y: 540 }, style: { fillColor: '#e1a158', fontSize: 24 }, animation: { type: 'fadeIn', duration: 800, delay: 4200 } },
        ],
      },
      {
        narration: `Algorithms are step-by-step procedures for solving computational problems.`,
        elements: [
          { id: 'heading', type: 'text', props: { text: 'Algorithm Flow', x: cx, y: 70 }, style: { fillColor: '#ece6e2', fontSize: 28 }, animation: { type: 'fadeIn', duration: 800, delay: 0 } },
          { id: 'start', type: 'flowbox', props: { x: cx, y: 150, width: 100, height: 40, label: 'Start', type: 'rect' }, style: { fillColor: 'rgba(92,208,179,0.2)', strokeColor: '#5cd0b3', textColor: '#ece6e2' }, animation: { type: 'scale', duration: 600, delay: 400 } },
          { id: 'arrow1', type: 'arrow', props: { x1: cx, y1: 170, x2: cx, y2: 210 }, style: { strokeColor: '#888', strokeWidth: 2 }, animation: { type: 'draw', duration: 400, delay: 800 } },
          { id: 'input', type: 'flowbox', props: { x: cx, y: 250, width: 120, height: 40, label: 'Input Data', type: 'rect' }, style: { fillColor: 'rgba(88,196,221,0.2)', strokeColor: '#58c4dd', textColor: '#ece6e2' }, animation: { type: 'scale', duration: 600, delay: 1000 } },
          { id: 'arrow2', type: 'arrow', props: { x1: cx, y1: 270, x2: cx, y2: 310 }, style: { strokeColor: '#888', strokeWidth: 2 }, animation: { type: 'draw', duration: 400, delay: 1400 } },
          { id: 'process', type: 'flowbox', props: { x: cx, y: 350, width: 140, height: 40, label: 'Process', type: 'rect' }, style: { fillColor: 'rgba(225,161,88,0.2)', strokeColor: '#e1a158', textColor: '#ece6e2' }, animation: { type: 'scale', duration: 600, delay: 1600 } },
          { id: 'arrow3', type: 'arrow', props: { x1: cx, y1: 370, x2: cx, y2: 410 }, style: { strokeColor: '#888', strokeWidth: 2 }, animation: { type: 'draw', duration: 400, delay: 2000 } },
          { id: 'decision', type: 'flowbox', props: { x: cx, y: 450, width: 120, height: 40, label: 'Condition?', type: 'rect' }, style: { fillColor: 'rgba(252,98,85,0.2)', strokeColor: '#fc6255', textColor: '#ece6e2' }, animation: { type: 'scale', duration: 600, delay: 2200 } },
          { id: 'arrow4a', type: 'arrow', props: { x1: 460, y1: 450, x2: 580, y2: 450 }, style: { strokeColor: '#5cd0b3', strokeWidth: 2 }, animation: { type: 'draw', duration: 400, delay: 2600 } },
          { id: 'yes', type: 'text', props: { text: 'Yes', x: 520, y: 435 }, style: { fillColor: '#5cd0b3', fontSize: 14 }, animation: { type: 'fadeIn', duration: 300, delay: 2800 } },
          { id: 'output', type: 'flowbox', props: { x: 640, y: 450, width: 100, height: 40, label: 'Output', type: 'rect' }, style: { fillColor: 'rgba(154,114,172,0.2)', strokeColor: '#9a72ac', textColor: '#ece6e2' }, animation: { type: 'scale', duration: 600, delay: 3000 } },
          { id: 'arrow4b', type: 'arrow', props: { x1: 340, y1: 450, x2: 220, y2: 350 }, style: { strokeColor: '#fc6255', strokeWidth: 2 }, animation: { type: 'draw', duration: 400, delay: 3400 } },
          { id: 'no', type: 'text', props: { text: 'No', x: 260, y: 400 }, style: { fillColor: '#fc6255', fontSize: 14 }, animation: { type: 'fadeIn', duration: 300, delay: 3600 } },
        ],
      },
    ];
  }

  const scenes = [];
  for (let i = 0; i < sceneCount; i++) {
    const template = sceneTemplates[i % sceneTemplates.length];
    scenes.push({
      id: `scene-${i + 1}`,
      duration: sceneDuration,
      narration: template.narration,
      background: '#1c1c1c',
      elements: template.elements.map(el => ({ ...el, id: `${el.id}-${i}` })),
    });
  }

  return {
    title,
    totalDuration: sceneCount * sceneDuration,
    scenes,
  };
}

// Filter out domain-inappropriate elements based on topic
function filterDomainElements(script: { title: string; totalDuration: number; scenes: { id: string; duration: number; narration: string; background: string; elements: { id: string; type: string; props: Record<string, unknown>; style?: Record<string, unknown>; animation?: { type: string; duration: number; delay: number } }[] }[] }, title: string): typeof script {
  const titleLower = title.toLowerCase();

  // Detect topic domain
  const isChemistry = /chem|atom|molecule|bond|reaction|element|compound|ion|acid|base|electron|proton|periodic/.test(titleLower);
  const isBiology = /bio|cell|dna|rna|protein|gene|organism|evolution|photosynthesis|mitosis|enzyme|anatomy|organ/.test(titleLower);
  const isMathPhysicsCS = /math|calculus|algebra|geometry|physics|mechanics|quantum|relativity|computer|algorithm|data structure|programming|code|software|binary|sort|search|graph theory|complexity|neural network|machine learning(?!.*bio)/.test(titleLower);

  // Elements that are chemistry/biology specific
  const chemBioElements = ['atom', 'molecule', 'bond', 'dna', 'reactionArrow'];
  // Elements specific to biology only
  const bioOnlyElements = ['dna'];
  // Elements specific to chemistry only  
  const chemOnlyElements = ['atom', 'molecule', 'bond', 'reactionArrow'];

  for (const scene of script.scenes) {
    // Filter based on domain
    if (isMathPhysicsCS && !isChemistry && !isBiology) {
      // Math/Physics/CS - remove ALL chemistry and biology specific elements
      scene.elements = scene.elements.filter(el => !chemBioElements.includes(el.type));
    } else if (isChemistry && !isBiology) {
      // Chemistry - remove biology-only elements
      scene.elements = scene.elements.filter(el => !bioOnlyElements.includes(el.type));
    } else if (isBiology && !isChemistry) {
      // Biology - remove chemistry-only elements
      scene.elements = scene.elements.filter(el => !chemOnlyElements.includes(el.type));
    }
    // If mixed or unclear, allow all elements
  }

  return script;
}

// Fix overlapping text elements by adjusting positions
interface ElementProps {
  x?: number;
  y?: number;
  text?: string;
  equation?: string;
  [key: string]: unknown;
}

interface LectureElement {
  id: string;
  type: string;
  props: ElementProps;
  style?: Record<string, unknown>;
  animation?: { type: string; duration: number; delay: number };
}

interface LectureScene {
  id: string;
  duration: number;
  narration: string;
  background: string;
  elements: LectureElement[];
}

interface LectureScript {
  title: string;
  totalDuration: number;
  scenes: LectureScene[];
}

function fixOverlappingElements(script: LectureScript): LectureScript {
  const MIN_VERTICAL_SPACING = 60;
  const MIN_HORIZONTAL_SPACING = 100;

  for (const scene of script.scenes) {
    // Get all text-like elements (text, equation)
    const textElements = scene.elements.filter(
      el => el.type === 'text' || el.type === 'equation'
    );

    // Sort by y position
    textElements.sort((a, b) => {
      const aY = (a.props?.y as number) || 0;
      const bY = (b.props?.y as number) || 0;
      return aY - bY;
    });

    // Check for vertical overlaps and adjust
    for (let i = 1; i < textElements.length; i++) {
      const prev = textElements[i - 1];
      const curr = textElements[i];

      const prevY = (prev.props?.y as number) || 0;
      const currY = (curr.props?.y as number) || 0;
      const prevX = (prev.props?.x as number) || 400;
      const currX = (curr.props?.x as number) || 400;

      // If elements are close horizontally (within 200px), check vertical spacing
      if (Math.abs(prevX - currX) < 200) {
        const verticalGap = currY - prevY;

        if (verticalGap < MIN_VERTICAL_SPACING) {
          // Move current element down to create proper spacing
          const adjustment = MIN_VERTICAL_SPACING - verticalGap;
          curr.props.y = currY + adjustment;

          // Clamp to canvas bounds (600 height)
          if ((curr.props.y as number) > 550) {
            // If we're pushing too low, try moving horizontally instead
            curr.props.y = currY;
            if (currX <= 400) {
              curr.props.x = Math.max(100, currX - MIN_HORIZONTAL_SPACING);
            } else {
              curr.props.x = Math.min(700, currX + MIN_HORIZONTAL_SPACING);
            }
          }
        }
      }
    }

    // Second pass: check all pairs for close positions
    for (let i = 0; i < textElements.length; i++) {
      for (let j = i + 1; j < textElements.length; j++) {
        const a = textElements[i];
        const b = textElements[j];

        const aX = (a.props?.x as number) || 400;
        const aY = (a.props?.y as number) || 300;
        const bX = (b.props?.x as number) || 400;
        const bY = (b.props?.y as number) || 300;

        const dx = Math.abs(aX - bX);
        const dy = Math.abs(aY - bY);

        // If both very close, adjust the one that comes later
        if (dx < 80 && dy < 40) {
          // They're overlapping - move b
          if (bY < 300) {
            b.props.y = bY - 50; // Move up
          } else {
            b.props.y = bY + 50; // Move down
          }

          // Clamp to canvas
          if ((b.props.y as number) < 50) b.props.y = 50;
          if ((b.props.y as number) > 550) b.props.y = 550;
        }
      }
    }
  }

  return script;
}
