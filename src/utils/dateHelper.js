import moment from 'moment';

/**
 * Calculates the date of the first Sunday of the last 365 days.
 * GitHub's graph starts roughly one year ago, on a Sunday.
 * @returns {string} ISO 8601 string of the start date.
 */
export function getStartDate() {
    let startDate = moment().subtract(1, 'year').startOf('day');
    // The graph starts on a Sunday. We find the most recent Sunday before or on this date.
    while (startDate.day() !== 0) { // moment().day() gives 0 for Sunday
        startDate.subtract(1, 'day');
    }
    return startDate.toISOString();
}