class User {
    constructor (firstName, lastName, id) {
        this.firstName = firstName;
        this.lastName = lastName;
        this._id = id;
    }
    
    get fullName() {
        return this.generateFullName();
    }
    
    generateFullName () {
        if (firstName && lastName) {
            console.log ("generateFullName: " + String(firstName) + " " + String(lastName));
            return String(this.firstName) + " " + String(this.lastName);
        }
        return "No name";
    }
}