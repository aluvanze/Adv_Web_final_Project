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
app.use(express.static('public'));
app.set('view engine', 'ejs');


let timetable = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));


app.get('/', (req, res) => {
  res.render('index', { timetable, successMessage: null });
});


app.get('/generate', (req, res) => {
  timetable = generateRandomTimetable();
  fs.writeFileSync(dataFilePath, JSON.stringify(timetable, null, 2), 'utf8');
  res.redirect('/');
});


app.post('/edit', (req, res) => {
  const newTimetable = req.body;
  delete newTimetable.successMessage; 

  if (validateTimetable(newTimetable)) {
    timetable = newTimetable;
    fs.writeFileSync(dataFilePath, JSON.stringify(timetable, null, 2), 'utf8');
    res.render('index', { timetable, successMessage: 'Timetable saved successfully' });
  } else {
    res.status(400).send('Invalid timetable configuration');
  }
});


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


function validateTimetable(newTimetable) {
 
  const subjectCount = {
    Languages: 0,
    Sciences: 0,
    Arts: 0,
    Sports: 0,
  };


  for (const day in newTimetable) {
    newTimetable[day].forEach(subject => {
      if (subject && subjectCount.hasOwnProperty(subject)) {
        subjectCount[subject]++;
      }
    });
  }

  // Check if each subject meets its required hours
  for (const subject in subjects) {
    if (subjectCount[subject] !== subjects[subject]) {
      return false;
    }
  }

  return true;
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
