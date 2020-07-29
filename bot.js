if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const firebase = require("./firebase");
const port = process.env.PORT || 5000;
const path = require("path");
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

const Twitter = require("twitter");

app.get("/", (req, res) => {
  console.log('GET "/"');
  if (firebase.getCurrentUser()) {
    console.log('Redirecting to "/admin"');
    res.redirect(303, "/admin");
  } else {
    console.log('Sending file "index.html"');
    res.sendFile("index.html", { root: __dirname + "/public" });
  }
});

app.get("/admin", (req, res) => {
  console.log('GET "/admin"');
  setTimeout(() => {
    console.log("Loading...");
    const currentUser = firebase.getCurrentUser();
    if (!currentUser) {
      console.log('Redirecting to "/"');
      res.redirect(303, "/");
    } else {
      res.send(`Logged in as: ${currentUser.email}`);
    }
  }, 1000);
});

app.post("/admin/signIn", async (req, res) => {
  console.log('POST "/admin/signIn"');
  const username = req.body.username;
  const password = req.body.password;

  await firebase.signIn(username, password);

  console.log('Redirecting to "/admin"');
  res.redirect(303, "/admin");
});

app.listen(port, () => {
  console.log("Running on port", port);
  const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  });

  const stream = client.stream("statuses/filter", {
    track: "#DeafTechTwitter,#DeafTechCommunity",
  });
  stream.on("data", function (event) {
    // We only want to RT original tweets
    if (!event || event.retweeted_status || event.quoted_status) {
      return;
    }

    console.log(JSON.stringify(event));

    const userScreenName = event.user.screen_name;
    const tweetIdString = event.id_str;
    const tweetURL = `https://twitter.com/${event.user.screen_name}/status/${tweetIdString}`;

    // TODO: Analyze the tweet
    //   - Check if user is allowed to be RT'd (blocklist)
    //   - Check for potentially harmful language

    // Retweet
    client.post("statuses/retweet/" + tweetIdString, function (
      error,
      tweet,
      response
    ) {
      // Do nothing for the moment
    });
  });

  stream.on("error", function (error) {
    throw error;
  });
});
