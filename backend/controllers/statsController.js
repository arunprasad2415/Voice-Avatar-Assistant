const Lead = require("../models/Lead");
const FAQ = require("../models/FAQ");
const VoiceResponse = require("../models/VoiceResponse");
const Log = require("../models/Log");
const { findBestMatch } = require("../utils/text");

const CONVERSATION_TYPES = ["voice", "faq", "ai", "fallback"];
const DAYS = 14;

const isValidTimeZone = (timeZone) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
};

const getStats = async (req, res, next) => {
  try {
    const timezone = isValidTimeZone(req.query.tz) ? req.query.tz : "UTC";
    const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);

    const [leads, newLeads, voiceResponses, faqs, bySource, daily, gaps] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: "new" }),
      VoiceResponse.find({ isActive: true }).lean(),
      FAQ.find({ isActive: true }).lean(),
      Log.aggregate([
        { $match: { type: { $in: CONVERSATION_TYPES } } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      Log.aggregate([
        { $match: { type: { $in: CONVERSATION_TYPES }, createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone } },
            count: { $sum: 1 },
          },
        },
      ]),
      // Questions your own content didn't answer (older logs stored fallbacks as unmatched "voice").
      Log.aggregate([
        { $match: { $or: [{ type: { $in: ["ai", "fallback"] } }, { type: "voice", matched: false }] } },
        { $sort: { createdAt: 1 } },
        {
          $group: {
            _id: { $toLower: "$userInput" },
            question: { $last: "$userInput" },
            source: { $last: "$type" },
            count: { $sum: 1 },
            lastAsked: { $max: "$createdAt" },
          },
        },
        { $sort: { count: -1, lastAsked: -1 } },
        { $limit: 50 },
      ]),
    ]);

    // Drop gaps that content added since then would now answer.
    const openGaps = gaps
      .filter(
        (gap) =>
          !findBestMatch(gap.question, voiceResponses, (v) => [v.trigger]) &&
          !findBestMatch(gap.question, faqs, (f) => [f.question, ...f.keywords])
      )
      .slice(0, 10)
      .map(({ question, source, count, lastAsked }) => ({ question, source, count, lastAsked }));

    const sources = Object.fromEntries(CONVERSATION_TYPES.map((type) => [type, 0]));
    bySource.forEach(({ _id, count }) => (sources[_id] = count));

    return res.status(200).json({
      success: true,
      data: {
        totals: {
          conversations: Object.values(sources).reduce((sum, n) => sum + n, 0),
          leads,
          newLeads,
          faqs: faqs.length,
          voiceResponses: voiceResponses.length,
        },
        sources,
        daily: Object.fromEntries(daily.map(({ _id, count }) => [_id, count])),
        gaps: openGaps,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };
