# Voice Avatar Assistant

MERN voice assistant: an animated avatar answers spoken or typed questions from admin-defined voice responses, then FAQs, then Gemini, and collects leads. An admin panel manages leads, FAQs, and responses.

## Setup

```bash
cd backend && npm install && cp .env.example .env   # fill in values
npm run dev                                           # http://localhost:5000

cd frontend && npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev                                           # http://localhost:5173
```

Create the first admin (open only while no admin exists; after that it needs an admin token):

```bash
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@example.com","password":"secret123"}'
```

## How answers are matched

A voice response matches when its trigger appears as whole words in what the user said ("hello" matches "hello there"). An FAQ matches on its keywords or its full question. If several match, the longest phrase wins. With no match the question goes to Gemini, and if that fails, to the active `fallback` voice response.

Backend tests: `cd backend && npm test`
