# Your News

During Final (Third) Year of my Degree (2016) I with a partner were tasked to develop a skill for Alexa.

We chose to create a Custom Skill to provide Football News via various API's.

We developed the skill using Node.js and used Lambada Function on [Amazon Web Services](http://aws.amazon.com/) to host the service.

User's can store their favourite teams in a NoSQL database provided by Amazon DynamoDB, they can add and delete from it using voice commands.

It verifies the teams using [football-data API](http://api.football-data.org/docs/v1/) before the data is stored.

Users can then get information on the latest score, next fixture and latest news for their favourite teams list or they can get the same information on a random team not in their favourites list.

For information on latest score and next fixture the same [API](http://api.football-data.org/docs/v1/) as above is used.

For the latest news on a team, We have used the [Twit NPM](https://www.npmjs.com/package/twit) to connect to [Twitter Search API](https://dev.twitter.com/rest/public/search) to get the latest and most popular tweet.