if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

const Twitter = require("twitter");

app.get("/", (req, res) => res.send("Hello!"));

app.listen(port, () => {
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
