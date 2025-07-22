import { db } from "../libs/db.js";

export const getAllSubmission = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all submissions for the user from the database
    const submissions = await db.submission.findMany({
      where: { userId },
    });

    if (!submissions) {
      return res.status(404).json({ message: "No submissions found" });
    }

    res.status(200).json({
      success: true,
      message: "All submissions fetched successfully",
      submissions,
    });
  } catch (error) {
    console.error("Error fetching all submissions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSubmissionsForProblem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { problemId } = req.params;

    // Fetch submissions for the specific problem from the database
    const submissions = await db.submission.findMany({
      where: {
        userId: userId,
        problemId: problemId,
      },
    });

    if (!submissions) {
      return res
        .status(404)
        .json({ message: "No submissions found for this problem" });
    }

    res.status(200).json({
      success: true,
      message: "Submissions for problem fetched successfully",
      submissions,
    });
  } catch (error) {
    console.error("Error fetching submissions for problem:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllTheSubmissionsForProblem = async (req, res) => {
  try {
    const { problemId } = req.params;

    // Fetch all submissions count for the specific problem from the database
    const submissionsCount = await db.submission.count({
      where: {
        problemId: problemId,
      },
    });

    res.status(200).json({
      success: true,
      message: "All submissions count for problem fetched successfully",
      count: submissionsCount,
    });
  } catch (error) {
    console.error("Error fetching all submissions for problem:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
