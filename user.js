class User {
    constructor (firstName, lastName, id) {
        this._firstName = firstName;
        this._lastName = lastName;
        this._id = id;
    }
    
    get fullName() {
        return this.firstName + ' ' + this.lastName;
    }
	
    set fullName (name) {
        var words = name.toString().split(' ');
        this.firstName = words[0] || '';
        this.lastName = words[1] || '';
    }
	
		get id () {
			return this._id;
		}
	
		set id (newId) {
				if (newId) {
					this._id = newId;
				}
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
    
    generateFullName () {
        if (firstName && lastName) {
            return String(this.firstName) + " " + String(this.lastName);
        }
        return "No name";
    }
}