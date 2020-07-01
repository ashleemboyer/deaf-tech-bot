if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

const Twitter = require("twitter");

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

server.listen(port, () => {
  console.log("Listening on port:", port);

  const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  });
  console.log("Created new Twitter client.");

  const stream = client.stream("statuses/filter", {
    track: "#DeafTechTwitter,#DeafTechCommunity",
  });
  console.log(
    "Streaming statuses with #DeafTechTwitter and #DeafTechCommunity."
  );

  stream.on("data", function (event) {
    console.log("Caught some data.");

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
      console.log("Retweeting the tweet at this link:", tweetURL);
    });
  });

  stream.on("error", function (error) {
    throw error;
  });
});

setInterval(() => {
  console.log("buzzzz.");
  const requestUrl =
    process.env.NODE_ENV === "production"
      ? "http://deaf-tech-bot.herokuapp.com/"
      : `http://localhost:${port}`;
  http.get(requestUrl);
}, 300000);
