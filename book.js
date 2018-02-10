class Book {
  constructor (title, author, genre, ISBN, copies, id) {
    this._title = title;
    this._author = author;
    this._genre = genre;
    this._ISBN = ISBN;
    this._copies = copies;
    this._id = id;
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