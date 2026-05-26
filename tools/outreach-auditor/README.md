# Swift 7 Outreach Auditor

Paste a business website, get a website audit, draft outreach email, mailto link, and approved save to Notion.

## Run

Create a local env file first:

```bash
cp tools/outreach-auditor/.env.example tools/outreach-auditor/.env
```

Then edit `tools/outreach-auditor/.env` and add your real keys.

Start the tool:

```bash
npm run outreach:audit
```

Then open:

```text
http://localhost:4177
```

## What it does

- Takes around 10 seconds by default, so it feels like a proper review rather than an instant scrape.
- Fetches the homepage plus up to five useful internal pages, prioritising contact, about, services, gallery, reviews and pricing pages.
- Extracts visible emails, phone numbers and Instagram links.
- Flags low-hanging fruit like free email addresses, template builders, weak CTAs, old content, thin SEO metadata, weak proof, missing reviews, generic buttons and shallow service pages.
- Drafts a short Swift 7 email from Callum that always pitches a redesign, not just small tweaks.
- If Ollama is running, uses a free local model to rewrite the email in a more natural voice.
- Creates a Notion page only after you click `Add to Notion`.

## AI writer

Free local AI uses Ollama. Install Ollama, then run:

```bash
ollama pull llama3.2:3b
ollama serve
```

Then set this in `tools/outreach-auditor/.env`:

```bash
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:3b
```

## Safety rules

- It does not guess emails.
- It does not send email.
- If no email is found, it stores a contact method instead of creating a mailto link.
