/***********************************************************************
Copyright 2019 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Note that these code samples being shared are not official Google
products and are not formally supported.
************************************************************************/


/**
 * @fileoverview Calls OpenWeatherMap API for a list of locations in a
 * spreadsheet and pastes the results in the corresponding columns.
 */


var API_KEY = '';  // insert here your OpenWeatherMap API key
var MAX_RETRIES = 10;
var SLEEP_BETWEEN_LOCATIONS = 1000;  // in milliseconds.
var SLEEP_BETWEEN_RETRIES = 3000;    // in milliseconds.
var UNITS = 'metric';                // metric/imperial for Celsius/Fahrenheit.
var retries = 0;


/**
 * Calls OpenWeatherMap API for each location in the "weather" sheet, and
 * compute the location bidding adjustment. The updated values are sent via
 * bulksheet to SA360.
 * @public
 */
function updateWeatherAndSendToSA360() {
  updateWeatherData();
  customLog_('Starting campaigns update...');
  sendUpdate();
}

/**
 * Calls OpenWeatherMap API for each location in the "weather" sheet, and pastes
 * the Weather and Temperature results in the corresponding columns. Takes note
 * of the result of each call in the "log" sheet.
 * @public
 */
function updateWeatherData() {
  clearLog_();
  var values = weatherSheet.getDataRange().getValues();
  var locationIndex, tempIndex, typeIndex;
  for (var col in values[0]) {
    if (!values[0][col]) {
      break;
    } else if (values[0][col].indexOf('Location name API') >= 0) {
      locationIndex = col;
    } else if (values[0][col].indexOf('Weather condition') >= 0) {
      typeIndex = col;
    } else if (values[0][col].indexOf('Weather temperature') >= 0) {
      tempIndex = col;
    }
  }
  for (var row in values) {
    if (row > 0 && values[row][locationIndex].length > 2) {
      var locationString = values[row][locationIndex];
      retries = 0;
      var apiData = getWeatherFromApi_(locationString);
      if (apiData) {
        var weather = apiData.weather[0].main;
        var temp = apiData.main.temp;
        weatherSheet.getRange((Number(row) + 1), (Number(typeIndex) + 1))
            .setValue(weather);
        weatherSheet.getRange((Number(row) + 1), (Number(tempIndex) + 1))
            .setValue(temp);
        customLog_(
            'Location "' + locationString + '": ' + weather + ', ' + temp +
            '°');
      } else {
        customLog_('Error loading API data for location: ' + locationString);
      }
      Utilities.sleep(SLEEP_BETWEEN_LOCATIONS);
    }
  }
  customLog_('Update completed!');
}

/**
 * Calls OpenWeatherMap API and retrieves the current weather data for the
 * location specified as input.
 * @param {string} location Location to query the weather API for.
 * @return {?Object} The weather API data for the location (null if error).
 * @private
 */
function getWeatherFromApi_(location) {
  var url = 'http://api.openweathermap.org/data/2.5/weather?q=' + location +
      '&appid=' + API_KEY + '&units=' + UNITS;
  retries++;
  Logger.log(url);
  try {
    var response = UrlFetchApp.fetch(url);
    return JSON.parse(response.getContentText());
  } catch (e) {
    if (retries < MAX_RETRIES) {
      Utilities.sleep(SLEEP_BETWEEN_RETRIES);
      return getWeatherFromApi_(location);
    } else {
      return null;
    }
  }
}
