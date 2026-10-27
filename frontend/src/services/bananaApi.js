import axios from "axios";
import { logEvent } from "../utils/logger";

/**
 * ============================================================
 * INTEROPERABILITY: External Banana API
 * * Connects our React frontend to a third-party PHP-based API
 * -===========================================================
 */
const BANANA_URL = "https://marcconrad.com/uob/banana/api.php";

export const fetchQuestion = async (signal) => {
  try {
    logEvent("BANANA_API_REQUEST_STARTED", { url: BANANA_URL });
    //api requested
    const response = await axios.get(BANANA_URL, { signal });
    //json processing for intrperbality
    const data = Array.isArray(response.data)
      ? response.data[0]
      : response.data;
    //api validation
    const solution = Number(data?.solution);
    if (
      typeof data?.question !== "string" ||
      !data.question ||
      !Number.isInteger(solution) ||
      solution < 0 ||
      solution > 9
    ) {
      throw new Error("Banana API returned an invalid puzzle.");
    }
    logEvent("BANANA_API_REQUEST_SUCCESS", data);

    return {
      imageUrl: data.question,
      solution,
    };
  } catch (err) {
    if (axios.isCancel(err) || err.code === "ERR_CANCELED") throw err;
    logEvent("BANANA_API_REQUEST_FAILED", { error: err.message });
    throw new Error("Could not fetch question from Banana API.");
  }
};

/**
 * Optional variant: fetch question with a specific math operator.
 * Demonstrates flexible interoperability via query parameters.
 */
export const fetchQuestionWithOperator = async (operator = "+") => {
  try {
    const url = `${BANANA_URL}?operator=${encodeURIComponent(operator)}`;
    logEvent("BANANA_API_REQUEST_STARTED", { url });
    const response = await axios.get(url);
    const data = Array.isArray(response.data)
      ? response.data[0]
      : response.data;
    const solution = Number(data?.solution);
    if (
      typeof data?.question !== "string" ||
      !data.question ||
      !Number.isInteger(solution) ||
      solution < 0 ||
      solution > 9
    ) {
      throw new Error("Banana API returned an invalid puzzle.");
    }
    logEvent("BANANA_API_REQUEST_SUCCESS", data);

    return {
      imageUrl: data.question,
      solution,
    };
  } catch (err) {
    logEvent("BANANA_API_REQUEST_FAILED", { error: err.message });
    throw new Error("Could not fetch question from Banana API.");
  }
};
