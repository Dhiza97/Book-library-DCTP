const http = require('http');
const fs = require('fs');

let users = [];
let books = [];

const server = http.createServer((req, res) => {
    const { url, method } = req;

    // Set response headers
    res.setHeader('Content-Type', 'application/json');

    // Users Routes
    if (url === '/createUser' && method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const newUser = JSON.parse(body);
            users.push(newUser);
            fs.writeFileSync('users.json', JSON.stringify(users));
            res.end(JSON.stringify({ message: 'User created successfully', user: newUser }));
        });
    } else if (url === '/authenticateUser' && method === 'POST') {
        // Implement authentication logic here
        res.end(JSON.stringify({ message: 'Authenticated successfully' }));
    } else if (url === '/getAllUsers' && method === 'GET') {
        res.end(JSON.stringify(users));
    }

    // Books Routes
    else if (url === '/createBook' && method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const newBook = JSON.parse(body);
            books.push(newBook);
            fs.writeFileSync('./books.json', JSON.stringify(books));
            res.end(JSON.stringify({ message: 'Book created successfully', book: newBook }));
        });

    } else if (url === '/delete' && method === 'DELETE') {
        // Implement delete logic here
        res.end(JSON.stringify({ message: 'Deleted successfully' }));
        
    } else if (url === '/loanOut' && method === 'POST') {
        // Implement loan out logic here
        res.end(JSON.stringify({ message: 'Loaned book' }));

    } else if (url === '/return' && method === 'POST') {
        // Implement return logic here
        res.end(JSON.stringify({ message: 'Returned book' }));

    } else if (url === '/update' && method === 'PUT') {
        // Implement update logic here
        res.end(JSON.stringify({ message: 'Update successfully' }));
    }

    // Default Route
    else {
        res.statusCode = 404;
        res.end(JSON.stringify({ message: 'Route not found' }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});