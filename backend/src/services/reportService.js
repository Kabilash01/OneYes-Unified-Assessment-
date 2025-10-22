const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const sendEmail = require('../utils/sendEmail');
const ScheduledReport = require('../models/ScheduledReport');
const analyticsService = require('./analyticsService');

/**
 * Report Service
 * Generates PDF and Excel reports, handles scheduled report delivery
 */

class ReportService {

  /**
   * Generate PDF report
   * @param {String} reportType - 'student', 'instructor', 'admin'
   * @param {Object} data - Report data
   * @param {Object} options - Additional options (title, period, etc.)
   * @returns {Buffer} PDF buffer
   */
  async generatePDF(reportType, data, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Header
        doc
          .fontSize(20)
          .text(options.title || 'Analytics Report', { align: 'center' })
          .moveDown();

        doc
          .fontSize(12)
          .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
          .text(`Period: ${options.period || 'All Time'}`, { align: 'center' })
          .moveDown(2);

        // Content based on report type
        switch (reportType) {
          case 'student':
            this._addStudentReportContent(doc, data);
            break;
          case 'instructor':
            this._addInstructorReportContent(doc, data);
            break;
          case 'admin':
            this._addAdminReportContent(doc, data);
            break;
          default:
            doc.text('Unknown report type');
        }

        // Footer
        doc
          .moveDown(2)
          .fontSize(10)
          .text('Unified Assessment Platform', { align: 'center' })
          .text('© 2025 All Rights Reserved', { align: 'center' });

        doc.end();
      } catch (error) {
        reject(new Error(`Error generating PDF: ${error.message}`));
      }
    });
  }

  /**
   * Add student report content to PDF
   * @private
   */
  _addStudentReportContent(doc, data) {
    doc.fontSize(16).text('Student Performance Report', { underline: true }).moveDown();

    // Overall Statistics
    if (data.overall) {
      doc.fontSize(14).text('Overall Statistics', { underline: true }).moveDown(0.5);
      doc.fontSize(12);
      doc.text(`Total Submissions: ${data.overall.totalSubmissions}`);
      doc.text(`Average Score: ${data.overall.avgScore || 0}`);
      doc.text(`Average Percentage: ${data.overall.avgPercentage || 0}%`);
      doc.text(`Highest Score: ${data.overall.maxScore || 0}`);
      doc.text(`Lowest Score: ${data.overall.minScore || 0}`);
      doc.moveDown();
    }

    // Subject Breakdown
    if (data.subjects && data.subjects.length > 0) {
      doc.fontSize(14).text('Subject Breakdown', { underline: true }).moveDown(0.5);
      doc.fontSize(12);
      
      data.subjects.forEach(subject => {
        doc.text(`${subject.subject}: ${subject.avgScore} (${subject.count} assessments)`);
      });
      doc.moveDown();
    }

    // Strengths and Weaknesses
    if (data.strengths) {
      doc.fontSize(14).text('Strengths', { underline: true }).moveDown(0.5);
      doc.fontSize(12);
      
      if (data.strengths.strengths && data.strengths.strengths.length > 0) {
        data.strengths.strengths.forEach(s => {
          doc.text(`✓ ${s.subject}: ${s.avgScore}`);
        });
      } else {
        doc.text('No data available');
      }
      doc.moveDown();

      doc.fontSize(14).text('Areas for Improvement', { underline: true }).moveDown(0.5);
      doc.fontSize(12);
      
      if (data.strengths.weaknesses && data.strengths.weaknesses.length > 0) {
        data.strengths.weaknesses.forEach(w => {
          doc.text(`• ${w.subject}: ${w.avgScore}`);
        });
      } else {
        doc.text('No data available');
      }
      doc.moveDown();
    }

    // Recent Performance Trend
    if (data.trend && data.trend.length > 0) {
      doc.fontSize(14).text('Recent Performance', { underline: true }).moveDown(0.5);
      doc.fontSize(12);
      
      data.trend.slice(-5).forEach(t => {
        const date = new Date(t.date).toLocaleDateString();
        doc.text(`${date}: ${t.score}/${t.totalMarks} - ${t.title}`);
      });
    }
  }

  /**
   * Add instructor report content to PDF
   * @private
   */
  _addInstructorReportContent(doc, data) {
    doc.fontSize(16).text('Instructor Analytics Report', { underline: true }).moveDown();

    // Overview
    if (data.overview) {
      doc.fontSize(14).text('Overview', { underline: true }).moveDown(0.5);
      doc.fontSize(12);
      
      if (data.overview.assessments) {
        doc.text('Assessments:');
        doc.text(`  Total: ${data.overview.assessments.total}`);
        doc.text(`  Published: ${data.overview.assessments.published}`);
        doc.text(`  Draft: ${data.overview.assessments.draft}`);
        doc.text(`  Archived: ${data.overview.assessments.archived}`);
        doc.moveDown(0.5);
      }

      if (data.overview.submissions) {
        doc.text('Submissions:');
        doc.text(`  Total: ${data.overview.submissions.total}`);
        doc.text(`  Evaluated: ${data.overview.submissions.evaluated}`);
        doc.text(`  Pending: ${data.overview.submissions.pending}`);
        doc.moveDown(0.5);
      }

      if (data.overview.scores) {
        doc.text('Score Statistics:');
        doc.text(`  Average: ${data.overview.scores.avgScore || 0}`);
        doc.text(`  Highest: ${data.overview.scores.maxScore || 0}`);
        doc.text(`  Lowest: ${data.overview.scores.minScore || 0}`);
        doc.moveDown();
      }
    }

    // Class Performance
    if (data.classPerformance) {
      doc.fontSize(14).text('Class Performance', { underline: true }).moveDown(0.5);
      doc.fontSize(12);
      doc.text(`Total Students: ${data.classPerformance.totalStudents || 0}`);
      doc.text(`Average Percentage: ${data.classPerformance.avgPercentage?.toFixed(2) || 0}%`);
      doc.moveDown();

      if (data.classPerformance.distribution) {
        doc.text('Grade Distribution:');
        doc.text(`  Excellent (90-100%): ${data.classPerformance.distribution.excellent || 0}`);
        doc.text(`  Good (75-89%): ${data.classPerformance.distribution.good || 0}`);
        doc.text(`  Average (60-74%): ${data.classPerformance.distribution.average || 0}`);
        doc.text(`  Below Average (<60%): ${data.classPerformance.distribution.belowAverage || 0}`);
      }
    }
  }

  /**
   * Add admin report content to PDF
   * @private
   */
  _addAdminReportContent(doc, data) {
    doc.fontSize(16).text('Platform Analytics Report', { underline: true }).moveDown();

    // Platform Metrics
    if (data.metrics) {
      doc.fontSize(14).text('Platform Metrics', { underline: true }).moveDown(0.5);
      doc.fontSize(12);

      if (data.metrics.users) {
        doc.text('Users:');
        doc.text(`  Total: ${data.metrics.users.total}`);
        doc.text(`  Students: ${data.metrics.users.students}`);
        doc.text(`  Instructors: ${data.metrics.users.instructors}`);
        doc.text(`  Admins: ${data.metrics.users.admins}`);
        doc.moveDown(0.5);
      }

      if (data.metrics.assessments) {
        doc.text('Assessments:');
        doc.text(`  Total: ${data.metrics.assessments.total}`);
        doc.text(`  Published: ${data.metrics.assessments.published}`);
        doc.text(`  Draft: ${data.metrics.assessments.draft}`);
        doc.moveDown(0.5);
      }

      if (data.metrics.submissions) {
        doc.text('Submissions:');
        doc.text(`  Total: ${data.metrics.submissions.total}`);
        doc.text(`  Evaluated: ${data.metrics.submissions.evaluated}`);
        doc.text(`  Pending: ${data.metrics.submissions.pending}`);
        doc.moveDown();
      }
    }

    // User Engagement
    if (data.engagement) {
      doc.fontSize(14).text('User Engagement', { underline: true }).moveDown(0.5);
      doc.fontSize(12);
      
      if (data.engagement.activeUsers) {
        doc.text(`Active Students: ${data.engagement.activeUsers.students}`);
        doc.text(`Active Instructors: ${data.engagement.activeUsers.instructors}`);
        doc.text(`Total Active: ${data.engagement.activeUsers.total}`);
      }
    }
  }

  /**
   * Generate Excel report
   * @param {String} reportType - 'student', 'instructor', 'admin'
   * @param {Object} data - Report data
   * @param {Object} options - Additional options
   * @returns {Buffer} Excel buffer
   */
  async generateExcel(reportType, data, options = {}) {
    try {
      const workbook = new ExcelJS.Workbook();
      
      workbook.creator = 'Unified Assessment Platform';
      workbook.created = new Date();

      switch (reportType) {
        case 'student':
          this._addStudentExcelSheets(workbook, data);
          break;
        case 'instructor':
          this._addInstructorExcelSheets(workbook, data);
          break;
        case 'admin':
          this._addAdminExcelSheets(workbook, data);
          break;
        default:
          throw new Error('Unknown report type');
      }

      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    } catch (error) {
      throw new Error(`Error generating Excel: ${error.message}`);
    }
  }

  /**
   * Add student sheets to Excel workbook
   * @private
   */
  _addStudentExcelSheets(workbook, data) {
    // Overall Statistics Sheet
    const overallSheet = workbook.addWorksheet('Overall Statistics');
    
    overallSheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 }
    ];

    if (data.overall) {
      overallSheet.addRows([
        { metric: 'Total Submissions', value: data.overall.totalSubmissions || 0 },
        { metric: 'Average Score', value: data.overall.avgScore || 0 },
        { metric: 'Average Percentage', value: `${data.overall.avgPercentage || 0}%` },
        { metric: 'Highest Score', value: data.overall.maxScore || 0 },
        { metric: 'Lowest Score', value: data.overall.minScore || 0 }
      ]);
    }

    // Subject Breakdown Sheet
    if (data.subjects && data.subjects.length > 0) {
      const subjectSheet = workbook.addWorksheet('Subject Breakdown');
      
      subjectSheet.columns = [
        { header: 'Subject', key: 'subject', width: 25 },
        { header: 'Assessments', key: 'count', width: 15 },
        { header: 'Average Score', key: 'avgScore', width: 15 }
      ];

      subjectSheet.addRows(data.subjects);
    }

    // Performance Trend Sheet
    if (data.trend && data.trend.length > 0) {
      const trendSheet = workbook.addWorksheet('Performance Trend');
      
      trendSheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Assessment', key: 'title', width: 30 },
        { header: 'Score', key: 'score', width: 10 },
        { header: 'Total Marks', key: 'totalMarks', width: 12 }
      ];

      trendSheet.addRows(
        data.trend.map(t => ({
          date: new Date(t.date).toLocaleDateString(),
          title: t.title,
          score: t.score,
          totalMarks: t.totalMarks
        }))
      );
    }

    // Style headers
    workbook.eachSheet(sheet => {
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' }
      };
      sheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
    });
  }

  /**
   * Add instructor sheets to Excel workbook
   * @private
   */
  _addInstructorExcelSheets(workbook, data) {
    // Overview Sheet
    const overviewSheet = workbook.addWorksheet('Overview');
    
    overviewSheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 }
    ];

    if (data.overview) {
      const rows = [];
      
      if (data.overview.assessments) {
        rows.push(
          { metric: 'Total Assessments', value: data.overview.assessments.total },
          { metric: 'Published Assessments', value: data.overview.assessments.published },
          { metric: 'Draft Assessments', value: data.overview.assessments.draft }
        );
      }

      if (data.overview.submissions) {
        rows.push(
          { metric: 'Total Submissions', value: data.overview.submissions.total },
          { metric: 'Evaluated Submissions', value: data.overview.submissions.evaluated },
          { metric: 'Pending Submissions', value: data.overview.submissions.pending }
        );
      }

      overviewSheet.addRows(rows);
    }

    // Class Performance Sheet
    if (data.classPerformance && data.classPerformance.students) {
      const classSheet = workbook.addWorksheet('Class Performance');
      
      classSheet.columns = [
        { header: 'Student Name', key: 'studentName', width: 25 },
        { header: 'Email', key: 'studentEmail', width: 30 },
        { header: 'Score', key: 'score', width: 10 },
        { header: 'Percentage', key: 'percentage', width: 12 },
        { header: 'Submitted At', key: 'submittedAt', width: 20 }
      ];

      classSheet.addRows(
        data.classPerformance.students.map(s => ({
          ...s,
          percentage: `${s.percentage.toFixed(2)}%`,
          submittedAt: new Date(s.submittedAt).toLocaleString()
        }))
      );
    }

    // Question Statistics Sheet
    if (data.questionStats && data.questionStats.length > 0) {
      const questionSheet = workbook.addWorksheet('Question Statistics');
      
      questionSheet.columns = [
        { header: 'Q#', key: 'questionNumber', width: 8 },
        { header: 'Question', key: 'questionText', width: 40 },
        { header: 'Type', key: 'type', width: 12 },
        { header: 'Marks', key: 'marks', width: 10 },
        { header: 'Correct', key: 'correct', width: 10 },
        { header: 'Incorrect', key: 'incorrect', width: 10 },
        { header: 'Success Rate', key: 'successRate', width: 15 },
        { header: 'Difficulty', key: 'difficulty', width: 12 }
      ];

      questionSheet.addRows(
        data.questionStats.map(q => ({
          ...q,
          successRate: `${q.successRate}%`
        }))
      );
    }

    // Style headers
    workbook.eachSheet(sheet => {
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' }
      };
      sheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
    });
  }

  /**
   * Add admin sheets to Excel workbook
   * @private
   */
  _addAdminExcelSheets(workbook, data) {
    // Platform Metrics Sheet
    const metricsSheet = workbook.addWorksheet('Platform Metrics');
    
    metricsSheet.columns = [
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 15 }
    ];

    if (data.metrics) {
      const rows = [];

      if (data.metrics.users) {
        rows.push(
          { category: 'Users', metric: 'Total Users', value: data.metrics.users.total },
          { category: 'Users', metric: 'Students', value: data.metrics.users.students },
          { category: 'Users', metric: 'Instructors', value: data.metrics.users.instructors },
          { category: 'Users', metric: 'Admins', value: data.metrics.users.admins }
        );
      }

      if (data.metrics.assessments) {
        rows.push(
          { category: 'Assessments', metric: 'Total', value: data.metrics.assessments.total },
          { category: 'Assessments', metric: 'Published', value: data.metrics.assessments.published },
          { category: 'Assessments', metric: 'Draft', value: data.metrics.assessments.draft }
        );
      }

      if (data.metrics.submissions) {
        rows.push(
          { category: 'Submissions', metric: 'Total', value: data.metrics.submissions.total },
          { category: 'Submissions', metric: 'Evaluated', value: data.metrics.submissions.evaluated },
          { category: 'Submissions', metric: 'Pending', value: data.metrics.submissions.pending }
        );
      }

      metricsSheet.addRows(rows);
    }

    // Instructor Performance Sheet
    if (data.instructorPerformance && data.instructorPerformance.length > 0) {
      const instructorSheet = workbook.addWorksheet('Instructor Performance');
      
      instructorSheet.columns = [
        { header: 'Instructor', key: 'instructor', width: 25 },
        { header: 'Assessments', key: 'assessments', width: 15 },
        { header: 'Submissions', key: 'submissions', width: 15 },
        { header: 'Evaluated', key: 'evaluated', width: 15 },
        { header: 'Evaluation Rate', key: 'evaluationRate', width: 18 }
      ];

      instructorSheet.addRows(
        data.instructorPerformance.map(i => ({
          ...i,
          evaluationRate: `${i.evaluationRate}%`
        }))
      );
    }

    // Assessment Distribution Sheet
    if (data.distribution) {
      const distSheet = workbook.addWorksheet('Assessment Distribution');
      
      distSheet.columns = [
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Count', key: 'count', width: 15 }
      ];

      if (data.distribution.bySubject) {
        distSheet.addRows(
          data.distribution.bySubject.map(s => ({
            category: `Subject: ${s.subject}`,
            count: s.count
          }))
        );
      }
    }

    // Style headers
    workbook.eachSheet(sheet => {
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' }
      };
      sheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
    });
  }

  /**
   * Send report via email
   * @param {String} userId - User ID
   * @param {Buffer} reportBuffer - Report file buffer
   * @param {String} format - 'pdf' or 'excel'
   * @param {String} reportType - Type of report
   * @returns {Promise}
   */
  async sendReport(userId, reportBuffer, format, reportType) {
    try {
      const User = require('../models/User');
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const extension = format === 'pdf' ? 'pdf' : 'xlsx';
      const mimeType = format === 'pdf' 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      const attachments = [{
        filename: `${reportType}_report_${Date.now()}.${extension}`,
        content: reportBuffer,
        contentType: mimeType
      }];

      await sendEmail({
        email: user.email,
        subject: `Your ${reportType} Analytics Report`,
        message: `Hello ${user.name},\n\nPlease find your ${reportType} analytics report attached.\n\nBest regards,\nUnified Assessment Platform`,
        attachments
      });

      return { success: true };
    } catch (error) {
      throw new Error(`Error sending report: ${error.message}`);
    }
  }

  /**
   * Schedule a report for regular delivery
   * @param {Object} scheduleConfig - Schedule configuration
   * @returns {Promise}
   */
  async scheduleReport(scheduleConfig) {
    try {
      const schedule = await ScheduledReport.create(scheduleConfig);
      return schedule;
    } catch (error) {
      throw new Error(`Error scheduling report: ${error.message}`);
    }
  }

  /**
   * Execute scheduled reports (called by cron job)
   * @returns {Promise}
   */
  async executeScheduledReports() {
    try {
      const now = new Date();
      
      // Find reports due for execution
      const dueReports = await ScheduledReport.find({
        isActive: true,
        nextRun: { $lte: now }
      }).populate('userId');

      console.log(`Found ${dueReports.length} scheduled reports to execute`);

      for (const report of dueReports) {
        try {
          // Fetch data based on report type
          let data;
          
          if (report.reportType === 'student') {
            const performance = await analyticsService.getStudentPerformance(report.userId._id);
            const subjects = await analyticsService.getSubjectBreakdown(report.userId._id);
            const strengths = await analyticsService.getStrengthsWeaknesses(report.userId._id);
            
            data = {
              overall: performance.overall,
              trend: performance.trend,
              subjects,
              strengths
            };
          } else if (report.reportType === 'instructor') {
            const overview = await analyticsService.getInstructorOverview(report.userId._id);
            data = { overview };
          } else if (report.reportType === 'admin') {
            const metrics = await analyticsService.getPlatformMetrics();
            const engagement = await analyticsService.getUserEngagement();
            const distribution = await analyticsService.getAssessmentDistribution();
            const instructorPerformance = await analyticsService.getInstructorPerformance();
            
            data = {
              metrics,
              engagement,
              distribution,
              instructorPerformance
            };
          }

          // Generate report
          const reportBuffer = report.format === 'pdf'
            ? await this.generatePDF(report.reportType, data, {
                title: `${report.reportType} Analytics Report`,
                period: report.frequency
              })
            : await this.generateExcel(report.reportType, data);

          // Send report
          await this.sendReport(report.userId._id, reportBuffer, report.format, report.reportType);

          // Update schedule
          const nextRun = this._calculateNextRun(report.frequency);
          report.lastSent = now;
          report.nextRun = nextRun;
          await report.save();

          console.log(`Successfully sent scheduled report to ${report.userId.email}`);
        } catch (error) {
          console.error(`Error executing scheduled report ${report._id}:`, error.message);
        }
      }

      return { executed: dueReports.length };
    } catch (error) {
      console.error('Error executing scheduled reports:', error.message);
      throw error;
    }
  }

  /**
   * Calculate next run time based on frequency
   * @private
   */
  _calculateNextRun(frequency) {
    const now = new Date();
    
    switch (frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      default:
        now.setDate(now.getDate() + 1);
    }
    
    return now;
  }
}

module.exports = new ReportService();
