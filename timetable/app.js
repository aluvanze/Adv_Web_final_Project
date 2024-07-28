const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const dataFilePath = path.join(__dirname, 'data', 'timetable.json');

const subjects = {
  Languages: 10,
  Sciences: 10,
  Arts: 5,
  Sports: 5,
};

app.use(bodyParser.urlencoded({ extended: true }));
// ... (other imports and initializations)

app.use(express.static('public'));
app.set('view engine', 'ejs');

// Load initial data
let timetable = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

// Route: Home Page (Display Timetable)
app.get('/', (req, res) => {
  res.render('index', { timetable, successMessage: null });
});

// Route: Generate Random Timetable
app.get('/generate', (req, res) => {
  timetable = generateRandomTimetable();
  fs.writeFileSync(dataFilePath, JSON.stringify(timetable, null, 2), 'utf8');
  res.redirect('/');
});

// Route: Edit Timetable
app.post('/edit', (req, res) => {
  const newTimetable = req.body;
  delete newTimetable.successMessage; // Remove the hidden input value

  if (validateTimetable(newTimetable)) {
    timetable = newTimetable;
    fs.writeFileSync(dataFilePath, JSON.stringify(timetable, null, 2), 'utf8');
    res.render('index', { timetable, successMessage: 'Timetable saved successfully' });
  } else {
    res.status(400).send('Invalid timetable configuration');
  }
});



// Function: Generate Random Timetable
function generateRandomTimetable() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const hoursPerDay = 6;
  const newTimetable = {};

  days.forEach(day => {
    newTimetable[day] = Array(hoursPerDay).fill(null);
  });

  Object.keys(subjects).forEach(subject => {
    let hoursLeft = subjects[subject];
    while (hoursLeft > 0) {
      days.forEach(day => {
        if (hoursLeft === 0) return;

        const randomSlot = Math.floor(Math.random() * hoursPerDay);
        if (newTimetable[day][randomSlot] === null) {
          newTimetable[day][randomSlot] = subject;
          hoursLeft--;
        }
      });
    }
  });

  return newTimetable;
}

// Function: Validate Timetable (Basic Example)
function validateTimetable(newTimetable) {
  // Basic validation logic (you can expand this)
  // Ensure each subject has the correct total number of hours
  return true;
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
