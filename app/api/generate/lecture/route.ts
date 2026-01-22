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
          { id: 'atom1', type: 'atom', props: { x: 250, y: 350, radius: 45, symbol: 'C', electrons: 4 }, style: { fillColor: '#2a4a6a', strokeColor: '#58c4dd', textColor: '#fff' }, animation: { type: 'scale', duration: 1000, delay: 1000 } },
          { id: 'atom2', type: 'atom', props: { x: 400, y: 350, radius: 45, symbol: 'O', electrons: 6 }, style: { fillColor: '#4a2a2a', strokeColor: '#fc6255', textColor: '#fff' }, animation: { type: 'scale', duration: 1000, delay: 1400 } },
          { id: 'atom3', type: 'atom', props: { x: 550, y: 350, radius: 45, symbol: 'H', electrons: 1 }, style: { fillColor: '#3a4a3a', strokeColor: '#5cd0b3', textColor: '#fff' }, animation: { type: 'scale', duration: 1000, delay: 1800 } },
        ],
      },
      {
        narration: `Atoms bond together to form molecules. The arrangement determines properties.`,
        elements: [
          { id: 'heading', type: 'text', props: { text: 'Molecular Structure', x: cx, y: 100 }, style: { fillColor: '#ece6e2', fontSize: 32 }, animation: { type: 'fadeIn', duration: 800, delay: 0 } },
          { id: 'molecule', type: 'molecule', props: { atoms: [{ x: 280, y: 350, symbol: 'H', color: '#58c4dd' }, { x: 400, y: 350, symbol: 'O', color: '#fc6255' }, { x: 520, y: 350, symbol: 'H', color: '#58c4dd' }], bonds: [{ from: 0, to: 1, type: 1 }, { from: 1, to: 2, type: 1 }] }, style: {}, animation: { type: 'fadeIn', duration: 2000, delay: 400 } },
          { id: 'label', type: 'text', props: { text: 'H2O - Water', x: cx, y: 480 }, style: { fillColor: '#5cd0b3', fontSize: 28 }, animation: { type: 'fadeIn', duration: 800, delay: 2000 } },
        ],
      },
      {
        narration: `Chemical reactions transform reactants into products through bond changes.`,
        elements: [
          { id: 'heading', type: 'text', props: { text: 'Chemical Reaction', x: cx, y: 100 }, style: { fillColor: '#ece6e2', fontSize: 32 }, animation: { type: 'fadeIn', duration: 800, delay: 0 } },
          { id: 'reactant', type: 'text', props: { text: 'Na + Cl', x: 200, y: 350 }, style: { fillColor: '#58c4dd', fontSize: 36 }, animation: { type: 'fadeIn', duration: 800, delay: 400 } },
          { id: 'arrow', type: 'arrow', props: { x1: 300, y1: 350, x2: 500, y2: 350 }, style: { strokeColor: '#ece6e2', strokeWidth: 3 }, animation: { type: 'draw', duration: 1200, delay: 1000 } },
          { id: 'product', type: 'text', props: { text: 'NaCl', x: 600, y: 350 }, style: { fillColor: '#e1a158', fontSize: 42 }, animation: { type: 'fadeIn', duration: 800, delay: 2000 } },
        ],
      },
    ];
  } else if (isBiology) {
    sceneTemplates = [
      {
        narration: `Welcome to our exploration of ${title}. Let's discover the building blocks of life.`,
        elements: [
          { id: 'title', type: 'text', props: { text: title, x: cx, y: 100 }, style: { fillColor: '#ece6e2', fontSize: 36 }, animation: { type: 'fadeIn', duration: 1200, delay: 0 } },
          { id: 'subtitle', type: 'text', props: { text: 'Biology Fundamentals', x: cx, y: 160 }, style: { fillColor: '#5cd0b3', fontSize: 24 }, animation: { type: 'fadeIn', duration: 800, delay: 600 } },
          { id: 'cell', type: 'ellipse', props: { x: cx, y: 380, radiusX: 180, radiusY: 100 }, style: { fillColor: 'rgba(92,208,179,0.15)', strokeColor: '#5cd0b3', strokeWidth: 3 }, animation: { type: 'scale', duration: 1500, delay: 1000 } },
          { id: 'nucleus', type: 'ellipse', props: { x: cx, y: 380, radiusX: 50, radiusY: 35 }, style: { fillColor: 'rgba(88,196,221,0.3)', strokeColor: '#58c4dd', strokeWidth: 2 }, animation: { type: 'scale', duration: 1000, delay: 2000 } },
        ],
      },
      {
        narration: `DNA carries genetic information in its famous double helix structure.`,
        elements: [
          { id: 'heading', type: 'text', props: { text: 'DNA Structure', x: cx, y: 100 }, style: { fillColor: '#ece6e2', fontSize: 32 }, animation: { type: 'fadeIn', duration: 800, delay: 0 } },
          { id: 'dna', type: 'dna', props: { x: cx, y: 350, width: 100, height: 280, turns: 4 }, style: { strokeColor: '#888' }, animation: { type: 'draw', duration: 3000, delay: 500 } },
          { id: 'label', type: 'text', props: { text: 'Double Helix', x: 620, y: 350 }, style: { fillColor: '#fc6255', fontSize: 20 }, animation: { type: 'fadeIn', duration: 600, delay: 2500 } },
        ],
      },
    ];
  } else {
    sceneTemplates = [
      {
        narration: `Welcome to our exploration of ${title}. This is going to be a fascinating journey.`,
        elements: [
          { id: 'title', type: 'text', props: { text: title, x: cx, y: 100 }, style: { fillColor: '#ece6e2', fontSize: 42 }, animation: { type: 'fadeIn', duration: 1500, delay: 0 } },
          { id: 'subtitle', type: 'text', props: { text: 'A Visual Journey', x: cx, y: 170 }, style: { fillColor: '#888888', fontSize: 24 }, animation: { type: 'fadeIn', duration: 1000, delay: 800 } },
          { id: 'circle1', type: 'circle', props: { x: 200, y: 380, radius: 40 }, style: { strokeColor: '#58c4dd', strokeWidth: 2 }, animation: { type: 'draw', duration: 1000, delay: 1500 } },
          { id: 'circle2', type: 'circle', props: { x: 600, y: 380, radius: 40 }, style: { strokeColor: '#5cd0b3', strokeWidth: 2 }, animation: { type: 'draw', duration: 1000, delay: 1800 } },
          { id: 'line1', type: 'line', props: { x1: 240, y1: 380, x2: 560, y2: 380 }, style: { strokeColor: '#e1a158', strokeWidth: 2 }, animation: { type: 'draw', duration: 800, delay: 2200 } },
        ],
      },
      {
        narration: `Let's visualize how functions behave on a coordinate system.`,
        elements: [
          { id: 'heading', type: 'text', props: { text: 'Function Visualization', x: cx, y: 80 }, style: { fillColor: '#ece6e2', fontSize: 28 }, animation: { type: 'fadeIn', duration: 800, delay: 0 } },
          { id: 'grid', type: 'grid', props: { originX: cx, originY: cy + 50, width: 500, height: 300, spacing: 50 }, style: { strokeColor: '#333333', opacity: 0.3 }, animation: { type: 'fadeIn', duration: 400, delay: 200 } },
          { id: 'graph', type: 'graph', props: { fn: 'sin(x)', xMin: -6, xMax: 6, xScale: 40, yScale: 60, originX: cx, originY: cy + 50 }, style: { strokeColor: '#58c4dd', strokeWidth: 3 }, animation: { type: 'draw', duration: 2500, delay: 600 } },
          { id: 'label', type: 'text', props: { text: 'f(x) = sin(x)', x: cx, y: 170 }, style: { fillColor: '#58c4dd', fontSize: 24 }, animation: { type: 'fadeIn', duration: 800, delay: 2800 } },
        ],
      },
      {
        narration: `The Pythagorean theorem shows a beautiful relationship in right triangles.`,
        elements: [
          { id: 'heading', type: 'text', props: { text: 'Pythagorean Theorem', x: cx, y: 80 }, style: { fillColor: '#ece6e2', fontSize: 28 }, animation: { type: 'fadeIn', duration: 800, delay: 0 } },
          { id: 'equation', type: 'equation', props: { equation: 'a² + b² = c²', x: cx, y: 180 }, style: { fillColor: '#58c4dd', fontSize: 48 }, animation: { type: 'fadeIn', duration: 1500, delay: 600 } },
          { id: 'triangle', type: 'shape', props: { points: [{ x: 250, y: 480 }, { x: 550, y: 480 }, { x: 250, y: 280 }] }, style: { strokeColor: '#5cd0b3', strokeWidth: 3 }, animation: { type: 'draw', duration: 1500, delay: 1800 } },
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
