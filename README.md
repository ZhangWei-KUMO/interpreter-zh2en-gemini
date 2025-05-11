# Gemini Interpreter

A real-time English-Chinese simultaneous interpretation web application built with Next.js 14 and Google's Gemini 2.5 Flash AI model.

## Features

- 🎙️ **Voice Recognition**: Record speech through your device's microphone
- 🔄 **Automatic Language Detection**: Identifies whether the speech is in English or Chinese
- 🌐 **Bidirectional Translation**: Seamlessly translates between English and Chinese
- 🔊 **Text-to-Speech**: Reads translations aloud using browser's speech synthesis
- 📝 **Text Editing**: Edit transcriptions and translations directly in the app
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🌙 **Dark/Light Modes**: Toggle between dark and light themes
- 🔒 **Client-side Processing**: Your audio recordings stay on your device

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **AI**: Google Gemini 2.5 Pro for speech recognition and translation
- **Audio**: Web Audio API, MediaRecorder API, Speech Synthesis API
- **Styling**: Modern CSS with responsive design

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- A Google Gemini API key (get one from [Google AI Studio](https://aistudio.google.com/))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gemini-interpreter.git
   cd gemini-interpreter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Usage

1. Click and hold the microphone button to start recording.
2. Speak in either English or Chinese.
3. Release the button to stop recording and trigger translation.
4. The app will automatically detect the language and translate to the other language.
5. Click the speaker button to hear the translation.
6. Edit either the transcription or translation as needed.

## How It Works

1. **Audio Recording**: The app captures audio using the MediaRecorder API.
2. **Audio Visualization**: Generates a real-time waveform during recording using the Web Audio API.
3. **Speech Recognition**: The audio is sent to Gemini AI for transcription.
4. **Language Detection**: Gemini identifies whether the transcribed text is in English or Chinese.
5. **Translation**: Based on the detected language, the text is translated to the other language.
6. **Text-to-Speech**: The browser's Speech Synthesis API is used to read the translation aloud.

## Project Structure

```
gemini-interpreter/
├── app/
│   ├── components/
│   │   ├── VoiceNotesApp.tsx    # Main application component
│   │   ├── SettingsModal.tsx    # API key settings modal
│   │   └── ServiceWorkerRegister.tsx
│   ├── utils/
│   │   ├── audioService.ts      # Audio recording and playback
│   │   ├── geminiService.ts     # Gemini API integration
│   │   └── helpers.ts           # Utility functions
│   ├── layout.tsx               # Next.js layout
│   ├── page.tsx                 # Main page
│   └── globals.css              # Global styles
├── public/
├── next.config.js
├── package.json
└── README.md
```

## Limitations

- Requires microphone access and browser support for the MediaRecorder API
- Translation quality depends on the Gemini AI model's capabilities
- Currently only supports English and Chinese language pairs
- Requires an internet connection for API calls to Gemini

## Future Improvements

- Add support for more languages
- Implement streaming translation for real-time interpretation
- Add speech-to-speech direct translation
- Improve the audio visualization with more detailed waveforms
- Save translation history to local storage or a database
- Add export options for translations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini AI for providing the AI models
- Next.js team for the excellent framework
- Web Audio and Speech Synthesis APIs for enabling audio processing

---

Made with ❤️ by [Your Name] 