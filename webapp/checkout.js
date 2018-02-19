class Checkout {
  constructor (userId, userFullName, userIsTeacher, bookId, bookTitle, checkoutDate, id) {
    this._userId = userId;
    this._userFullName = userFullName;
    this._userIsTeacher = userIsTeacher;
    this._bookId = bookId;
    this._bookTitle = bookTitle;
    this._checkoutDate = checkoutDate;
    this._id = id;
  }
  
  containsString (queryString) {
    var lowerCaseQueryString = queryString.toString().toLowerCase();
    return this._userId.toString().toLowerCase().indexOf(lowerCaseQueryString) !== -1
        || this._userFullName.toLowerCase().indexOf(lowerCaseQueryString) !== -1
        || this._bookTitle.toLowerCase().indexOf(lowerCaseQueryString) !== -1
        || this._checkoutDate.toLocaleDateString().toLowerCase().indexOf(lowerCaseQueryString) !== -1
        || this._id.toLowerCase().indexOf(lowerCaseQueryString) !== -1;
  }
  
  get userId () {
    return this._userId;
  }
  
  set userId (newUserId) {
    this._userId = newUserId;
  }
  
  get userFullName () {
    return this._userFullName;
  }
  
  set userFullName (newUserFullName) {
    this._userFullName = newUserFullName;
  }
  
  get userIsTeacher () {
    return this._userIsTeacher;
  }
  
  set userIsTeacher (newUserIsTeacher) {
    this._userIsTeacher = newUserIsTeacher;
  }
  
  get bookId () {
    return this._bookId;
  }
  
  set bookId (newBookId) {
    this._bookId = newBookId;
  }
  
  get bookTitle () {
    return this._bookTitle;
  }
  
  set bookTitle (newBookTitle) {
    this._bookTitle = newBookTitle;
  }
  
  get checkoutDate () {
    return this._checkoutDate;
  }
  
  set checkoutDate (newCheckoutDate) {
    this._checkoutDate = newCheckoutDate;
  }
  
  get id () {
    this._id;
  }
  
  set id (newId) {
    this._id = newId;
  }
}