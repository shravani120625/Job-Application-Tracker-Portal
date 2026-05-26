import JobApplication from '../models/JobApplication.js';

// @desc    Get dashboard analytics and reports
// @route   GET /api/analytics/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all applications for user
    const applications = await JobApplication.find({ user: userId });

    // 1. Funnel data aggregation (count by stage)
    const stages = ['Saved', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected'];
    const funnel = {
      Saved: 0,
      Applied: 0,
      OA: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };

    applications.forEach(app => {
      if (funnel[app.stage] !== undefined) {
        funnel[app.stage]++;
      }
    });

    // 2. Calculate Response Rate
    // Active applications are anything that is past "Saved"
    // Responses are applications that reached OA, Interview, Offer, or Rejected (i.e. did not ghost)
    const totalActive = applications.filter(app => app.stage !== 'Saved').length;
    const totalResponded = applications.filter(app => 
      ['OA', 'Interview', 'Offer', 'Rejected'].includes(app.stage)
    ).length;

    const responseRate = totalActive > 0 
      ? Math.round((totalResponded / totalActive) * 100) 
      : 0;

    // 3. Monthly applications volume (for trend charts)
    // Group by month name (last 6 months)
    const monthlyStats = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = months[d.getMonth()] + ' ' + d.getFullYear().toString().slice(-2);
      monthlyStats[monthName] = 0;
    }

    applications.forEach(app => {
      const appDate = new Date(app.createdAt);
      const monthName = months[appDate.getMonth()] + ' ' + appDate.getFullYear().toString().slice(-2);
      if (monthlyStats[monthName] !== undefined) {
        monthlyStats[monthName]++;
      }
    });

    // Format monthlyStats for Recharts
    const monthlyData = Object.keys(monthlyStats).map(key => ({
      month: key,
      applications: monthlyStats[key],
    }));

    // 4. Upcoming tasks (Deadlines) in the next 14 days
    const upcomingTasks = [];
    const today = new Date();
    const fourteenDaysLater = new Date();
    fourteenDaysLater.setDate(today.getDate() + 14);

    applications.forEach(app => {
      app.tasks.forEach(task => {
        const dueDate = new Date(task.dueAt);
        if (!task.done && dueDate >= today && dueDate <= fourteenDaysLater) {
          upcomingTasks.push({
            taskId: task._id,
            taskTitle: task.title,
            dueAt: task.dueAt,
            applicationId: app._id,
            company: app.company,
            roleTitle: app.roleTitle,
            stage: app.stage,
          });
        }
      });
    });

    // Sort upcoming tasks by due date (nearest first)
    upcomingTasks.sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalApplications: applications.length,
          activeApplications: totalActive,
          offers: funnel['Offer'],
          interviews: funnel['Interview'],
          responseRate: `${responseRate}%`,
        },
        funnel,
        monthlyData,
        upcomingTasks: upcomingTasks.slice(0, 5), // Limit to top 5
      },
    });
  } catch (error) {
    console.error(`[Analytics Stats Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error computing dashboard metrics' });
  }
};
