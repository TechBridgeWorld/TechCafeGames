Please provide details for as many sections that apply to your specific project. For sections that do not apply, simply indicate the phrase N/A. 

1. Provide instructions on how to checkout the code from the current repository and where to place it on the local machine (e.g., C:\MyProject or /home/userBob/myProject).

  clone it from https://github.com/elpintar/edugamify
  open the folder in a terminal and run node app
  access it at localhost:8000 on a web browser

  or go to
  edugamify.herokuapp.com

2. List the platforms on which the project can compiled and built (Windows, Linux, Mac OS).

  any platform

3. Since the project may be multifaceted, provide a list of the different components included in this project along with a description of each one stating its purpose and how it interacts with the other components.

  node/express:
    app.js accesses a mongo database stored on MongoLab and the TechCafe database and serves the html/css/javascript files of the app itself
  mongolab:
    hosts our databases

4. Specify the tools needed to compile and build the project including compilers and/or IDEs. (e.g., Java SDK 1.6, gcc 4.3.2 on the Linux platform, Eclipse Juno, Visual Studio 10, etc...).

  node is needed (version 0.10.5 is what we use)

5. List any additional libraries that are needed for compiling, building and running the code (e.g., Boost C++ Library 1.53.0, Android API 15).

  none

6. Specify the locations where these tools can be acquired (e.g., URLs, FTP sites, local CMU servers).

  nodejs.org

7. Indicate the location where these tools need to be installed on the local machine for project compilation, building and execution.

  anywhere

8. Indicate if there are any project config files, what they are used for and provide information on where these files need to be located on the local machine.

  N/A

9. Specify any settings within these config files for compiling, building and/or execution (e.g., BASEPATH=C:\Users\Bob\myProject\).

  N/A

10. Provide instructions on how to compile and build the project using the specified tool(s) from item 4 (e.g., startup Eclipse, import project X, right click on file Main and select Run as -> Java Application) and also specify any compiler/build configuration settings (paths of include files and other dependencies).

  N/A

11. Indicate the target platform on which the binary (or binaries) are intended to run (e.g., Windows, Android Device, Custom hardware).

  any platform-it is on a website

12. Indicate if the application requires any input files that are read and processed when the application executes (e.g., XML Files, text files, image files, etc).

  N/A

13. Specify the locations where these input files can be obtained if not already included in the project (e.g., URL, CMU Serves, etc...).

  N/A

14. Specify the locations where these input files need to reside on the local machine when the application executes.

  N/A

15. Indicate if the application generates output files.

  N/A

16. Specify the location of where these output files will be written.

  N/A

17. If using external hardware or mobile device, provide instructions on how this device needs to be connected to the computer.

  the project works on mobile applications-just use any internet browser

18. Regarding mobile devices and/or external hardware, indicate if any of the generated binaries from item 10 need to be installed on this device and provide instructions on how to install these binaries.

  nope

19. Specify any settings on the computer for the device (e.g., the COM port).

  N/A

20. Provide instructions on how to run the application on the external hardware, mobile device and/or computer.

  internet browser-Chrome and Safari have been tested

21. If the mobile device requires interaction with the computer, provide instructions on how this interaction should work from an end user standpoint (i.e., first run application A on the laptop computer, then lunch program B on the mobile device, next you should see a screen indicating a connection was made, etc...).

  just the internet

22. List any known bugs, configuration issues or other pitfalls to look out for when compiling, building and/or running the application.
    
  not secure-can access our javascript functions
  doesn't work on firefox

23. Provide a list of future features/capabilities that you would like to see included in the existing tool.

  more minigame objects-springs, reverse gravity blocks
