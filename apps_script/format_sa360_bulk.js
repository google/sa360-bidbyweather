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
 * Copies relevant data from the sheet 'FromSA360' to sheet 'Upload'.
 * @public
 */
function copyAndFormatBulkSheet() {
  clearLog_();
  var newData = sa360BulkSheet.getDataRange().getValues();
  customLog_('Starting to format the SA360 sheet..');
  var headers = [
    'Row Type', 'Action', 'Status', 'Location', 'Location bid adjustment %',
    'Recommended bid adjustment %', 'Target ID', 'Advertiser ID', 'Advertiser',
    'Account ID', 'Account', 'Campaign ID', 'Campaign'
  ];
  var idxHeaders = [];
  for (var row in newData) {
    if (row == 0) {
      for (idx in headers) {
        idxHeaders.push(newData[row].indexOf(headers[idx]));
      }
    }

    if (row != 0 && newData[row][0] != 'location target') {
      continue;
    }
    for (var i = 0; i < headers.length; i++) {
      uploadSheet.getRange(parseInt(row) + 1, i + 1)
          .setValue(newData[row][idxHeaders[i]]);
    }
  }
  customLog_('Completed. Data has been copied to Sheet Upload.');
}
