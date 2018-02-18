class Book {
  constructor (title, author, genre, ISBN, pubdate, pages, copies, id) {
    this._title = title;
    this._author = author;
    this._genre = genre;
    this._ISBN = ISBN;
    this._pubdate = pubdate;
    this._pages = pages;
    this._copies = copies;
    this._id = id;
  }
  
  containsString (queryString) {
    var lowerCaseQueryString = queryString.toString().toLowerCase();
    return this._title.toLowerCase().indexOf(lowerCaseQueryString) !== -1
        || this._author.toLowerCase().indexOf(lowerCaseQueryString) !== -1
        || this._genre.toLowerCase().indexOf(lowerCaseQueryString) !== -1
        || this._ISBN.toLowerCase().indexOf(lowerCaseQueryString) !== -1
        || this._pages.toString().toLowerCase().indexOf(lowerCaseQueryString) !== -1
        || this._pubdate.toLocaleDateString().toLowerCase().indexOf(lowerCaseQueryString) !== -1;
  }
  
  get title () {
    return this._title;
  }
  
  set title (newTitle) {
    this._title = newTitle;
  }
  
  get author () {
    return this._author;
  }
  
  set author (newAuthor) {
    this._author = newAuthor;
  }
  
  get genre () {
    return this._genre;
  }
  
  set genre (newGenre) {
    this._genre = newGenre;
  }
  
  get ISBN () {
    return this._ISBN;
  }
  
  set ISBN (newISBN) {
    this._ISBN = newISBN;
  }
  
  get pubdate () {
    return this._pubdate;
  }
  
  set pubdate (newPubdate) {
    this._pubdate = newPubdate;
  }
  
  get pages () {
    return this._pages;
  }
  
  set pages (newPages) {
    this._pages = newPages;
  }
  
  get copies () {
    return this._copies;
  }
  
  set copies (newCopies) {
    this._copies = newCopies;
  }
  
  get id () {
    return this._id;
  }
  
  set id (newId) {
    this._id = newId;
  }
}