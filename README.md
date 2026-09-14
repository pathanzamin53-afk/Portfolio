# Avery Stone Developer Portfolio

A premium, responsive full-stack developer portfolio built with semantic HTML, CSS, vanilla JavaScript, Node.js, Express, and MongoDB. The sample content is intentionally centralized in readable markup and the `projects` array in `frontend/js/main.js`, making it straightforward to customize.

## Project structure

```text
developer-portfolio/
├── frontend/
│   ├── index.html
│   ├── css/
│   │   ├── style.css
│   │   ├── responsive.css
│   │   └── animations.css
│   ├── js/
│   │   ├── main.js
│   │   ├── animations.js
│   │   └── api.js
│   └── assets/
│       ├── images/
│       ├── icons/
│       └── fonts/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── config/db.js
│   ├── models/Contact.js
│   ├── routes/contactRoutes.js
│   ├── controllers/contactController.js
│   └── middleware/errorMiddleware.js
└── README.md
```

## Requirements

- Node.js 18+
- MongoDB 6+ locally, or a MongoDB Atlas connection string
- A static frontend server such as VS Code Live Server

## Backend setup

1. Open a terminal in `developer-portfolio/backend`.
2. Install packages: `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `MONGODB_URI` to a running local MongoDB instance or Atlas database.
5. Set `CLIENT_ORIGIN` to the exact origin serving the frontend.
6. Start the API with `npm run dev` (or `npm start`).

The API runs on `http://localhost:5000` by default.

### Vercel deployment

Deploy the `backend` folder as a Vercel project. Vercel uses `backend/api/index.js` as the serverless entrypoint; no long-running `listen()` process is used in production. Add these Vercel environment variables:

- `MONGODB_URI`: your MongoDB Atlas connection string.
- `CLIENT_ORIGIN`: the exact deployed frontend URL, such as `https://your-portfolio.vercel.app`.
- `WHATSAPP_ACCESS_TOKEN`: Meta WhatsApp Cloud API permanent/system-user access token.
- `WHATSAPP_PHONE_NUMBER_ID`: the Meta WhatsApp business phone number ID.
- `WHATSAPP_RECIPIENT_NUMBER`: your WhatsApp number in international format without `+` or spaces.
- `WHATSAPP_TEMPLATE_NAME`: an approved Meta message template name.
- `WHATSAPP_TEMPLATE_LANGUAGE`: the approved template language, usually `en_US`.

Create and approve a Meta WhatsApp template named `portfolio_contact_notification` with four body variables in this order: name, email, subject, and message. WhatsApp Cloud API requires an approved template when initiating a notification conversation.

## Frontend setup

Serve `developer-portfolio/frontend` with Live Server or another static server. Open the URL it provides, usually `http://127.0.0.1:5500`. The contact form sends requests to `http://localhost:5000/api/contact`.

When the frontend is deployed on the same Vercel project/domain as the API, it automatically uses `/api`. For a separately hosted frontend, set `window.PORTFOLIO_API_URL` to the deployed backend URL before loading `js/main.js`. No secrets belong in frontend files.

## API reference

- `GET /api/health` returns a service health response.
- `POST /api/contact` validates, sanitizes, and stores `{ name, email, subject, message }` in MongoDB.
- `POST /api/contact` validates, sanitizes, stores, and forwards contact messages.

Contact messages are not exposed through a public GET endpoint. Use the database or a separately authenticated admin tool to review them.

## Customization

Update the name, bio, links, social URLs, stats, timeline, testimonials, and contact email directly in `frontend/index.html`. Update project cards in the `projects` array in `frontend/js/main.js`. Replace the profile placeholder with an optimized image in `frontend/assets/images/` and update the portrait markup when ready.
