import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available from environment variables
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const detailedPromptTemplate = `
You are a master lyricist specializing in trap/rap-infused songs with a cinematic, atmospheric edge—blending street hustle metaphors with thematic depth, unpredictable market-like chaos, and vivid production cues. Your style draws from artists like Travis Scott, Playboi Carti, and Future, but twisted into conceptual worlds: think 808 slides echoing emotional volatility, chopped & screwed verses for introspection, explosive drops for climactic tension, and ambient fades for lingering mystery.

Core Guidelines for Generation:
Theme Integration: Anchor the song in a single, high-energy concept (e.g., crypto volatility, urban survival, cosmic ambition). Weave metaphors from the theme into every section—personify elements (e.g., "charts as gang signs," "moonshots as rocket launches") to create a narrative arc of rise, risk, and raw grind.
Structure (Mandatory – Mirror this Exactly): Use the provided template below. Each section must include:
Bracketed production notes (e.g., [Intro – Psychedelic haze, glitchy synths]) with sensory details: beats (trap/drill/phonk hybrids), effects (echo, reverb, chops, pitch shifts), SFX (e.g., vinyl crackle, laser whooshes), and vocal styles (auto-tune, layered ad-libs, half-time flows).
Rhyme Scheme: AABB or internal rhymes for verses; repetitive, hooky choruses in drops with escalating ad-libs (e.g., (what? yeah!)).
Length: Verses 8-10 lines; Drops 6-8 lines with repeatable chorus; Keep total song concise yet immersive (under 800 words).

Language & Vibe: Gritty, poetic slang—mix euphoria and dread (e.g., "long on lunacy, short on sane"). Use repetition for hypnosis (e.g., "throwin' gang signs" motif). Build tension: slow builds to frantic drops, then ethereal breakdowns.
Innovation: Remix familiar phrases into fresh hooks. End with a philosophical twist (e.g., "the grind never ends"). Ensure flow reads aloud like a beat drop—rhythmic, punchy.
Adaptability: If a topic is specified, fuse it seamlessly. If pulling from existing lyrics, remix 20-30% of key lines (e.g., adapt "charts throwin' gang signs" to fit new theme) while evolving the rest.

Output Format: Wrap the full song lyrics in a markdown code block (\`\`\`) for clean readability. No intro text—just the song.

Song Structure Template to Follow:
[Intro – [Atmospheric build description]]
[Hook phrase]... (effect: phrase...)
[Hook variation]... (effect: variation...)
[Verse 1 – [Vocal/beat style]]
[8-10 lines of thematic bars]
[Pre-Drop – [Build elements]]
[Indicator phrase]— [Indicator phrase]— [stutter/chop effect]...
[Drop 1 – [Full beat drop description]]
[Chorus lines with ad-libs]
[2-3 more chorus lines]
(Variation ad-lib) [Hook remix]...
[Verse 2 – [Flow variation]]
[8-10 lines, echoing Verse 1 motifs]
[Break – [Stripped-back elements]]
[Hook fragments with chops]...
[Drop 2 – [Beat switch description]]
[Remixed chorus with intensified ad-libs]...
[Verse 3 – [Chopped/screwed variation]]
[Shortened, effected remix of Verse 1 lines]...
[Build – [Rising tension elements]]
[Indicator build with pitch/effects]...
[Drop 3 – [Hybrid peak energy]]
[Escalated chorus with crowd/chant vibes]...
[Bridge – [Beatless/ambient]]
[Echoing hook fragments]...
[Final Drop – [Max layers return]]
[Ultimate chorus remix]...
[Outro – [Fade-out description]]
[Hook fades]...
(Thematic closer)
[SFX fade]

User Input: [{userInput}]. Generate now.
`;

const simpleLyricsPromptTemplate = `
You are a master lyricist. Your task is to generate a complete song based on the user's request.

**User Request:** A song about "{topic}" in the style of {artist} with a structure inspired by {structuralInspiration}.
{remixContext}
{inspirationContext}

**CRITICAL OUTPUT RULES:**
1.  **LYRICS ONLY:** Your entire response must be ONLY the raw song lyrics.
2.  **NO LABELS:** Do NOT include any structural labels like [Verse], [Chorus], [Intro], [Outro], etc.
3.  **NO PRODUCTION NOTES:** Do NOT include any bracketed text like [Tense build-up] or [Beat drops].
4.  **NO HARMONIES/AD-LIBS:** Do not include parenthetical ad-libs or harmonies like (yeah!) or (ooh).
5.  **NO EXTRA TEXT:** Do not add any introductory sentences, titles, or concluding remarks. The output should be clean, pure, copy-paste-ready lyrics.

Generate the song now.
`;

async function callGemini(prompt: string): Promise<string> {
    try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let text = response.text;
    if (!text) {
      throw new Error("The API returned an empty response.");
    }
    
    // Remove markdown code block fences if they exist
    if (text.startsWith('```') && text.endsWith('```')) {
      text = text.substring(3, text.length - 3).trim();
    }
    
    return text.trim();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate lyrics. The model may be unavailable or the request was invalid.");
  }
}

export async function generateLyrics(
  artist: string,
  topic: string,
  structureSource: string,
  existingLyrics?: string,
  inspirationLyrics?: string,
  includeInstructions: boolean = true
): Promise<string> {
  const structuralInspiration = structureSource.trim() !== '' ? structureSource : artist;

  let prompt: string;

  if (includeInstructions) {
    let userInput: string;
    if (existingLyrics) {
      userInput = `Radically remix and reimagine the following song to give it a completely different feel. You can change the perspective, mood, or narrative, but keep the core topic of "${topic}". The new version should be a creative departure, not a simple variation. Maintain the lyrical style of ${artist} and a structure inspired by ${structuralInspiration}. Here are the original lyrics to transform:\n---\n${existingLyrics}\n---`;
    } else {
      let basePrompt = `A song about "${topic}" in the style of ${artist} with a structure inspired by ${structuralInspiration}.`;
      if (inspirationLyrics && inspirationLyrics.trim() !== '') {
          basePrompt += `\n\nDraw inspiration from the themes, mood, and lyrical style of the following lyrics:\n---\n${inspirationLyrics}\n---`;
      }
      userInput = basePrompt;
    }
    prompt = detailedPromptTemplate.replace('{userInput}', userInput);
  } else {
    // Lyrics-only prompt
    let remixContext = '';
    if (existingLyrics) {
      remixContext = `Radically remix and reimagine the following lyrics to give them a completely different feel. Change the perspective, mood, or narrative. Here are the original lyrics to transform:\n---\n${existingLyrics}\n---`;
    }
    
    let inspirationContext = '';
    if (inspirationLyrics && inspirationLyrics.trim() !== '') {
        inspirationContext = `\nDraw inspiration from the following lyrics:\n---\n${inspirationLyrics}\n---`;
    }

    prompt = simpleLyricsPromptTemplate
      .replace('{topic}', topic)
      .replace('{artist}', artist)
      .replace('{structuralInspiration}', structuralInspiration)
      .replace('{remixContext}', remixContext)
      .replace('{inspirationContext}', inspirationContext);
  }

  return callGemini(prompt);
}

const hookRemixDetailedPrompt = `
You are a master DJ and music producer. Your task is to take the following song and create a 5-6 minute extended remix. The remix must heavily focus on the hook/chorus.

**Instructions:**
1.  **Identify the Hook:** First, analyze the provided lyrics and identify the main hook or chorus.
2.  **Extend and Rebuild:** Create a full 5-6 minute song structure around that hook. Use repetition, build-ups, breakdowns, beat switches, and vocal chops of the hook.
3.  **Add New Elements:** Introduce new instrumental sections (like long intros/outros, bridges), and add new, complementary ad-libs that fit the original theme and style.
4.  **Maintain Format:** The final output must follow the detailed structure format with bracketed production cues, ad-libs in parentheses, and wrapped in a markdown code block.

**Original Song Lyrics:**
\`\`\`
{originalLyrics}
\`\`\`

Generate the 5-6 minute extended hook remix now.
`;

const hookRemixSimplePrompt = `
You are a master DJ and music producer. Your task is to take the following song and create a 5-6 minute extended remix of PURE LYRICS.

**Instructions:**
1.  **Identify the Hook:** Analyze the provided lyrics and identify the main hook or chorus.
2.  **Extend and Rebuild:** Create a full 5-6 minute song structure around that hook using lyrical repetition, variations, and new complementary bridges or verses.
3.  **CRITICAL OUTPUT RULES:**
    - **LYRICS ONLY:** Your entire response must be ONLY the raw song lyrics.
    - **NO LABELS:** Do NOT include any structural labels like [Verse], [Chorus], etc.
    - **NO PRODUCTION NOTES:** Do NOT include any bracketed text like [Beat drops].
    - **NO HARMONIES/AD-LIBS:** Do not include parenthetical ad-libs like (yeah!).
    - **NO EXTRA TEXT:** Do not add any introductory sentences, titles, or concluding remarks.

**Original Song Lyrics:**
\`\`\`
{originalLyrics}
\`\`\`

Generate the 5-6 minute extended hook remix now, following all rules strictly.
`;

export async function generateHookRemix(
  originalLyrics: string,
  includeInstructions: boolean = true
): Promise<string> {
  const prompt = includeInstructions
    ? hookRemixDetailedPrompt.replace('{originalLyrics}', originalLyrics)
    : hookRemixSimplePrompt.replace('{originalLyrics}', originalLyrics);

  return callGemini(prompt);
}

const enhanceLyricsPromptTemplate = `
You are a versatile music production AI for any genre (e.g., pop, hip-hop, EDM, folk). Enhance provided lyrics by:

1. **Structure**: Preserve original lines exactly; do NOT add section tags like [Verse 1], [Chorus], or [Bridge]. Insert ONLY inline production instructions in [brackets] after relevant lines or groups for transitions/effects (e.g., [rising synth build] for EDM tension, [acoustic fingerpicking fade-in] for folk intimacy, [808 drop swell] for trap energy). Use sparingly for flow.

2. **Harmonies/Background**: Add background vocals, echoes, or ad-libs in (parentheses) immediately after key phrases (e.g., (oohs fading low) for soulful layers, (echo: yeah! hype) for hip-hop ad-libs, (multi-tracked ahhs swell) for pop builds). Limit to 2-4 words per instance; include genre-fit effects like "reverb tail," "pitch bend," or "crowd echo" for vividness.

3. **Flow**: Infer genre from lyrics if unspecified. Build progressively—subtle starts (whispers, soft layers), escalate to peaks (explosive shouts, full stacks). Optionally end with a single [Outro fade/variation] note if it fits naturally.

**CRITICAL OUTPUT RULES:**
- Your entire response MUST be ONLY the enhanced lyrics.
- Do NOT add any introductory sentences, explanations, titles, or concluding remarks.
- Do NOT change or remove any of the original lyrics. Only add the production cues and background vocals.

Here are the lyrics to enhance:
---
{originalLyrics}
---

Enhance them now.
`;

export async function enhanceLyrics(originalLyrics: string): Promise<string> {
    const prompt = enhanceLyricsPromptTemplate.replace('{originalLyrics}', originalLyrics);
    return callGemini(prompt);
}

const musicStylePromptTemplate = `
You are an expert music producer creating a prompt for a music generation AI like Suno. Based on the provided lyrics and artist style, generate a single-line, comma-separated style prompt.

**CRITICAL RULES:**
1.  The prompt MUST contain these 4 tags in a logical order: Style, Instrument, Vocal Style, and Sound Design.
2.  The entire output must be a single line of text with the tags separated by commas.
3.  Keep each tag description concise (2-4 words).
4.  Do not include the tag names (e.g., "Style: ") in the output.
5.  Do not add any other text, explanations, or formatting.

**Example Output:**
Indie Pop, Rhythmic acoustic guitar, Breathy female vocals, Warm reverb

**Artist Style:** {artist}
**Lyrics:**
---
{lyrics}
---

Generate the music style prompt now.
`;

export async function generateMusicStyle(lyrics: string, artist: string): Promise<string> {
  const prompt = musicStylePromptTemplate
    .replace('{artist}', artist)
    .replace('{lyrics}', lyrics);
  return callGemini(prompt);
}