# SA360 BidByWeather

Disclaimer: This is not an official Google product.

## OVERVIEW

This tool enables SA360 advertisers to automatically adjust the bidding for
SA360 campaigns depending on the weather conditions for each location target
specified.

The tool functionality is orchestrated by a Google Spreadsheet powered by custom
AppsScript code, which is mainly taking care of:

*   retrieving the weather information through OpenWeatherMap API for each
    location target in the campaigns requested;
*   computing the bid adjustment percentages according to the desired logic;
*   sending the updated bid ajustment to be applied in SA360 (leveraging a
    previously configured SFTP endpoint).

The provided setup allows adjusting the bidding for all location targets in all
the campaigns that are specified in the Sheet, belonging to the same advertiser.
The logic used to adjust the bidding is deliberately not provided since each
client needs to define the best strategy that suits to the product/service being
advertised. Please note that more complex, AppsScript based, logic is also
possible to implement, but it requires non trivial coding skills.

## REQUIREMENTS AND LIMITATIONS

#### 1. Authorizations

Each individual user needs to “install” the tool and to authorise access to the
SA360 API through his/her personal privileges.

Users of the tools need to have access to the SA360 Advertisers and Campaigns
they want to edit.

#### 2. Google Cloud Platform project

Behind the scenes, Google Cloud Platform tools such as Cloud Storage and Cloud
Functions are used, and therefore a active Google Cloud Platform project (with
an active Billing Account) is required.

Please note that Cloud costs are usage-based and this tool requires very low
amount of resources; monthly cost is therefore expected to be extremely low (a
few dollars), when not falling entirely in the free tier of operations that GCP
offers.

#### 3. Data size

Apps Script limitations apply. For more information on quotas and limitations,
please check out this
[page](https://developers.google.com/apps-script/guides/services/quotas).

Consider choosing a different approach if you’re planning to use the tool for
thousands of campaigns.

## INITIAL SETUP

#### 1. Configure Google Cloud Platform: Cloud Function and Storage Bucket

1.  Create _**Cloud Function**_.
    -   Go to the Cloud Functions section (enable the API if prompted).
    -   Click on **Create Function**.
        *   Use a function name of your choice.
        *   Set memory allocated to **128MB**.
        *   Choose: **Trigger HTTP** (and take note of the URL that it is
            automatically generated).
        *   Source: **Inline editor**.
        *   Runtime: **Python 3.7**.
        *   In the inline editor, copy in **main.py** and in
            **requirements.txt** the code from the corresponding files you can
            find in the _cloud\_function_ folder.
        *   Function to execute: **send_file**.
        *   Click on _Environment variables, networking, timeouts and more_ 
            to show more options:
            -   Select your preferred **region** (changing the region will 
                change the URL, so be sure of taking note of the latest one).
            -   Under _Environment variables_ click on **Add variable** and 
                insert a new variable with NAME **GCP_ID** and as VALUE the ID
                of your Cloud Project (can also be found after project= in the
                URL).
        *   Click on Create, and after a couple of minutes your Cloud Function
            should be up and running.
2.  Create a _**Cloud Storage bucket**_.
    -   Go to _Storage > Browser_.
    -   Click on **Create bucket**.
        *   Use a name of your choice and click on _Create_ ( take note of the
            name).
        *   Once created, Click on the 3-dots icon on the right.
        *   Select **Edit bucket permissions**.
        *   For each Google account (email) which will be pushing updates
            through the tool, add a new member with role **Storage Object
            Creator**.

#### 2. Create a new Spreadsheet

Create a new [Google Spreadsheet](https://sheets.google.com) and open its script
editor (from _Tools > Script Editor_)

-   Copy all the **.js files** in the _apps\_script_ folder(Code.js, Utils.js,
    DataDownload.js, DataUpload.js, ConfigDataHandler.js) in the corresponding
    .gs (Code.gs, Utils.gs, DataDownload.gs, DataUpload.gs,
    ConfigDataHandler.gs) files in your AppScript project.
-   Click on _View > Show manifest file_ to access file **appsscript.json**, and
    copy the content of file appsscript.json from this project (or even just the
    _oauthScopes_ object) into that file.
-   Click on _Resources > Cloud Platform Project_. In the following pop-up
    window, in the section _Change Project_, put your Cloud project id (you can find it on the _Home_ of your
    Google Cloud project, in the _Project Info_ section).
-   From the Cloud Platform console, open the left-side menu and select _API &
    Services > Library_. Search for **Search Ads 360 API**, select it, and
    click on "Enable". You can now close this tab and the Script Editor tab, and
    go back to the Spreadsheet.
-   If you reload the spreadsheet, the needed sheets ('Weather', 'Upload',
    'FromSA360' and 'Log') will be automatically created.

#### 3. Create the Advertiser sFTP endpoint(s) in SA360

For your advertiser in SA360, go to _Advertiser Settings > Integrations > sFTP
Connections_ and create a new sFTP Connection.

-   Choose a _sFTP connection name_ (e.g. “Bulk Budgets”).
-   Choose _Bulksheet Upload_ as “Purpose”.
-   Click on _Generate_.
-   After a few seconds, the platform will show the **Server, Port, Username and
    Password** assigned to your endpoint - take note of all four, as they’ll be
    needed in the next step.

For more information regarding sFTP for bulk edits in Search Ads please check
the
[SA360 Help Center page](https://support.google.com/searchads/answer/7409125?hl=en).

## USAGE

The followings are the steps needed to display and edit the budget data through
the bulk editor.

1.  For your agency and the selected advertiser in SA360, select the Account
    you'd like to use the bid by weather strategy with: then go to
    _Targets >Location Targets_ and click on the download icon to get the
    report. Please be sure to have in the report the field _Campaign location
    targets_ checked and then click on _Download_: you should now have a file
    containing the details of your account.
2.  Copy paste the content of the downloaded report in the **FromSA360** sheet.
3.  From the toolbar, select _Weather API > **Format bulk sheet from SA360**_.
4.  In the **Upload** tab, you should now see the data corresponding to the
    account added.
5.  Copy the location targets column from the **Upload** tab and paste it in the
    _Location name SA360_ column in the **Weather** tab
6.  Since, unfortunately, the location name accepted by OpenWeatherMap API could
    not match the _Location name SA360_ format, it is needed to double check
    each location format searching it on the
    [OpenWeatherMap website](https://openweathermap.org/city):
    *   In case the location format is the same in SA360 and on OpenWeatherMap,
        it is sufficient to copy the location value from _Location name SA360_
        column to _Location name API_ column in the **Weather** tab
    *   In case of a mismatch, you need to put the value accepted by
        OpenWeatherMap in the column _Location name API_ in the **Weather** tab
7.  From the toolbar, select _Weather API > **Update Weather only**_.
8.  In the **Weather** tab, you should now see the current weather data (Weather
    condition and weather temperature) for each location added
9.  Add the desired logic to compute the bid adjustment as a spreadsheet formula
    in the _Bid adjustment_ column in the **Weather** tab. The resulting number
    n can't be smaller than -0.9 (corresponding to -90% of the current bidding)
    and can't be higher than 9 (corresponding to 900% of the current bidding).
    See
    [SA360 support page](https://support.google.com/searchads/answer/6260599?hl=en)
    for more information on the bid adjustment column
10. From the toolbar, select _Weather API > **Update Weather and send to
    SA360**_.
    *   The first time each user sends data for the advertiser, a series of
        dialog windows will ask to enter the configuration information:
        -   SFTP data obtained in step 3 (host, port, username, password)
        -   the Cloud Function URL and the Cloud Storage bucket name obtained in
            Step 1
11. If you want/need to cancel or modify the configuration data for the
    advertiser, select _Weather API > Delete advertiser config_ from the
    toolbar. When launching a new upload, you will be asked to re-enter the
    configuration data
