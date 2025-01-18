import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import db from './lib/db.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'process.env.CLIENT_URL', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});


app.use(cors());


app.use(express.json());


io.on('connection', (socket) => {
  console.log('A user connected');
  
});


app.get('/test', (req, res) => {
  res.send('Hello, world!');
});


app.post('/tasks', async (req, res) => {
  try {
    const { name, status } = req.body;
    const created_at = new Date().toISOString(); 
    const [result] = await db.execute(
      'INSERT INTO tasks (name, status, created_at) VALUES (?, ?, ?)',
      [name, status, created_at]
    );
    const task = { id: result.insertId, name, status, created_at }; 
    io.emit('taskAdded', task); // Emit task with created_at
    res.status(201).json(task);
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ message: 'Failed to add task', error });
  }
});

app.get('/tasks', async (req, res) => {
  try {
    const { searchQuery } = req.query;
    let query = 'SELECT * FROM tasks';
    const queryParams = [];

    if (searchQuery) {
      query += ' WHERE name LIKE ?';
      queryParams.push(`%${searchQuery}%`);
    }

    const [tasks] = await db.execute(query, queryParams);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks', error });
  }
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.execute('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
    const updatedTask = { id, status };
    io.emit('taskUpdated', updatedTask);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task', error });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute('DELETE FROM tasks WHERE id = ?', [id]);
    io.emit('taskDeleted', { id });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task', error });
  }
});

//  server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
