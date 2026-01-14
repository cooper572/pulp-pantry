import axios from "axios";

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { ingredients } = req.body;

        if (!ingredients) {
            return res.status(400).json({ error: "No ingredients provided" });
        }

        const SPOONACULAR_KEY = process.env.SPOONACULAR_API_KEY;

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

        const recipes = await Promise.all(
            response.data.map(async (recipe) => {
                const details = await axios.get(
                    `https://api.spoonacular.com/recipes/${recipe.id}/information`,
                    { params: { apiKey: SPOONACULAR_KEY } }
                );

                return {
                    title: details.data.title,
                    instructions:
                        details.data.instructions || "No instructions provided."
                };
            })
        );

        res.status(200).json({
            breakfast: recipes[0],
            lunch: recipes[1],
            dinner: recipes[2]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate meals" });
    }
}
