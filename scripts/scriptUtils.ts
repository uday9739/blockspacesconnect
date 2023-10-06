import { accessSync, PathLike } from "fs";
import path from "path";
import * as readline from "readline";
import * as url from 'url';
import { promisify } from "util";

export type PromptOptions = {
  defaultValue?: any,
  promptHeader?: string,
  inputRegex?: RegExp
}

type FnQuestion = (prompt: string) => Promise<string>

/**
 * Prompts the user to enter a value and captures a single line of input
 * @param {string} message the prompt to show the user
 * @param {Object} options
 * @param {any} [options.defaultValue] a default value to use if nothing is entered by the user
 * @param {string} [options.promptHeader="> "] the prompt "header" text to use before the area where the user input will be shown
 * @param {RegExp} [options.inputRegex] if given, user input must match this regex
 * @returns {Promise<string>} the value entered by the user
 */
export async function prompt(message: string,
  { defaultValue, promptHeader, inputRegex }: PromptOptions = { promptHeader: "> " }
): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  promptHeader = promptHeader || "> ";
  const question: FnQuestion = promisify(rl.question).bind(rl) as unknown as FnQuestion;

  try {
    let userInput = await question(buildPromptText(message, defaultValue, promptHeader)) || defaultValue || "";

    if (inputRegex) {
      while (!inputRegex.test(userInput)) {
        userInput = await question(promptHeader);
      }
    }

    return userInput;
  } finally {
    rl.close();
  }
}

/**
 * Prompt the user for a yes/no choice
 *
 * @param message the prompt message
 * @returns true if the user chooses "yes", false for "no"
 */
export async function promptBoolean(message: string): Promise<boolean> {
  const userInput = await prompt(message, {
    promptHeader: "[(y)es / (n)o]: ",
    inputRegex: /[yn]/i
  })

  return userInput.toLowerCase() === "y";
}

function buildPromptText(message: string, defaultValue: any, promptHeader: string): string {
  let promptText = `\n${message}`;

  if (defaultValue !== null && defaultValue !== undefined) {
    promptText += ` (default: ${defaultValue})`;
  }

  return `${promptText}\n${promptHeader}`;
}

export function fileExistsSync(filePath: PathLike): boolean {
  try {
    accessSync(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Returns the full directory path (__dirname) and full file path (__filename) for an ES6 module URL
 * @param {string} moduleFileUrl the file URL of a module, typically from import.meta.url
 * @returns the file and directory paths for the given module URL
 */
export function getModulePaths(moduleFileUrl: string | url.URL) {
  if (!moduleFileUrl) {
    throw new Error("moduleFileUrl is required");
  }

  const __filename = url.fileURLToPath(moduleFileUrl);
  const __dirname = path.dirname(__filename);

  return { __filename, __dirname };

}