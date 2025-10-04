module.exports = (req, res, next) => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  if (day >= 1 && day <= 5 && hour >= 9 && hour < 17) {
    next();
  } else {
    res.status(403).json({
      message:
        "Submissions are only allowed on weekdays between 9 AM and 5 PM.",
    });
  }
};
