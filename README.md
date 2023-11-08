# Drink Master Project - Backend Part

Welcome to the Drink Master project! This Node.js backend application provides the core functionality for the Drink Master application, allowing you to explore, create, and manage your favorite cocktails and drinks. With this backend, users can create accounts, add their own drink recipes, and save their favorite drinks for future reference.

## Table of Contents

- [Frontend](#frontend)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-docs)
- [Contributors](#contributors)

## <a id="frontend">Frontend</a>

- [GitHub](https://github.com/DanyloTytarenko/DrinkMaster)
- [Live page](https://danylotytarenko.github.io/DrinkMaster/welcome)

## <a id="features">Features</a>

The Drink Master backend provides a set of features that enable users to interact with the system through the API endpoints (see [Usage](#usage)):

- User account creation and authentication
- Adding and deleting own drink recipes
- Browsing and searching for drink recipes
- Saving favorite drinks for easy access
- Secure and efficient backend powered by Node.js

## <a id="getting-started">Getting Started</a>

### <a id="prerequisites">Prerequisites</a>

Before you can run the Drink Master backend, you'll need to have the following software installed on your system:

- Node.js - JavaScript runtime
- npm or Yarn - Package manager for Node.js

### <a id="installation">Installation</a>

1. Clone the repository to your local machine:
   ```
   git clone https://github.com/Illya-Bilyk/nodejs-teamproject-rest-api
   ```
2. Change your current directory to the project folder:
   ```
   cd nodejs-teamproject-rest-api
   ```
3. Install the project dependencies:
   ```
   npm install
   or
   yarn install
   ```
4. Configure the environment variables. You will need to create a .env file in the project root and define the required variables (e.g., database connection details, API keys, etc) - see `.env.example` for required variables.
5. Start the server:
   ```
   npm run dev
   or
   yarn run dev
   ```

Your Drink Master backend should now be running and accessible at `http://localhost:3000` (if you set the PORT `.env` variable as 3000).

## <a id="usage">Usage</a>

Here are some example use cases of the Drink Master backend:

- To create a new user account, send a POST request to `/auth/signup`.
- To authenticate a user, send a POST request to `/auth/signin`.
- To log out, send a POST request to `/auth/signout`.
- To get the current user, send a GET request to `/users/current`.
- To update user info, send a PATCH request to `/users/update`.
- To subscribe a user to the newsletter, send a POST request to `/users/subscribe`.
- To authenticate a user through Google, send a GET request to `/auth/google`
- To get main page drinks, send a GET request to `/drinks/mainpage`.
- To get popular drinks, send a GET request to `/drinks/popular`.
- To get drinks by search, send a GET request to `/drinks/search`.
- To get a drink by ID, send a GET request to `/drinks/:drinkId`.
- To add your own drink, send a POST request to `/drinks/own/add`.
- To delete your own drink, send a DELETE request to `/drinks/own/remove/:drinkId`.
- To get your own drinks, send a GET request to `/drinks/own`.
- To add a drink to your favorite drinks, send a POST request to `/drinks/favorite/add/:drinkId`.
- To remove a drink from your favorite drinks, send a DELETE request to `/drinks/favorite/remove/:drinkId`.
- To get all your favorite drinks, send a GET request to `/drinks/favorite`.
- To get all drink categories, send a GET request to `/filters/categories`.
- To get all ingredients, send a GET request to `/filters/ingredients`.
- To get all glasses, send a GET request to `/filters/glasses`.

These endpoints allow you to interact with various features of the Drink Master backend, including user management, drink management, and access to filters and categories.

## <a id="api-docs">API Documentation</a>

For detailed API documentation or tests, please refer to the [Swagger API Documentation](https://drinks-whm4.onrender.com/api-docs/).
The first opening may be long, because free render.com service is used for backend deployment.

## <a id="contributors">Contributors</a>

This project was made possible by the hard work and dedication of the following team members:

- Illya Bilyk - Team Lead / Developer
  - [GitHub](https://github.com/Illya-Bilyk)
- Kyrylo Lysenko - Developer
  - [GitHub](https://github.com/Stylize-K)
- Viktoria Barma - Scrum Master / Developer
  - [GitHub](https://github.com/ViktoriiaBarma)
- Ivan Stepanenko - Developer
  - [GitHub](https://github.com/go-to-stars)

**A big thank you to our team for their contributions to this project!**
