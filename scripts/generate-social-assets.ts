import fs from 'fs';
import path from 'path';

/**
 * Automated Social & Distribution Asset Generator for ApexTools (apextools.app)
 * Produces ready-to-use viral short-form video scripts, Reddit/Quora answer templates,
 * and pre-formatted directory submissions for 15+ software aggregators.
 */

const VIRAL_VIDEO_SCRIPTS = [
  {
    title: 'Angle 1: The "Illegal Website" Tech Hook (Image & Media Tools)',
    targetPlatforms: ['TikTok', 'YouTube Shorts', 'Instagram Reels'],
    targetAudience: 'iPhone users, photographers, students, designers',
    duration: '35 seconds',
    visualStoryboard: [
      { time: '0:00 - 0:03', visual: 'Face to camera with text overlay: "Secret website that feels illegal to know"', audio: 'If you use an iPhone or Windows PC, stop scrolling right now.' },
      { time: '0:04 - 0:10', visual: 'Screen record opening a folder full of .HEIC photos that won\'t open on Windows PC', audio: 'You know that annoying moment when iPhone photos save as .HEIC and your PC refuses to open them?' },
      { time: '0:11 - 0:20', visual: 'Navigate to apextools.app/convert/image/heic-to-jpg and drag 20 photos into the dropzone. Instant conversion occurs.', audio: 'Go to apextools.app. It lets you batch convert all your HEIC photos to high-quality JPG in 2 seconds with zero software to install.' },
      { time: '0:21 - 0:30', visual: 'Show the audio trimmer and video converter tabs', audio: 'Plus it has a built-in audio studio, PDF tools, and video converter with zero watermarks.' },
      { time: '0:31 - 0:35', visual: 'Show the bookmark star on browser', audio: 'Bookmark apextools.app right now because you will need this tomorrow.' },
    ],
  },
  {
    title: 'Angle 2: Stop Paying Adobe $50/mo (Productivity & Freelance Hack)',
    targetPlatforms: ['TikTok', 'YouTube Shorts', 'LinkedIn Video'],
    targetAudience: 'Freelancers, remote workers, students',
    duration: '30 seconds',
    visualStoryboard: [
      { time: '0:00 - 0:04', visual: 'Screen showing Adobe $54.99/mo subscription screen crossed out in red', audio: 'Stop paying fifty dollars a month just to trim audio, compress PDFs, or convert videos.' },
      { time: '0:05 - 0:15', visual: 'Screen recording apextools.app showing Audio Trimmer, WAV to MP3, and PDF to Word', audio: 'apextools.app is a free universal utility suite that runs entirely in your browser with zero sign-up required.' },
      { time: '0:16 - 0:25', visual: 'Dragging a large PDF and extracting Word doc cleanly', audio: 'Clean interface, zero ads blocking your screen, and your files are auto-purged from memory for privacy.' },
      { time: '0:26 - 0:30', visual: 'URL apextools.app on screen', audio: 'Share this with a freelancer who needs to save money.' },
    ],
  },
  {
    title: 'Angle 3: Test Your Mic and Webcam Before Interviews (Hardware Tests)',
    targetPlatforms: ['TikTok', 'YouTube Shorts', 'LinkedIn Video'],
    targetAudience: 'Remote workers, job seekers, Zoom/Teams users',
    duration: '28 seconds',
    visualStoryboard: [
      { time: '0:00 - 0:04', visual: 'Person looking nervous on Zoom call with "Can you hear me now?" text', audio: 'Do this 10-second test before your next Zoom or Teams interview.' },
      { time: '0:05 - 0:15', visual: 'Browser showing apextools.app/convert/hardware/mic-test with live waveform visualizer', audio: 'Go to apextools.app and click Hardware Tests. The live mic visualizer tests your real microphone input, volume level, and echo in real-time.' },
      { time: '0:16 - 0:24', visual: 'Clicking Webcam Test showing FPS, resolution, and dead pixel screen tester', audio: 'It even checks your webcam resolution, monitor dead pixels, and speaker stereo separation.' },
      { time: '0:25 - 0:28', visual: 'Thumbs up on camera', audio: 'Check apextools.app before your next call.' },
    ],
  },
];

const DIRECTORY_SUBMISSIONS = [
  {
    directory: 'AlternativeTo (alternativeto.net)',
    suggestedTitle: 'ApexTools',
    tagline: 'Modern, fast, privacy-first universal file conversion & web utility suite',
    alternativesTo: ['CloudConvert', 'Zamzar', 'Convertio', 'Smallpdf'],
    url: 'https://apextools.app',
    license: 'Free / Web-based',
    shortDescription: 'Free online file converter for documents, audio studio, video transcoding, unit calculators, and hardware diagnostics with zero signup.',
    tags: ['converter', 'pdf-converter', 'heic-converter', 'audio-editor', 'file-conversion', 'utilities'],
  },
  {
    directory: 'Product Hunt (producthunt.com)',
    suggestedTitle: 'ApexTools 2.0',
    tagline: 'Fast, secure & modern all-in-one browser utility platform',
    pricing: '100% Free',
    makersComment: `Hey Product Hunt community! 👋
We built ApexTools (https://apextools.app) because most online file conversion sites are clogged with annoying popups, aggressive trackers, and slow upload queues.

ApexTools gives you:
⚡ Instant Client-Side Processing for privacy & speed
📄 Document & PDF Suite (PDF to Word, Merge, Compress)
🎧 Audio Studio (MP3, WAV, Trimmer, Pitch & Volume booster)
🎬 Video & Media Transcoding (MOV to MP4, WebM, GIF)
🛠️ Hardware Diagnostics (Mic visualizer, Webcam, Dead pixel test)
🇵🇰 Specialized Calculators (Tola Gold, Marla Land, Real-time Forex USD-to-PKR)

Would love your feedback and feature requests!`,
  },
  {
    directory: 'Toolify.ai / Futurepedia / SaaSHub',
    suggestedTitle: 'ApexTools',
    pricing: 'Free',
    website: 'https://apextools.app',
    shortDescription: 'Universal utility platform for instant file conversion, audio editing, and hardware diagnostics.',
  },
];

const REDDIT_QUORA_TEMPLATES = [
  {
    query: 'How do I convert HEIC photos to JPG on Windows 10/11 without third-party apps?',
    template: `You don't need to install heavy software or pay for Adobe. You can use a lightweight web converter like **[ApexTools HEIC to JPG](https://apextools.app/convert/image/heic-to-jpg)**.

Here is how:
1. Go to https://apextools.app/convert/image/heic-to-jpg
2. Drag and drop your .heic or .heif photos.
3. Click Convert — it converts in your browser with high quality and no watermarks.
4. Download the resulting .jpg files individually or as a single zip archive.

Your photos stay private and are automatically purged from memory.`,
  },
  {
    query: 'How do I convert an iPhone Voice Memo to MP3 to share with non-Apple users?',
    template: `Apple Voice Memos save in .m4a format, which won't always play on older car stereos or Android devices.

Fastest way to fix this without iTunes:
1. In your Voice Memos app, tap the three dots (...) on your recording and choose **Save to Files**.
2. Open **[ApexTools M4A to MP3](https://apextools.app/convert/audio/m4a-to-mp3)** in Safari or Chrome.
3. Select your .m4a file from Files.
4. It transcodes directly to a clean 320kbps MP3 that plays anywhere.`,
  },
  {
    query: 'How to calculate 1 Marla in Square Feet in Pakistan (DHA vs Patwari)?',
    template: `In Pakistan, the size of 1 Marla depends on whether you are buying in an urban housing society or agricultural/patwari land:

- **Housing Authorities (DHA, Bahria Town, LDA City, CDA):** \`1 Marla = 225 Square Feet\` (1 Kanal = 20 Marlas = 4,500 Sq Ft).
- **Revenue / Patwari Standard (Rural / Agricultural registry):** \`1 Marla = 272.25 Square Feet\` (1 Karam = 5.5 ft, 1 Sarsahi = 30.25 sq ft).

You can use the interactive **[ApexTools Marla to Square Feet Converter](https://apextools.app/convert/unit/marla-to-square-feet)** to toggle between LDA (225), Patwari (272.25), and CDA (250) standards with land visualizers.`,
  },
];

async function main() {
  console.log('=====================================================');
  console.log('📱 ApexTools Automated Growth & Social Assets Playbook');
  console.log('=====================================================\n');

  const outputDir = path.resolve(process.cwd(), 'scratch/growth-playbook');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Save Short Form Video Scripts
  const videoMarkdown = `# Viral Short-Form Video Scripts (TikTok / Reels / Shorts)\n\n` +
    VIRAL_VIDEO_SCRIPTS.map((s, idx) => `
## ${idx + 1}. ${s.title}
- **Platforms:** ${s.targetPlatforms.join(', ')}
- **Audience:** ${s.targetAudience}
- **Target Duration:** ${s.duration}

### Storyboard:
| Timestamp | Visual Action | Voiceover / Hook |
| :--- | :--- | :--- |
${s.visualStoryboard.map((b) => `| \`${b.time}\` | ${b.visual} | *"${b.audio}"* |`).join('\n')}
`).join('\n---\n');

  fs.writeFileSync(path.join(outputDir, 'viral_video_scripts.md'), videoMarkdown, 'utf8');

  // 2. Save Directory Submissions
  const directoryMarkdown = `# High-DA Software Directory Submission Copies\n\n` +
    DIRECTORY_SUBMISSIONS.map((d) => `
## ${d.directory}
- **Title:** ${d.suggestedTitle}
- **URL:** ${d.url || 'https://apextools.app'}
- **Tagline:** ${d.tagline || ''}
${d.alternativesTo ? `- **Alternatives To:** ${d.alternativesTo.join(', ')}` : ''}
${d.makersComment ? `\n### Maker's Pitch:\n\`\`\`text\n${d.makersComment}\n\`\`\`` : ''}
`).join('\n---\n');

  fs.writeFileSync(path.join(outputDir, 'directory_submissions.md'), directoryMarkdown, 'utf8');

  // 3. Save Reddit/Quora Response Templates
  const forumMarkdown = `# Reddit & Quora High-Value Organic Response Templates\n\n` +
    REDDIT_QUORA_TEMPLATES.map((r, idx) => `
### Scenario ${idx + 1}: Question: "${r.query}"
\`\`\`markdown
${r.template}
\`\`\`
`).join('\n---\n');

  fs.writeFileSync(path.join(outputDir, 'community_growth_templates.md'), forumMarkdown, 'utf8');

  console.log(`✅ Growth assets generated successfully!`);
  console.log(`📁 Files saved to: ${outputDir}`);
  console.log(`   - viral_video_scripts.md`);
  console.log(`   - directory_submissions.md`);
  console.log(`   - community_growth_templates.md\n`);
}

main().catch(console.error);
