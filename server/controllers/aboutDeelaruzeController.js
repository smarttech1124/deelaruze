const AboutDeelaruze = require('../models/AboutDeelaruze');


// @desc    Get About Deelaruze
// @route   GET /api/about
// @access  Public
exports.getAbout = async (req, res) => {
  try {
    const about = await AboutDeelaruze.findOne();

    res.json({
      success: true,
      data: about,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching about deelaruze',
      error: error.message,
    });
  }
};


// @desc    Save (Create or Update) About
// @route   POST /api/about
// @access  Private/Admin
exports.saveAbout = async (req, res) => {
  try {
    let about = await AboutDeelaruze.findOne();

    if (about) {
      // ===============================
      // UPDATE EXISTING
      // ===============================
      about = await AboutDeelaruze.findByIdAndUpdate(
        about._id,
        { ...req.body },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: "About updated successfully",
        data: about,
      });
    }

    // ===============================
    // CREATE NEW
    // ===============================
    about = await AboutDeelaruze.create({
      ...req.body,
    });

    res.status(201).json({
      success: true,
      message: "About created successfully",
      data: about,
    });

  } catch (error) {
    console.error("SAVE ABOUT ERROR:", error);

    res.status(400).json({
      success: false,
      message: "Error saving about",
      error: error.message,
    });
  }
};
