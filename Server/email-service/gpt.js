import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const cleanJSON = (text) => {
  // Remove triple backticks and optional language hint (e.g. ```json)
  return text.replace(/```json|```/g, "").trim();
};

const issuerBlacklist = [
  "ZAFIR TOTAALPROJECTEN BVBA",
  "ZAFIR TOTAL PROJECTS",
  "ZAFIR"
];

const isBlacklistedIssuer = (name) =>
  issuerBlacklist.some((entry) =>
    name.toUpperCase().includes(entry.toUpperCase())
  );

async function askGPT(text) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant. Always respond in valid JSON format without markdown code fences.",
      },
      {
        role: "user",
        content: `
From the following text, extract the fields below. The issuer is the company that SENT the invoice — typically found near payment details, legal disclaimers, or VAT numbers. Do NOT use the recipient.

- issuer: the sending company’s name
- amount: total price as a number
- btw: true if the amount includes BTW, false otherwise
- btwPercent: the percent of BTW as a number, or false if not found

Exclude known recipients like Zafir in any form.

Return only valid JSON:
{
  "issuer": "CPE nv",
  "amount": 45.05,
  "btw": true,
  "btwPercent": 21
}

Text:
${text}
`,
      },
    ],
    temperature: 0.2,
  });

  let responseText = completion.choices[0].message.content.trim();
  responseText = cleanJSON(responseText);

  try {
    const parsed = JSON.parse(responseText);

    if (parsed.issuer && isBlacklistedIssuer(parsed.issuer)) {
      parsed.issuer = "UNKNOWN ISSUER";
    }

    if (
      typeof parsed.issuer === "string" &&
      typeof parsed.amount === "number" &&
      typeof parsed.btw === "boolean" &&
      (typeof parsed.btwPercent === "number" || parsed.btwPercent === false)
    ) {
      return parsed;
    } else {
      throw new Error("JSON structure is invalid");
    }
  } catch (err) {
    console.error("❌ Failed to parse GPT response as valid JSON:", responseText);
    throw new Error("Could not parse GPT response");
  }
}


const analyze = async (text) => {
  return await askGPT(text);
};

export default analyze;
