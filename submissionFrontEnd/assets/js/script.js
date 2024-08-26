document.addEventListener('DOMContentLoaded', function () {
    const RENDER = 'render';
    const BOOKS_KEY = 'BOOKS_KEY';

    const books = JSON.parse(localStorage.getItem(BOOKS_KEY)) || [];

    document.getElementById('addBookForm').addEventListener('submit', function (e) {
        e.preventDefault();
        addBook();
        saveBooks();
        const toast = document.querySelector('.toast')
        toast.classList.add('is-visible');
        setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 3000);
    })

    function generateId() {
        return new Date().getTime();
    }

    function createBookObject(id, title, author, year, isRead) {
        return {
            id,
            title,
            author,
            year,
            isRead
        }
    }

    function addBook() {
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const year = parseInt(document.getElementById('year').value);
        const isRead = document.querySelector('#isRead:checked') === null ? false : true;

        const book = createBookObject(generateId(), title, author, year, isRead);
        books.push(book)
        document.dispatchEvent(new Event(RENDER));
        document.getElementById('addBookForm').reset();
    }

    function createBookItem(bookObject) {
        const bookItem = document.createElement('div');
        bookItem.classList.add('book-item')

        const bookItemInfo = document.createElement('div');
        bookItemInfo.classList.add('book-item-info');

        const bookItemAction = document.createElement('div');
        bookItemAction.classList.add('book-item-action');

        const bookTitle = document.createElement('h4');
        bookTitle.innerText = bookObject.title;

        const bookAuthor = document.createElement('p');
        bookAuthor.innerText = bookObject.author;

        const bookYear = document.createElement('p');
        bookYear.innerText = bookObject.year;

        const doneBtn = document.createElement('button');
        doneBtn.classList.add('btn-sm', 'done');
        doneBtn.innerText = 'Done';

        const undoBtn = document.createElement('button');
        undoBtn.classList.add('btn-sm', 'undo');
        undoBtn.innerText = 'Undo';

        const delBtn = document.createElement('button');
        delBtn.classList.add('btn-sm', 'del');
        delBtn.innerText = 'Delete';

        bookItemInfo.append(bookTitle, bookAuthor, bookYear);
        if (!bookObject.isRead) {
            doneBtn.addEventListener('click', function () {
                addToFinished(bookObject.id);
            });

            delBtn.addEventListener('click', function () {
                const option = confirm(`Are You sure for delete this book : ${bookObject.title}`);
                if (option) removeBook(bookObject.id);
                return
            });

            bookItemAction.append(doneBtn, delBtn);
        } else {
            undoBtn.addEventListener('click', function () {
                undoReadBook(bookObject.id);
            })

            delBtn.addEventListener('click', function () {
                const option = confirm(`Are You sure for delete this book : ${bookObject.title}`);
                if (option) removeBook(bookObject.id);
                return
            });

            bookItemAction.append(undoBtn, delBtn);
        }
        bookItem.append(bookItemInfo, bookItemAction);
        bookItem.setAttribute('id', bookObject.id);

        return bookItem;
    }

    function findBookById(bookId) {
        for (const book of books) {
            if (book.id === bookId) {
                return book;
            }
        }
        return null;
    }

    function findBookIndex(bookId) {
        for (let i = 0; i < books.length; i++) {
            if (books[i].id === bookId) {
                return i;
            }
        }

        return -1;
    }

    function addToFinished(bookId) {
        const bookTarget = findBookById(bookId);

        if (bookTarget === null) return

        bookTarget.isRead = true;
        document.dispatchEvent(new Event(RENDER));
        saveBooks();
    }

    function undoReadBook(bookId) {
        const bookTarget = findBookById(bookId);

        if (bookTarget === null) return

        bookTarget.isRead = false;
        document.dispatchEvent(new Event(RENDER));
        saveBooks();
    }

    function removeBook(bookId) {
        const bookIndex = findBookIndex(bookId);

        if (bookIndex === -1) return

        books.splice(bookIndex, 1);
        document.dispatchEvent(new Event(RENDER));
        saveBooks();
    }

    document.addEventListener(RENDER, function () {
        const unfinishedRead = document.getElementById('unfinishedRead');
        unfinishedRead.innerHTML = '';

        const finishedRead = document.getElementById('finishedRead');
        finishedRead.innerHTML = '';

        for (const book of books) {
            const bookItem = createBookItem(book);
            if (!book.isRead) {
                unfinishedRead.append(bookItem);
            } else {
                finishedRead.append(bookItem);
            }
        }
    });

    function saveBooks() {
        if (typeof Storage !== undefined) {
            const stringedData = JSON.stringify(books);
            localStorage.setItem(BOOKS_KEY, stringedData);
        } else {
            console.log("Your Browser didnt support Web Storage");
        }
    };

    document.getElementById('searchInput').addEventListener('input', function () {
        const keyword = document.getElementById('searchInput').value;
        const filteredBook = books.filter(book => {
            const regex = new RegExp(keyword, 'gi');
            return book.title.match(regex);
        });

        if (keyword !== "") {
            const unfinishedRead = document.getElementById('unfinishedRead');
            unfinishedRead.innerHTML = '';

            const finishedRead = document.getElementById('finishedRead');
            finishedRead.innerHTML = '';

            for (const book of filteredBook) {
                const bookItem = createBookItem(book);
                if (!book.isRead) {
                    unfinishedRead.append(bookItem);
                } else {
                    finishedRead.append(bookItem);
                }
            }
        } else {
            document.dispatchEvent(new Event(RENDER));
        }
    });

    document.dispatchEvent(new Event(RENDER));
});