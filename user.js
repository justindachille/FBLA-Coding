class User {
    constructor (firstName, lastName, id) {
        this.firstName = firstName.value;
        this.lastName = lastName.value;
        this._id = id;
    }
    
    get fullName() {
        return this.generateFullName();
    }
    
    generateFullName () {
        if (firstName && lastName) {
            console.log ("generateFullName: " + String(firstName) + " " + String(lastName));
            return String(firstName) + " " + String(lastName);
        }
        return "No name";
    }
    
}