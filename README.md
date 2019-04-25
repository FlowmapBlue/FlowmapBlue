# flowmap.blue

This app can render a geographic flow map visualization from a spreadsheet published on Google Sheets.

It can be used to visualize numbers of movements of people or goods between pairs of geographic locations
(Origin-Destination data).



[Try in action](http://flowmap.blue/)


[![flowmap.blue](https://user-images.githubusercontent.com/351828/56728822-fd3b9e00-6753-11e9-8dba-d3f3ecbb7e4d.png)
](https://flowmap.blue/1Oe3zM219uSfJ3sjdRT90SAK2kU3xIvzdcCW6cwTsAuc)


## Running locally

Install dependencies:

    npm install

Add `.env` file to the project root with a [Mapbox access token](https://www.mapbox.com/help/define-access-token/):

    REACT_APP_MapboxAccessToken=Your_Own_Mapbox_Access_Token_Goes_Here

Then run:

    npm start
