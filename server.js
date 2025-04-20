// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0'; // Bind to all interfaces by default

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Determine if we're in production or development
const isProduction = process.env.NODE_ENV === 'production';
const staticPath = isProduction ? path.join(__dirname, 'build') : path.join(__dirname, 'public');

// Serve static files
app.use(express.static(staticPath));

// API endpoint to save quiz data
app.post('/api/save-quiz', (req, res) => {
  try {
    console.log('Received save request:', req.body.courseId, req.body.weekId);
    const { courseId, weekId, data, overwrite } = req.body;
    
    if (!courseId || !weekId || !data) {
      return res.status(400).send('Missing required fields');
    }
    
    // Ensure the directory exists
    const dirPath = path.join(__dirname, 'public', 'db', 'courses', courseId);
    console.log('Saving to directory:', dirPath);
    
    if (!fs.existsSync(dirPath)) {
      try {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log('Created directory:', dirPath);
      } catch (mkdirErr) {
        console.error('Error creating directory:', mkdirErr);
        return res.status(500).send(`Failed to create directory: ${mkdirErr.message}`);
      }
    }
    
    // Get the file path
    const filePath = path.join(dirPath, `${weekId}.json`);
    console.log('File path:', filePath);
    
    // Check if file exists and we're not allowed to overwrite
    if (fs.existsSync(filePath) && !overwrite) {
      return res.status(409).send(`File already exists at ${filePath}. Set overwrite=true to replace it.`);
    }
    
    // Write the file
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log('Successfully wrote file:', filePath);
    } catch (writeErr) {
      console.error('Error writing file:', writeErr);
      return res.status(500).send(`Failed to write file: ${writeErr.message}`);
    }
    
    return res.status(200).send({
      message: 'Quiz data saved successfully',
      path: `/db/courses/${courseId}/${weekId}.json`
    });
  } catch (error) {
    console.error('Error saving quiz:', error);
    return res.status(500).send(`Server error: ${error.message}`);
  }
});

// Add an endpoint to check if a file exists
app.get('/api/check-file/:courseId/:weekId', (req, res) => {
  try {
    const { courseId, weekId } = req.params;
    const filePath = path.join(__dirname, 'public', 'db', 'courses', courseId, `${weekId}.json`);
    
    const exists = fs.existsSync(filePath);
    return res.status(200).send({ exists });
  } catch (error) {
    console.error('Error checking file:', error);
    return res.status(500).send(`Server error: ${error.message}`);
  }
});

// Endpoint to list files in a directory
app.get('/api/list-files', (req, res) => {
  try {
    const dbPath = path.join(__dirname, 'public', 'db', 'courses');
    const results = [];

    if (fs.existsSync(dbPath)) {
      const courses = fs.readdirSync(dbPath);
      
      courses.forEach(course => {
        const coursePath = path.join(dbPath, course);
        if (fs.statSync(coursePath).isDirectory()) {
          const weeks = fs.readdirSync(coursePath)
            .filter(file => file.endsWith('.json'))
            .map(file => ({
              name: file,
              path: `/db/courses/${course}/${file}`
            }));
          
          results.push({
            course,
            weeks
          });
        }
      });
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error('Error listing files:', error);
    return res.status(500).send(`Server error: ${error.message}`);
  }
});

// Endpoint to get file content
app.get('/api/file-content', (req, res) => {
  try {
    const { path: filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).send('Missing file path');
    }
    
    // Convert relative path to absolute path
    const relativePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const fullPath = path.join(__dirname, 'public', relativePath);
    
    console.log('Reading file:', fullPath);
    
    // Security check - make sure we're only accessing files in the public directory
    if (!fullPath.startsWith(path.join(__dirname, 'public'))) {
      return res.status(403).send('Access denied');
    }
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).send('File not found');
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    return res.status(200).send(content);
  } catch (error) {
    console.error('Error reading file:', error);
    return res.status(500).send(`Server error: ${error.message}`);
  }
});

// For any other route, serve the appropriate file depending on environment
app.get('*', (req, res) => {
  if (isProduction) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
  console.log(`Serving static files from: ${staticPath}`);
  console.log(`Database directory: ${path.join(__dirname, 'public', 'db', 'courses')}`);
  console.log(`For Cloudflare Tunnel use: cloudflared tunnel --url http://${HOST}:${PORT}`);
}); 