const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors package

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes
// Create a MySQL connection
const connection = mysql.createConnection(
  {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'crudx'
}
);


// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});

// Create a student
app.post('/students', (req, res) => {
  const { names, address } = req.body;

  // Check if names, address, or age is null
  if (!names || !address) {
    return res.status(400).json({ message: 'Please fill all fields: names, address, and age' });
  }

  // Check if the name already exists in the database
  connection.query('SELECT * FROM student WHERE names = ?', [names], (error, results, fields) => {
    if (error) {
      console.error('Error checking student existence: ' + error.stack);
      res.status(500).send('Internal Server Error');
      return;
    }
    
    // If a student with the same name exists, return an error
    if (results.length > 0) {
      console.log('Student with the same name already exists')
      return res.status(409).json({ message: 'Student with the same name already exists' });
    }

    // If the name doesn't exist, insert the new student record
    const student = { names, address };
    connection.query('INSERT INTO student SET ?', student, (error, results, fields) => {
      if (error) {
        console.error('Error creating student: ' + error.stack);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.status(201).json({ message: 'Student created successfully', data: student });
    });
  });
});



// Get all students
app.get('/students', (req, res) => {
  connection.query('SELECT * FROM student',
   (error, results, fields) => {
    if (error) {
      console.error('Error retrieving students: ' + error.stack);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});

// Get a single student by ID
app.get('/students/:id', (req, res) => {
  const studentId = req.params.id;
  connection.query('SELECT * FROM student WHERE id = ?', studentId, (error, results, fields) => {
    if (error) {
      console.error('Error retrieving student: ' + error.stack);
      res.status(500).send('Internal Server Error');
      return;
    }
    if (results.length === 0) {
      res.status(404).send('Student not found');
      return;
    }
    res.json(results[0]);
  });
});

// Update a student by ID
app.put('/students/:id', (req, res) => {
  const studentId = req.params.id;
  const { names, address } = req.body;
  const updatedStudent = { names, address };
  connection.query('UPDATE student SET ? WHERE id = ?', [updatedStudent, studentId], (error, results, fields) => {
    if (error) {
      console.error('Error updating student: ' + error.stack);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.status(201).json({message:'Student updated successfully',updatedStudent:updatedStudent});
  });
});

// Delete a student by ID
app.delete('/students/:id', (req, res) => {
  const studentId = req.params.id;
  connection.query('DELETE FROM student WHERE id = ?', studentId, (error, results, fields) => {
    if (error) {
      console.error('Error deleting student: ' + error.stack);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.send('Student deleted successfully');
  });
});

app.listen(5000, () => {
  console.log("Listening on port 5000");
});
