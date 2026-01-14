import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SPOONACULAR_KEY = process.env.SPOONACULAR_API_KEY;

app.post("/generate-meals", async (req, res) => {
    try {
        const { ingredients } = req.body;

        if (!ingredients) {
            return res.status(400).json({ error: "No ingredients provided" });
        }

        const response = await axios.get(
            "https://api.spoonacular.com/recipes/findByIngredients",
            {
                params: {
                    ingredients,
                    number: 3,
                    ranking: 1,
                    ignorePantry: true,
                    apiKey: SPOONACULAR_KEY
                }
            }
        );

        const recipeIds = response.data.map((recipe) => recipe.id).join(",");

        const bulkResponse = await axios.get(
            `https://api.spoonacular.com/recipes/informationBulk`,
            {
                params: {
                    ids: recipeIds,
                    apiKey: SPOONACULAR_KEY,
                },
            }
        );

        const recipes = bulkResponse.data.map((recipe) => {
            return {
                title: recipe.title,
                instructions:
                    recipe.instructions || "No instructions provided.",
            };
        });

        res.json({
            breakfast: recipes[0],
            lunch: recipes[1],
            dinner: recipes[2]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate meals" });
    }
});

const PORT = 3000;
app.listen(PORT, () =>
    console.log(`🍳 Backend running at http://localhost:${PORT}`)
);
    