const express = require("express");
require("dotenv").config();
const superagent = require("superagent");

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`🌏 Server is running at http://localhost:${port}, GREAT!!!`);
});

app.get("/", (_, res) => {
  res.status(200).send("Server is working.");
});

// Get a recipe for a meal
// Get meals by categories
// Get meals by area

/** Fetching the movie */
app.post("/getmovie", (req, res) => {
  const movieToSearch = req.body?.queryResult?.parameters?.movie;

  const api = encodeURI(
    `${process.env.BASE_URL}/?t=${movieToSearch}&apiKey=${process.env.API_KEY}`
  );

  superagent
    .post(api)
    .then((apiRes) => {
      let dataToSend = apiRes.body;
      return response.json({
        message: "Went through!!",
        data: dataToSend,
      });
    })
    .catch((error) => console.error(error));
});

/** Get a recipe for a meal */
app.post("/get-recipe", (request, response) => {
  let mealToSearch;
  
  if (request.body?.queryResult?.parameters) {
    mealToSearch = request.body?.queryResult?.parameters?.recipe;
  } else {
    return false
  }

  const api = encodeURI(
    `${process.env.BASE_RECIPE_URL}/search.php?s=${mealToSearch}`
  );

  superagent
    .post(api)
    .then((apiRes) => {
      let dataToSend = apiRes.body;
      return response.json({
        message: "Went through!!",
        data: dataToSend,
      });
    })
    .catch((error) => console.error(error));
});

/** Get a recipes by categories */
app.post("/get-recipe-category", (request, response) => {
  // const mealToSearch = request.body?.queryResult?.parameters?.recipeCategory;
  let mealToSearch;

  if (request.body?.queryResult?.parameters) {
    mealToSearch = request.body?.queryResult?.parameters?.recipeCategory;
  } else {
    return false
  }
  const api = encodeURI(
    `${process.env.BASE_RECIPE_URL}/filter.php?c=${mealToSearch}`
  );

  superagent
    .post(api)
    .then((apiRes) => {
      let dataToSend = apiRes.body;
      return response.json({
        message: "Went through!!",
        data: dataToSend,
      });
    })
    .catch((error) => console.error(error));
});

/** Get a recipes by area */
app.post("/get-recipe-area", (request, response) => {
  // const mealToSearch = request.body?.queryResult?.parameters?.recipeArea;
  let mealToSearch;

  if (request.body?.queryResult?.parameters) {
    mealToSearch = request.body?.queryResult?.parameters?.recipeArea;
  } else {
    return false
  }
  
  const api = encodeURI(
    `${process.env.BASE_RECIPE_URL}/filter.php?a=${mealToSearch}`
  );

  superagent
    .post(api)
    .then((apiRes) => {
      let dataToSend = apiRes.body;
      return response.json({
        message: "Went through!!",
        data: dataToSend,
      });
    })
    .catch((error) => console.error(error));
});