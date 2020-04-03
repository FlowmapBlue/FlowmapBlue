# Flowmap.blue

  
[![Netlify Status](https://api.netlify.com/api/v1/badges/8b9d3eee-7aa8-4b1f-9e37-2f78307e91d7/deploy-status)](https://app.netlify.com/sites/flowmap-blue/deploys)

[https://flowmap.blue](http://flowmap.blue/)


This app can render a geographic flow map visualization from a spreadsheet published on Google Sheets.

It can be used to visualize numbers of movements of people or goods between pairs of geographic locations
(Origin-Destination data).


<a href=https://flowmap.blue/1Oe3zM219uSfJ3sjdRT90SAK2kU3xIvzdcCW6cwTsAuc><img src=https://user-images.githubusercontent.com/351828/76080526-5fd20d00-5fa7-11ea-939c-7abb268fde40.png width=800>
</a>



## Running locally

Install dependencies:

    yarn install
or     

    npm install
    

Add `.env` file to the project root with a [Mapbox access token](https://www.mapbox.com/help/define-access-token/):

    REACT_APP_MapboxAccessToken=Your_Own_Mapbox_Access_Token_Goes_Here

Then run:

    npm start


<a href="https://www.netlify.com">
    <img src="https://www.netlify.com/img/global/badges/netlify-dark.svg" alt="Deploys by Netlify" />
</a>
