# flowmap.blue

This app can render a geographic flow map visualization from a spreadsheet published on Google Sheets.

It can be used to visualize numbers of movements of people or goods between pairs of geographic locations
(Origin-Destination data).



[Try in action](http://flowmap.blue/)

[![flowmap.blue](https://user-images.githubusercontent.com/351828/51086743-a8e35400-174a-11e9-9826-a2a7484d7b6d.jpg)
](http://flowmap.blue/1zNbTBLInPOBcCwCDdoSdnnUDdOfDyStFdhPC6nJmBl8)


## Running locally

Install dependencies:

    npm install

Add `.env` file to the project root with a [Mapbox access token](https://www.mapbox.com/help/define-access-token/):

    REACT_APP_MapboxAccessToken=Your_Own_Mapbox_Access_Token_Goes_Here

Then run:

    npm start
