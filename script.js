var fs = require("fs");
var util = require("util");
var log_file = fs.createWriteStream(__dirname + "/debug.log", { flags: "w" });
var log_stdout = process.stdout;
console.log = function (d) {
  log_file.write(util.format(d) + "\n");
  log_stdout.write(util.format(d) + "\n");
};
require("dotenv").config();
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const CONDITION_GROUP = `${process.env.CONDITION_GROUP}`;
const GROUPS_TO_ADD_USERS_TO = JSON.parse(
  `${process.env.GROUPS_TO_ADD_USERS_TO}`
);
const USERS_TO_ADD_TO_GROUPS = JSON.parse(
  `${process.env.USERS_TO_ADD_TO_GROUPS}`
);

const userInfo = [];
const confirmedUsers = [];

const getUserIds = async () => {
  await Promise.all(
    USERS_TO_ADD_TO_GROUPS.map(async (userEmail) => {
      try {
        let encodedEmail = encodeURIComponent(userEmail);
        let response = await fetch(
          `${process.env.URL}/rest/api/3/user/search?query=${encodedEmail}`,
          {
            method: "GET",
            headers: {
              Authorization: `Basic ${process.env.API_KEY}`,
              Accept: "application/json",
            },
          }
        );
        if (response.status !== 200) {
          console.log(`${response.status}: ${response.error}`);
          return;
        }
        let users = await response.json();
        users.map(async (user) => {
          if (user.active) {
            userInfo.push(user.self);
          }
        });
      } catch (err) {
        console.log(err);
      }
    })
  );
  return userInfo;
};

const confirmUserPartOfConditionGroup = async (apis) => {
  await Promise.all(
    apis.map(async (url) => {
      try {
        let response = await fetch(`${url}&expand=groups`, {
          method: "GET",
          headers: {
            Authorization: `Basic ${process.env.API_KEY}`,
            Accept: "application/json",
          },
        });
        let user = await response.json();
        let filteredIds = user.groups.items.map((group) => group.groupId);
        if (filteredIds.includes(CONDITION_GROUP)) {
          confirmedUsers.push(user);
        } else {
          console.log(
            `${new Date().toGMTString()} - ${
              user.displayName
            } is not part of the condition group`
          );
        }
      } catch (err) {
        console.log(err);
      }
    })
  );
  return confirmedUsers;
};

const addUsersToGroups = async (users) => {
  await Promise.all(
    await users.map(async (user) => {
      let bodyData = {
        accountId: user.accountId,
      };
      await Promise.all(
        GROUPS_TO_ADD_USERS_TO.map(async (groupId) => {
          const response = await fetch(
            `${process.env.URL}/rest/api/3/group/user?groupId=${groupId}`,
            {
              method: "POST",
              headers: {
                Authorization: `Basic ${process.env.API_KEY}`,
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(bodyData),
            }
          );
          if ((response.status = 201)) {
            console.log(
              `${new Date().toGMTString()} - ${
                user.displayName
              } has been added to group, ${groupId}.`
            );
          } else {
            console.log(`${response.status}: ${response.error}`);
          }
        })
      );
    })
  );
  return true;
};

const script = async () => {
  const start = Date.now();
  const userAPI = await getUserIds();
  const usersToAddToGroups = await confirmUserPartOfConditionGroup(userAPI);
  const addedUserToGroups = await addUsersToGroups(usersToAddToGroups);
  if (addedUserToGroups) {
    const end = Date.now();
    const totalTime = end - start;
    console.log(
      `\n-------------------------------------------------------------------------------------------------------------------\n\n${new Date().toGMTString()} - ✅ ${
        confirmedUsers.length
      } user(s) (${confirmedUsers.map(
        (user) => user.displayName
      )}) have been added to the requested groups in ${
        totalTime / 1000
      } seconds. \n\n----> Please check the logs for any errors.\n`
    );
  }
};

script();
