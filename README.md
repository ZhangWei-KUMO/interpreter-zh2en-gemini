# Chinese-English Simultaneous Interpreter

[![Node.js](https://img.shields.io/badge/Node.js-v18.0%2B-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-v14-black)](https://nextjs.org/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Pro-blue)](https://ai.google.dev/)

<p align="center">
  <img src="./public/icon-192x192.png" alt="Chinese-English Interpreter Icon" width="150">
</p>

[中文](README.zh.md) | English

This software automatically performs Chinese-English simultaneous interpretation based on user's natural language speech with a single click, without requiring any manual settings. It's especially suitable for elderly people traveling abroad. Whether at Los Angeles airport or on a Thai beach, you don't need to worry about your parents facing language barriers. The original motivation for developing this open-source software was when my uncle encountered difficulties at a US airport due to language barriers. After spending half an hour trying to teach him how to use AI translation software, I realized that teaching elderly people to use prompts or existing AI software properly is as challenging as writing a new AI software. After all, in the AI era, everyone should benefit from the convenience brought by AI, which led to this open-source project. Future versions will include Chinese-Japanese, Chinese-Korean, Chinese-Vietnamese, and more. In short, "just click wherever you need help."

## Features

- 🎙️ **Voice Recognition**: Record speech via device microphone
- 🔄 **Automatic Language Detection**: Identify whether speech is English or Chinese
- 🌐 **Two-way Translation**: Seamlessly convert between English and Chinese
- 🔊 **Text-to-Speech**: Read translations aloud using browser's speech synthesis
- 📝 **Text Editing**: Edit transcriptions and translations directly in the app
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🌙 **Dark/Light Mode**: Switch between dark and light themes
- 🔒 **Client-side Processing**: Your recordings stay on your device

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **AI**: Google Gemini 2.5 Pro for speech recognition and translation
- **Audio**: Web Audio API, MediaRecorder API, Speech Synthesis API
- **Styling**: Modern CSS with responsive design

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- Google Gemini API key (get from [Google AI Studio](https://aistudio.google.com/))

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

### How to Use

1. Click and hold the microphone button to start recording.
2. Speak in English or Chinese.
3. Release the button to stop recording and trigger translation.
4. The app will automatically detect the language and translate to the other language.
5. Click the speaker button to hear the translation.
6. Edit the transcription or translation as needed.

## How It Works

1. **Audio Recording**: The app captures audio using the MediaRecorder API.
2. **Audio Visualization**: Real-time waveform is generated during recording using Web Audio API.
3. **Speech Recognition**: Audio is sent to Gemini AI for transcription.
4. **Language Detection**: Gemini identifies whether the transcribed text is English or Chinese.
5. **Translation**: Based on the detected language, the text is translated to the other language.
6. **Text-to-Speech**: Translation is read aloud using the browser's speech synthesis API.


## Limitations

- Requires microphone access permission and browser support for MediaRecorder API
- Translation quality depends on the capabilities of Gemini AI model
- Currently only supports English and Chinese language pair
- Requires internet connection to call Gemini API

## Future Improvements

- Add more language support
- Implement streaming translation for real-time interpretation
- Add direct speech-to-speech translation
- Improve audio visualization with more detailed waveforms
- Save translation history to local storage or database
- Add translation export options

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Thanks to Google Gemini AI for providing the AI model
- Thanks to the Next.js team for the excellent framework
- Thanks to Web Audio and Speech Synthesis APIs for audio processing

---

Made with ❤️ by [Lewis Zhang | 张伟]
