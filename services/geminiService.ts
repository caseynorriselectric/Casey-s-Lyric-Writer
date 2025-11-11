async function callAI(prompt: string): Promise<string> {
  try {
    const response = await fetch('/.netlify/functions/gemini-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Netlify function failed with status ${response.status}:`, errorBody);
      const errorJson = JSON.parse(errorBody);
      throw new Error(errorJson.error || `Failed to generate lyrics. The server returned an error.`);
    }

    const data = await response.json();
    if (typeof data.text !== 'string') {
      throw new Error("The API returned an invalid response.");
    }
    
    return data.text;
  } catch (error) {
    console.error("Error calling AI API via proxy:", error);
    throw new Error(error instanceof Error ? error.message : "An unknown error occurred while generating lyrics.");
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

  const remixContext = existingLyrics 
    ? `\n- **Task:** Radically remix and reimagine the following song to give it a completely different feel. You can change the perspective, mood, or narrative, but keep the core topic. Here are the original lyrics to transform:\n---\n${existingLyrics}\n---`
    : '';

  const inspirationContext = (inspirationLyrics && inspirationLyrics.trim() !== '')
    ? `\n- **Inspiration:** Draw inspiration from the themes, mood, and lyrical style of the following lyrics:\n---\n${inspirationLyrics}\n---`
    : '';
  
  let prompt: string;

  if (includeInstructions) {
    prompt = `You are a creative songwriter and music producer AI.
Your task is to write a complete song based on the user's request.
The song should include lyrics and production cues in [brackets] to guide the musical arrangement.
The vocal delivery, harmonies, and ad-libs should be noted in (parentheses).

**User Request:**
- **Artist Style:** ${artist}
- **Topic:** ${topic}
- **Structural Inspiration:** ${structuralInspiration}${remixContext}${inspirationContext}

Generate the song now, including clear production cues.`;
  } else {
    prompt = `You are a creative songwriter AI.
Your task is to write the lyrics for a complete song based on the user's request.

**User Request:**
- **Artist Style:** ${artist}
- **Topic:** ${topic}
- **Structural Inspiration:** ${structuralInspiration}${remixContext}${inspirationContext}

**CRITICAL OUTPUT RULES:**
1.  **LYRICS ONLY:** Your entire response must be ONLY the raw song lyrics.
2.  **NO LABELS:** Do NOT include any structural labels like [Verse], [Chorus], [Intro], [Outro], etc.
3.  **NO PRODUCTION NOTES:** Do NOT include any bracketed text.
4.  **NO HARMONIES/AD-LIBS:** Do not include parenthetical text.
5.  **NO EXTRA TEXT:** Do not add any introductory sentences, titles, or concluding remarks.

Generate the lyrics now.`;
  }

  return callAI(prompt);
}

export async function generateHookRemix(
  originalLyrics: string,
  includeInstructions: boolean = true
): Promise<string> {
  let prompt: string;

  if (includeInstructions) {
    prompt = `You are a master DJ and music producer AI.
Your task is to take the following song and create a 5-6 minute extended remix. The remix must heavily focus on the hook/chorus.

**Instructions:**
1.  **Identify the Hook:** First, analyze the provided lyrics and identify the main hook or chorus.
2.  **Extend and Rebuild:** Create a full 5-6 minute song structure around that hook. Use repetition, build-ups, breakdowns, beat switches, and vocal chops of the hook.
3.  **Add New Elements:** Introduce new instrumental sections (like long intros/outros, bridges), and add new, complementary ad-libs that fit the original theme and style.
4.  **Formatting:** Include production cues in [brackets] and ad-libs in (parentheses).

**Original Song Lyrics:**
---
${originalLyrics}
---

Generate the 5-6 minute extended hook remix now.`;
  } else {
    prompt = `You are a master DJ and music producer AI.
Your task is to take the following song and create the lyrics for a 5-6 minute extended remix.

**Instructions:**
1.  **Identify the Hook:** Analyze the provided lyrics and identify the main hook or chorus.
2.  **Extend and Rebuild:** Create a full 5-6 minute song structure around that hook using lyrical repetition, variations, and new complementary bridges or verses.
3.  **CRITICAL OUTPUT RULES:**
    - **LYRICS ONLY:** Your entire response must be ONLY the raw song lyrics.
    - **NO LABELS:** Do NOT include any structural labels like [Verse], [Chorus], etc.
    - **NO PRODUCTION NOTES:** Do NOT include any bracketed text.
    - **NO HARMONIES/AD-LIBS:** Do not include parenthetical ad-libs.
    - **NO EXTRA TEXT:** Do not add any introductory sentences, titles, or concluding remarks.

**Original Song Lyrics:**
---
${originalLyrics}
---

Generate the lyrics for the extended hook remix now.`;
  }

  return callAI(prompt);
}

export async function enhanceLyrics(originalLyrics: string): Promise<string> {
    const prompt = `You are a versatile music production AI. Your task is to enhance the provided lyrics with production cues and vocal suggestions without altering the original lyrics.

1. **Structure**: Preserve the original lyrics exactly. Do NOT add section tags like [Verse 1], [Chorus], or [Bridge]. Insert ONLY inline production instructions in [brackets] after relevant lines to suggest instrumental transitions or effects (e.g., [rising synth build], [acoustic guitar enters softly], [808 drops]). Use these sparingly to enhance the song's flow.

2. **Harmonies/Background**: Strategically add background vocals, echoes, or ad-libs in (parentheses) to add musicality. **Do not add them to every line.** Focus on placement where it serves the song best, such as emphasizing a key phrase or building energy. Examples: (oohs fading), (echo: go!), (harmony swells).

3. **Flow**: Infer the genre from the lyrics and tailor your suggestions accordingly.

**CRITICAL OUTPUT RULES:**
- Your entire response MUST be ONLY the enhanced lyrics.
- Do NOT add any introductory sentences, explanations, titles, or concluding remarks.
- Do NOT change or remove any of the original lyrics. Only add the production cues and background vocals.

Here are the lyrics to enhance:
---
${originalLyrics}
---

Enhance them now.`;
    return callAI(prompt);
}

export async function generateMusicStyle(lyrics: string, artist: string): Promise<string> {
  const prompt = `You are an expert music producer AI. Based on the provided lyrics and artist style, generate a single-line, comma-separated style prompt suitable for a music generation AI like Suno or Udio.

**CRITICAL RULES:**
1.  The prompt should be a comma-separated list of tags describing the genre, mood, instrumentation, and vocal style.
2.  The entire output must be a single line of text.
3.  Do not add any other text, explanations, or formatting.

**Example Output:**
Indie Pop, Rhythmic acoustic guitar, Warm reverb, Male vocals

**Artist Style:** ${artist}
**Lyrics:**
---
${lyrics}
---

Generate the music style prompt now.`;
  return callAI(prompt);
}