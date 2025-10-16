export const prompt = `
========= START OF THE RAW TEXT=========

$$RAW_PRICES$$

========= END OF THE RAW TEXT=========

Here is the list of products that is available. They are in format: "article; alias, alias2, alias3". Look for matches in both articles and aliases, but in result json use corresponding article.

========= AVAILABLE ARTICLES LIST =========

$$ARTICLES$$

========= END AVAILABLE ARTICLES LIST =========

Please extract relevant information and fill in the following JSON fields. Do not use markdown or any other formatting — just plain JSON. Reply **only** with a JSON object and no additional text. If there is a duplicate for the same model use one with the highest price. Ignore items that is not have article from "AVAILABLE ARTICLES LIST" list.

Expected item JSON format:
{
    "article": "",
    "price": 0
}

Example of the JSON output format:
[
    {
        "article": "iPhone 16 Pro Max 1 Tb Desert"
        "price": 127200
    }
]
`;

