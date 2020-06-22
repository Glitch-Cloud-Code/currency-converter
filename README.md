This app is already deployed on the firebase servers! If you don't wanna bother with deployment - here is a link for you :) https://glitch-currency-converter.firebaseapp.com/

For deploying this app on your local machine you will need:
1. [NPM](https://www.npmjs.com/get-npm)  
2. Angular CLI - (Run "npm install -g @angular/cli" in command line)
3. [Docker for Windows](https://www.docker.com/products/docker-desktop).

After installing these tools, just open the terminal in the root folder of the project and run these commands:
* "docker build . -t ssmir/currency-converter"
* "docker run -p 3000:80 ssmir/currency-converter".

Then head over to your browser and open "[http://localhost:3000/](http://localhost:3000/)".

For development purpouses use "ng serve".
