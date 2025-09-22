export const prompt = `
========= START OF THE RAW TEXT=========

$$RAW_PRICES$$

========= END OF THE RAW TEXT=========

========= AVAILABLE ARTICLES LIST =========

$$ARTICLES$$

iPhone SE 2022 128 Black
iPhone SE 2022 128 Red
iPhone SE 2022 128 White
iPhone SE 2022 256 Black
iPhone SE 2022 256 Red
iPhone SE 2022 256 White
iPhone SE 2022 64 Black
iPhone SE 2022 64 Red
iPhone SE 2022 64 White

========= END AVAILABLE ARTICLES LIST =========

Please extract relevant information and fill in the following JSON fields. Do not use markdown or any other formatting — just plain JSON. Reply **only** with a JSON object and no additional text. If there is a duplicate for the same model use one with the highest price. Ignore items that is not have article from "AVAILABLE ARTICLES LIST" list.

Expected item JSON format:
{
    "raw": "",
    "model": "",
    "country": "",
    "article": "",
    "price": 0
}

Example of the JSON output format:
[
    {
        "raw": "16 Pro Max 1TB Desert 🇦🇪 127200 🚙",
        "model": "16 Pro Max 1TB Desert",
        "article": "iPhone 16 Pro Max 1 Tb Desert"
        "country": "🇦🇪",
        "price": 127200
    }
]

or [] if there is no Articles in "AVAILABLE ARTICLES LIST" list.

`;

