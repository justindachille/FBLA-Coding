class Checkout {
  constructor (userId, userFullName, bookId, bookTitle, checkOutDate, id) {
    this._userId = userId;
    this._userFullName = userFullName;
    this._bookId = bookId;
    this._bookTitle = bookTitle;
    this._checkOutDate = checkOutDate;
    this._id = id;
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
  
  get checkOutDate () {
    return this._checkOutDate;
  }
  
  set checkOutDate (newCheckOutDate) {
    this._checkOutDate = newCheckOutDate;
  }
  
  get id () {
    this._id;
  }
  
  set id (newId) {
    this._id = newId;
  }
}