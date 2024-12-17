import express from 'express';

const usersRouter = express.Router();

// Mock data for users
let users = [
    { id: 1, name: 'John Doe', email: 'johndoe@example.com' },
    { id: 2, name: 'Jane Smith', email: 'janesmith@example.com' },
    { id: 3, name: 'Alice Johnson', email: 'alice@example.com' },
];

let nextUserId = 4; // Counter for the next user ID

// 1. Fetch all users
usersRouter.get('/', (req, res) => {
    res.json(users);
});

// 2. Fetch a specific user by ID
usersRouter.get('/:id', (req, res) => {
    const { id } = req.params;
    const user = users.find((u) => u.id === parseInt(id));
    if (!user) {
        return res.status(404).send(`User with ID ${id} not found.`);
    }
    res.json(user);
});

// 3. Create a new user
usersRouter.post('/', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).send('Name and email are required.');
    }

    const newUser = { id: nextUserId++, name, email };
    users.push(newUser);
    res.status(201).json(newUser);
});

// 4. Update an existing user by ID
usersRouter.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    const user = users.find((u) => u.id === parseInt(id));
    if (!user) {
        return res.status(404).send(`User with ID ${id} not found.`);
    }

    if (name) user.name = name;
    if (email) user.email = email;

    res.json({ message: `User with ID ${id} has been updated.`, user });
});

// 5. Delete a user by ID
usersRouter.delete('/:id', (req, res) => {
    const { id } = req.params;
    const index = users.findIndex((u) => u.id === parseInt(id));
    if (index === -1) {
        return res.status(404).send(`User with ID ${id} not found.`);
    }

    users.splice(index, 1);
    res.send(`User with ID ${id} has been deleted.`);
});

export default usersRouter;


