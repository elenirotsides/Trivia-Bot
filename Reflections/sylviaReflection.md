# SSW-345 Reflection
## By Sylvia Boamah

### Design
 
1. What was most helpful about thinking about design methods of your project?

The most helpful design methods for this project were the use cases and architecture diagram. The use cases allowed me to better understand our targeted user and what tasks they would have to complete in order to fully engage with the Trivia bot. This allowed the team to establish the normal and alternative flows of the bot and brainstorm commands that the bot would need. The architecture diagram gave me a visual representation of how different platforms and servers would interact with each other, as well as recognizing how the Discord API and Trivia API would be integrated and work together. 
 
2. What was most difficult? What would you do differently?

The most difficult design method to understand was the sequence diagram. I had no prior knowledge of bots before this project so creating a sequence diagram required a lot of research. I had no experience with REST APIs either, so I did not know how the Trivia API would interact with Node.js and the Discord server. I would have done the sequence diagram differently by adding more lifelines to display how the Discord API and Heroku engage with the other participants, since more knowledge was acquired after implementing the project. 
 
3. What design methods might you want to try again in the future on another project?

I would like to try use cases and architecture diagrams again. They allowed me to document all possible scenarios and interactions a program would need to consider. Visual representations help me understand the ins and outs of my resources, languages, and tools so I can expatiate everything before I start coding. 
 
### Implementation
 
1. What was most helpful about implementing, testing, and integration in your bot project?

During implementation, using different branches and creating pull requests (PR) were the most helpful strategies for the duration of the project. My team members were able to code in their own branches in order to solve their assigned issues. From there, we would separately commit our changes and create PRs in order to merge into the main branch. Changes would not be committed until they were reviewed, which made working on the same JavaScript file and solving merge conflicts more efficient. We would comment on each other’s PRs and either approve or request changes to each other’s code. This provided for seamless collaboration. 

One of the most helpful strategies my team used while in the testing phases of the project was using testing channels in Discord. We were able to implement our own Trivia Bots attached to our separate testing channels using the Discord Developer Portal. From there, we were able to access our own bot tokens and hard code them into our local repositories so they do not interfere with the main bot channel. This method was very effective in testing the separate issues we had to solve.

During the integration process, the best tool my team used was Heroku, a cloud application service that supports Node.js projects. The team was able to host the bot on our main Discord channel by directly linking the main branch to Heroku. This tool made testing in the main channel accessible to all team members at the same time, which made it easier to test simultaneous gameplay. 
 
2. What was most difficult? What would you do differently?

The most difficult part in our process was figuring out how to structure our code. We decided that the best way to implement the bot under the time constraint was to use one file called bot.js. With us all working on one file, it was difficult to commit changes without another team member present. With this obstacle, meetings had to be arranged to commit each change and some members, myself included, would not realize their code structure was outdated. This occurred when I was implementing a multiple choice game but was not aware that certain syntaxes were changed and adopted by other team members. I would have implemented the bot differently by researching ways to separate game modes into different JS files for easier committing and pushing. 
 
3. What implementation, testing, and integration methods might you want to try again in the future on another project?

I would want to try using different branches and creating pull requests again because they were very streamlined and easily documented ways of adding to a project without disrupting anyone’s progress. It is insightful to receive feedback and request changes on people’s code to best improve communication and collaboration between developers. 
 
 
### Process
 
1. What was most helpful about implementing kanban in your project?

Using the kanban in my project was helpful in knowing the issues created by team members and who was assigned to them. The kanban allowed the team to distribute work evenly and visually display our progress. Additionally, using the point system and other labels was helpful in knowing what issues to prioritize and implement chronologically. We labeled issues under different categories such as “Feature”, “Bug”, and “Enhancement” to best communicate what the issues were geared towards. Whenever issues were created and moved across the kanban board, the Github notifications were easily linked and accessed through the team’s Discord channel to best alert members of new goals.
 
2. What was most difficult? What would you do differently?

The most difficult part of the kanban board was knowing how to best explain the issues so that other team members could understand. When there are bugs in our code, or functionalities that need to be implemented or fixed, it was a struggle to best communicate the steps in solving them especially since I had no prior knowledge on how to code Discord bots. Explaining them enough so that they were then assignable to someone else was an obstacle. Often, we had to host meetings to communicate our issues. If we had a longer time frame, I would have done further research so I was more informed of the best practices in writing issue descriptions and so that there were less gaps in our communication.
 
3. What software processes or practices might you want to try again in the future on another project?

I would want to continue using the point system and labels to categorize my issues. These practices will allow me to better document my decisions and sort goals by difficulty and importance. Using these practices would help me plan out which features I can implement right away and which ones require more research and planning.
 
### Overall
 
Considering all the design and architecture methods, testing practices, and software processes you've encountered---**compare and constrast** how the benefits of the different practices and how they might be useful together.

Using use case diagrams helps in understanding the targeted user and giving an overview on what tasks they should be able to complete. This contrasts with diagrams like architecture and sequence diagrams because those respectively flesh out how different participating tools interact with each other and how operations are carried out in the system. Working in tandem, creating these diagrams allows developers to connect user interactions with the capabilities and the constraints of the languages, servers, and APIs used. Another design method is implementing object-oriented programming (OOP) by modeling data as objects. Analyzing use cases in conjunction with an OOP design lays out the necessary data fields to display for the user to complete a task. For example, our project contains an object that gathers the data fields for each trivia question. The object identifies the question, difficulty, type, and corresponding answer choices. This object is significant because it is used to then display to the user the information they need to play the game, showing the importance of OOP and use cases working together. 

Defining our use cases helps us in testing our code to solve our documented issues. I referred to our use cases in order to ensure the code was working properly in my separate Discord channel. If I was able to interact with the bot, use commands, and answer questions on the interface, I knew I was satisfying our target user. Understanding our use cases also assisted in assigning point values and labels to issues in our kanban board because both practices expand on prioritization. Using an Agile approach allowed the team to break up responsibilities into smaller, more manageable tasks, all with the goal of satisfying our use cases. Although different concepts, design, testing, and software practices are most effective when working collectively. 
