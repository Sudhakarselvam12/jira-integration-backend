require('dotenv').config();

const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.get('/jira-issues', async (req, res) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_JIRA_BASE_URL}/rest/api/3/search?project=${process.env.REACT_APP_JIRA_PROJECT_KEY}&startAt=${req.query.startAt}&maxResults=${req.query.maxResults}&fields=key,summary,issuetype,status,assignee`, {
      headers: {  
        "Content-Type": 'application/json'
      },
      auth: {
        username: process.env.REACT_APP_JIRA_USER_NAME,
        password: process.env.REACT_APP_JIRA_API_TOKEN,
      },
      });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}); 

app.listen(port, () => {
  console.log(`server listening at port: ${port}...`);
});
