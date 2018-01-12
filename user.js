class User {
    constructor(firstName, lastName, id) {
        this.firstName = firstName;
        this.lastName = lastName;
        this._id = id;
    }
    
    get fullName() {
        return this.generateFullName();
    }
    
    this.generateFullName = function () {
        if(firstName && lastName) {
            return firstName + " " + lastName;
        }        
    }
    
}