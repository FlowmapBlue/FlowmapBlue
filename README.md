# Blue Arrow Map - light

This app can render a geographic flow map visualization from a spreadsheet published on Google Sheets.

It can be used to visualize numbers of movements of people or goods between pairs of geographic locations
(Origin-Destination data).



[Try in action](https://blue-arrow-map-light.netlify.com/)

[![image](https://user-images.githubusercontent.com/351828/50651937-31146d00-0f85-11e9-88b2-b18ec6e4553f.png)](https://blue-arrow-map-light.netlify.com/1zNbTBLInPOBcCwCDdoSdnnUDdOfDyStFdhPC6nJmBl8)


## Running locally

Install dependencies:

    npm install

Add `.env` file to the project root with a [Mapbox access token](https://www.mapbox.com/help/define-access-token/):

    REACT_APP_MapboxAccessToken=Your_Own_Mapbox_Access_Token_Goes_Here

Then run:

    npm start
