"# FinalYearProject" 

This is my Final year project, NoteMAX. It is a Note taking web application/Chrome Extension which allows users create, save, edit, Favourite and delete notes. Share notes and collaborate in real-time with other users, and summarize notes using Azure openAI services.
There is also a chatbot page, with an AI powered assistant using a different deployed AI Model from Azure where users can ask questions to the AI and receive answers, create chats, edit and delete chats.
A reminders page allowing users to schedule reminders and when they trigger they will recieve Email reminders (using Azure communication Services) and Browser notification reminders (if enabled).

Frontend:
npm i
npm run build:web (to build web application)
npm run build (to build Chrome extension

to load extension into chrome, go to chrome://extensions/ with developer mode on, load unpacked in the top left and select "dist" folder in frontend. (dist-web is for the web application)

Deployed Application on a Digital Ocean Droplet at : https://notemax.site/
