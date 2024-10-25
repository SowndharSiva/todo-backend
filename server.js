const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const app = express();
const cors=require("cors")

let db = null;

app.use(cors());
app.use(express.json());

const initializeDbAndServer = async () => {
    try {
        db = await open({
            filename: path.join(__dirname, "Todo.db"),
            driver: sqlite3.Database,
        });
        app.listen(3005, () => {
            console.log("Server is running on http://localhost:3005");
        });
    } catch (err) {
        console.log(`Db Error: ${err.message}`);
        process.exit(1);
    }
};
initializeDbAndServer();

// Getting the todos
app.get("/todos", async (req, res) => {
    try {
        const getQuery = `SELECT * FROM todo;`;
        const getTodos = await db.all(getQuery);
        res.send(getTodos);
    } catch (err) {
        res.status(500).send({ error: "Error fetching todos" });
    }
});

//Adding a new Todo
app.post("/todos/add", async (req, res) => {
    const { title, description, isChecked } = req.body;
    try {
        const postQuery = `
            INSERT INTO todo (title, description, isChecked) 
            VALUES (?, ?, ?);
        `;
        await db.run(postQuery, title, description, isChecked);
        res.status(200).send("Todo added successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Error on posting the Todo" });
    }
});


// Update Todo 
app.put("/todos/update/:id", async (req, res) => {
    console.log("Received a PUT request on /todos/update/:id"); 
    const { id } = req.params;
    console.log(id)
    const { title, description, isChecked } = req.body; 
    try {
        const updateQuery = `
            UPDATE todo 
            SET title = ?, description = ?, isChecked = ? 
            WHERE id = ?;
        `;
        const result = await db.run(updateQuery, title, description, isChecked, id);

        // Check if the row was modified
        if (result.changes === 0) {
            res.status(404).send({ error: "Todo not found or no changes made" });
        } else {
            res.status(200).send("Todo updated successfully");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Error updating the Todo" });
    }
});

// Delete Item
app.delete("/todos/delete/:id", async (req, res) => {
    const { id } = req.params; 

    try {
        const deleteQuery = `DELETE FROM todo WHERE id = ?;`;
        const result = await db.run(deleteQuery, id);

        // Check if the row was deleted
        if (result.changes === 0) {
            res.status(404).send({ error: "Todo not found" });
        } else {
            res.status(200).send("Todo deleted successfully");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Error deleting the Todo" });
    }
});
