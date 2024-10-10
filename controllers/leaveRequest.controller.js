const LeaveRequest = require("../models/leaveRequest.model");
const User = require("../models/user.model");
const { successResponse, errorResponse } = require("../utils/responseHelpers");
const { sendTelegramMessage } = require("../utils/sendTelegramMessage");
const { getFormattedDate } = require("../utils/getFormattedDate");
const { getNumberOfDays } = require("../utils/getNumberOfDays");
const statusOrder = {
  Pending: 1,
  Approved: 2,
  Rejected: 3,
};

const getAllLeaveRequests = async (req, res, next) => {
  try {
    const leaveRequests = await LeaveRequest.find()
      .populate({
        path: "employee",
        select: "name role",
      })
      .populate({
        path: "approvedOrRejectedBy",
        select: "name role",
      })
      .exec();

    // Sort in application code
    leaveRequests.sort((a, b) => {
      const statusA = statusOrder[a.status] || 4; // Assign a default value if status not found
      const statusB = statusOrder[b.status] || 4; // Assign a default value if status not found
      return statusA - statusB; // Sort by the mapped values
    });

    return successResponse(
      res,
      leaveRequests,
      "Leave requests retrieved successfully"
    );
  } catch (error) {
    return next(error);
  }
};

const getLeaveRequestById = async (req, res, next) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id)
      .populate({
        path: "employee",
        select: "name role",
      })
      .populate({
        path: "approvedOrRejectedBy",
        select: "name role",
      })
      .exec();

    if (!leaveRequest) {
      return errorResponse(res, "Leave request not found", 404);
    }

    return successResponse(
      res,
      leaveRequest,
      "Leave request retrieved successfully"
    );
  } catch (error) {
    return next(error);
  }
};

const getLeaveRequestsByEmployeeId = async (req, res, next) => {
  try {
    const leaveRequests = await LeaveRequest.find({
      employee: req.params.id,
    })
      .populate({
        path: "employee",
        select: "name role",
      })
      .populate({
        path: "approvedOrRejectedBy",
        select: "name role",
      })
      .exec();

    if (!leaveRequests) {
      return errorResponse(res, "Leave request not found", 404);
    }

    // Sort in application code
    leaveRequests.sort((a, b) => {
      const statusA = statusOrder[a.status] || 4; // Assign a default value if status not found
      const statusB = statusOrder[b.status] || 4; // Assign a default value if status not found
      return statusA - statusB; // Sort by the mapped values
    });

    return successResponse(
      res,

      leaveRequests,
      "Leave requests retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

const createLeaveRequest = async (req, res, next) => {
  try {
    const existingLeaveRequest = await LeaveRequest.findOne({
      employee: req.user.id,
      status: "Pending",
    });

    if (existingLeaveRequest) {
      return errorResponse(
        res,
        "You already have a pending leave request",
        400
      );
    }

    const leaveRequest = new LeaveRequest({
      employee: req.user.id,
      status: "Pending",
      type: req.body.type,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      numberOfDays: getNumberOfDays(req.body.start_date, req.body.end_date),
      reason: req.body.reason,
    });

    console.log("requester", req.user);

    await leaveRequest.save();

    await sendTelegramMessage(
      `
    🌟 New Leave Request Submitted 🌟
    \n👤 Employee: ${req.user.name} (${req.user.role})
    \n📄 Leave Type: ${req.body.type}
    \n🗓️ Start Date: ${getFormattedDate(req.body.start_date)}
    \n🗓️ End Date: ${getFormattedDate(req.body.end_date)}
    \n🗓️ Request Date: ${getFormattedDate(new Date())}
    \n📝 Reason: ${req.body.reason}
    \n🙈 Review Now: ${process.env.CLIENT_SIDE_URL}/leaveRequest/approve/${
        leaveRequest._id
      }
  `,
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_TOPIC_LEAVE_REQUEST_ID
    );

    return successResponse(
      res,
      leaveRequest,
      "Leave request created successfully"
    );
  } catch (error) {
    return next(error);
  }
};

const updateLeaveRequest = async (req, res, next) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return errorResponse(res, "Leave request not found", 404);
    }

    leaveRequest.type = req.body.type;
    leaveRequest.start_date = req.body.start_date;
    leaveRequest.end_date = req.body.end_date;
    leaveRequest.reason = req.body.reason;
    leaveRequest.numberOfDays = getNumberOfDays(
      req.body.start_date,
      req.body.end_date
    );
    await leaveRequest.save();

    return successResponse(
      res,
      leaveRequest,
      "Leave request updated successfully"
    );
  } catch (error) {
    return next(error);
  }
};

const deleteLeaveRequest = async (req, res, next) => {
  try {
    // can only delete pending requests
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return errorResponse(res, "Leave request not found", 404);
    }

    if (leaveRequest.status !== "Pending") {
      return errorResponse(
        res,
        "Cannot delete a leave request that is not pending",
        400
      );
    }

    await LeaveRequest.findByIdAndDelete(req.params.id);

    await sendTelegramMessage(
      `
    Leave Request Deleted ❌
    \n👤 Employee: ${req.user.name}
    \n📅 Deleted Date: ${getFormattedDate(new Date())}
  `,
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_TOPIC_LEAVE_REQUEST_ID
    );

    return successResponse(
      res,
      leaveRequest,
      "Leave request deleted successfully"
    );
  } catch (error) {
    return next(error);
  }
};

const approveOrRejectLeave = async (req, res, next) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return errorResponse(res, "Leave request not found", 404);
    }

    leaveRequest.status = req.body.status;
    leaveRequest.comment = req.body.comment;
    leaveRequest.approvedOrRejectedBy = req.user.id;

    await leaveRequest.save();

    const employee = await User.findById(leaveRequest.employee);

    const approvalMessage = `
🎉 Your Leave Request Has Been Approved 🎉

\n👤 Employee: ${employee.name} (${employee.role})
\n📄 Leave Type: ${leaveRequest.type}
\n🗓️ Start Date: ${getFormattedDate(leaveRequest.start_date)}
\n🗓️ End Date: ${getFormattedDate(leaveRequest.end_date)}
\n📝 Reason: ${leaveRequest.reason}
\n🙋‍♂️ Comment: ${req.body.comment}

We wish you a restful time off! If you have any questions, feel free to reach out.
`;

    const rejectionMessage = `
❌ Your Leave Request Has Been Rejected ❌

\n👤 Employee: ${employee.name} (${employee.role})
\n📄 Leave Type: ${leaveRequest.type}
\n🗓️ Requested Start Date: ${getFormattedDate(leaveRequest.start_date)}
\n🗓️ Requested End Date: ${getFormattedDate(leaveRequest.end_date)}
\n📝 Reason: ${leaveRequest.reason}
\n🙋‍♂️ Comment: ${req.body.comment}

If you have any questions or need further clarification, please contact your manager.
`;

    const pendingMessage = `
🔄 Your Leave Request Status Has Changed to Pending 🔄

\n👤 Employee: ${employee.name} (${employee.role})
\n📄 Leave Type: ${leaveRequest.type}
\n🗓️ Requested Start Date: ${getFormattedDate(leaveRequest.start_date)}
\n🗓️ Requested End Date: ${getFormattedDate(leaveRequest.end_date)}
\n📝 Reason: ${leaveRequest.reason}
\n🙋‍♂️ Comment: ${req.body.comment} 

Your request is currently under review. We will notify you once a decision has been made.
`;

    if (employee.chat_id) {
      if (req.body.status === "Approved") {
        await sendTelegramMessage(approvalMessage, employee.chat_id);
      } else if (req.body.status === "Rejected") {
        await sendTelegramMessage(rejectionMessage, employee.chat_id);
      } else {
        await sendTelegramMessage(pendingMessage, employee.chat_id);
      }
    }

    return successResponse(
      res,
      leaveRequest,
      `Leave request ${req.body.status} successfully`
    );
  } catch (error) {
    return next(error);
  }
};

const clearAllLeaveRequests = async (req, res, next) => {
  try {
    await LeaveRequest.deleteMany({
      end_date: { $lt: new Date() }, // Only delete records where end_date is less than today
    });

    return successResponse(res, null, "Leave requests cleared successfully");
  } catch (error) {
    console.error("Error clearing leave requests", error);
  }
};

const rejectLeaveRequestAfterEndDate = async () => {
  try {
    const leaveRequests = await LeaveRequest.find({
      end_date: { $lt: new Date() },
      status: "Pending",
    });

    for (const leaveRequest of leaveRequests) {
      leaveRequest.status = "Rejected";
      leaveRequest.comment = "The leave request has expired";
      await leaveRequest.save();

      const employee = await User.findById(leaveRequest.employee);

      const rejectionMessage = `
      ❌ Your Leave Request Has Been Rejected ❌
      
      \n👤 Employee: ${employee.name} (${employee.role})
      \n📄 Leave Type: ${leaveRequest.type}
      \n🗓️ Requested Start Date: ${getFormattedDate(leaveRequest.start_date)}
      \n🗓️ Requested End Date: ${getFormattedDate(leaveRequest.end_date)}
      \n📝 Reason: ${leaveRequest.reason}
      \n🙋‍♂️ Comment: ${leaveRequest.comment}
      
      If you have any questions or need further clarification, please contact your manager.
      `;

      if (employee.chat_id) {
        await sendTelegramMessage(rejectionMessage, employee.chat_id);
      }
    }
  } catch (error) {
    console.error("Error rejecting leave requests", error);
  }
};

module.exports = {
  getAllLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  approveOrRejectLeave,
  clearAllLeaveRequests,
  rejectLeaveRequestAfterEndDate,
  getLeaveRequestsByEmployeeId,
};
