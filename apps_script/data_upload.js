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
 * @fileoverview Functions to send the updated campaign data to the Google Cloud
 * Storage folder (so that it can be forwarded to the SA360 SFTP endpoint).
 */

var GCS_API_UPLOAD_URL = 'https://www.googleapis.com/upload/storage/v1/b/' +
    'BUCKET/o?uploadType=media&name=FILE';


/**
 * Starts the worflow to upload the bulksheet to Google Cloud Storage,
 * and from that to SA360
 * @public
 */
function sendUpdate() {
  copyAndFormatBidAdjustment_();
  var newData = uploadSheet.getDataRange().getDisplayValues();
  var advertiser = newData[1][8];
  var advertiserId = newData[1][7];
  sendBulkSheet_(newData, advertiser, advertiserId);
  customLog_('Job completed.');
}


/**
 * Copies and formats bid adjustment percentages
 * from the sheet 'Weather' to 'upload'.
 * @private
 */
function copyAndFormatBidAdjustment_() {
  var weatherRawRange = weatherSheet.getDataRange();
  var lastRow = weatherRawRange.getLastRow();
  var weatherAdjRaw = weatherSheet.getRange(2, 2, (lastRow - 1), 4).getValues();

  var locationAdj = {};

  for (var row in weatherAdjRaw) {
    var location = weatherAdjRaw[row][0];
    var percentage = parseInt(weatherAdjRaw[row][3] * 100, 10) + '%';
    locationAdj[location] = percentage;
  }

  var lastRow = uploadSheet.getDataRange().getLastRow();
  for (var i = 2; i <= lastRow; i++) {
    var loc = uploadSheet.getRange(i, 4).getValue();
    uploadSheet.getRange(i, 5).setValue(locationAdj[loc]);
  }
}

/**
 * Sends a CSV bulk sheet file to the required Google Cloud Storage bucket.
 * GCS and SFTP details are requested to the user.
 * @param {!Object} data The 2D array of values to be sent as CSV file.
 * @param {string} advertiser The name of the Advertiser the data refers to.
 * @param {string} advertiserId The ID of the Advertiser the data refers to.
 * @private
 */
function sendBulkSheet_(data, advertiser, advertiserId) {
  // Gets Google Cloud Storage and SFTP details corresponding to the Advertiser.
  getConfigDataForAdvertiser_(advertiser);
  var host = userProperties.getProperty('Host');
  var port = userProperties.getProperty('Port');
  var username = userProperties.getProperty('Username');
  var password = userProperties.getProperty('Password');
  var gcsBucket = userProperties.getProperty('Bucket');
  var cloudFunctionURL = userProperties.getProperty('Url');

  if (!(host && port && username && password)) {
    customLog_(
        'No SFTP access information found for the advertiser ' + advertiser);
    return;
  }

  // First API call: sends the CSV file to GCS.
  var csvFile = convertArrayToCsv_(data);
  var currentDate = new Date();
  var fileName = advertiserId + '-' + currentDate.getTime() + '.csv';
  var url = GCS_API_UPLOAD_URL.replace('BUCKET', gcsBucket)
                .replace('FILE', encodeURIComponent(fileName));
  var response = JSON.parse(callApi_(url, 'POST', csvFile, 'text/csv'));
  if (!response.id) {
    throw ('Error while sending the CSV file to GCS - check permissions?');
  }

  // Second call: send HTTP POST request (which triggers the Cloud Function).
  // The payload includes the SFTP details to be used by the Cloud Functions to
  // transfer the CSV file to the SA360 sFTP endpoint.
  var payload = {
    'filename': fileName,
    'bucket': gcsBucket,
    'sftp-host': host,
    'sftp-port': parseInt(port),
    'sftp-username': username,
    'sftp-password': password
  };
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload)
  };
  var response = UrlFetchApp.fetch(cloudFunctionURL, options);
  if (response.getResponseCode() != 200) {
    throw ('Error during HTTP call - check URL?');
  }
  customLog_(
      'Bulk sheet for advertiser ' + advertiser + ' [' + advertiserId +
      '] sent to GCS/SFTP ' + (data.length - 1) + ' campaigns, filename ' +
      fileName);
}
