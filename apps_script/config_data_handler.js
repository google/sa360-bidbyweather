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
 * @fileoverview Functions to handle the SFTP and
 * GCS bucket configuration information.
 */


/**
 * Deletes the stored config data for the advertiser.
 * This includes sFTP data and the cloud setup (bucket, cloud function URL).
 * @public
 */
function clearSavedAdvertiserConfig() {
  clearLog_();
  customLog_('Started script to delete the config (GCS/SFTP) data');
  userProperties.deleteAllProperties();
  customLog_('Script finished');
}


/**
 * Retrieves SFTP and GCP config data for the advertiser.
 * If not already available, prompts the user to insert them.
 * @param {string} advertiser The name of the Advertiser the data refers to.
 * @return {!Array<string>} The config data if available, empty array otherwise.
 * @private
 */
function getConfigDataForAdvertiser_(advertiser) {
  // Input is needed only if the config data for the advertiser is not available
  if (!isAdvertiserConfigStored_()) {
    customLog_('Saving SFTP configuration for advertiser ' + advertiser);
    var userResponse = [];
    var requiredFields = [
      'SFTP Host:', 'SFTP Port:', 'SFTP Username:', 'SFTP Password:',
      'GCS Bucket:', 'Cloud Function URL:'
    ];

    for (i = 0; i < requiredFields.length; i++) {
      userResponse[i] = getUserInput_(advertiser, requiredFields[i]);
      if (userResponse[i] == null) {
        userResponse = [];
        break;
      }
    }
    if (userResponse.length == requiredFields.length) {
      userProperties.setProperty('Host', userResponse[0]);
      userProperties.setProperty('Port', userResponse[1]);
      userProperties.setProperty('Username', userResponse[2]);
      userProperties.setProperty('Password', userResponse[3]);
      userProperties.setProperty('Bucket', userResponse[4]);
      userProperties.setProperty('Url', userResponse[5]);
    }
    return userResponse;
  }
  return [
    userProperties.getProperty('Host'), userProperties.getProperty('Port'),
    userProperties.getProperty('Username'),
    userProperties.getProperty('Password'),
    userProperties.getProperty('Bucket'), userProperties.getProperty('Url')
  ];
}


/**
 * The method is displaying a UI for inserting the required config data
 * @param {string} advertiser The name of the Advertiser the data refers to.
 * @param {string} requestedField The data the user is required to provide.
 * @return {string} The config data if provided, null otherwise.
 * @private
 */
function getUserInput_(advertiser, requestedField) {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt(
      'Info required for advertiser ' + advertiser, requestedField,
      ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() == ui.Button.OK) {
    return response.getResponseText();
  }
  return;
}


/**
 * Checks if the config data for the advertiser is available or not.
 * @return {boolean} True if the data is available, false otherwise.
 * @private
 */
function isAdvertiserConfigStored_() {
  return userProperties.getProperty('Host') != null &&
      userProperties.getProperty('Port') != null &&
      userProperties.getProperty('Username') != null &&
      userProperties.getProperty('Password') != null &&
      userProperties.getProperty('Bucket') != null &&
      userProperties.getProperty('Url') != null;
}
