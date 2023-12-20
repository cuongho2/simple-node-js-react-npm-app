/**
 * Created by A on 7/18/17.
 */
'use strict';

module.exports = {
  SCHEDULE_STATUS: {
    NEW: "New",
    WAITING: "Waiting",
    PENDING: "Pending",
    APPROVED: "Approved",
    COMPLETED: "Completed",
    DELETED: "Deleted",
    CANCELED: "Canceled",
  },
  SCHEDULE_ERROR: {
    INVALID_REQUEST: "INVALID_REQUEST",
    NEW_SCHEDULE_TOO_SOON: "NEW_SCHEDULE_TOO_SOON",
    OVER_LIMITED_PACKAGE: "OVER_LIMITED_PACKAGE",
    CANCEL_SCHEDULE_TOO_LATE: "CANCEL_SCHEDULE_TOO_LATE",
  }
}