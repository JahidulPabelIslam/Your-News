# Your News

During the final (third) year of my degree (2016) I along with a partner were tasked to develop a skill for Alexa. We chose to create a custom skill to provide Football News via various API's.

We developed the skill using Node.js and used Lambada Function on [Amazon Web Services](http://aws.amazon.com/) to host the service.

User's can save their favourite teams using voice commands, which will be stored in a NoSQL database provided by Amazon DynamoDB, they can add and delete from it also using voice commands. It verifies the teams using [football-data API](http://api.football-data.org/docs/v1/) before the data is stored.

Users can then get information on the latest score, next fixture and latest news for their favourite team's list or they can get the same information on a another team not on their favourites list. This information is also retrived from [football-data API](http://api.football-data.org/docs/v1/).

For the latest news on a team, We have used the [Twit](https://www.npmjs.com/package/twit) package to connect to [Twitter Search API](https://dev.twitter.com/rest/public/search) to get the latest and most popular tweet.
