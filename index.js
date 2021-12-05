const express = require("express");
const dialogflow = require("@google-cloud/dialogflow");
const cors = require("cors");
require("dotenv").config();
const superagent = require("superagent");

const app = express();
const port = process.env.PORT || 4000;

const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);

// google dialogflow project-id
const PROJECTID = CREDENTIALS.project_id;

// Configurations for client
const CONFIGURATION = {
  credentials: {
    private_key: CREDENTIALS["private_key"],
    client_email: CREDENTIALS["client_email"],
  },
};

// Create a new session
const sessionClient = new dialogflow.SessionsClient(CONFIGURATION);

// Detect Intent method - used to detect the intent of the user
const detectIntent = async (languageCode, queryText, sessionId) => {
  let sessionPath = sessionClient.projectAgentSessionPath(PROJECTID, sessionId);

  // The text query request: What question users will ask
  let request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: queryText,
        languageCode: languageCode,
      },
    },
  };

  // Response and results of the questions asked by a user
  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;

  console.log({ result: result.parameters.fields });

  return {
    response: result.fulfillmentText,
  };
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (_, res) => {
  res.status(200).send("Server is working.");
});

// Dialogflow route - Used to get the answers to users questions based on parameters passed
app.post("/dialogflow-response", async (req, res) => {
  let languageCode = req.body.languageCode;
  let queryText = req.body.queryText;
  let sessionId = req.body.sessionId;

  try {
    let responseData = await detectIntent(languageCode, queryText, sessionId);
    res.json({
      message: "Successful",
      data: responseData.response,
    });
  } catch (error) {
    return error;
  }
});

/* One API to get different response depending on the values or parameters passed */
app.post("/recipes", (request, response) => {
  const recipeName = request.body?.queryResult?.parameters?.recipe;
  const recipeCategory = request.body?.queryResult?.parameters?.recipeCategory;
  const recipeArea = request.body?.queryResult?.parameters?.recipeArea;
  const random = request.body?.queryResult?.parameters?.randomRecipe;
  const randomRecipe = random.toLowerCase() === "random" ? random : null;

  /** Get a recipe for a meal */
  if (recipeName) {
    const api = encodeURI(
      `${process.env.BASE_RECIPE_URL}/search.php?s=${recipeName}`
    );

    superagent
      .post(api)
      .then((apiRes) => {
        let { meals } = apiRes.body,
          dataToSend;

        if (!Array.isArray(meals)) return;

        meals.map((recipes) => (dataToSend = recipes));

        let ingredientsArray = [];
        const mealArray = Object.keys(dataToSend);

        mealArray.map((key) => {
          key.includes("strIngredient") && dataToSend[key] !== ""
            ? ingredientsArray.push({ ingredient: dataToSend[key] })
            : false;
        });

        mealArray.map((key) => {
          key.includes("strMeasure") && dataToSend[key] !== ""
            ? (ingredientsArray = [
                ...ingredientsArray,
                { measure: dataToSend[key] },
              ])
            : false;
        });

        const { strMeal, strCategory, strArea, strInstructions } = dataToSend;

        return response.json({
          message: "Query Successful",
          fulfillmentText: `
        The name of the recipe is ${strMeal}.
        It falls under the ${strCategory} category and it is a ${strArea}dish.

        The ingredients to make this meals are ${ingredientsArray
          .map((item) => item.ingredient)
          .filter((item) => item !== " " && item)}.

        The instruction to make this receipe is as follows: ${strInstructions}`,
        });
      })
      .catch((error) => response.json({ error: error }));
  }

  /** Get a recipes by categories */
  if (recipeCategory) {
    const api = encodeURI(
      `${process.env.BASE_RECIPE_URL}/filter.php?c=${recipeCategory}`
    );

    superagent
      .post(api)
      .then((apiRes) => {
        let { meals } = apiRes.body;

        if (!Array.isArray(meals)) return;

        let ingredientsArray = [];

        meals.forEach((item) => ingredientsArray.push(item.strMeal));

        return response.json({
          message: "Went through!!",
          fulfillmentText: `
        Meals under this category include:
        ${ingredientsArray.join(", ")}
        `,
        });
      })
      .catch((error) => response.json({ error: error }));
  }

  /** Get a recipes by area or country */
  if (recipeArea) {
    const api = encodeURI(
      `${process.env.BASE_RECIPE_URL}/filter.php?a=${recipeArea}`
    );

    superagent
      .post(api)
      .then((apiRes) => {
        let { meals } = apiRes.body;

        if (!Array.isArray(meals)) return;

        let ingredientsArray = [];

        meals.forEach((item) => ingredientsArray.push(item.strMeal));

        return response.json({
          message: "Went through!!",
          fulfillmentText: `
          Meals found in this country include:
          ${ingredientsArray.join(", ")}
          `,
        });
      })
      .catch((error) => response.json({ error: error }));
  }

  /** Get a random recipe */
  if (!randomRecipe) {
    return response.json({
      message: "Successful",
      fulfillmentText: 'No data found',
    });

  } else {
    const api = encodeURI(`${process.env.BASE_RECIPE_URL}/random.php`);

    superagent
      .post(api)
      .then((apiRes) => {
        let { meals } = apiRes.body;

        let dataToSend;

        meals.map((randomMeal) => (dataToSend = randomMeal));

        let ingredientsArray = [];
        const mealArray = Object.keys(dataToSend);

        mealArray.map((key) => {
          key.includes("strIngredient") && dataToSend[key] !== ""
            ? ingredientsArray.push({ ingredient: dataToSend[key] })
            : false;
        });

        mealArray.map((key) => {
          key.includes("strMeasure") && dataToSend[key] !== ""
            ? (ingredientsArray = [
                ...ingredientsArray,
                { measure: dataToSend[key] },
              ])
            : false;
        });

        const { strMeal, strCategory, strArea, strInstructions } = dataToSend;

        return response.json({
          message: "Successful",
          fulfillmentText: `
        The name of the recipe is ${strMeal}.
        It falls under the ${strCategory} category and it is a ${strArea} dish.

        The ingredients to make this meals are ${ingredientsArray
          .map((item) => item.ingredient)
          .filter((item) => item !== " " && item)}.

        The instruction to make this receipe is as follows: ${strInstructions}`,
        });
      })
      .catch((error) => response.json({ error: error }));
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}, GREAT!!!`);
});

module.exports = app;