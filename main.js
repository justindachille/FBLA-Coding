var script = document.createElement('script');
script.src = 'http://code.jquery.com/jquery-1.11.0.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

var config = {
  apiKey: "AIzaSyAimFk0NTla6Gp4PkyZ47qnol8co8PTsKI",
  authDomain: "library-d7f65.firebaseapp.com",
  databaseURL: "https://library-d7f65.firebaseio.com",
  projectId: "library-d7f65",
  storageBucket: "library-d7f65.appspot.com",
  messagingSenderId: "634700996570"
};

function loadJSON(callback) {

  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', 'userdata.json', true); // Replace 'my_data' with the path to your file
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

firebase.initializeApp(config);
// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();
var STUDENT_CHECKOUT_PERIOD = 14;
var TEACHER_CHECKOUT_PERIOD = 90;
var MAX_STUDENT_CHECKOUTS = 3;
var MAX_TEACHER_CHECKOUTS = 10;
var MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
var OVERDUE_COST_PER_DAY = 0.18;
var USER_MAX_READ = 30;
var BOOK_MAX_READ = 50;
var USER_COLLECTION = "users";
var BOOK_COLLECTION = "books";
var CHECKOUT_COLLECTION = "checkouts";
var selectedUserId = "";
var selectedBookId = "";
var selectedBookTitle = "";
var selectedBook;
var selectedUser;

function importData() {
  createBook(title, author, genre, ISBN, pubdate, pages)
  loadJSON(function (response) {
    // Parse JSON string into object
    var actual_JSON = JSON.parse(response);
    for (var i = 0; i < 1; i++) {
      console.log(actual_JSON[i].author);
      var bookAuthor = actual_JSON[i].author

      var bookTitle = actual_JSON[i].title;
      console.log(actual_JSON[i].title);

      var bookISBN = actual_JSON[i].isbn13;
      console.log(actual_JSON[i].isbn13);

      var bookGenre = actual_JSON[i].subjects;
      var bookGenreSplit = bookGenre.substr(0, bookGenre.indexOf(','));
      console.log(actual_JSON[i].subjects);

      var bookPubdate = actual_JSON[i].pubdate;
      console.log(actual_JSON[i].pubdate);

      var bookPages = actual_JSON[i].pages;
      console.log(actual_JSON[i].pages);
      createBookArgs(bookTitle, bookAuthor, bookGenreSplit, bookISBN, bookPubdate, bookPages);
    }
  });

  loadJSON(function (response) {
    var actual_JSON = JSON.parse(response);
    // Parse JSON string into object
    for (var i = 0; i < 50; i++) {
      var userFirstName = actual_JSON[i].firstName;
      var userLastname = actual_JSON[i].lastName;

      createUserArgs(userFirstName, userLastname);
    }
  });

}

window.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("editForm");

  // Called when the edit user button is clicked
  document.getElementById("editUserButton").addEventListener("click", function () {
    var newFirstName = document.getElementById("selectionFirstName").value;
    var newLastName = document.getElementById("selectionLastName").value;
    var newIsTeacher = document.getElementById("selectionIsTeacher").checked;
    var userDocRef = db.collection(USER_COLLECTION).doc(selectedUserId);
    console.log("Id: " + selectedUserId);
    return db.runTransaction(function (transaction) {
      return transaction.get(userDocRef).then(function (userDoc) {
        if (!userDoc) {
          throw "Document does not exist!"
        }
        if (!userDoc.exists) {
          throw "Document does not exist!"
        }
        transaction.update(
          userDocRef, {
            firstName: newFirstName,
            lastName: newLastName,
            isTeacher: newIsTeacher
          });
        return newFirstName;
      });
    }).then(function () {
      console.log("Transaction successfully committed!");
      readAllUsers();
    }).catch(function (error) {
      console.log("Transaction failed: ", error);
    })
  });

  // Called when the edit book button is clicked
  document.getElementById("editBookButton").addEventListener("click", function () {
    var newTitle = document.getElementById("selectionTitle").value;
    var newAuthor = document.getElementById("selectionAuthor").value;
    var newCopies = document.getElementById("selectionCopies").value;
    var bookDocRef = db.collection(BOOK_COLLECTION).doc(selectedBookId);
    console.log("Book ID: " + selectedBookId);
    return db.runTransaction(function (transaction) {
      return transaction.get(bookDocRef).then(function (bookDoc) {
        if (!bookDoc) {
          throw "Document does not exist!"
        }
        if (!bookDoc.exists) {
          throw "Document does not exist!"
        }
        transaction.update(
          bookDocRef, {
            title: newTitle,
            author: newAuthor,
            copies: newCopies
          });
        return newTitle;
      });
    }).then(function () {
      console.log("Transaction successfully committed!");
    }).catch(function (error) {
      console.log("Transaction failed: ", error);
    })
  });
});

function makeAllReports() {
  makeReports("");
}

function searchReports() {
  var queryString = document.getElementById("reportSearchInput").value;
  makeReports(queryString);
}

function makeReports(queryString) {
  var checkoutsRef = db.collection(CHECKOUT_COLLECTION);
  checkoutsRef
    .where("checkinDate", "==", "null")
    .get()
    .then(function (querySnapshot) {
      //Create each table for reports and fines
      var fineCheckoutList = document.querySelector("#fineList");
      fineCheckoutList.innerHTML = "";
      var fineTable = document.createElement("table");
      fineTable.className = "table";
      fineTable.appendChild(makeFineHeader());
      fineCheckoutList.appendChild(fineTable);

      var weeklyCheckoutList = document.querySelector("#checkoutList");
      weeklyCheckoutList.innerHTML = "";
      var weeklyTable = document.createElement("table");
      weeklyTable.className = "table";
      weeklyTable.appendChild(makeCheckoutHeader());
      weeklyCheckoutList.appendChild(weeklyTable);
      querySnapshot.forEach((doc) => {
        var checkout = doc.data();
        var newCheckout = new Checkout(checkout.userId, checkout.userFullName, checkout.userIsTeacher, checkout.bookId, checkout.bookTitle, checkout.checkoutDate, doc.id);
        if (!newCheckout.containsString(queryString)) {
          return;
        }
        // If user is teacher, use teacher checkout period and fine, else use student checkout period and fine
        if (checkout.userIsTeacher) {
          var dueDate = addDays(new Date(), TEACHER_CHECKOUT_PERIOD);
          if (checkout.checkoutDate < dueDate) {
            weeklyTable.appendChild(makeCheckoutHtml(checkout));
          } else {
            fineTable.appendChild(makeFineHtml(checkout));
          }
        } else {
          var dueDate = addDays(new Date(), STUDENT_CHECKOUT_PERIOD);
          console.log("dueDate: " + dueDate);
          console.log("checkoutDate: " + checkout.checkoutDate);
          if (checkout.checkoutDate < dueDate) {
            console.log("less than");
            weeklyTable.appendChild(makeCheckoutHtml(checkout));
          } else {
            console.log("greater than");
            fineTable.appendChild(makeFineHtml(checkout));
          }
        }
      });
    });
}

function searchUsers() {
  var searchText = document.getElementById("userSearchInput").value;
  readUsers(searchText);
}

function readAllUsers() {
  readUsers("");
}

function readUsers(queryString) {
  db.collection(USER_COLLECTION).limit(USER_MAX_READ).get().then((querySnapshot) => {
    var userList = document.querySelector("#userList");
    userList.innerHTML = "";
    var table = document.createElement("table");
    table.className = "table";
    table.appendChild(makeUserHeader());
    userList.appendChild(table);
    querySnapshot.forEach((doc) => {
      user = doc.data();
      var newUser = new User(user.firstName, user.lastName, user.isTeacher, doc.id);
      if (newUser.containsString(queryString)) {
        table.appendChild(makeUserHtml(newUser));
      }
    });
  });
}

function searchBooks() {
  var searchText = document.getElementById("bookSearchInput").value;
  readBooks(searchText);
}

function readAllBooks() {
  readBooks("");
}

function readBooks(queryString) {
  db.collection(BOOK_COLLECTION).get().then((querySnapshot) => {
    var readCount = 0;
    var bookList = document.querySelector("#bookList");
    bookList.innerHTML = "";
    var table = document.createElement('table');
    table.className = "table";
    table.appendChild(makeBookHeader());
    bookList.appendChild(table);
    querySnapshot.forEach((doc) => {
      book = doc.data();
      //constructor (title, author, genre, ISBN, pubdate, pages, copies, id)
      var newBook = new Book(book.title, book.author, book.genre, book.ISBN, book.pubdate, book.pages, book.copies, doc.id);
      if (newBook.containsString(queryString)) {
        readCount++;
        if (readCount >= BOOK_MAX_READ) {
          return;
        }
        table.appendChild(makeBookHtml(newBook));
      }
    });
  });
}

// Called when a user is selected
function selectUser(user) {
  document.getElementById("selectionFirstName").value = user.firstName;
  document.getElementById("selectionLastName").value = user.lastName;
  document.getElementById("selectionIsTeacher").checked = user.isTeacher;
  console.log("user: " + user.isTeacher);
  document.getElementById("selectionId").innerHTML = "Id: " + user.id;
  document.getElementById("selectedUser").innerHTML = "Selected user: " + user.fullName;
}

// Called when a book is selected
function selectBook(book) {
  document.getElementById("selectionTitle").value = book.title;
  document.getElementById("selectionAuthor").value = book.author;
  document.getElementById("selectionCopies").value = book.copies;
  document.getElementById("checkoutBookTitle").innerHTML = book.title;
  document.getElementById("checkoutUserId").value = selectedUserId;
  if (!selectedUser) {
    document.getElementById("checkoutButton").className = "disabledButton";
    document.getElementById("checkoutButton").disabled = true;
    document.getElementById("checkinButton").className = "disabledButton";
    document.getElementById("checkinButton").disabled = true;
    return;
  }
  var checkoutsRef = db.collection(CHECKOUT_COLLECTION);
  // Get number of books checked out by user
  checkoutsRef
    .where("userId", "==", selectedUserId)
    .where("checkinDate", "==", "null")
    .get()
    .then(function (querySnapshot) {
      var numBooksCheckedOut = querySnapshot.docs.length;
      console.log("numBooksCheckedOut: " + numBooksCheckedOut);
      if (selectedUser.isTeacher) {
        if (numBooksCheckedOut >= MAX_TEACHER_CHECKOUTS) {
          document.getElementById("checkoutButton").className = "disabledButton";
          document.getElementById("checkoutButton").disabled = true;
          return false;
        }
      } else {
        if (numBooksCheckedOut >= MAX_STUDENT_CHECKOUTS) {
          console.log("user has checked out more than max number!");
          document.getElementById("checkoutButton").className = "disabledButton";
          document.getElementById("checkoutButton").disabled = true;
          return false;
        }
      }
      return true;
    }).then(function (shouldContinue) {
      if (!shouldContinue) {
        return false;
      }
      checkoutsRef
        .where("bookId", "==", selectedBookId)
        .where("checkinDate", "==", "null")
        .get()
        .then(function (querySnapshot) {
          console.log("selectedBookid: " + selectedBookId);
          var numCheckouts = querySnapshot.docs.length;
          var remainingCopies = book.copies - numCheckouts;
          console.log("numCheckouts: " + numCheckouts + " remaining " + remainingCopies);
          document.getElementById("checkoutCopies").innerHTML = remainingCopies + " out of " + book.copies;
          if (remainingCopies == 0) {
            document.getElementById("checkoutButton").className = "disabledButton";
            document.getElementById("checkoutButton").disabled = true;
          } else {
            document.getElementById("checkoutButton").className = "enableButton";
            document.getElementById("checkoutButton").disabled = false;
          }
        });
      return true;
    }).then(function (shouldContinue) {
      if (!shouldContinue) {
        return false;
      }
      // Check to see if user has the selected book checked out
      checkoutsRef
        .where("userId", "==", selectedUserId)
        .where("bookId", "==", selectedBookId)
        .where("checkinDate", "==", "null")
        .get()
        .then(function (querySnapshot) {
          console.log("user has checked out: " + querySnapshot.docs.length);
          if (querySnapshot.docs.length <= 0) {
            document.getElementById("checkinButton").className = "disabledButton";
            document.getElementById("checkinButton").disabled = true;
            console.log("disabled: " + querySnapshot.docs.length);
          } else {
            document.getElementById("checkinButton").className = "enableButton";
            document.getElementById("checkinButton").disabled = false;
          }
        });
    });
}

function createUser() {
  var firstNameText = capitalizeFirstLetter(document.getElementById("firstName").value);
  var lastNameText = capitalizeFirstLetter(document.getElementById("lastName").value);
  var isTeacherChecked = document.getElementById("isTeacher").checked;
  db.collection(USER_COLLECTION).doc().set({
      firstName: firstNameText,
      lastName: lastNameText,
      isTeacher: isTeacherChecked
    })
    .then(function (docRef) {
      console.log("user written");
    });
  readAllUsers();
}

function createUserArgs(firstName, lastName) {
  var isTeacherChecked = Math.random() >= 0.9;
  var id = Math.floor(Math.random() * 90000) + 10000;
  id = "" + id;
  db.collection(USER_COLLECTION).doc(id).set({
      firstName: firstName,
      lastName: lastName,
      isTeacher: isTeacherChecked
    })
    .then(function (docRef) {
      console.log("user written");
    });
  readAllUsers();
}

function createUser() {
  var firstNameText = capitalizeFirstLetter(document.getElementById("firstName").value);
  var lastNameText = capitalizeFirstLetter(document.getElementById("lastName").value);
  var isTeacherChecked = document.getElementById("isTeacher").checked;
  db.collection(USER_COLLECTION).doc().set({
      firstName: firstNameText,
      lastName: lastNameText,
      isTeacher: isTeacherChecked
    })
    .then(function (docRef) {
      console.log("user written");
    });
  readAllUsers();
}

function createBookArgs(title, author, genre, ISBN, pubdate, pages) {
  var maximumCopies = 3;
  var minimumCopies = 1;
  var randomCopies = Math.floor(Math.random() * (maximumCopies - minimumCopies + 1)) + minimumCopies;
  var ISBN = "" + ISBN;
  db.collection(BOOK_COLLECTION).doc(ISBN).set({
      title: title,
      author: author,
      genre: genre,
      ISBN: ISBN,
      pubdate: pubdate,
      pages: pages,
      copies: randomCopies
    })
    .then(function (docRef) {
      console.log("book written");
    });
}

function createBook() {
  var bookTitleText = document.getElementById("bookTitle").value;
  var bookAuthorText = document.getElementById("bookAuthor").value;
  var bookGenreText = document.getElementById("bookGenre").value;
  var bookISBNText = document.getElementById("bookISBN").value;
  var pubdate = document.getElementById("bookPubdate").value;
  var pagesText = document.getElementById("bookPages").value;
  var bookCopiesText = document.getElementById("bookCopies").value;
  db.collection(BOOK_COLLECTION).doc().set({
      title: bookTitleText,
      author: bookAuthorText,
      genre: bookGenreText,
      ISBN: bookISBNText,
      pubdate: pubdateText,
      pages: pagesText,
      copies: bookCopiesText
    })
    .then(function (docRef) {
      console.log("book written");
    });
  readBooks("");
}

function makeFineHeader() {
  var bookTitle = document.createElement("th");
  bookTitle.className = "bookTitle";
  bookTitle.id = "fineTable";
  bookTitle.innerHTML = "Book Title";

  var username = document.createElement("th");
  username.className = "username";
  username.id = "fineTable";
  username.innerHTML = "Name";

  var fine = document.createElement("th");
  fine.className = "fine";
  fine.id = "fineTable";
  fine.innerHTML = "Fine";

  var checkoutDate = document.createElement("th");
  checkoutDate.className = "checkoutDate";
  checkoutDate.id = "fineTable";
  checkoutDate.innerHTML = "Checkout Date";

  var date = document.createElement("th");
  date.className = "date";
  date.id = "fineTable";
  date.innerHTML = "Days after due";

  var row = document.createElement('tr');
  row.id = "fineTable";
  row.appendChild(bookTitle);
  row.appendChild(username);
  row.appendChild(fine);
  row.appendChild(checkoutDate);
  row.appendChild(date);
  return row;
}

function makeFineHtml(checkout) {
  var bookTitle = document.createElement("td");
  bookTitle.className = "bookTitle";
  bookTitle.innerHTML = checkout.bookTitle;

  var username = document.createElement("td");
  username.className = "username";
  username.innerHTML = checkout.userFullName;

  //Days overdue
  var date = document.createElement("td");
  date.className = "date";

  var checkoutDate = document.createElement("td");
  checkoutDate.className = "checkoutDate";
  checkoutDate.innerHTML = checkout.checkoutDate.toLocaleDateString();

  // Check if user is teacher or student to calculate period
  if (checkout.userIsTeacher) {
    var checkinDate = addDays(checkout.checkoutDate, TEACHER_CHECKOUT_PERIOD);
    var timeDifference = checkinDate - (new Date());
    var daysOverdue = Math.abs(Math.floor(timeDifference / MILLIS_PER_DAY));
    date.innerHTML = daysOverdue;
  } else {
    var checkinDate = addDays(checkout.checkoutDate, STUDENT_CHECKOUT_PERIOD);
    var timeDifference = checkinDate - (new Date());
    var daysOverdue = Math.abs(Math.floor(timeDifference / MILLIS_PER_DAY));
    date.innerHTML = daysOverdue;
  }

  var fine = document.createElement("td");
  fine.classname = "fine";
  var fineAmount = OVERDUE_COST_PER_DAY * daysOverdue;
  fine.innerHTML = "$" + fineAmount.toFixed(2);

  var row = document.createElement('tr');
  row.appendChild(bookTitle);
  row.appendChild(username);
  row.appendChild(fine);
  row.appendChild(checkoutDate);
  row.appendChild(date);

  return row;
}

function makeCheckoutHeader() {
  var bookTitle = document.createElement("th");
  bookTitle.className = "bookTitle";
  bookTitle.innerHTML = "Book Title";

  var username = document.createElement("th");
  username.className = "username";
  username.innerHTML = "Name";

  var checkoutDate = document.createElement("th");
  checkoutDate.className = "checkoutDate";
  checkoutDate.innerHTML = "Checkout Date";

  var date = document.createElement("th");
  date.className = "date";
  date.innerHTML = "Days until due";
  var row = document.createElement('tr');

  row.appendChild(bookTitle);
  row.appendChild(username);
  row.appendChild(checkoutDate);
  row.appendChild(date);
  return row;
}

function makeCheckoutHtml(checkout) {
  var bookTitle = document.createElement("td");
  bookTitle.className = "bookTitle";
  bookTitle.innerHTML = checkout.bookTitle;

  var username = document.createElement("td");
  username.className = "username";
  username.innerHTML = checkout.userFullName;

  var checkoutDate = document.createElement("td");
  checkoutDate.className = "checkoutDate";
  checkoutDate.innerHTML = checkout.checkoutDate.toLocaleDateString();

  // Check if user is teacher or student
  if (checkout.userIsTeacher) {
    var date = document.createElement("td");
    date.className = "date";
    var checkinDate = addDays(checkout.checkoutDate, TEACHER_CHECKOUT_PERIOD);
    var timeDifference = checkinDate - (new Date());
    date.innerHTML = Math.floor(timeDifference / MILLIS_PER_DAY);
  } else {
    var date = document.createElement("td");
    date.className = "date";
    var checkinDate = addDays(checkout.checkoutDate, STUDENT_CHECKOUT_PERIOD);
    var timeDifference = checkinDate - (new Date());
    date.innerHTML = Math.floor(timeDifference / MILLIS_PER_DAY);
  }

  var row = document.createElement('tr');
  row.appendChild(bookTitle);
  row.appendChild(username);
  row.appendChild(checkoutDate);
  row.appendChild(date);

  return row;
}

function makeUserHeader() {
  var firstName = document.createElement("th");
  firstName.className = "firstName";
  firstName.innerHTML = "First Name";

  var lastName = document.createElement("th");
  lastName.className = "lastname";
  lastName.innerHTML = "Last Name";

  var isTeacher = document.createElement("th");
  isTeacher.className = "isTeacher";
  isTeacher.innerHTML = "Teacher or Student";

  var id = document.createElement("th");
  id.className = "id";
  id.innerHTML = "Id";

  var row = document.createElement('tr');
  row.appendChild(firstName);
  row.appendChild(lastName);
  row.appendChild(isTeacher);
  row.appendChild(id);

  return row;
}

function makeUserHtml(user) {
  var firstName = document.createElement("td");
  firstName.className = "firstName";
  firstName.innerHTML = user.firstName;

  var lastName = document.createElement("td");
  lastName.className = "lastName";
  lastName.innerHTML = user.lastName;

  var isTeacher = document.createElement("td");
  isTeacher.className = "isTeacher";
  isTeacher.innerHTML = "Student";
  if (user.isTeacher) {
    isTeacher.innerHTML = "Teacher";
  }

  var id = document.createElement("td");
  id.className = "id";
  id.innerHTML = user.id;

  var row = document.createElement('tr');
  row.appendChild(firstName);
  row.appendChild(lastName);
  row.appendChild(isTeacher);
  row.appendChild(id);

  if (user.id === selectedUserId) {
    row.className = "tableSelected";
  }

  // Called when row is clicked    
  row.onclick = function () {
    selectedUserId = user.id;
    selectedUser = user;
    selectUser(user);
    onUserTextChanged();
    console.log(selectedUserId);
    readAllUsers();
  };
  return row;
}

function makeBookHeader() {
  var title = document.createElement("th");
  title.className = "title";
  title.innerHTML = "Title";

  var author = document.createElement("th");
  author.className = "author";
  author.innerHTML = "Author";

  var genre = document.createElement("th");
  genre.className = "genre";
  genre.innerHTML = "Genre";

  var isbn = document.createElement("th");
  isbn.className = "isbn";
  isbn.innerHTML = "ISBN";

  var pubdate = document.createElement("th");
  pubdate.className = "pubdate";
  pubdate.innerHTML = "Publish Date";

  var pages = document.createElement("th");
  pages.className = "pages";
  pages.innerHTML = "Pages";

  // Called when row is clicked
  var row = document.createElement('tr');
  row.appendChild(title);
  row.appendChild(author);
  row.appendChild(genre);
  row.appendChild(pubdate);
  row.appendChild(pages);
  row.appendChild(isbn);

  return row;
}

function makeBookHtml(book) {
  var title = document.createElement("td");
  title.className = "title";
  title.innerHTML = book.title;

  var author = document.createElement("td");
  author.className = "author";
  author.innerHTML = book.author;

  var genre = document.createElement("td");
  genre.className = "genre";
  genre.innerHTML = book.genre;

  var isbn = document.createElement("td");
  isbn.className = "isbn";
  isbn.innerHTML = book.ISBN;

  var pubdate = document.createElement("td");
  pubdate.className = "pubdate";
  pubdate.innerHTML = book.pubdate;

  var pages = document.createElement("td");
  pages.className = "pages";
  pages.innerHTML = book.pages;

  var row = document.createElement('tr');
  row.appendChild(title);
  row.appendChild(author);
  row.appendChild(genre);
  row.appendChild(pubdate);
  row.appendChild(pages);
  row.appendChild(isbn);

  if (book.id === selectedBookId) {
    row.classList.add("tableSelected");
  }

  // Called when row is clicked
  row.onclick = function () {
    selectedBookId = book.id;
    selectedBookTitle = book.title;
    selectedBook = book;
    selectBook(book);
    onBookTextChanged();
    console.log("selected book: " + book.title + " with id: " + book.id);
    readBooks("");
  }
  return row;
}

// Called when checkout button is pressed.
async function checkout() {
  if (document.getElementById("checkoutButton").disabled) {
    return;
  }
  var checkoutUserId = document.getElementById("checkoutUserId").value;
  var selectedUserName = "";
  var promise = db.collection(USER_COLLECTION).doc(checkoutUserId).get().then(function (doc) {
    user = doc.data();
    var newUser = new User(user.firstName, user.lastName, user.isTeacher, doc.id);
    console.log(newUser.fullName);
    selectedUserName = newUser.fullName;
    selectedUser = newUser;
    console.log("selectedUserName: " + selectedUserName);
  });
  promise.then(function () {
    console.log("asynç " + selectedUserName);
    console.log("checking out with book ID: " + selectedBookId);
    db.collection(CHECKOUT_COLLECTION).doc().set({
      userId: checkoutUserId,
      userFullName: selectedUserName,
      userIsTeacher: selectedUser.isTeacher,
      bookId: selectedBookId,
      bookTitle: selectedBookTitle,
      checkinDate: "null",
      checkoutDate: new Date()
    })
  }).then(function (docRef) {
    console.log("book checked out!");
    readBooks(selectedBookId);
    selectBook(selectedBook);
  });
}

// Called when checkin button is pressed.
function checkin() {
  if (document.getElementById("checkinButton").disabled) {
    return;
  }
  var checkinUserId = selectedUserId;
  var selectedUserName = "";
  var lastCheckoutId;

  // Get ID of one of the checked out books.
  var promise = db.collection(CHECKOUT_COLLECTION)
    .where("bookId", "==", selectedBookId)
    .where("userId", "==", selectedUserId)
    .where("checkinDate", "==", "null")
    .get()
    .then((querySnapshot) => {
      var lastCheckout;
      querySnapshot.forEach(function (checkout) {
        lastCheckout = checkout;
        console.log("checkout id: " + checkout.id);
      });
      console.log("lastCheckoutId: " + lastCheckout);
      lastCheckoutId = lastCheckout.id;
      return lastCheckout.id;
    });

  // Use checkout ID to add a checkin date.
  promise.then((checkoutId) => {
    db.runTransaction(function (transaction) {
      var checkoutRef = db.collection(CHECKOUT_COLLECTION).doc(lastCheckoutId);
      return transaction.get(checkoutRef).then((unused) => {
        transaction.update(checkoutRef, {
          checkinDate: new Date()
        });
      });

    }).then(function () {
      console.log("Transaction successfully committed!");
      readBooks(selectedBookId);
      selectBook(selectedBook);
    }).catch(function (error) {
      console.log("Transaction failed: ", error);
    });
  });
}

function deleteBook() {
  if (!selectedBookId) {
    return;
  }
  db.collection(BOOK_COLLECTION).doc(selectedBookId).delete().then(function () {
    console.log("Document successfully deleted!");
  }).catch(function (error) {
    console.error("Error removing document: ", error);
  });
  readBooks("");
}

function onUserTextChanged() {
  var firstNameInput = document.getElementById("firstName").value;
  var lastNameInput = document.getElementById("lastName").value;
  var isTeacherInput = document.getElementById("isTeacher").value;
  if (firstNameInput || lastNameInput || isTeacherInput) {
    enableUserButtons();
  } else {
    disableUserButtons();
  }
  readAllUsers();
}

// Controls the help tips for the book tab
function bookHelp(selectedObject) {
  var bookCreateHelp = document.getElementById("bookCreateHelpTip");
  var bookEditHelp = document.getElementById("bookEditHelpTip");
  var bookCheckoutHelp = document.getElementById("bookCheckoutHelpTip");
  var bookSearchHelp = document.getElementById("bookSearchHelpTip");

  bookCreateHelp.style.visibility = "hidden";
  bookEditHelp.style.visibility = "hidden";
  bookCheckoutHelp.style.visibility = "hidden";
  bookSearchHelp.style.visibility = "hidden";
  if (selectedObject.id == "bookCreate") {
    bookCreateHelp.style.visibility = "visible";
  }

  if (selectedObject.id == "bookEdit") {
    bookEditHelp.style.visibility = "visible";
  }

  if (selectedObject.id == "bookCheckout") {
    var checkoutHelpText = document.getElementById("bookCheckoutHelpText");
    if (selectedUser == null) {
      checkoutHelpText.innerHTML = "Select a user to start checkout!";
      checkoutHelpText.style.color = "Red";
    } else {
      checkoutHelpText.innerHTML = "Use the buttons to checkin or checkout";
      checkoutHelpText.style.color = "White";
    }
    bookCheckoutHelp.style.visibility = "visible";
  }

  if (selectedObject.id == "bookSearch") {
    bookSearchHelp.style.visibility = "visible";
  }
}

function userHelp(selectedObject) {
  var userEditHelp = document.getElementById("userEditHelpTip");
  var userCreateHelp = document.getElementById("userCreateHelpTip");
  var userSearchHelp = document.getElementById("userSearchHelpTip");

  userEditHelp.style.visibility = "hidden";
  userCreateHelp.style.visibility = "hidden";
  userSearchHelp.style.visibility = "hidden";

  if (selectedObject.id == "userEdit") {
    userEditHelp.style.visibility = "visible";
  }

  if (selectedObject.id == "userCreate") {
    userCreateHelp.style.visibility = "visible";
  }

  if (selectedObject.id == "userSearch") {
    userSearchHelp.style.visibility = "visible";
  }
}

function reportHelp(selectedObject) {
  var reportSearchHelp = document.getElementById("reportSearchHelpTip");

  reportSearchHelp.style.visibility = "hidden";

  if (selectedObject.id == "reportSearch") {
    reportSearchHelp.style.visibility = "visible";
  }
}

function onBookTextChanged() {
  var bookTitleText = document.getElementById("bookTitle").value;
  var bookAuthorText = document.getElementById("bookAuthor").value;
  var bookGenreText = document.getElementById("bookGenre").value;
  var bookISBNText = document.getElementById("bookISBN").value;
  var bookCopiesText = document.getElementById("bookCopies").value;
  if (bookTitleText || bookAuthorText || bookGenreText || bookISBNText || bookCopiesText) {
    enableBookButtons();
  } else {
    disableBookButtons();
  }
  readBooks("");
}

function enableUserButtons() {
  document.getElementById("createUserButton").className = "enableButton";
  document.getElementById("deleteUserButton").className = "deleteButton";
}

function disableUserButtons() {
  document.getElementById("createUserButton").className = "disabledButton";
  document.getElementById("deleteUserButton").className = "disabledButton";
}

function enableBookButtons() {
  document.getElementById("createBookButton").className = "enableButton";
  document.getElementById("deleteBookButton").className = "deleteButton";
}

function disableBookButtons() {
  document.getElementById("createBookButton").className = "disabledButton";
  document.getElementById("deleteBookButton").className = "disabledButton";
}

function openTab(evt, tabName) {
  var tabcontent = document.getElementsByClassName("tabcontent");
  for (var i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  var tablinks = document.getElementsByClassName("tablinks");
  for (var i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}