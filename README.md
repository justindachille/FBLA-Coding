# FBLA Coding & Programming - Library Database
Library is a fully cloud backed asyncronus realtime database backed by Cloud Firestore which automatically synchronizes across multiple platforms. It it able to support as many clients as you need to be your library database solution. There are many options which allow you to fully customize the database to your needs

# Features
* Realtime cloud database
* Fully editable
* Import book and user data through JSON
* Generate book and fine reports
* Fines and checkout constants for student or teacher editable

# Interface
Library is designed mainly around a horizontal table view, which allows the user to quickly and seamlessly switch for what they need at a given time. Each tab is broken down into a panel of I/O, and the resultant relevant information synced from the database. 

# Hardware Architecture
The backend processing system for this database is centralized to a Cloud Firestore location, with all of the data automatically backed up and synced to the central database. 

# Software Architecture
Library is made up of a main webpage, index.html, and separate classes are used for books and users. IDs for each book and user are generated with a combination of a timestamp and a few random bits converted to base64 to encode into ASCII characters to ensure that each ID is unique.