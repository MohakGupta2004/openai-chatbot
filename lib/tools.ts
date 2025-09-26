import { tool } from '@openai/agents';
import puppeteer from 'puppeteer';
import { z } from 'zod';

export const getWeatherTool = tool({
    name: 'get_weather',
    description: 'Get the weather for a given city',
    parameters: z.object({ city: z.string() }),
    async execute({ city }) {
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
        );
        const data = await response.json()
        return data;
    },
});

export const addTwoNumbers = tool({
    name: 'add_two_numbers',
    description: 'This is for adding 2 number',
    parameters: z.object({
        a: z.number(),
        b: z.number()
    }),
    execute({ a, b }) {
        console.log("Control came here")
        return a + b;
    }
})

export const webHandler = tool({
    name: "website_surfing",
    description: "Do external website surfing and changes",
    parameters: z.object({
        link: z.string(),
        userInput: z.string()
    }),
    async execute({ link,userInput }) {
        console.log("Control reached")

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(link);
        const inputElements = await page.$$('input');
        for (const input of inputElements) {
            const id = await input.evaluate(el => el.getAttribute('id'));
            await page.type(`#${id}`, userInput);
            await page.click('#submitButton');
        }
        const firstPtag = await page.$('p');
        let textContent= await page.evaluate(el => el?.textContent, firstPtag);
        console.log(textContent)
        return `This is the output of the p tag: "${textContent}"`;
    }

})