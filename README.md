# flowmap.blue

This app can render a geographic flow map visualization from a spreadsheet published on Google Sheets.

It can be used to visualize numbers of movements of people or goods between pairs of geographic locations
(Origin-Destination data).



[Try online](http://flowmap.blue/)


[![flowmap.blue](https://user-images.githubusercontent.com/351828/65035807-69f54600-d94a-11e9-82ab-775e28ef1547.png)
](https://flowmap.blue/1Oe3zM219uSfJ3sjdRT90SAK2kU3xIvzdcCW6cwTsAuc)

![color-schemes](https://user-images.githubusercontent.com/351828/65035296-17675a00-d949-11e9-8b12-b3b08bc76b91.png)


## Running locally

Install dependencies:

    npm install

Add `.env` file to the project root with a [Mapbox access token](https://www.mapbox.com/help/define-access-token/):

    REACT_APP_MapboxAccessToken=Your_Own_Mapbox_Access_Token_Goes_Here

Then run:

    npm start
