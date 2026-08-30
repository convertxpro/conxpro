import { FaqItem } from '@/components/layout/FAQAccordion';

export const DEVELOPER_TOOL_FAQS: Record<string, FaqItem[]> = {
  'yaml-to-json': [
    {
      question: 'How to convert YAML to JSON in browser without uploading sensitive keys?',
      answer: 'ConvertHub executes 100% client-side in your local browser using an in-memory js-yaml parser. Your Kubernetes secrets, AWS credentials, and configuration files are never sent across the network or logged on any server.',
    },
    {
      question: 'Can I sort keys and format or minify the output JSON?',
      answer: 'Yes! You can toggle alphabetical key sorting, customize indentation (2 spaces, 4 spaces, or 8 spaces), and toggle instant one-line JSON minification for production deployments.',
    },
    {
      question: 'How does the parser handle complex YAML features like anchors and multi-line strings?',
      answer: 'Our engine supports full YAML 1.2 specification including YAML anchors (&) and aliases (*), literal block scalar styles (|), folded block scalar styles (>), and multi-document streams.',
    },
    {
      question: 'Can I convert large Kubernetes or Docker Compose YAML files?',
      answer: 'Yes. Because parsing happens directly in browser JavaScript memory without upload latency, you can process multi-megabyte YAML manifests with instant sub-millisecond conversion.',
    },
  ],
  'json-to-yaml': [
    {
      question: 'How to convert JSON to clean YAML for Kubernetes manifests?',
      answer: 'Paste your JSON object or array into the input editor. ConvertHub immediately serializes it into idiomatic, human-readable YAML with proper 2-space indentation and clean string quoting.',
    },
    {
      question: 'Does the converter support arrays and deeply nested objects?',
      answer: 'Yes. Nested objects and arrays of arbitrary depth are accurately indented with clean YAML list dash (-) prefixes and map key-value formatting.',
    },
    {
      question: 'Are numbers, booleans, and nulls properly preserved in YAML?',
      answer: 'Yes. JavaScript booleans (true/false) remain unquoted, null values map to standard YAML null/tilde (~), and numeric values retain their precise floating-point or integer types.',
    },
  ],
  'toml-to-json': [
    {
      question: 'Can I convert Cargo.toml or pyproject.toml to JSON?',
      answer: 'Yes! ConvertHub includes a robust TOML v1.0.0 parser (smol-toml) capable of parsing Rust Cargo.toml, Python pyproject.toml, and Go configuration files directly into structured JSON and YAML.',
    },
    {
      question: 'How are TOML tables, inline tables, and arrays of tables mapped to JSON?',
      answer: 'Standard TOML tables [table] become JSON objects, inline tables { a = 1 } become nested JSON keys, and arrays of tables [[items]] map directly to JSON arrays of objects.',
    },
    {
      question: 'Why does TOML conversion fail when converting an array?',
      answer: 'TOML requires the root element of a document to be a key-value table (map), not a top-level array. Wrap top-level arrays in a parent key before converting to TOML.',
    },
  ],
  'yaml-to-toml': [
    {
      question: 'How to convert YAML configuration files to TOML format?',
      answer: 'ConvertHub first parses your YAML data structure into an in-memory document tree and serializes it into standard TOML 1.0 syntax with table headers and typed key-value assignments.',
    },
    {
      question: 'Is TOML compatible with environment variables and strings with special characters?',
      answer: 'Yes. String values containing double quotes, backslashes, or multiline content are automatically escaped according to TOML specifications.',
    },
  ],
  'sql-to-json': [
    {
      question: 'How to extract SQL INSERT statements into a structured JSON array or CSV?',
      answer: 'Paste your SQL INSERT INTO statement or database table dump into ConvertHub. Our regex and lexer pipeline extracts column definitions and row tuples into structured JSON objects and CSV table rows in real time.',
    },
    {
      question: 'Does the parser handle escaped quotes, NULLs, and boolean literals in SQL values?',
      answer: 'Yes! Single quote escapes (\'\'), SQL NULL values, TRUE/FALSE booleans, and nested JSON strings within SQL columns are decoded into their native JavaScript data types.',
    },
    {
      question: 'Can I convert a multi-line SQL dump with thousands of rows?',
      answer: 'Yes. The converter parses multi-row VALUES batches with zero server requests, and allows downloading the result as .json or .csv with a single click.',
    },
  ],
  'json-to-sql': [
    {
      question: 'How to generate bulk SQL INSERT statements from a JSON array for Postgres or MySQL?',
      answer: 'Paste your JSON array of objects, choose your target SQL dialect (PostgreSQL, MySQL, SQLite, MS SQL Server), set your custom table name and batch chunk size (e.g. 500 rows per batch), and click copy or download.',
    },
    {
      question: 'How are SQL identifiers escaped for different database engines?',
      answer: 'For MySQL, columns and table names are wrapped in backticks (`table`). For PostgreSQL and SQLite, double quotes ("table") are used. For MS SQL Server, square brackets ([table]) are applied.',
    },
    {
      question: 'Can I generate an automatic CREATE TABLE schema from the JSON data?',
      answer: 'Yes! Enable the "CREATE TABLE" option to generate an automatic DDL schema with automatically inferred column types (INTEGER, NUMERIC, BOOLEAN, VARCHAR, JSONB, TEXT).',
    },
  ],
  'csv-to-sql': [
    {
      question: 'How to convert a CSV spreadsheet into SQL INSERT INTO queries?',
      answer: 'Upload or paste your CSV table data. ConvertHub uses PapaParse to stream and parse header columns, dynamic types, and generate batch-chunked SQL INSERT statements for your database.',
    },
    {
      question: 'Can I customize batch sizes for large CSV uploads?',
      answer: 'Yes, you can configure batch chunking to 100, 500, or 1000 rows per INSERT statement to comply with database packet size limits (e.g. MySQL max_allowed_packet).',
    },
  ],
  'jwt-decoder': [
    {
      question: 'How to decode and verify JWT expiration in browser without risking security?',
      answer: 'ConvertHub executes 100% client-side in your local browser using in-memory Base64URL parsing and the native Web Crypto API. Your private access tokens, session claims, and HMAC secret keys are never transmitted over the network or logged on any server.',
    },
    {
      question: 'How does the real-time JWT expiration countdown work?',
      answer: 'Our inspector reads the exp (expiration time) and iat (issued at) claims from the payload, calculates seconds remaining against your local clock, and provides live second-by-second countdown with visual Active/Expired indicators.',
    },
    {
      question: 'Can I verify HMAC-SHA256 (HS256) signatures client-side?',
      answer: 'Yes! Enter your HMAC secret key into the verifier drawer. ConvertHub signs the Header.Payload segment locally using Web Crypto crypto.subtle.sign and compares the resulting signature with the token signature.',
    },
    {
      question: 'What standard JWT claims are recognized and explained?',
      answer: 'The claims tree automatically explains RFC 7519 standard claims including iss (Issuer), sub (Subject), aud (Audience), exp (Expiration), nbf (Not Before), iat (Issued At), and jti (JWT ID), along with formatted human-readable UTC/local date strings.',
    },
  ],
  'hash-generator': [
    {
      question: 'How to verify SHA-256 checksum of an ISO or ZIP file on Windows/Mac?',
      answer: 'Drop your ISO, ZIP, or installer into the File Checksum Verifier tab, select SHA-256 (or MD5/SHA-512), and let the streaming reader compute the hash. Paste the publisher’s target checksum into the comparator box to get an instant green MATCH confirmation.',
    },
    {
      question: 'What is the difference between SHA-256 and Keccak-256 (Ethereum hash)?',
      answer: 'While both produce 256-bit (64-character hex) hashes, Keccak-256 is the original algorithm chosen by Ethereum for EVM smart contracts, transaction hashes, and address derivation, whereas NIST standardized a slightly modified padding variation as FIPS SHA-3.',
    },
    {
      question: 'Can I hash large files (2GB+) in the browser without crashing memory?',
      answer: 'Yes! ConvertHub uses chunked 2MB streaming with FileReader and incremental Web Crypto / CryptoJS hashing pipelines. Files are read progressively without loading the entire multi-gigabyte payload into memory at once.',
    },
    {
      question: 'Does the hash generator support HMAC secrets and uppercase formatting?',
      answer: 'Yes! You can toggle HMAC mode to compute HMAC-SHA256, HMAC-SHA512, HMAC-SHA384, HMAC-SHA1, and HMAC-MD5 with any secret key, and toggle between uppercase and lowercase hexadecimal output with a single click.',
    },
  ],
  'css-unit-converter': [
    {
      question: 'How to calculate responsive CSS font size with clamp()?',
      answer: 'CSS clamp() takes three parameters: clamp(minFontSize, preferredCalculatedRate, maxFontSize). ConvertHub calculates the linear slope and y-axis intersection based on your minimum viewport (e.g. 375px mobile) and maximum viewport (e.g. 1440px desktop), generating smooth fluid typography with zero media query jumps.',
    },
    {
      question: 'What is the difference between REM and EM in CSS?',
      answer: 'REM (Root EM) is always relative to the root <html> font-size (default 16px). EM is relative to the immediate parent element’s font-size. Using REM ensures predictable typography across deep component hierarchies while avoiding compounding scale issues.',
    },
    {
      question: 'How are VW and VH units converted to pixels?',
      answer: '1vw represents 1% of the viewport width, and 1vh represents 1% of the viewport height. At a standard 1920×1080 display, 10vw equals 192px and 10vh equals 108px. ConvertHub lets you customize your baseline viewport dimensions to test any screen configuration.',
    },
    {
      question: 'Can I map pixel values to Tailwind CSS typography and spacing classes?',
      answer: 'Yes! ConvertHub automatically inspects your computed pixel value and displays the closest matching Tailwind class (e.g., text-xl for 20px / 1.25rem, or p-4 / m-4 for 16px / 1rem).',
    },
  ],
  'qr-code-generator': [
    {
      question: 'How to create a Wi-Fi auto-connect QR Code?',
      answer: 'Select the "Wi-Fi Network" tab, enter your network SSID (name), choose your security type (WPA/WPA2/WPA3 or Open), and input the password. ConvertHub formats the standard WIFI:S:ssid;T:WPA;P:password;; payload so guests can scan with their phone camera and connect immediately without typing passwords.',
    },
    {
      question: 'How to make a WhatsApp direct message QR code for Pakistan (+92)?',
      answer: 'Switch to the "WhatsApp" tab, input your phone number (e.g., 923001234567 or 03001234567), and write an optional pre-filled message. When scanned, it automatically launches WhatsApp on the user’s smartphone and opens a direct chat window.',
    },
    {
      question: 'Can I upload a custom company logo in the center of the QR code?',
      answer: 'Yes! ConvertHub allows uploading PNG, SVG, or JPG brand logos. When a logo is uploaded, our engine automatically applies High (30%) Error Correction (ECC Level H) and draws a rounded badge behind the logo, ensuring the QR code scans reliably across all devices.',
    },
    {
      question: 'What is the best format to download QR codes for billboard or brochure printing?',
      answer: 'For professional printing on banners, brochures, business cards, or packaging, download the Vector SVG format — it provides infinite resolution with zero pixelation at any physical size. For digital use, our ultra-sharp 2048px PNG export is ideal.',
    },
  ],
  'cron-expression-decoder': [
    {
      question: 'How does a 5-part crontab expression work?',
      answer: 'A standard Unix crontab expression contains 5 fields separated by spaces: [Minute: 0-59] [Hour: 0-23] [Day of Month: 1-31] [Month: 1-12] [Day of Week: 0-7]. An asterisk (*) represents every value, slashes (*/15) represent step intervals, and commas (1,15) represent discrete lists.',
    },
    {
      question: 'How to interpret complex step intervals like */15 * * * * or 0 9 * * 1-5?',
      answer: '*/15 * * * * executes every 15 minutes of every hour of every day. 0 9 * * 1-5 executes at exactly 09:00 AM, Monday through Friday (business days). ConvertHub translates all syntax into clear, unambiguous natural English.',
    },
    {
      question: 'Does the cron decoder calculate exact upcoming run times in Pakistan Time (PKT)?',
      answer: 'Yes! ConvertHub parses the cron interval and computes the exact upcoming 10 execution timestamps in both UTC and Pakistan Standard Time (PKT, UTC+5 / Asia/Karachi), along with human relative countdowns (e.g. "in 14 minutes").',
    },
    {
      question: 'Can I build cron schedules visually without memorizing syntax?',
      answer: 'Yes! Our visual Crontab Builder lets you configure schedules using simple dropdowns (Minute intervals, Daily times, Weekly day checkboxes, or Monthly schedules) and instantly generates the verified cron syntax.',
    },
  ],
  'image-to-text-ocr': [
    {
      question: 'How does client-side WebAssembly OCR work without uploading images to a server?',
      answer: 'ConvertHub runs the complete Tesseract OCR optical character recognition engine directly inside your browser using WebAssembly (WASM). Model weights are downloaded directly to your local device memory, guaranteeing complete document privacy.',
    },
    {
      question: 'Which languages are supported for scanned document and image OCR?',
      answer: 'Our OCR engine supports English, Urdu (اردو), Arabic (العربية), Spanish, French, German, Chinese Simplified, Hindi, Russian, and Japanese with specialized trained models.',
    },
    {
      question: 'Can I extract text from multi-page scanned PDF documents?',
      answer: 'Yes! ConvertHub renders multi-page PDF pages directly onto an in-browser canvas and processes OCR across pages, providing Plain Text, Markdown, and JSON word-level bounding box coordinates.',
    },
  ],
  'remove-background': [
    {
      question: 'How does in-browser AI background removal isolate subjects?',
      answer: 'ConvertHub executes an advanced deep learning segmentation neural network in WebAssembly and ONNX Web memory. It segments people, products, clothing, and cars locally without uploading photos to external cloud servers.',
    },
    {
      question: 'What background replacement options are available before exporting?',
      answer: 'You can export transparent PNGs with full alpha channel fidelity, apply solid colors (such as pure white #FFFFFF for Amazon/eBay e-commerce listings), apply adjustable background blur, or upload custom scenic backgrounds.',
    },
  ],
  'diff-checker': [
    {
      question: 'How does the diff checker compare text and source code?',
      answer: 'Our Monaco-grade diff engine performs character, word, and line-level diff calculations. You can view changes in Side-by-Side (Split) mode or Unified (Inline) mode with instant addition and deletion metrics.',
    },
    {
      question: 'Can I export standard unified patch files (.patch)?',
      answer: 'Yes. ConvertHub generates standard unified .patch and .diff files compatible with Git, Mercurial, and patch command-line utilities.',
    },
  ],
  'curl-to-code': [
    {
      question: 'Which programming languages are supported by the cURL code generator?',
      answer: 'ConvertHub converts cURL commands into idiomatic snippets for JavaScript (Fetch & Axios), TypeScript, Python (Requests & Async HTTPX), Go (net/http), Rust (Reqwest), PHP (Guzzle & cURL), Java (HttpClient 11+), Dart / Flutter, and C# (.NET).',
    },
    {
      question: 'Does the parser support Bearer tokens, JSON payloads, and multipart forms?',
      answer: 'Yes! The parser tokenizes headers (-H), request methods (-X), JSON data (-d / --data-raw), basic auth (-u), and cookies (-b) into structured native request objects.',
    },
  ],
  'screen-recorder': [
    {
      question: 'How does the in-browser screen recorder capture video without extensions?',
      answer: 'ConvertHub uses the native HTML5 MediaDevices and MediaRecorder APIs built into modern browsers. You can capture your entire desktop, specific application windows, browser tabs, or webcam.',
    },
    {
      question: 'Can I record both microphone audio and system audio simultaneously?',
      answer: 'Yes! ConvertHub mixes multiple audio tracks using the browser Web Audio API AudioContext and GainNode pipeline so your voice commentary and system audio are synchronized.',
    },
    {
      question: 'Can I trim my recording and export to MP4, WebM, or Animated GIF?',
      answer: 'Yes. After finishing your recording, you can set precise start and end trim points on the timeline and export in WebM, MP4, or high-framerate Animated GIF format.',
    },
  ],
};

export const HARDWARE_TOOL_FAQS: Record<string, FaqItem[]> = {
  'webcam-test': [
    {
      question: 'Is my webcam video recorded or sent to a server?',
      answer: 'No. ConvertHub operates 100% client-side in your browser. Video feeds never leave your device or touch any remote server.',
    },
    {
      question: 'Why is my webcam resolution lower than advertised?',
      answer: 'Web browsers negotiate resolution based on lighting, USB bandwidth, and browser permissions. Ensure you select the maximum resolution in the test dropdown.',
    },
    {
      question: 'How do I test multiple webcams at the same time?',
      answer: 'Use the device selector dropdown to switch between built-in and external USB cameras. Each camera reports its own supported resolutions, frame rates, and sensor capabilities independently.',
    },
    {
      question: 'Why does my webcam appear dark or grainy?',
      answer: 'Low-light environments force the webcam sensor to increase ISO gain, introducing noise. Try improving ambient lighting, enabling auto-exposure in your system settings, or using an external HD webcam with larger sensor pixels.',
    },
  ],
  'mic-test': [
    {
      question: 'How does the mic echo/loopback test work?',
      answer: 'The tool temporarily records a 5-second audio clip into local browser memory and plays it back to let you hear your real audio output, clarity, and background noise.',
    },
    {
      question: 'Why does my microphone show low volume levels?',
      answer: 'Check your OS system microphone input level (usually under Sound settings), ensure the correct mic is selected as default, and confirm that browser permissions allow microphone access. External USB mics may also have hardware gain dials.',
    },
    {
      question: 'Can I test Bluetooth headset microphones in the browser?',
      answer: 'Yes! Bluetooth headset microphones are exposed through the browser MediaDevices API just like USB and built-in mics. Select your Bluetooth device from the input dropdown to begin testing.',
    },
  ],
  'speaker-test': [
    {
      question: 'What should I listen for during the frequency sweep?',
      answer: 'Listen for smooth, continuous sound without rattling, distortion, buzzing, or sudden volume drop-offs across bass (20-250Hz) and treble (4kHz-20kHz).',
    },
    {
      question: 'How does the left/right stereo channel test work?',
      answer: 'The stereo test plays audio exclusively through the left channel, then the right channel, allowing you to verify both speakers are functioning and that stereo panning is correct. If sound only comes from one side, your speaker or audio jack may be damaged.',
    },
    {
      question: 'Can I use the speaker test to check Bluetooth speaker quality?',
      answer: 'Yes! Connect your Bluetooth speaker, select it as the audio output device in your OS settings, and run the frequency sweep. Note that Bluetooth codecs (SBC, AAC, aptX, LDAC) may introduce slight latency or frequency roll-off above 16kHz.',
    },
  ],
  'screen-test': [
    {
      question: 'What is the difference between a dead pixel and a stuck pixel?',
      answer: 'A dead pixel is permanently off (black dot on white background), while a stuck pixel has subpixels stuck on (bright red, green, or blue dot on black background).',
    },
    {
      question: 'How does the screen refresh rate (Hz) detection work?',
      answer: 'The tool uses requestAnimationFrame() timing to measure the actual render frequency of your display. It counts consecutive frames over a 1-second window and reports the real refresh rate (60Hz, 120Hz, 144Hz, 240Hz) your browser is delivering.',
    },
    {
      question: 'Can I detect dead pixels on a laptop screen using this tool?',
      answer: 'Yes! Enter fullscreen mode and cycle through solid color backgrounds (red, green, blue, white, black). Carefully scan the entire display surface for any dots that remain a different color from the background — those are dead or stuck pixels.',
    },
    {
      question: 'What is contrast gradient banding and how do I test for it?',
      answer: 'Gradient banding appears as visible steps or stripes in smooth color transitions, indicating your display has limited color depth (6-bit vs 8-bit panels). Our gradient test renders smooth transitions from black to white and across color channels to expose banding artifacts.',
    },
  ],
  'keyboard-test': [
    {
      question: 'What is keyboard ghosting and N-Key Rollover (NKRO)?',
      answer: 'Ghosting occurs when multiple simultaneous key presses fail to register. NKRO keyboards can register unlimited simultaneous key presses without locking up.',
    },
    {
      question: 'How does the mechanical switch chatter detection work?',
      answer: 'When you press a key, the tool records the exact timestamps of keydown and keyup events. If multiple rapid keydown events fire within 30ms from a single physical press, it indicates switch bounce or chatter — a common sign of worn mechanical switches.',
    },
    {
      question: 'Can I test function keys, media keys, and special keys?',
      answer: 'Yes! The virtual keyboard layout displays all standard keys including F1-F12 function row, media playback keys, Print Screen, Scroll Lock, Pause, Insert, Delete, Home, End, and arrow keys. Each key lights up when pressed.',
    },
    {
      question: 'Why do some key combinations not register in the browser?',
      answer: 'Certain key combinations are intercepted by the operating system before reaching the browser (e.g., Ctrl+Alt+Delete on Windows, Cmd+Q on macOS). These system-level shortcuts cannot be captured by web-based keyboard testers.',
    },
  ],
  'mouse-test': [
    {
      question: 'How do I know if my mouse switch is failing?',
      answer: 'If the Double-Click Fault Tester detects click intervals under 80ms during a single physical click, the microswitch spring is bouncing and likely needs replacement.',
    },
    {
      question: 'How does the mouse polling rate test work?',
      answer: 'The tool measures the frequency of mousemove events per second while you move the mouse across the test area. Standard mice report at 125Hz (8ms intervals), while gaming mice operate at 500Hz or 1000Hz (1ms intervals) for smoother cursor tracking.',
    },
    {
      question: 'Can I test trackpad gestures and scroll precision?',
      answer: 'Yes! The scroll wheel test measures scroll delta values, direction, and smoothness. Trackpad users can verify two-finger scroll precision, acceleration curves, and scroll distance per gesture.',
    },
  ],
  'gamepad-test': [
    {
      question: 'What causes analog stick drift on controllers?',
      answer: 'Potentiometer wear or dust buildup causes analog sticks to report non-zero coordinates when resting. Our Stick Drift Radar calculates the exact drift percentage.',
    },
    {
      question: 'Which controllers are supported by the browser Gamepad API?',
      answer: 'All standard HID-compliant controllers work including Xbox One/Series X|S, PlayStation DualShock 4 and DualSense 5, Nintendo Switch Pro Controller, and most third-party USB and Bluetooth gamepads. Connect via USB or Bluetooth and press any button to activate.',
    },
    {
      question: 'How does the trigger pressure gauge work?',
      answer: 'Analog triggers (L2/R2 on PlayStation, LT/RT on Xbox) report continuous pressure values from 0.0 (released) to 1.0 (fully pressed). The pressure gauge visualizes this range in real-time so you can verify smooth, linear trigger response without dead zones.',
    },
    {
      question: 'Can I test controller vibration and rumble motors?',
      answer: 'Yes! The rumble test uses the Gamepad Haptic Actuator API to pulse the left (heavy) and right (light) vibration motors at configurable intensities, letting you verify both motors are functional.',
    },
  ],
  'call-readiness': [
    {
      question: 'How does the readiness test verify Zoom and Teams compatibility?',
      answer: 'It tests camera resolution (720p+), microphone volume and noise floor, speaker audio path, and WebRTC network ping to ensure seamless conferencing performance.',
    },
    {
      question: 'What does the readiness scorecard measure?',
      answer: 'The all-in-one diagnostic produces a 0-100 readiness score combining: camera clarity (resolution, frame rate, brightness), microphone quality (volume, noise floor, echo), speaker output (audio path verification), and network latency (WebRTC ICE candidate round-trip time).',
    },
    {
      question: 'Why does my camera pass but microphone fails the readiness test?',
      answer: 'Camera and microphone permissions are granted separately in most browsers. Ensure both permissions are explicitly allowed. Also check that your headset microphone is selected as the default input device in your operating system sound settings.',
    },
    {
      question: 'Can I share my readiness test results with IT support?',
      answer: 'Yes! The scorecard generates a shareable summary with device names, test results, browser version, and network stats that you can copy to clipboard and send to your IT helpdesk or meeting organizer.',
    },
  ],
};
