/**
 *  This is the Leasing CRM assistant powered by Cloudflare Workers and using a "gemma-3-12b-it" model.
 * 
 * @author Reece Resnik
 * @version v1.0
 */


// Cleans up data from HTTP response
function parseFirestoreData(firestoreResponse) {
  const documents = firestoreResponse.documents || [];

  return documents.map(doc => {
    const fields = doc.fields;
    const cleanData = {};

    for (const [key, value] of Object.entries(fields)) {
      if (value.stringValue !== undefined) {
        cleanData[key] = value.stringValue;
      } else if (value.integerValue !== undefined) {
        cleanData[key] = value.integerValue;
      }
    }

    return cleanData;
  });
}



export default {
  async fetch(request, env) {
    // Handle CORS for browser requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Get the question from the request body
      const { question, conversationHistory = [] } = await request.json();



      if (!question) {
        return new Response(JSON.stringify({ error: 'No question provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Fetch leads from Firestore
      const projectId = "leasing-crm-6a808";
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/leads`;

      const firestoreResponse = await fetch(firestoreUrl);
      const firestoreData = await firestoreResponse.json();
      const leads = parseFirestoreData(firestoreData);

      // Build conversation context
      let conversationContext = '';
      if (conversationHistory.length > 0) {
        conversationContext = '\n\nPrevious conversation:\n';
        conversationHistory.forEach(msg => {
          conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
        });
      }
      const leadsDescription = leads.map((lead, index) =>
        `[${index + 1}] ${Object.entries(lead).map(([k,v]) => `${k}=${v}`).join(', ')}`).join('\n');
      // Create prompt with the user's question
      // Create prompt with conversation history
      const prompt = `Database records (numbers in brackets are just row IDs, not names):
${leadsDescription}
${conversationContext}
Question: ${question}

Answer using ONLY the data above. When listing names, use the actual name field values, not the row numbers. If not in data, say "I don't have that information". Max 2 sentences.`;

      // Ask the AI
      const aiResponse = await env.AI.run("@cf/google/gemma-3-12b-it", {
        prompt: prompt
      });

      // Return the response with CORS headers
      return new Response(JSON.stringify({
        answer: aiResponse.response
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};