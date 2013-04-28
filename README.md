TECHCAFE GAMES TRANSFER DOCUMENT
===================================

###1. Provide instructions on how to checkout the code from the current repository and where to place it on the local machine. ###
There are three git repositories: 

Brain Race: https://github.com/CMU-15-239/TechCafeGames
Teacher Portal: https://github.com/hedgeday/TeacherPortal
TechCafe-Node: https://github.com/hedgeday/Node-TechCafe

For all three of the above projects, clone from the respective git repositories. It does not matter where the code is placed on the local machine.

* * *

###2. List the platforms on which the project can compiled and built.###
Windows, Linux, Mac OS

* * *

###3. Since the project may be multifaceted, provide a list of the different components included in this project along with a description of each one stating its purpose and how it interacts with the other components.###
There are three components to the project: 

A) Teacher Portal: Web based content authoring tool used to create content for Brain race and future TechCafe games
URL: techcafe-teacher.herokuapp.com

B) Brain Race: Cross-platform mobile educational game that uses content created on the teacher portal
URL: brainrace.herokuapp.com

C) TechCafe-Node: Node.js module used to dynamically import content into Brain Race and future games from the Teacher Portal.


* * *

###4. Specify the tools needed to compile and build the project including compilers and/or IDEs.###
#####Brain Race: #####
- Node.js 0.8.11
- MongoDB 2.4.1

#####Teacher Portal: #####
- Ruby 1.9.3
- Rails 3.2.13 
- PostgreSQL 9.2.3

* * *

###5. List any additional libraries that are needed for compiling, building and running the code ###
#####Node Modules (for Brain Race): #####
Express
Mongoose

#####Ruby Gems (for Teacher Portal):#####
bcrypt-ruby
cancan
cofee-rails
debugger
jquery-rails
mocha
nested_form
nifty-generators
pg
sass-rails
uglifier

* * *

###6. Specify the locations where these tools can be acquired. ###
Node.js: http://nodejs.org/
MongoDB: http://www.mongodb.org/
Ruby: http://www.ruby-lang.org/en/
Rails: http://rubyonrails.org/
PostgreSQL: http://www.postgresql.org/

Both Express and Mongoose can be installed by running ‘npm install’ from the Brain Race directory. They can also be downloaded from http://expressjs.com/ and http://mongoosejs.com/
All necessary Ruby gems can be installed by running ‘bundle install’ from the Teacher Portal directory.

* * *

###7. Indicate the location where these tools need to be installed on the local machine for project compilation, building and execution.###

For instructions on installing PostgreSQL and MongoDB, please refer to the documentation on the official websites. 

Node.js, MongoDB, PostgreSQL, Ruby, Rails: Install wherever convenient on your local machine, as long as they are all accessible using the command line. 

#####Node Modules and Ruby Gems (for Teacher Portal):#####
Node modules will be automatically installed in the correct place when running ‘npm install’.
Gems will be automatically installed in the correct place when running ‘bundle install’.

* * *

###8. Indicate if there are any project config files, what they are used for and provide information on where these files need to be located on the local machine.###
Included in the project package.

* * *

###9. Specify any settings within these config files for compiling, building and/or execution.###

Admin user ‘postgres’ might need to be created for Teacher Portal. (On some machines, this is the default user.)

* * *

###10. Provide instructions on how to compile and build the project using the specified tool(s) from item 4 and also specify any compiler/build configuration settings.###
#####Brain Race: #####
- Clone repository
- Run ‘npm install’ in the Brain Race folder, which installs the required node modules.
- In a separate terminal window, run mongoDB. (use ‘./mongod’ in your mongodb/bin folder)
- Open a terminal window, navigate to the Brain Race folder, and use ‘node server.js’

######To access local instance of Brain Race:######
On computer:
- Using a browser (preferably Chrome), access localhost:8080/desktop.html
- On Chrome, go to View > Developer >Developer Tools 
- In the window that pops up at the bottom, click on the settings icon on the bottom right corner of your screen. On the window that pops up over your developer console, click on “Overrides” on the left under “Settings”, and then on the right pane scroll down and enable “Emulate touch events”.
- You can now control the car in game by clicking and dragging your mouse
- Note: both the local version and brainrace.herokuapp.com pull content from techcafe-teacher.herokuapp.com

On mobile: 
- Using a browser (preferably CordovaBrowser) , access <Host Computer IP>:8080

* * *

#####Teacher Portal:##### 
- Clone repository
- In a separate terminal window, run ‘postgres’
- In a terminal window, navigate to the Teacher Portal folder and run ‘bundle install’ 
- Run ‘rake db:migrate’
- Run ‘rails server’ 

To access local instance of Teacher Portal: 
- Using a browser, navigate to localhost:3000 

* * *

###11. Indicate the target platform on which the binary (or binaries) are intended to run.###
The entire project is web based, and can run on any platform with a browser.
Brain Race is also packaged as an APK file, which can be installed on Android devices.


###12. Indicate if the application requires any input files that are read and processed when the application executes. ###
The project does not require external content. 

* * *

###13. Specify the locations where these input files can be obtained if not already included in the project.###
N/A

* * *

###14. Specify the locations where these input files need to reside on the local machine when the application executes.###
N/A

* * *

###15. Indicate if the application generates output files.###
It doesn’t.

* * *

###16. Specify the location of where these output files will be written.###
N/A

* * *

###17. If using external hardware or mobile device, provide instructions on how this device needs to be connected to the computer.###
No physical connection is needed between the mobile device and a computer.

When running Brain Race from a mobile device, one option is to install and run the APK, which is connected to brainrace.herokuapp.com.
Another option is to connect to localhost. To do this, you need to first run the node server on a computer. Then, on the phone, you can access the game at <your computer’s IP>:8080. Accessing the game through Cordova Browser (can be downloaded for free from Google Play and iOS App Store) is recommended because it simulates the game as if it has been packaged as an APK.

* * *

###18. Regarding mobile devices and/or external hardware, indicate if any of the generated binaries from item 10 need to be installed on this device and provide instructions on how to install these binaries.###
For Brain Race, an APK can be installed to access the game hosted at brainrace.herokuapp.com. The APK is included in the Brain Race project package - it can be transferred onto an Android phone and installed directly. The game can then be accessed like any other Android app.  

* * *

###19. Specify any settings on the computer for the device.###
N/A 

* * *

###20. Provide instructions on how to run the application on the external hardware, mobile device and/or computer.###
Install the APK file for Brain Race on the smartphone. Run the application, and play. 

* * *

###21. If the mobile device requires interaction with the computer, provide instructions on 
how this interaction should work from an end user standpoint. ###
(Optional) 
Manage users, questions, and content sets on the Teacher Portal at techcafe-teacher.herokuapp.com. 

Launch brain race and use new or previously created content in game. 

* * *

###22. List any known bugs, configuration issues or other pitfalls to look out for when compiling, building and/or running the application.###
PostgreSQL requires the user ‘postgres’ to run with our app. (More?) 

* * *

###23. Provide a list of future features/capabilities that you would like to see included in the existing tool.###
Different question types for teacher portal, such as fill in the blanks and image questions. 

Performance tracking on teacher portal (for example, different classes’ and students’ performance over time, frequent correctly- and incorrectly-answered questions in a content set, etc). 

Caching of Brain Race game content so game can still be played if device loses internet connection during a game.

More games. 

* * *

##Additional Information:##

#####Keeping the API up to date: #####
If the location of the Teacher Portal is changed, the API implementation must also be updated in order to continue to correctly serve question content. At the time of writing this document, the Teacher Portal was hosted at http://techcafe-teacher.herokuapp.com. 

Instructions for API update. 

The API is located at https://github.com/hedgeday/Node-TechCafe. 

Step 1: Update the readme.md file to reflect the change in the URL. 

Step 2: Update line 7 of the file node_techcafe/node_techcafe.js to reflect the URL change. 

* * *

#####Teacher Portal Accounts#####
An account on the Teacher Portal is either an admin or a teacher.

Teachers can manage all questions and their own content sets. Administrators can manage all questions, all content sets, all user accounts, and question categories.

When deploying the Teacher Portal with a new database, the first person to register will automatically become an admin. After that, everyone who registers from techcafe-teacher.herokuapp.com/signup will automatically become a teacher. 

Admins can create new admin accounts and teacher accounts from the “Accounts” page.
