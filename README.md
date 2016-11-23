# Your News

During Final (Third) Year of my Degree (2016) I with a partner were tasked to develop something for Alexa.

We Chose to create a Custom Alexa Skill for Get Football News.

User's can store their favourite teams in a database, they can add and delete from it using voice commands.

It verifies the teams using http://api.football-data.org/docs/v1/ before the data is stored.

Users can then get information on the latest score, next fixture and latest news for their favourite teams or they can get the same information on a random team not in their favourites list.

For information on latest score and next fixture the same API as above is used.

For the latest news on a team, We have used https://www.npmjs.com/package/twit to connect to Twitter Search API.