import { db } from "../libs/db.js";
import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";

export const createProblem = async (req, res) => {
  // get all the data from the req body
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolution,
  } = req.body;

  // going to check the user role once again
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "You are not allowed to create a problem",
    });
  }

  try {
    // loop through each reference solutions for different languages
    for (const [language, solutionCode] of Object.entries(referenceSolution)) {
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return res.status(400).json({
          error: `Language ${language} is not supported`,
        });
      }

      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionsResults = await submitBatch(submissions);

      const tokens = submissionsResults.map((res) => res.token);

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Testcase ${i + 1} failed for language ${language}`,
          });
        }
      }
    }
    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolution,
        userId: req.user.id,
      },
    });

    res.status(200).json({ success: true, problem: newProblem });
  } catch (error) {
    console.log("create problem error ->", error);
    res.status(400).json({ success: false, error });
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const problems = await db.problem.findMany();

    if (!problems) {
      return res.status(404).json({
        error: "No problems found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Problems fetched successfully",
      problems,
    });
  } catch (error) {
    console.log("error while fetching all problems--> ", error);
    res.status(500).json({
      error: "Error while fetching all problems",
    });
  }
};

export const getProblemById = async (req, res) => {
  const { id } = req.params;
  try {
    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return res.status(404).json({
        error: "No problem found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Problem fetched successfully",
      problem,
    });
  } catch (error) {
    console.log("error while fetching problem by id--> ", error);
    res.status(500).json({
      error: "Error while fetching problem by id",
    });
  }
};

export const updateProblem = async (req, res) => {
  const { id } = req.params;
  // get all the data from the req body
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolution,
  } = req.body;

  // going to check the user role once again
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "You are not allowed to update a problem",
    });
  }

  const problem = await db.problem.findUnique({
    where: {
      id,
    },
  });

  if (!problem) {
    return res.status(404).json({
      error: "Problem can not found",
    });
  }

  try {
    // loop through each reference solutions for different languages
    for (const [language, solutionCode] of Object.entries(referenceSolution)) {
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return res.status(400).json({
          error: `Language ${language} is not supported`,
        });
      }

      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionsResults = await submitBatch(submissions);

      const tokens = submissionsResults.map((res) => res.token);

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Testcase ${i + 1} failed for language ${language}`,
          });
        }
      }
    }
    const newProblem = await db.problem.update({
      where: {
        id,
      },
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolution,
        userId: req.user.id,
      },
    });

    res.status(200).json({ success: true, problem: newProblem });
  } catch (error) {
    console.log("update problem error ->", error);
    res.status(400).json({ success: false, error });
  }
};

export const deleteProblem = async (req, res) => {};

export const getAllProblemsSolvedByUser = async (req, res) => {};
