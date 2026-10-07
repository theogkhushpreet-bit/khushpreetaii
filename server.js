const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');
const resourcesDir = path.join(__dirname, 'resources');

app.use(express.json({ limit: '1mb' }));
app.use('/resources', express.static(resourcesDir));
app.use(express.static(publicDir));

function localAnswer(question, profile = {}) {
  const q = String(question || '').toLowerCase();
  const income = Number(profile.monthlyIncome || 0);
  const expense = Number(profile.monthlyExpense || 0);
  const balance = income - expense;
  const actions = [];
  if (Number(profile.missingDocuments || 0) > 0) actions.push(`Review ${profile.missingDocuments} missing document item(s).`);
  if (Number(profile.pendingApplications || 0) > 0) actions.push(`Follow up on ${profile.pendingApplications} pending application(s).`);
  if (Array.isArray(profile.students) && profile.students.length) actions.push(`Review education and scholarship options for ${profile.students.length} student(s).`);
  if (balance < 0) actions.push('Review recurring household expenses because recorded monthly expenses exceed income.');
  if (q.includes('finance') || q.includes('money') || q.includes('financial')) {
    return `Financial intelligence\n\nRecorded monthly income: ₹${income.toLocaleString('en-IN')}\nRecorded monthly expense: ₹${expense.toLocaleString('en-IN')}\nEstimated monthly balance: ₹${balance.toLocaleString('en-IN')}\n\nPriority: review the highest recurring expenses and pending payments first.`;
  }
  if (q.includes('education') || q.includes('student') || q.includes('skill')) {
    return `Education & skills intelligence\n\n${Array.isArray(profile.students) ? profile.students.length : 0} student record(s) are stored. Review each student's career goal, score and recorded skill gap, then verify current scholarship/training opportunities through official portals.`;
  }
  return `Bharat Jeevan AI local analysis\n\nThe profile was analyzed across finance, education, livelihood, documents and citizen-service signals.\n\nTop actions:\n${(actions.length ? actions : ['Keep the family profile updated as circumstances change.']).map((x,i)=>`${i+1}. ${x}`).join('\n')}\n\nThis is the offline fallback. Add an API key only when you want the optional AI backend.`;
}

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'Bharat Jeevan AI' }));

app.post('/api/ai', async (req, res) => {
  try {
    const { question, profile } = req.body || {};
    if (!process.env.OPENAI_API_KEY) {
      return res.json({ answer: localAnswer(question, profile), sources: [] });
    }

    // Optional OpenAI integration. If the key/model/service is unavailable,
    // return a working fallback rather than crashing the serverless function.
    try {
      const OpenAI = require('openai');
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const model = process.env.OPENAI_MODEL || 'gpt-5-mini';
      const completion = await client.responses.create({
        model,
        input: [
          { role: 'system', content: 'You are Bharat Jeevan AI, a careful citizen and family intelligence assistant. Analyze the supplied profile. Do not claim official government eligibility; say potential match and tell the user to verify on official portals. Keep answers practical and concise.' },
          { role: 'user', content: `Question: ${question || 'Analyze my profile'}\nProfile JSON: ${JSON.stringify(profile || {})}` }
        ]
      });
      return res.json({ answer: completion.output_text || localAnswer(question, profile), sources: [] });
    } catch (aiError) {
      console.error('Optional AI provider failed:', aiError.message);
      return res.json({ answer: localAnswer(question, profile), sources: [] });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(200).json({ answer: 'Bharat Jeevan AI is running in offline fallback mode. Please try again.', sources: [] });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Bharat Jeevan AI running on port ${PORT}`));
}

module.exports = app;
