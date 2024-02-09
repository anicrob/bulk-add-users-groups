# Bulk Add User(s) to Group(s) if they are part of a certain group

## Description

Follow the set up directions in the Setup Instructions section to run this script. This script will allow you to add as many users as you would like to as many groups as you would like in bulk as long as they are part of a certain group.


## Table of Contents
* [Use Case](#use-case)
* [Setup Instructions](#setup-instructions)
* [Usage](#usage)
* [Basic Auth](#basic-auth)
* [Permissions & Limitations](#permissions--limitations)
* [Credits](#credits)


## Use Case 

When you add a user to Jira through Atlassian Access's User Provisioning/Sync feature with your IdP (so not manually), it does not add the user to any default user groups. For example, if a user is created and is in the full-time employees group that is a group from your IdP, they will not get access to any products as a group from your IdP CANNOT be used as a default access group. This means that you have to go in and manually add any default access groups/add them to products. 

This script allows you to put in any number of emails in a list, and it will ensure they are part of the desired "condition" group, and if they meet the test, they will be added to the groups you want to add them to (if these are default access groups, they can provide the users the right product access without having to do it manually!).

## Setup Instructions

Here are the setup steps:

1. Ensure you have Node.js downloaded: https://nodejs.org/en 

Select the option on the left. 

To check and see if you have node already installed or if the install was successful, run the command:

~~~
node -v
~~~

2. After doing a git clone, install the necessary packages. They are already added to the package.json, so all that's needed is to run the following commmand:
~~~
npm i
~~~

3. Set up an .env file

Run the following command:
~~~
touch .env
~~~

Add five values to this file with the following titles:

API_KEY - see Basic Auth section on how to get this value; see permissions section to see which permissions this user needs

URL - this is the Atlassian url instance (e.g. https://your-domain.atlassian.net)

CONDITION_GROUP - this is the group that you want to ensure the user(s) are part of before they get added to the groups

GROUPS_TO_ADD_USERS_TO - this is an array/list of group IDs that you want to add the correct users to

USERS_TO_ADD_TO_GROUPS - this is an array/list of users (specifically their emails) that you want to ensure that they are in the condition group, and if they are, to add them to the specified groups above


### Note: you can use the .env.TEMPLATE file as a reference.

## Usage

To use this script, run it by using the following command:

~~~
npm run start
~~~

OR

~~~
node index.js
~~~

## Basic Auth

Atlassian uses Basic Auth for a few of their REST endpoints for their authentication headers. Here are the steps to get your API token into Basic Auth format:

1. Ensure you have an API key created. Go here to create one if needed: https://id.atlassian.com/manage-profile/security/api-tokens

2. The format of basic auth is username:password then base64. The username is your email associated with your Atlassian account and then the password is the API key.

3. In the terminal run this command: (replacing user@example.com with your Atlassian account email and api_token_string with your api ke from step 1)

~~~
echo -n user@example.com:api_token_string | base64
~~~

## Permissions & Limitations

For the Find Users API endpoint:

- Privacy controls are applied to the response based on the users' preferences. This could mean, for example, that the user's email address is hidden. See the [Profile visibility overview](https://developer.atlassian.com/cloud/jira/platform/profile-visibility/) for more details.

- Permissions required: Browse users and groups global permission. Anonymous calls or calls by users without the required permission return empty search results.

For the Add user to group API endpoint:

- Permissions required: Site administration (that is, member of the site-admin group).

## Credits

This was created by anicrob. 

Jira Cloud REST APIs Endpoint used: 
- [Find Users](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-user-search/#api-rest-api-3-user-search-get)

- [Add user to group](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-groups/#api-rest-api-3-group-user-post)


You can find more of my work at [anicrob](https://github.com/anicrob).

