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
  "elements": [5-8 elements]
}

ELEMENT TYPES (position x:100-700, y:80-520 to stay on screen):

1. TEXT: {"id":"t1","type":"text","props":{"text":"Hello World","x":400,"y":100},"style":{"fillColor":"#ece6e2","fontSize":36},"animation":{"type":"fadeIn","duration":800,"delay":0}}

2. EQUATION (use SIMPLE notation - Unicode preferred):
   GOOD: "a² + b² = c²", "E = mc²", "πr²", "θ = 45°", "∫f(x)dx", "Σn", "√2", "∞"
   BAD: Complex LaTeX like "\\frac{}", "\\begin{matrix}"
   {"id":"eq1","type":"equation","props":{"equation":"a² + b² = c²","x":400,"y":200},"style":{"fillColor":"#58c4dd","fontSize":42,"glow":true,"glowColor":"#58c4dd"},"animation":{"type":"fadeIn","duration":1000,"delay":500}}

3. CIRCLE: {"id":"c1","type":"circle","props":{"x":400,"y":300,"radius":80},"style":{"strokeColor":"#5cd0b3","strokeWidth":3,"glow":true},"animation":{"type":"draw","duration":1200,"delay":200}}

4. LINE: {"id":"l1","type":"line","props":{"x1":200,"y1":300,"x2":600,"y2":300},"style":{"strokeColor":"#888888","strokeWidth":2},"animation":{"type":"draw","duration":600,"delay":0}}

5. ARROW: {"id":"a1","type":"arrow","props":{"x1":400,"y1":400,"x2":550,"y2":250},"style":{"strokeColor":"#fc6255","strokeWidth":3},"animation":{"type":"draw","duration":800,"delay":400}}

6. GRAPH: {"id":"g1","type":"graph","props":{"fn":"sin(x)","xMin":-6,"xMax":6,"xScale":40,"yScale":40,"originX":400,"originY":350},"style":{"strokeColor":"#58c4dd","strokeWidth":3,"glow":true},"animation":{"type":"draw","duration":2000,"delay":600}}

7. SHAPE (polygon): {"id":"s1","type":"shape","props":{"points":[{"x":300,"y":400},{"x":500,"y":400},{"x":400,"y":200}]},"style":{"strokeColor":"#ffff00","strokeWidth":2,"fillColor":"rgba(255,255,0,0.1)"},"animation":{"type":"draw","duration":1200,"delay":300}}

8. GRID: {"id":"grid1","type":"grid","props":{"originX":400,"originY":300,"width":500,"height":350,"spacing":50},"style":{"strokeColor":"#444444","opacity":0.4},"animation":{"type":"fadeIn","duration":600,"delay":0}}

9. NUMBER: {"id":"n1","type":"number","props":{"value":3.14159,"x":400,"y":250,"decimals":2},"style":{"fillColor":"#ffff00","fontSize":48},"animation":{"type":"fadeIn","duration":1500,"delay":800}}

COLORS: #58c4dd (blue), #5cd0b3 (teal), #83c167 (green), #ffff00 (yellow), #e1a158 (gold), #fc6255 (red), #9a72ac (purple), #ece6e2 (white), #888888 (gray)

ANIMATION TYPES: fadeIn, fadeOut, draw (for lines/shapes/circles), typewriter (for text), scale

REQUIREMENTS:
- Generate EXACTLY ${sceneCount} scenes
- Keep equations SIMPLE using Unicode: ², ³, π, θ, α, β, γ, λ, σ, Σ, ∫, √, ∞, ≈, ≠, ≤, ≥, →, ×, ÷, ±
- Position elements to stay ON SCREEN (x: 100-700, y: 80-520)
- Stagger animation delays within each scene
- Build visual complexity gradually across scenes

Start with title scene, then explain concepts step by step with visuals.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON
    let lectureScript;
    try {
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
      else if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
      if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);
      lectureScript = JSON.parse(cleanText.trim());

      // Ensure we have scenes
      if (!lectureScript.scenes || lectureScript.scenes.length < 2) {
        lectureScript = createFallbackLecture(title, sceneCount, sceneDuration);
      }
    } catch {
      console.error('Failed to parse Gemini response:', text.substring(0, 500));
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
  const cx = 400,
    cy = 300;

  const sceneTemplates = [
    // Title scene
    {
      narration: `Welcome to our exploration of ${title}. This is going to be a fascinating journey into mathematics.`,
      elements: [
        {
          id: 'title',
          type: 'text',
          props: { text: title, x: cx, y: 180 },
          style: {
            fillColor: '#ece6e2',
            fontSize: 42,
            glow: true,
            glowColor: '#58c4dd',
          },
          animation: { type: 'fadeIn', duration: 1500, delay: 0 },
        },
        {
          id: 'subtitle',
          type: 'text',
          props: { text: 'A Visual Journey', x: cx, y: 250 },
          style: { fillColor: '#888888', fontSize: 24 },
          animation: { type: 'fadeIn', duration: 1000, delay: 800 },
        },
        {
          id: 'circle1',
          type: 'circle',
          props: { x: 200, y: 400, radius: 40 },
          style: { strokeColor: '#58c4dd', strokeWidth: 2, glow: true },
          animation: { type: 'draw', duration: 1000, delay: 1500 },
        },
        {
          id: 'circle2',
          type: 'circle',
          props: { x: 600, y: 400, radius: 40 },
          style: { strokeColor: '#5cd0b3', strokeWidth: 2, glow: true },
          animation: { type: 'draw', duration: 1000, delay: 1800 },
        },
        {
          id: 'line1',
          type: 'line',
          props: { x1: 240, y1: 400, x2: 560, y2: 400 },
          style: { strokeColor: '#e1a158', strokeWidth: 2 },
          animation: { type: 'draw', duration: 800, delay: 2200 },
        },
      ],
    },
    // Coordinate system
    {
      narration: `Let's set up our coordinate system. This grid will help us visualize the mathematical relationships.`,
      elements: [
        {
          id: 'grid',
          type: 'grid',
          props: {
            originX: cx,
            originY: cy,
            width: 500,
            height: 350,
            spacing: 50,
          },
          style: { strokeColor: '#444444', opacity: 0.4 },
          animation: { type: 'fadeIn', duration: 800, delay: 0 },
        },
        {
          id: 'xaxis',
          type: 'arrow',
          props: { x1: 120, y1: cy, x2: 680, y2: cy },
          style: { strokeColor: '#888888', strokeWidth: 2 },
          animation: { type: 'draw', duration: 600, delay: 400 },
        },
        {
          id: 'yaxis',
          type: 'arrow',
          props: { x1: cx, y1: 480, x2: cx, y2: 120 },
          style: { strokeColor: '#888888', strokeWidth: 2 },
          animation: { type: 'draw', duration: 600, delay: 600 },
        },
        {
          id: 'xlabel',
          type: 'text',
          props: { text: 'x', x: 700, y: cy },
          style: { fillColor: '#ece6e2', fontSize: 20 },
          animation: { type: 'fadeIn', duration: 400, delay: 1000 },
        },
        {
          id: 'ylabel',
          type: 'text',
          props: { text: 'y', x: cx + 20, y: 110 },
          style: { fillColor: '#ece6e2', fontSize: 20 },
          animation: { type: 'fadeIn', duration: 400, delay: 1100 },
        },
      ],
    },
    // Graph scene
    {
      narration: `Watch as we draw this elegant curve. Notice how smoothly it flows across the coordinate plane.`,
      elements: [
        {
          id: 'axes-x',
          type: 'arrow',
          props: { x1: 120, y1: cy, x2: 680, y2: cy },
          style: { strokeColor: '#888888', strokeWidth: 2 },
          animation: { type: 'draw', duration: 500, delay: 0 },
        },
        {
          id: 'axes-y',
          type: 'arrow',
          props: { x1: cx, y1: 480, x2: cx, y2: 120 },
          style: { strokeColor: '#888888', strokeWidth: 2 },
          animation: { type: 'draw', duration: 500, delay: 200 },
        },
        {
          id: 'graph',
          type: 'graph',
          props: {
            fn: 'sin(x)*2',
            xMin: -6,
            xMax: 6,
            xScale: 40,
            yScale: 50,
            originX: cx,
            originY: cy,
          },
          style: {
            strokeColor: '#58c4dd',
            strokeWidth: 3,
            glow: true,
            glowColor: '#58c4dd',
          },
          animation: { type: 'draw', duration: 2500, delay: 700 },
        },
        {
          id: 'eq',
          type: 'equation',
          props: { equation: 'f(x) = sin(x)', x: cx, y: 100 },
          style: {
            fillColor: '#ece6e2',
            fontSize: 32,
            glow: true,
            glowColor: '#58c4dd',
          },
          animation: { type: 'fadeIn', duration: 1000, delay: 2500 },
        },
      ],
    },
    // Pythagorean theorem
    {
      narration: `The Pythagorean theorem shows us a beautiful relationship. In any right triangle, the sum of squared legs equals the hypotenuse squared.`,
      elements: [
        {
          id: 'triangle',
          type: 'shape',
          props: {
            points: [
              { x: 250, y: 420 },
              { x: 550, y: 420 },
              { x: 250, y: 180 },
            ],
          },
          style: {
            strokeColor: '#5cd0b3',
            strokeWidth: 3,
            fillColor: 'rgba(92,208,179,0.1)',
          },
          animation: { type: 'draw', duration: 1500, delay: 0 },
        },
        {
          id: 'labela',
          type: 'text',
          props: { text: 'a', x: 235, y: 300 },
          style: { fillColor: '#58c4dd', fontSize: 28 },
          animation: { type: 'fadeIn', duration: 500, delay: 1600 },
        },
        {
          id: 'labelb',
          type: 'text',
          props: { text: 'b', x: 400, y: 440 },
          style: { fillColor: '#5cd0b3', fontSize: 28 },
          animation: { type: 'fadeIn', duration: 500, delay: 1800 },
        },
        {
          id: 'labelc',
          type: 'text',
          props: { text: 'c', x: 420, y: 280 },
          style: { fillColor: '#ffff00', fontSize: 28 },
          animation: { type: 'fadeIn', duration: 500, delay: 2000 },
        },
        {
          id: 'equation',
          type: 'equation',
          props: { equation: 'a² + b² = c²', x: cx, y: 100 },
          style: {
            fillColor: '#ece6e2',
            fontSize: 40,
            glow: true,
            glowColor: '#ffff00',
          },
          animation: { type: 'fadeIn', duration: 1200, delay: 2400 },
        },
      ],
    },
    // Unit circle
    {
      narration: `The unit circle is fundamental to trigonometry. Every point on this circle represents a unique angle and its coordinates reveal sine and cosine.`,
      elements: [
        {
          id: 'axes-x',
          type: 'arrow',
          props: { x1: 180, y1: cy, x2: 620, y2: cy },
          style: { strokeColor: '#888888', strokeWidth: 2 },
          animation: { type: 'draw', duration: 500, delay: 0 },
        },
        {
          id: 'axes-y',
          type: 'arrow',
          props: { x1: cx, y1: 480, x2: cx, y2: 120 },
          style: { strokeColor: '#888888', strokeWidth: 2 },
          animation: { type: 'draw', duration: 500, delay: 200 },
        },
        {
          id: 'circle',
          type: 'circle',
          props: { x: cx, y: cy, radius: 150 },
          style: {
            strokeColor: '#58c4dd',
            strokeWidth: 3,
            glow: true,
            glowColor: '#58c4dd',
          },
          animation: { type: 'draw', duration: 1800, delay: 500 },
        },
        {
          id: 'radius',
          type: 'arrow',
          props: { x1: cx, y1: cy, x2: cx + 106, y2: cy - 106 },
          style: { strokeColor: '#ffff00', strokeWidth: 3 },
          animation: { type: 'draw', duration: 800, delay: 2400 },
        },
        {
          id: 'angle',
          type: 'text',
          props: { text: 'θ', x: cx + 35, y: cy - 15 },
          style: { fillColor: '#e1a158', fontSize: 24 },
          animation: { type: 'fadeIn', duration: 500, delay: 3000 },
        },
        {
          id: 'eq',
          type: 'equation',
          props: { equation: 'x = cos(θ), y = sin(θ)', x: cx, y: 100 },
          style: { fillColor: '#ece6e2', fontSize: 28, glow: true },
          animation: { type: 'fadeIn', duration: 1000, delay: 3300 },
        },
      ],
    },
    // Euler's identity
    {
      narration: `And here's Euler's identity - often called the most beautiful equation in mathematics. It connects five fundamental constants.`,
      elements: [
        {
          id: 'eq',
          type: 'equation',
          props: { equation: 'e^(iπ) + 1 = 0', x: cx, y: 200 },
          style: {
            fillColor: '#ece6e2',
            fontSize: 52,
            glow: true,
            glowColor: '#58c4dd',
          },
          animation: { type: 'fadeIn', duration: 1500, delay: 0 },
        },
        {
          id: 'e',
          type: 'text',
          props: { text: "e = Euler's number", x: 200, y: 350 },
          style: { fillColor: '#58c4dd', fontSize: 18 },
          animation: { type: 'fadeIn', duration: 600, delay: 1800 },
        },
        {
          id: 'i',
          type: 'text',
          props: { text: 'i = imaginary unit', x: 400, y: 350 },
          style: { fillColor: '#5cd0b3', fontSize: 18 },
          animation: { type: 'fadeIn', duration: 600, delay: 2200 },
        },
        {
          id: 'pi',
          type: 'text',
          props: { text: 'π = pi', x: 600, y: 350 },
          style: { fillColor: '#e1a158', fontSize: 18 },
          animation: { type: 'fadeIn', duration: 600, delay: 2600 },
        },
        {
          id: 'one',
          type: 'text',
          props: { text: '1 = unity', x: 300, y: 420 },
          style: { fillColor: '#ffff00', fontSize: 18 },
          animation: { type: 'fadeIn', duration: 600, delay: 3000 },
        },
        {
          id: 'zero',
          type: 'text',
          props: { text: '0 = nothingness', x: 500, y: 420 },
          style: { fillColor: '#fc6255', fontSize: 18 },
          animation: { type: 'fadeIn', duration: 600, delay: 3400 },
        },
      ],
    },
  ];

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
