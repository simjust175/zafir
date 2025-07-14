import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const cleanJSON = (text) => {
  return text.replace(/```json|```/g, "").trim();
};

const issuerBlacklist = [
  "ZAFIR TOTAALPROJECTEN BVBA",
  "ZAFIR TOTAL PROJECTS",
  "ZAFIR",
];

const isBlacklistedIssuer = (name) =>
  issuerBlacklist.some((entry) =>
    name.toUpperCase().includes(entry.toUpperCase())
  );

async function askGPT(text) {
  
  const prompt = `
Parse the following invoice text and extract:

- issuer: the company that issued/sent the invoice (not the recipient)
- amount: total to pay (number)
- btw: true if the total includes BTW
- btwPercent: number or false if not found

Return only this JSON:
{
  "issuer": "Company Name",
  "amount": 123.45,
  "btw": true,
  "btwPercent": 21
}

Invoice Text:
${text}
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert invoice reader. You always return a clean JSON object. The issuer is the company that sent the invoice, which is usually found at the top or near payment/bank/VAT details. Exclude any recipient names like ZAFIR. If unsure, output 'UNKNOWN ISSUER'. Do not include markdown or backticks.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    let responseText = completion.choices[0].message.content.trim();
    responseText = cleanJSON(responseText);
    let parsed = JSON.parse(responseText);

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
    console.warn("Initial GPT parsing failed. Attempting fallback retry.");

    try {
      const fallbackPrompt = `Please retry:
Extract JSON in format:
{
  "issuer": "",
  "amount": 0,
  "btw": false,
  "btwPercent": false
}
from:
${text}`;

      const retry = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { role: "user", content: fallbackPrompt },
        ],
        temperature: 0.2,
      });

      let retryText = cleanJSON(retry.choices[0].message.content.trim());
      const retryParsed = JSON.parse(retryText);

      if (retryParsed.issuer && isBlacklistedIssuer(retryParsed.issuer)) {
        retryParsed.issuer = "UNKNOWN ISSUER";
      }

      return retryParsed;
    } catch (retryErr) {
      console.error("❌ Retry also failed:", retryErr);
      throw new Error("Both initial and retry GPT parsing failed.");
    }
  }
}

const analyze = async (text, senderEmail) => {
  console.log("Email sent from -", senderEmail);
  
  return await askGPT(text);
};

export default analyze;
