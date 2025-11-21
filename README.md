# Leasing AI Assistant

> An AI-powered CRM assistant that supports leasing agents in their daily routine using natural language queries.

## The Problem

From experience, I know how hard it can be to quickly aggregate and cross-reference leads when using search and filter, this assistant changes that.
Instead of bogging through filters and scanning profiles, a leasing agent can just ask a plain English question and get an instant answer. 

## How It Works

1. The user asks a question (along with any previous conversation history)
2. A Cloudflare Worker fetches the current lead data from Firebase Firestore
3. The raw Firestore response is parsed into a clean, readable format
4. A prompt is constructed combining the lead data, conversation history, and the user's question
5. The prompt is sent to Google's Gemma 3 model via Cloudflare Workers AI
6. The model's response is returned to the user

## Example Queries

- "What kinda units are today's tours interested in?"
- "Which leads should be called and which should be emailed?"  
- "What leads are lacking attention?"

## Tech Stack

- **Runtime:** Cloudflare Workers
- **AI Model:** gemma-3-12b-it 
- **Database:** Firebase Firestore

  
## Live Demo

- **API Endpoint:** [leasing-ai-assistant.rresnik2.workers.dev](https://leasing-ai-assistant.rresnik2.workers.dev/)
- **Try it in the CRM:** [leasing-crm.vercel.app](https://leasing-crm.vercel.app/)


## Author

Reece Resnik - Built from firsthand experience as a leasing professional at Arlo Apartments.
