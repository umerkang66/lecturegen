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

LAYOUT RULES (NO OVERLAPPING):
- Title: y: 80-120
- Equation: y: 180-220
- Visuals: y: 260-520
- Space text elements 50px apart vertically

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

REQUIREMENTS:
1. Generate EXACTLY ${sceneCount} scenes
2. For CHEMISTRY topics: Use atom, molecule, bond, reactionArrow elements
3. For BIOLOGY topics: Use ellipse (cells), rect (organelles), dna, flowbox elements
4. For MATH/PHYSICS: Use equation, graph, shape, arrow elements
5. Space elements properly - NO OVERLAPPING
6. Use Unicode: ², ³, π, θ, α, β, Σ, →

Create visually rich, educational content appropriate for the topic.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON with multiple fallback methods
    let lectureScript;
    try {
      let cleanText = text.trim();

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

      lectureScript = JSON.parse(cleanText);

      // Ensure we have scenes
      if (!lectureScript.scenes || lectureScript.scenes.length < 2) {
        lectureScript = createFallbackLecture(title, sceneCount, sceneDuration);
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response, using fallback. Error:', parseError);
      console.error('Response preview:', text.substring(0, 300));
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
