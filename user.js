class User {
  constructor (firstName, lastName, isTeacher, id) {
    this._firstName = firstName;
    this._lastName = lastName;
    this._isTeacher = isTeacher;
    this._id = id;
  }

  containsString (queryString) {
    var lowerCaseQueryString = queryString.toString().toLowerCase();
    var teacherOrStudent = this._isTeacher ? "teacher" : "student";
    return this._firstName.toLowerCase().indexOf(lowerCaseQueryString) !== -1
        || this._lastName.toLowerCase().indexOf(lowerCaseQueryString) !== -1
        || teacherOrStudent.indexOf(lowerCaseQueryString) !== -1
        || this._id.toString().toLowerCase().indexOf(lowerCaseQueryString) !== -1;
  }
  
  get fullName () {
    return this.firstName + ' ' + this.lastName;
  }

  set fullName (name) {
    var words = name.toString().split(' ');
    this.firstName = words[0] || '';
    this.lastName = words[1] || '';
  }
	
	get firstName () {
		return this._firstName;
	}
	
	set firstName (newFirstName) {
		if (newFirstName) {
			this.firstName = newFirstName;
		}
	}
	
	get lastName () {
		return this._lastName;
	}
	
	set lastName (newLastName) {
		if (newLastName) {
			this.lastName = newLastName;
		}
	}
  
  get isTeacher () {
    return this._isTeacher;
  }
  
  set isTeacher (newIsTeacher) {
    this._isTeacher = newIsTeacher;
  }
  
  get id () {
    return this._id;
  }

  set id (newId) {
    if (newId) {
      this._id = newId;
    }
  }
  
  generateFullName () {
    if (firstName && lastName) {
      return String(this.firstName) + " " + String(this.lastName);
    }
    return "No name";
  }
}