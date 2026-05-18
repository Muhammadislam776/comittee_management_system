const Committee = require('../models/Committee');
const Meeting = require('../models/Meeting');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get consolidated system analytics metrics
// @route   GET /api/analytics
// @access  Private
exports.getAnalytics = asyncHandler(async (req, res, next) => {
  // 1. Fetch All Raw Data
  const committees = await Committee.find();
  const meetings = await Meeting.find().populate('committee', 'name');
  const tasks = await Task.find().populate('meeting');

  // --- 2. Calculate Task Stats ---
  const totalTasks = tasks.length;
  const statusStats = { Pending: 0, 'In Progress': 0, Completed: 0 };
  const priorityStats = { Low: 0, Medium: 0, High: 0 };

  tasks.forEach(t => {
    if (statusStats[t.status] !== undefined) statusStats[t.status]++;
    if (priorityStats[t.priority] !== undefined) priorityStats[t.priority]++;
  });

  const taskCompletionRate = totalTasks > 0 
    ? Math.round((statusStats.Completed / totalTasks) * 100) 
    : 0;

  // --- 3. Calculate Attendance Stats ---
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalExcused = 0;
  let totalAttendanceMarked = 0;

  const attendanceTrends = meetings
    .filter(m => m.attendance && m.attendance.length > 0)
    .map(m => {
      let present = 0;
      let absent = 0;
      let excused = 0;

      m.attendance.forEach(a => {
        if (a.status === 'Present') { present++; totalPresent++; }
        else if (a.status === 'Absent') { absent++; totalAbsent++; }
        else if (a.status === 'Excused') { excused++; totalExcused++; }
        totalAttendanceMarked++;
      });

      const total = present + absent + excused;
      const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        meetingId: m._id,
        meetingTitle: m.title,
        date: m.date,
        attendanceRate
      };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const overallAttendanceRate = totalAttendanceMarked > 0
    ? Math.round((totalPresent / totalAttendanceMarked) * 100)
    : 0;

  // --- 4. Calculate Committee Stats ---
  const committeePerformances = await Promise.all(committees.map(async (c) => {
    const committeeMeetings = meetings.filter(m => m.committee && m.committee._id.toString() === c._id.toString());
    const meetingIds = committeeMeetings.map(m => m._id.toString());

    // Resolve tasks belonging to these meetings
    const committeeTasks = tasks.filter(t => t.meeting && meetingIds.includes(t.meeting._id.toString()));
    const completedTasksCount = committeeTasks.filter(t => t.status === 'Completed').length;
    const taskRate = committeeTasks.length > 0 
      ? Math.round((completedTasksCount / committeeTasks.length) * 100) 
      : 0;

    // Resolve attendance average
    let totalPresentM = 0;
    let totalMarkedM = 0;
    
    committeeMeetings.forEach(m => {
      if (m.attendance && m.attendance.length > 0) {
        m.attendance.forEach(a => {
          if (a.status === 'Present') totalPresentM++;
          totalMarkedM++;
        });
      }
    });

    const averageAttendance = totalMarkedM > 0 
      ? Math.round((totalPresentM / totalMarkedM) * 100) 
      : 0;

    return {
      committeeId: c._id,
      committeeName: c.name,
      membersCount: c.members ? c.members.length : 0,
      meetingsCount: committeeMeetings.length,
      tasksCount: committeeTasks.length,
      taskCompletionRate: taskRate,
      averageAttendance
    };
  }));

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalCommittees: committees.length,
        totalMeetings: meetings.length,
        totalTasks,
        taskCompletionRate,
        overallAttendanceRate
      },
      tasks: {
        total: totalTasks,
        statusStats,
        priorityStats
      },
      attendance: {
        breakdown: {
          present: totalPresent,
          absent: totalAbsent,
          excused: totalExcused
        },
        trends: attendanceTrends
      },
      committees: committeePerformances
    }
  });
});
