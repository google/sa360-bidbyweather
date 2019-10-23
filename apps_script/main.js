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


var doc = SpreadsheetApp.getActive();
var WEATHER_SHEET_NAME = 'Weather';
var UPLOAD_SHEET_NAME = 'Upload';
var SA360BULK_SHEET_NAME = 'FromSA360';
var LOG_SHEET_NAME = 'Log';
var weatherSheet = doc.getSheetByName(WEATHER_SHEET_NAME);
var uploadSheet = doc.getSheetByName(UPLOAD_SHEET_NAME);
var sa360BulkSheet = doc.getSheetByName(SA360BULK_SHEET_NAME);
var logSheet = doc.getSheetByName(LOG_SHEET_NAME);
var userProperties = PropertiesService.getUserProperties();


/**
 * Adds a custom menu to the spreadsheet.
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Weather API')
      .addItem(
          'Update Weather and send to SA360', 'updateWeatherAndSendToSA360')
      .addItem('Update Weather only', 'updateWeatherData')
      .addItem('Delete advertiser config', 'clearSavedAdvertiserConfig')
      .addItem('Format bulk sheet from SA360', 'copyAndFormatBulkSheet')
      .addToUi();
  init_();
}


/**
 * Initialization function to structure the spreadsheet, if needed.
 * @private
 */
function init_() {
  if (!weatherSheet || !uploadSheet || !sa360BulkSheet || !logSheet) {
    // We need setup and format the spreadsheet
    initSpreadsheet_();
  }
  doc.setActiveSheet(configSheet);
}


/**
 * Sets up and formats the needed sheets in the Spreadsheet.
 * @private
 */
function initSpreadsheet_() {
  if (!weatherSheet) {
    doc.insertSheet(WEATHER_SHEET_NAME, 1);
    weatherSheet = doc.getSheetByName(WEATHER_SHEET_NAME);
    weatherSheet.setTabColor('blue');
    weatherSheet.getRange(1, 1)
        .setValue('Location name API')
        .setFontWeight('bold');
    weatherSheet.getRange(1, 2)
        .setValue('Location name SA360')
        .setFontWeight('bold');
    weatherSheet.getRange(1, 3)
        .setValue('Weather condition')
        .setFontWeight('bold');
    weatherSheet.getRange(1, 4)
        .setValue('Weather temperature')
        .setFontWeight('bold');
    weatherSheet.getRange(1, 5)
        .setValue('Bid adjustment')
        .setFontWeight('bold');
    weatherSheet.getRange(1, 1, 1, 5).setBackground('#ADD6AD');
  }
  if (!uploadSheet) {
    doc.insertSheet(UPLOAD_SHEET_NAME, 2);
    uploadSheet = doc.getSheetByName(UPLOAD_SHEET_NAME);
    uploadSheet.setTabColor('green');
    uploadSheet.getRange(1, 1, 1, 13).setBackground('#ADD6AD');
    uploadSheet.getRange(1, 1, 1, 13).setFontWeight('bold');
  }
  if (!sa360BulkSheet) {
    doc.insertSheet(SA360BULK_SHEET_NAME, 3);
    sa360BulkSheet = doc.getSheetByName(SA360BULK_SHEET_NAME);
    sa360BulkSheet.setTabColor('yellow');
  }
  if (!logSheet) {
    doc.insertSheet(LOG_SHEET_NAME, 4);
    logSheet = doc.getSheetByName(LOG_SHEET_NAME);
    logSheet.setTabColor('black');
    logSheet.getRange(1, 1, 1, 3).setBackground('#778899');
    logSheet.getRange(1, 1).setValue('Timestamp').setFontWeight('bold');
    logSheet.getRange(1, 2).setValue('Message').setFontWeight('bold');
  }
}
