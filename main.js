  var config = {
    apiKey: "AIzaSyAimFk0NTla6Gp4PkyZ47qnol8co8PTsKI",
    authDomain: "library-d7f65.firebaseapp.com",
    databaseURL: "https://library-d7f65.firebaseio.com",
    projectId: "library-d7f65",
    storageBucket: "library-d7f65.appspot.com",
    messagingSenderId: "634700996570"
  };
  firebase.initializeApp(config);
  // Initialize Cloud Firestore through Firebase
  var db = firebase.firestore();
  var CHECKOUT_PERIOD = 14;
  var MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
  var USER_COLLECTION = "users";
  var BOOK_COLLECTION = "books";
  var CHECKOUT_COLLECTION = "checkouts";
  var selectedUserId = "";
  var selectedBookId = "";
  var selectedBookTitle = "";

  window.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("editForm");

    document.getElementById("editButton").addEventListener("click", function () {
      var newFirstName = document.getElementById("selectionFirstName").value;
      var newLastName = document.getElementById("selectionLastName").value;
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
          //          var user = userDoc.data();
          transaction.update(
            userDocRef, {
              firstName: newFirstName,
              lastName: newLastName
            });
          return newFirstName;
        });
      }).then(function () {
        console.log("Transaction successfully committed!");
      }).catch(function (error) {
        console.log("Transaction failed: ", error);
      })
    });
  });

  function makeReports() {
    makeWeeklyReport();
    makeFineReport();
  }

  function makeFineReport() {

  }

  function makeWeeklyReport() {
    var checkoutsRef = db.collection(CHECKOUT_COLLECTION);
    var dueDate = addDays(new Date(), -CHECKOUT_PERIOD);
    //.where("checkOutDate", ">", dueDate)
    checkoutsRef.get().then(function (querySnapshot) {
      var checkoutList = document.querySelector("#checkoutList");
      checkoutList.innerHTML = "";
      var table = document.createElement("table");
      table.className = "table";
      table.appendChild(makeCheckoutHeader());
      checkoutList.appendChild(table);
      querySnapshot.forEach((doc) => {
        var checkout = doc.data();
        var newCheckout = new Checkout(checkout.userId, checkout.userFullName, checkout.bookId, checkout.bookTitle, checkout.checkOutDate, doc.id);
        table.appendChild(makeCheckoutHtml(newCheckout));
      });
    });
  }

  function readUsers() {
    db.collection(USER_COLLECTION).get().then((querySnapshot) => {
      var userList = document.querySelector("#userList");
      userList.innerHTML = "";
      var table = document.createElement("table");
      table.className = "table";
      table.appendChild(makeUserHeader());
      userList.appendChild(table);
      querySnapshot.forEach((doc) => {
        user = doc.data();
        var newUser = new User(user.firstName, user.lastName, user.isTeacher, doc.id);
        table.appendChild(makeUserHtml(newUser));
      });
    });
  }

  function readBooks() {
    db.collection(BOOK_COLLECTION).get().then((querySnapshot) => {
      var bookList = document.querySelector("#bookList");
      bookList.innerHTML = "";
      var table = document.createElement('table');
      table.className = "table";
      table.appendChild(makeBookHeader());
      bookList.appendChild(table);
      querySnapshot.forEach((doc) => {
        book = doc.data();
        var newBook = new Book(book.title, book.author, book.genre, book.ISBN, book.copies, doc.id);
        table.appendChild(makeBookHtml(newBook));
      });
    });
  }



  function selectUser(user) {
    document.getElementById("selectionFirstName").value = user.firstName;
    document.getElementById("selectionLastName").value = user.lastName;
    document.getElementById("selectionId").innerHTML = "Id: " + user.id;
  }

  function selectBook(book) {
    document.getElementById("selectionTitle").value = book.title;
    document.getElementById("selectionAuthor").value = book.author;
    document.getElementById("selectionISBN").value = book.ISBN;
    document.getElementById("checkoutSelectionId").innerHTML = selectedBookId;
    document.getElementById("checkoutBookTitle").innerHTML = book.title;
    var checkoutsRef = db.collection(CHECKOUT_COLLECTION);
    checkoutsRef.where("bookId", "==", selectedBookId).where("checkInDate", "==", null).get().then(function (querySnapshot) {
      var count = querySnapshot.docs.length;
      var remainingCopies = book.copies - count;
      document.getElementById("checkoutCopies").innerHTML = remainingCopies;
      if (remainingCopies == 0) {
        document.getElementById("checkoutButton").disabled = true;
      } else {
        document.getElementById("checkoutButton").disabled = false;
      }
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
    readUsers();
  }

  function createBook() {
    var bookTitleText = document.getElementById("bookTitle").value;
    var bookAuthorText = document.getElementById("bookAuthor").value;
    var bookGenreText = document.getElementById("bookGenre").value;
    var bookISBNText = document.getElementById("bookISBN").value;
    var bookCopiesText = document.getElementById("bookCopies").value;
    db.collection(BOOK_COLLECTION).doc().set({
        title: bookTitleText,
        author: bookAuthorText,
        genre: bookGenreText,
        ISBN: bookISBNText,
        copies: bookCopiesText
      })
      .then(function (docRef) {
        console.log("book written");
      });
    readBooks();
  }

  function makeCheckoutHeader() {
    var bookTitle = document.createElement("th");
    bookTitle.className = "bookTitle";
    bookTitle.innerHTML = "Book Title";

    var username = document.createElement("th");
    username.className = "username";
    username.innerHTML = "Name";

    var date = document.createElement("th");
    date.className = "date";
    date.innerHTML = "Days until due";
    var row = document.createElement('tr');
    row.appendChild(bookTitle);
    row.appendChild(username);
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
    
    var date = document.createElement("td");
    date.className = "date";
    var checkInDate = addDays(checkout.checkOutDate, CHECKOUT_PERIOD);
//    checkInDate.setDate(checkout.checkOutDate + CHECKOUT_PERIOD);
    var timeDifference = checkInDate - (new Date());
    date.innerHTML = Math.floor(timeDifference / MILLIS_PER_DAY);

    var row = document.createElement('tr');
    row.appendChild(bookTitle);
    row.appendChild(username);
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

    var row = document.createElement('tr');
    row.appendChild(firstName);
    row.appendChild(lastName);
    row.appendChild(isTeacher);

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

    var row = document.createElement('tr');
    row.appendChild(firstName);
    row.appendChild(lastName);
    row.appendChild(isTeacher);

    if (user.id === selectedUserId) {
      row.className = "tableSelected";
    }

    row.onclick = function () {
      selectedUserId = user.id;
      selectUser(user);
      onUserTextChanged();
      console.log(selectedUserId);
      readUsers();
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

    var row = document.createElement('tr');
    row.appendChild(title);
    row.appendChild(author);
    row.appendChild(genre);
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

    var row = document.createElement('tr');
    row.appendChild(title);
    row.appendChild(author);
    row.appendChild(genre);
    row.appendChild(isbn);

    if (book.id === selectedBookId) {
      row.classList.add("tableSelected");
    }

    row.onclick = function () {
      selectedBookId = book.id;
      selectedBookTitle = book.title;
      selectBook(book);
      onBookTextChanged();
      console.log("selected book: " + book.title + " with id: " + book.id);
      readBooks();
    }
    return row;
  }

  async function checkout() {
    var checkoutUserId = document.getElementById("checkoutUserId").value;
    var selectedUserName = "";
    var promise = db.collection(USER_COLLECTION).doc(checkoutUserId).get().then(function (doc) {
      user = doc.data();
      var newUser = new User(user.firstName, user.lastName, user.isTeacher, doc.id);
      console.log(newUser.fullName);
      selectedUserName = newUser.fullName;
    });
    promise.then(function () {
      console.log("asynç " + selectedUserName);
    });
    console.log("checking out with book id: " + selectedBookId);
    db.collection(CHECKOUT_COLLECTION).doc().set({
        userId: checkoutUserId,
        userFullName: selectedUserName,
        bookId: selectedBookId,
        bookTitle: selectedBookTitle,
        checkOutDate: new Date()
      })
      .then(function (docRef) {
        console.log("book checked out!");
      });
    readUsers();
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
    readBooks();
  }

  function onUserTextChanged() {
    if (selectedUserId) {
      enableUserButtons();
    } else {
      disableUserButtons();
    }
    readUsers();
  }

  function onBookTextChanged() {
    if (selectedBookId) {
      enableBookButtons();
    } else {
      disableBookButtons();
    }
    readBooks();
  }

  function enableUserButtons() {
    document.getElementById("createBookButton").className = "createButton";
    document.getElementById("deleteBookButton").className = "deleteButton";
  }

  function disableUserButtons() {
    document.getElementById("createUserButton").className = "disabledButton";
    document.getElementById("deleteUserButton").className = "disabledButton";
  }

  function enableBookButtons() {
    document.getElementById("createUserButton").className = "createButton";
    document.getElementById("deleteUserButton").className = "deleteButton";
  }

  function disableBookButtons() {
    document.getElementById("createBookButton").className = "disabledButton";
    document.getElementById("deleteBookButton").className = "disabledButton";
  }

  function addedPost(post) {
    var newUser = {}
    newPost['username'] = post.username;
    allUsers.push(newUser);
    readPosts();
  }

  function changedPost(newPost) {
    allusers.forEach(function (oldUser) {
      if (oldUser.text == newPost.text) {
        oldUser.username = newPost.username;
      }
    });
    readPosts();
  }

  function removedPost(removedPost) {
    var updatedList = [];
    allUsers.forEach(function (post) {
      if (post.text === removedPost.text) {} else {
        updatedList.push(post);
      }
    });
    allUsers = updatedList;
    readPosts();
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function listenForChanges() {
    db.collection(USER_COLLECTION).onSnapshot(function (querySnapshot) {
      querySnapshot.docChanges.forEach(function (change) {
        console.log("change in ", change.type + " " + change.doc.data().text);
        if (change.type === "added") {
          addedPost(change.doc.data());
        }
        if (change.type === "modified") {
          changedPost(change.doc.data());
        }
        if (change.type === "removed") {
          removedPost(change.doc.data());
        }
      });
    });
  }

  function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function parseDate(str) {
      var mdy = str.split('/');
      return new Date(mdy[2], mdy[0]-1, mdy[1]);
  }

  function daydiff(first, second) {
      return Math.round((second-first)/(1000*60*60*24));
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
  document.getElementById("defaultOpen").click();

