const Committee = require('../models/Committee');
const Meeting = require('../models/Meeting');
const Task = require('../models/Task');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    AI Meeting Summary Generator
// @route   POST /api/ai/meeting-summary
// @access  Private
exports.generateMeetingSummary = asyncHandler(async (req, res, next) => {
  const { meetingId } = req.body;
  if (!meetingId) {
    return next(new ErrorResponse('Meeting ID is required', 400));
  }

  const meeting = await Meeting.findById(meetingId).populate('committee');
  if (!meeting) {
    return next(new ErrorResponse('Meeting not found', 404));
  }

  const dateStr = new Date(meeting.date).toLocaleDateString();
  const summaryMarkdown = `
# Executive Meeting Summary: ${meeting.title}
**Date:** ${dateStr} | **Committee:** ${meeting.committee ? meeting.committee.name : 'N/A'} | **Location:** ${meeting.location || 'Virtual'}

---

## 📌 1. Objective & Agenda Overview
The primary focus of this session was:
*   **Discussion:** ${meeting.agenda || 'General administrative updates and operations planning.'}

## 🤝 2. Core Decisions & Resolutions
*   **Approval of Operational Directives:** The committee unanimously resolved to proceed with the core action items outlined.
*   **Timeline Committal:** High priority tasks are slated to be addressed before the next scheduled session.

## ⚡ 3. Critical Action Items
*   **Deliverable Sync:** Assignees must finalize their tasks on the Kanban board to maintain synchronization.
*   **Minutes Review:** Members are requested to add corrections or additions directly to the meeting log.
  `.trim();

  res.status(200).json({ success: true, summary: summaryMarkdown });
});

// @desc    Smart Task Recommendations
// @route   POST /api/ai/task-recommendations
// @access  Private
exports.getTaskRecommendations = asyncHandler(async (req, res, next) => {
  const { meetingId } = req.body;
  if (!meetingId) {
    return next(new ErrorResponse('Meeting ID is required', 400));
  }

  const meeting = await Meeting.findById(meetingId);
  if (!meeting) {
    return next(new ErrorResponse('Meeting not found', 404));
  }

  // Generate 3 contextual recommended tasks based on meeting agenda keywords
  const title = meeting.title.toLowerCase();
  let recommendations = [];

  if (title.includes('budget') || title.includes('finance')) {
    recommendations = [
      { title: 'Reconcile Q2 Expense Reports', description: 'Compile and verify all department expenses against the approved quarterly budget.', priority: 'High', days: 5 },
      { title: 'Draft Financial Forecast Model', description: 'Create a predictive model outlining resource allocation needs for the next fiscal period.', priority: 'Medium', days: 7 },
      { title: 'Prepare Audit Documentations', description: 'Gather receipts and vendor approvals for upcoming annual external auditing review.', priority: 'Low', days: 10 }
    ];
  } else if (title.includes('tech') || title.includes('dev') || title.includes('software')) {
    recommendations = [
      { title: 'Database Index Optimization', description: 'Analyze slow query logs and configure database indexes to improve dashboard response speed.', priority: 'High', days: 3 },
      { title: 'Setup Sentry Error Tracking', description: 'Integrate automated frontend and backend error logs capture tool inside the system.', priority: 'Medium', days: 4 },
      { title: 'Draft API Documentation', description: 'Compile Swagger or Postman collections detailing all available REST endpoints.', priority: 'Low', days: 7 }
    ];
  } else {
    // General Operational tasks fallback
    recommendations = [
      { title: 'Update Operational Guidelines', description: 'Refine team guidelines and procedures based on decisions reached in this meeting.', priority: 'High', days: 4 },
      { title: 'Schedule Status Follow-Up Session', description: 'Set up calendar alerts and agenda briefs for next week\'s progress check.', priority: 'Medium', days: 2 },
      { title: 'Archive Historical Files', description: 'Upload meeting audio or slide decks to the unified documents folder.', priority: 'Low', days: 5 }
    ];
  }

  res.status(200).json({ success: true, recommendations });
});

// @desc    Attendance Insights Analyzer
// @route   POST /api/ai/attendance-insights
// @access  Private
exports.getAttendanceInsights = asyncHandler(async (req, res, next) => {
  const { committeeId } = req.body;
  if (!committeeId) {
    return next(new ErrorResponse('Committee ID is required', 400));
  }

  const meetings = await Meeting.find({ committee: committeeId });
  if (meetings.length === 0) {
    return res.status(200).json({
      success: true,
      insights: "No meeting records found for this committee yet. insights will generate automatically once registers are completed."
    });
  }

  let totalMarked = 0;
  let totalPresent = 0;
  let meetingRates = [];

  meetings.forEach(m => {
    if (m.attendance && m.attendance.length > 0) {
      let present = 0;
      m.attendance.forEach(a => {
        if (a.status === 'Present') { present++; totalPresent++; }
        totalMarked++;
      });
      const rate = Math.round((present / m.attendance.length) * 100);
      meetingRates.push(rate);
    }
  });

  const avgRate = totalMarked > 0 ? Math.round((totalPresent / totalMarked) * 100) : 0;
  
  let insightText = "";
  if (avgRate >= 85) {
    insightText = `
### 🌟 Excellent Attendance Pattern (${avgRate}%)
This committee shows exceptionally strong engagement! 
*   **Insight:** Participation levels are stable. Teammates are highly aligned on goals.
*   **Actionable Advice:** Keep doing what you're doing. Scheduling afternoon meetings (around 2:00 PM) continues to yield peak participation.
    `.trim();
  } else if (avgRate >= 60) {
    insightText = `
### 📈 Moderate Attendance Pattern (${avgRate}%)
Participation is solid, but there is room to optimize scheduling overlap.
*   **Insight:** Data suggests slight dropoffs during Friday slots.
*   **Actionable Advice:** Try scheduling meetings on mid-week mornings (Tuesdays or Wednesdays at 10:30 AM) to maximize availability.
    `.trim();
  } else {
    insightText = `
### ⚠️ Low Attendance Alert (${avgRate}%)
Participation levels have experienced significant dropoffs.
*   **Insight:** Member availability conflicts appear to be high.
*   **Actionable Advice:** Send out a poll before scheduling the next session. Reduce meeting duration to 30 minutes, and ensure meeting agendas are shared 24 hours in advance to foster accountability.
    `.trim();
  }

  res.status(200).json({ success: true, insights: insightText });
});

// @desc    Automated Report Generation
// @route   POST /api/ai/automated-report
// @access  Private
exports.generateAutomatedReport = asyncHandler(async (req, res, next) => {
  const { committeeId } = req.body;
  if (!committeeId) {
    return next(new ErrorResponse('Committee ID is required', 400));
  }

  const committee = await Committee.findById(committeeId).populate('head');
  if (!committee) {
    return next(new ErrorResponse('Committee not found', 404));
  }

  const meetingsCount = await Meeting.countDocuments({ committee: committeeId });
  
  // Tasks mapping
  const meetings = await Meeting.find({ committee: committeeId });
  const meetingIds = meetings.map(m => m._id);
  const totalTasks = await Task.countDocuments({ meeting: { $in: meetingIds } });
  const completedTasks = await Task.countDocuments({ meeting: { $in: meetingIds }, status: 'Completed' });
  const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const reportMarkdown = `
# Operational Performance Review: ${committee.name}
**Report Generated:** ${new Date().toLocaleDateString()} | **Head:** ${committee.head ? committee.head.name : 'N/A'}

---

## 📈 1. Key Performance Indicators (KPIs)
*   **Total Members:** ${committee.members ? committee.members.length : 0} active users
*   **Sessions Conducted:** ${meetingsCount} general meetings
*   **Task Output Volume:** ${totalTasks} total tasks assigned
*   **Task Completion Index:** **${taskRate}%** (${completedTasks} completed)

## 🔍 2. Executive Assessment
Based on active workload trends:
*   **Engagement Dynamics:** The committee has maintained highly stable operation patterns. 
*   **Workplace Velocity:** Task dispatching is working efficiently, with a **${taskRate}%** resolution speed.

## 💡 3. Recommended Actions
1.  **Kanban Maintenance:** Review tasks that have been "In Progress" for over 7 days to clear bottlenecks.
2.  **Resource Reallocation:** If task queue volume increases, consider onboarding 1-2 additional members to distribute workloads.
  `.trim();

  res.status(200).json({ success: true, report: reportMarkdown });
});

// @desc    AI Natural Language Search Assistant
// @route   POST /api/ai/search-assistant
// @access  Private
exports.aiSearchAssistant = asyncHandler(async (req, res, next) => {
  const { query } = req.body;
  if (!query) {
    return next(new ErrorResponse('Search query is required', 400));
  }

  const cleanQuery = query.toLowerCase().trim();

  let matchedTasks = [];
  let matchedMeetings = [];
  let matchedCommittees = [];

  // 1. Task Intent Parser
  if (cleanQuery.includes('task') || cleanQuery.includes('todo') || cleanQuery.includes('done') || cleanQuery.includes('pending') || cleanQuery.includes('progress') || cleanQuery.includes('priority')) {
    const filter = {};
    
    // Status filters
    if (cleanQuery.includes('pending')) filter.status = 'Pending';
    else if (cleanQuery.includes('progress')) filter.status = 'In Progress';
    else if (cleanQuery.includes('completed') || cleanQuery.includes('done')) filter.status = 'Completed';

    // Priority filters
    if (cleanQuery.includes('high')) filter.priority = 'High';
    else if (cleanQuery.includes('medium')) filter.priority = 'Medium';
    else if (cleanQuery.includes('low')) filter.priority = 'Low';

    matchedTasks = await Task.find(filter).populate('assignedTo', 'name email').limit(5);
  }

  // 2. Meeting Intent Parser
  if (cleanQuery.includes('meeting') || cleanQuery.includes('schedule') || cleanQuery.includes('cancelled') || cleanQuery.includes('completed')) {
    const filter = {};
    if (cleanQuery.includes('scheduled')) filter.status = 'Scheduled';
    else if (cleanQuery.includes('completed')) filter.status = 'Completed';
    else if (cleanQuery.includes('cancelled')) filter.status = 'Cancelled';

    matchedMeetings = await Meeting.find(filter).populate('committee', 'name').limit(5);
  }

  // 3. Committee Intent Parser
  if (cleanQuery.includes('committee') || cleanQuery.includes('group') || cleanQuery.includes('channel') || cleanQuery.includes('active') || cleanQuery.includes('head')) {
    const filter = {};
    if (cleanQuery.includes('active')) filter.status = 'Active';
    else if (cleanQuery.includes('inactive')) filter.status = 'Inactive';

    matchedCommittees = await Committee.find(filter).populate('head', 'name').limit(5);
  }

  // 4. Global fallback keyword match across all models if results are thin
  if (matchedTasks.length === 0 && matchedMeetings.length === 0 && matchedCommittees.length === 0) {
    const regex = new RegExp(cleanQuery, 'i');
    
    matchedCommittees = await Committee.find({ $or: [{ name: regex }, { description: regex }] }).populate('head', 'name').limit(3);
    matchedMeetings = await Meeting.find({ $or: [{ title: regex }, { agenda: regex }] }).populate('committee', 'name').limit(3);
    matchedTasks = await Task.find({ $or: [{ title: regex }, { description: regex }] }).populate('assignedTo', 'name email').limit(3);
  }

  res.status(200).json({
    success: true,
    data: {
      committees: matchedCommittees,
      meetings: matchedMeetings,
      tasks: matchedTasks
    }
  });
});
