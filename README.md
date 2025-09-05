# Groq AI Chatbot

A comprehensive AI chatbot application built with Next.js and Groq API, featuring multiple AI models, reasoning capabilities, web search, and file upload support.

## Features

- 🤖 **Multiple AI Models**: Support for various Groq models including Llama, Mixtral, Gemma, and GPT-OSS
- 🧠 **Reasoning Mode**: Step-by-step analysis and problem-solving with reasoning models
- 🌐 **Web Search**: Real-time web search capabilities with Compound models
- 🔍 **Browser Search**: Interactive web browsing and navigation
- 💬 **Multiple Chats**: Create and manage multiple conversation threads
- 📁 **File Upload**: Support for PDF, TXT, DOC, DOCX, and MD files
- 💾 **Conversation Memory**: Persistent chat history and context
- 🎨 **Modern UI**: Beautiful, responsive interface with dark mode support
- ⚡ **Fast Responses**: Powered by Groq's high-speed inference

## Supported Models

### Regular Models
- **Llama 3.3 70B Versatile**: High-performance general-purpose model
- **Llama 3.1 70B Versatile**: Versatile model for various applications
- **Llama 3.1 8B Instant**: Fast, lightweight model for quick responses
- **Mixtral 8x7B**: Mixture of experts model with large context
- **Gemma 2 9B IT**: Instruction-tuned model for conversations

### Reasoning Models
- **GPT-OSS 20B**: Reasoning model with step-by-step analysis
- **GPT-OSS 120B**: Advanced reasoning model for complex problems
- **Qwen 3 32B**: Multilingual reasoning model

### Web Search Models
- **Compound**: Advanced system with web search capabilities
- **Compound Mini**: Lightweight system with web search

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Groq API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd chat
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Add your Groq API key to `.env.local`:
```env
GROQ_API_KEY=your_groq_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Getting a Groq API Key

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

## Usage

### Creating a New Chat

1. Click the "New Chat" button in the sidebar
2. Choose your preferred AI model and settings
3. Start typing your message

### Model Selection

- **Regular Chat**: Standard conversational responses
- **Reasoning Mode**: Step-by-step analysis (available for reasoning models)
- **Web Search**: Access real-time web information (Compound models)
- **Browser Search**: Interactive web browsing (GPT-OSS models)

### File Upload

1. Click the paperclip icon in the message input
2. Select files (PDF, TXT, DOC, DOCX, MD)
3. Files will be attached to your message
4. The AI can analyze and respond based on file content

### Chat Management

- **Rename**: Click the edit icon next to a chat title
- **Delete**: Click the trash icon to remove a chat
- **Switch**: Click on any chat in the sidebar to switch between conversations

## API Endpoints

- `GET /api/chats` - Get all chats
- `POST /api/chats` - Create a new chat
- `GET /api/chats/[id]` - Get a specific chat
- `PUT /api/chats/[id]` - Update a chat
- `DELETE /api/chats/[id]` - Delete a chat
- `POST /api/chats/[id]/messages` - Add a message to a chat
- `POST /api/chat/completions` - Get AI completion
- `POST /api/upload` - Upload files

## Configuration

### Environment Variables

```env
# Required
GROQ_API_KEY=your_groq_api_key_here

# Optional
NEXT_PUBLIC_APP_NAME=Groq AI Chatbot
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=pdf,txt,doc,docx,md
```

### Model Configuration

Models and their capabilities are defined in `src/lib/models.ts`. You can:
- Add new models
- Modify model descriptions
- Update capability flags
- Change default parameters

## Development

### Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page
├── components/         # React components
│   ├── ChatInterface.tsx
│   ├── ChatSettings.tsx
│   └── Sidebar.tsx
├── lib/               # Utility libraries
│   ├── models.ts      # Model definitions
│   └── storage.ts     # Data storage
└── types/             # TypeScript types
    └── index.ts
```

### Building for Production

```bash
npm run build
npm start
```

### Linting and Type Checking

```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the [Groq Documentation](https://console.groq.com/docs)
2. Review the [Next.js Documentation](https://nextjs.org/docs)
3. Open an issue in this repository

## Acknowledgments

- [Groq](https://groq.com/) for providing fast AI inference
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons