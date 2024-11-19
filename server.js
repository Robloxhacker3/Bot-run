const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

// Endpoint to run the bot code
app.post('/run', (req, res) => {
  const { token, code } = req.body;

  if (!token || !code) {
    return res.json({ error: 'Missing token or bot code' });
  }

  // Prepare the bot script
  const botCode = `
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
  console.log(\`Logged in as \${client.user.tag}!\`);
});

${code}

client.login('${token}');
`;

  // Save the bot code to a file
  fs.writeFileSync('bot.js', botCode);

  // Run the bot script
  exec('node bot.js', (error, stdout, stderr) => {
    if (error) {
      return res.json({ error: stderr || 'Error occurred while running the bot' });
    }
    res.json({ output: stdout });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
