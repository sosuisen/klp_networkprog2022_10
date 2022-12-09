const express = require('express');

const host = 'localhost';
const port = 8080;
const apiEndPoint = '/api/';

const todos = [
  { id: 1, title: 'ネーム', completed: true },
  { id: 2, title: '下書き', completed: false },
];

const app = express();
app.use('/hello', (req, res, next) => {
    res.send('Hello, world!');
});

// staticディレクトリ以下のファイルを静的データとして返す
app.use(express.static('static'));

// リクエスト本文のJSON文字列を自動的にオブジェクトへ変換
app.use(express.json());

app.get(apiEndPoint + 'todos', (req, res) => {
    res.json(todos);
});

app.get(apiEndPoint + 'todos/:id', (req, res, next) => {
    const todo = todos.find(todo => todo.id === parseInt(req.params.id));
    if (todo) {
        return res.json(todo);
    }
    const err = new Error(req.params.id + ' is not found.');
    err.statusCode = 404;
    next(err);
});

app.post(apiEndPoint + 'todos', (req, res, next) => {
    const obj = req.body; // リクエスト本文のJSON文字列から変換されたオブジェクト
    const title = obj.title;
    if (typeof title !== 'string' || !title) {
        const err = new Error('title is required');
        err.statusCode = 400;
        return next(err);
    }
    const lastId = todos[todos.length - 1].id;
    const newTodo = {
        title,
        id: lastId + 1,
        completed: false,
    };
    todos.push(newTodo);
    console.log(`Added new todo: ${JSON.stringify(newTodo)}`);
    // 201 Created を返す
    res.status(201).json(newTodo);
});

app.put(apiEndPoint + 'todos/:id', (req, res, next) => {
    const todo = todos.find(todo => todo.id === parseInt(req.params.id));
    if (todo) {
        const obj = req.body; // リクエスト本文のJSON文字列から変換されたオブジェクト

        Object.assign(todo, obj);
        // 別解
        // Object.keys(obj).forEach(key => todo[key] = obj[key]);
        console.log(`Updated todo: ${JSON.stringify(todo)}`);
        return res.json(todo);
    }
    const err = new Error(req.params.id + ' is not found.');
    err.statusCode = 404;
    next(err);
});

app.delete(apiEndPoint + 'todos/:id', (req, res, next) => {
    const todoIndex = todos.findIndex(todo => todo.id === parseInt(req.params.id));
    if (todoIndex >= 0) {
        todos.splice(todoIndex, 1);
        console.log(`Deleted todo id: ${req.params.id}`);    
        return res.json({ id: req.params.id });
    }
    const err = new Error(req.params.id + ' is not found.');
    err.statusCode = 404;
    next(err);
});

// エラーハンドリングミドルウェア 教科書 p.184
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message });
});

app.listen(port, host, () => console.log("Express server has been started!"));