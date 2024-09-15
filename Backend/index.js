const express = require("express");
const { UserModel, TodoModel } = require("./db");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { auth, JWT_TOKEN } = require("./auth");
const cors = require('cors');
const port = 5000;
const app = express();
app.use(express.json());
app.use(cors());
// Load environment variables from the .env file
dotenv.config(); // Use default path (.env) which should be in the root directory

app.post("/signup", async function (req, res) {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({
            msg: "Please provide all the details"
        });
    }

    try {
        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                msg: "User Already Exists"
            });
        }
        const newUser = await UserModel.create({
            email, password, name
        });

        res.status(201).json({
            message: "You are Signed up",
            userId: newUser._id
        });
    } catch (error) {
        if (error.name == 'ValidationError') {
            return res.status(400).json({
                message: 'Validation Error',
                errors: Object.keys(error.errors).map(key => ({
                    field: key,
                    message: error.errors[key].message
                }))
            });
        }
        res.status(500).json({
            message: "An internal server error occurred",
            error: error.message
        });
    }
});

app.post("/signin", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({
        email
    });
    if (!user) {
        return res.status(403).json({
            msg: "Incorrect credentials"
        });
    }

    const response = await user.isPasswordCorrect(password);

    if (response) {
        const token = jwt.sign({
            id: user._id.toString()
        }, JWT_TOKEN);

        res.json({
            token
        });
    } else {
        res.status(403).json({
            message: "Incorrect credentials"
        });
    }
});

app.post("/todo", auth, async function (req, res) {
    const userId = req.userId;
    const title = req.body.title;
    const done = req.body.done;
    const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;

    if (!title) {
        return res.status(403).json({
            message: "Please provide title"
        });
    }

    await TodoModel.create({
        userId, title, done, dueDate
    });

    res.json({
        msg: "Todo Created"
    });
});

app.get("/todos", auth, async function (req, res) {
    const userId = req.userId;

    const todos = await TodoModel.find({
        userId
    });

    res.json({
        todos
    });
});

app.post("/todoFinish/:todoId", auth, async function (req, res) {
    const { todoId } = req.params;
    const userId = req.userId;

    const todo = await TodoModel.findOne({
        _id: todoId,
        userId
    });
    if (!todo) {
        return res.status(404).json({
            message: "Todo not found"
        });
    }

    const updatedTodo = await TodoModel.findOneAndUpdate(
        { _id: todoId, userId },
        { done: true },
        { new: true } // Ensure the updated document is returned
    );

    if (!updatedTodo) {
        return res.status(404).json({
            message: "Todo not found"
        });
    }

    res.json({
        message: "Todo marked as done"
    });
});
// Update a todo
app.put("/todo/:todoId", auth, async function (req, res) {
    const { todoId } = req.params;
    const { title } = req.body;
    const userId = req.userId;

    const todo = await TodoModel.findOne({
        _id: todoId,
        userId
    });

    if (!todo) {
        return res.status(404).json({
            message: "Todo not found"
        });
    }

    const updatedTodo = await TodoModel.findOneAndUpdate(
        { _id: todoId, userId },
        { title },
        { new: true }
    );

    if (!updatedTodo) {
        return res.status(404).json({
            message: "Todo not found"
        });
    }

    res.json({
        message: "Todo updated"
    });
});
// Delete a todo
app.delete("/todo/:todoId", auth, async function (req, res) {
    const { todoId } = req.params;
    const userId = req.userId;

    const todo = await TodoModel.findOne({
        _id: todoId,
        userId
    });

    if (!todo) {
        return res.status(404).json({
            message: "Todo not found"
        });
    }

    await TodoModel.deleteOne({ _id: todoId, userId });

    res.json({
        message: "Todo deleted"
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
    });
