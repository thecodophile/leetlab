import { db } from "../libs/db.js";

export const getAllListDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const playlists = await db.playlist.findMany({
      where: { userId },
      include: {
        problems: {
          include: {
            problem: true, // Include problem details in the playlist
          },
        }, // Include problems in the playlist
      },
    });

    if (!playlists || playlists.length === 0) {
      return res.status(404).json({
        error: "No playlists found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Playlists fetched successfully",
      playlists,
    });
  } catch (error) {
    console.log("error while fetching all playlists--> ", error);
    res.status(500).json({
      error: "Error while fetching all playlists",
    });
  }
};

export const getPlayListDetails = async (req, res) => {
  const { playlistId } = req.params;
  try {
    const playlist = await db.playlist.findUnique({
      where: { id: playlistId, userId: req.user.id },
      include: {
        problems: {
          include: {
            problem: true, // Include problem details in the playlist
          },
        }, // Include problems in the playlist
      },
    });

    if (!playlist) {
      return res.status(404).json({
        error: "Playlist not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Playlist fetched successfully",
      playlist,
    });
  } catch (error) {
    console.log("error while fetching playlist by id--> ", error);
    res.status(500).json({
      error: "Error while fetching playlist by id",
    });
  }
};

export const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    const newPlaylist = await db.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Playlist created successfully",
      playlist: newPlaylist,
    });
  } catch (error) {
    console.log("create playlist error ->", error);
    res.status(400).json({ success: false, error });
  }
};

export const addProblemToPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: "Invalid or missing problem IDs" });
    }

    const problemsInPlaylist = await db.problemsInPlaylist.createMany({
      data: problemIds.map((problemId) => ({
        playlistId,
        problemId,
      })),
    });

    res.status(200).json({ success: true, problem: problemsInPlaylist });
  } catch (error) {
    console.log("add problem to playlist error ->", error);
    res.status(400).json({ success: false, error });
  }
};

export const deletePlaylist = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const deletedPlaylist = await db.playlist.delete({
      where: { id: playlistId, userId: req.user.id },
    });

    res.status(200).json({
      success: true,
      message: "Playlist deleted successfully",
      playlist: deletedPlaylist,
    });
  } catch (error) {
    console.log("delete playlist error ->", error);
    res.status(400).json({ success: false, error });
  }
};

export const removeProblmeFromPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: "Invalid or missing problem IDs" });
    }

    const removedProblem = await db.problemsInPlaylist.deleteMany({
      where: {
        playlistId,
        problemId: {
          in: problemIds,
        },
      },
    });

    if (removedProblem.count === 0) {
      return res
        .status(404)
        .json({ error: "Problem not found in the playlist" });
    }

    res.status(200).json({
      success: true,
      message: "Problem removed from playlist successfully",
    });
  } catch (error) {
    console.log("remove problem from playlist error ->", error);
    res.status(400).json({ success: false, error });
  }
};
