const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
  const issueBody = process.env.ISSUE_BODY;
  const issueNumber = process.env.ISSUE_NUMBER;
  const repo = process.env.REPO;
  const token = process.env.GITHUB_TOKEN;

  // Ask Claude about the issue/comment
  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: `You are a helpful assistant for the Waddle Miniblox enhancement script. 
             You help users with bug reports, feature requests, and general questions.
             Keep responses concise and technical when appropriate.`,
    messages: [
      {
        role: 'user',
        content: issueBody,
      },
    ],
  });

  const claudeReply = message.content[0].text;

  // Post Claude's response as a GitHub comment
  const [owner, repoName] = repo.split('/');
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/issues/${issueNumber}/comments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        body: `### 🤖 Claude says:\n\n${claudeReply}`,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  console.log('Claude response posted successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
