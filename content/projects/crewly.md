---
title: Crewly
link: https://crewly.rawley.me
description: A small-scale class project.
---
<figure>
  <img src="/images/projects/crewly/crewly-screenshot-dashboard.png" alt="Crewly website dashboard">
</figure>

## What it is
Crewly ([crewly.rawley.me](https://crewly.rawley.me)) is an implementation of a group project assignment in my Software Engineering class. The idea is that there are three user groups: users looking to volunteer, users looking *for* volunteers, and university admins. The project solves this lack of a bridge between these users for a specific domain we decided on: UAFS RSOs.

Previously, RSOs have to advertise only to people within the club via crude methods like in-person or email solicitation, to people that may/may not want to actually help. Now, they can advertise this straight to their target audience and get the help they need, fast.

The project uses a minimal tech stack. It is broken into two parts, the frontend and the backend, both containerized with Docker. The backend uses `node.js` with `express`. The frontend uses `React.js` with a premade component library.

## My role
My role in this group project was three-fold: act as the "scrum master" and leader of the group, setup the initial project and make the early design decisions, and contribute code to both the frontend and backend. Of course, I also ensured the code and process was also well documented as per the assignment requirements. We used Trello for our task management and would have standup meetings to go over the progress and tickets.

## Features
#### Signup and signin
<figure>
  <img src="/images/projects/crewly/crewly-screenshot-signup.png">
</figure>
A basic and necessary feature. You can signup and signin to Crewly to begin using the project. Passwords are hashed when stored in the database, keeping the site safe to use.

#### Create and view listings
<figure>
  <img src="/images/projects/crewly/crewly-screenshot-post.png">
</figure>
Crewly enables volunteers to browse and view RSO listings. It also allows users that are a club member to make and edit listings. You can view post details such as the roster list, location, time, and the ability to sign up. You can also ask questions in the "Questions and answers" section of the listing. Is it innapropriate or irrelevant to Crewly's purposes? You can also report it.

#### Profile
<figure>
  <img src="/images/projects/crewly/crewly-screenshot-profile.png">
</figure>
Each user has a customizable profile where they can include things like a biography, interests, a profile picture, and the ability to switch to dark mode. The profile also showcases all of their verified events they volunteered at, as well as the clubs they are a part of. They can also edit some information or delete their account.

#### Admin tools
<figure>
  <img src="/images/projects/crewly/crewly-screenshot-admin.png">
</figure>
Users designated as admins have exactly one power: the ability to create clubs and edit club information (like club name, or who is designated as a club leader). They can also delete clubs. This is important so that fake/irrelevant listings from visitors are limited.

#### Other
<figure>
  <img src="/images/projects/crewly/crewly-screenshot-post.png">
</figure>
This project has a few other tiny features. You can check notifications anytime there is a reply to one of your questions, or verify that you actually went and volunteered for an RSO event.


## Challenges

## Reflections