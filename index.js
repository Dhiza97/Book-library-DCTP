const http = require('http');
const fs = require('fs');

let users = [];
let books = [];

// Load users from file if it exists
if (fs.existsSync('users.json')) {
    const data = fs.readFileSync('users.json', 'utf8');
    users = JSON.parse(data);
}

// Load books from file if it exists
if (fs.existsSync('books.json')) {
    const data = fs.readFileSync('books.json', 'utf8');
    books = JSON.parse(data);
}

const server = http.createServer((req, res) => {
    const { url, method } = req;

    // Set response headers
    res.setHeader('Content-Type', 'application/json');

    // Users Routes
    if (url.toLowerCase() === '/createuser' && method === 'POST') {
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
    } else if (url.toLowerCase() === '/authenticateuser' && method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { name, password } = JSON.parse(body);
            const user = users.find(user => user.name === name && user.password === password);
            if (user) {
                res.end(JSON.stringify({ message: 'Authenticated successfully', user }));
            } else {
                res.statusCode = 401;
                res.end(JSON.stringify({ message: 'Authentication failed' }));
            }
        });
    } else if (url.toLowerCase() === '/getallusers' && method === 'GET') {
        res.end(JSON.stringify(users));
    }

    // Books Routes
    else if (url.toLowerCase() === '/createbook' && method === 'POST') {
        // Create a new book
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const newBook = JSON.parse(body);
            const existingBook = books.find(book => book.title === newBook.title);
            if (!existingBook) {
                books.push(newBook);
                fs.writeFileSync('books.json', JSON.stringify(books));
                res.end(JSON.stringify({ message: 'Book created successfully', book: newBook }));
            } else {
                res.statusCode = 400; // Bad Request
                res.end(JSON.stringify({ message: 'Book with the same title already exists' }));
            }
        });
    } else if (url.toLowerCase() === '/loanout' && method === 'POST') {
        // Loan out a book
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { name, title } = JSON.parse(body);
            const user = users.find(user => user.name === name);
            const book = books.find(book => book.title === title && !book.loanedOut);
            if (user && book) {
                book.loanedOut = true;
                book.borrower = name;
                book.dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
                user.borrowedBooks.push(title);
                fs.writeFileSync('users.json', JSON.stringify(users));
                fs.writeFileSync('books.json', JSON.stringify(books));
                res.end(JSON.stringify({ message: 'Book loaned successfully', book, user }));
            } else {
                res.statusCode = 400; // Bad Request
                res.end(JSON.stringify({ message: 'User or book not found, or book is already loaned' }));
            }
        });
    } else if (url.toLowerCase() === '/return' && method === 'POST') {
        // Return a book
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { name, title } = JSON.parse(body);
            const user = users.find(user => user.name === name);
            const book = books.find(book => book.title === title && book.loanedOut && book.borrower === name);
            if (user && book) {
                book.loanedOut = false;
                delete book.borrower;
                delete book.dueDate;
                const index = user.borrowedBooks.indexOf(title);
                if (index !== -1) {
                    user.borrowedBooks.splice(index, 1);
                }
                fs.writeFileSync('users.json', JSON.stringify(users));
                fs.writeFileSync('books.json', JSON.stringify(books));
                res.end(JSON.stringify({ message: 'Book returned successfully', book, user }));
            } else {
                res.statusCode = 400; // Bad Request
                res.end(JSON.stringify({ message: 'User or book not found, or book is not loaned to the user' }));
            }
        });
    } else if (url.toLowerCase() === '/update' && method === 'PUT') {
        // Update a book
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { currentTitle, currentAuthor, newTitle, newAuthor } = JSON.parse(body);
            const book = books.find(book => book.title === currentTitle && book.author === currentAuthor);
            if (book) {
                book.title = newTitle;
                book.author = newAuthor;
                fs.writeFileSync('books.json', JSON.stringify(books));
                res.end(JSON.stringify({ message: 'Book updated successfully', updatedBook: book }));
            } else {
                res.statusCode = 404; // Not Found
                res.end(JSON.stringify({ message: 'Book not found' }));
            }
        });
    } else if (url.toLowerCase() === '/deletebook' && method === 'DELETE') {
        // Delete a book
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { title } = JSON.parse(body);
            const index = books.findIndex(book => book.title === title);
            if (index !== -1) {
                books.splice(index, 1);
                fs.writeFileSync('books.json', JSON.stringify(books));
                res.end(JSON.stringify({ message: 'Book deleted successfully' }));
            } else {
                res.statusCode = 404; // Not Found
                res.end(JSON.stringify({ message: 'Book not found' }));
            }
        });
    }

    else {
        // Route not found
        res.statusCode = 404;
        res.end(JSON.stringify({ message: 'Route not found' }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});