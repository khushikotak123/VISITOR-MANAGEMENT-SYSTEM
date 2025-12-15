# VISITOR-MANAGEMENT-SYSTEM
The web application gives the user two options: Check In and Check Out.  Check In: The Visitor is asked to enter his/her and Host's details.Thereafter,a SMS and E-mail is sent to the Host giving the details of the Visitor.  Check Out: The Visitor is asked to enter his/her E-mail Id for verification and after it the visitor is checked out.
Tech Stack
Front-End : EJS, HTML, CSS, Bootstrap.
Back-End : NodeJS, ExpressJS, Nodemailer(Mail service), fast2sms(Message Service).
Database: MongoDB.
Approach
Workflow:

Visitor is given the option to Check-in.
Visitor is asked to fill his own details as well as the host's details whom he wants to meet.
Visitor is then given the option to Checkout.
At the time of checkout, the Visitor is asked to enter his Email-id for verification.
After this, the visitor is checked out of the system.
A visitor can check-in and checkout at any time irrespective of the other visitors.
Database 'user' and it's Collections are designed as following:

Clients: Contains details specific to the visitors.
|___Clients
        |___name 
        |___email
        |___phone
Hosts: Contains details specific to the hosts.
|___Hosts
       |___hname
       |___hemail 
       |___hphone
Visits: Contains details specific to the visits by visitors(Check-in - Check-out).
|___Visits
       |___email
       |___checkin
       |___checkout
       |___hemail
I have made 3 collections so as to reduce redundancy in the database. Even if a visitor has visited the office more than once, his details will only be stored once in the Clients collection. The same goes for the Host's Details.

Corner Cases:

A visitor cannot check-in again if he/she is already checked in and has not checked out.
A visitor cannot checkout with an Email-Id that has not been used to Check-in.
A visitor cannot checkout again if he/she is already been checked out.
