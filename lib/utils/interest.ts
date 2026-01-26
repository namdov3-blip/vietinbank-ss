import { toZonedTime } from 'date-fns-tz';

const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Helper: Convert date to VN timezone and get start of day
 */
export const getVNStartOfDay = (date: Date | string): Date => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const vnDate = toZonedTime(d, VN_TIMEZONE);
  vnDate.setHours(0, 0, 0, 0);
  return vnDate;
};

/**
 * Tính lãi theo cách của ngân hàng: lãi nhập gốc theo từng kỳ (tháng)
 * Mỗi kỳ tính lãi dựa trên số dư đầu kỳ, sau đó cộng lãi vào gốc để tính kỳ tiếp theo
 * 
 * Ví dụ từ phiếu ngân hàng:
 * - Kỳ 1 (21/08-01/09): Số dư 97,923,200 → Lãi 2,951 → Số dư mới 97,926,151
 * - Kỳ 2 (01/09-01/10): Số dư 97,926,151 → Lãi 8,049 → Số dư mới 97,934,200
 * - Kỳ 3 (01/10-01/11): Số dư 97,934,200 → Lãi 8,318 → Số dư mới 97,942,518
 * 
 * @param principal - Số tiền gốc
 * @param annualRate - Lãi suất năm (%)
 * @param startDate - Ngày bắt đầu tính lãi
 * @param endDate - Ngày kết thúc tính lãi
 * @returns Tổng lãi đã tính
 */
export const calculateInterest = (
    principal: number,
    annualRate: number,
    startDate: Date | string | undefined,
    endDate: Date
): number => {
    if (!startDate) return 0;

    // Handle different date input types
    let baseDate: Date;
    if (startDate instanceof Date) {
        baseDate = new Date(startDate);
    } else if (typeof startDate === 'object') {
        return 0;
    } else {
        baseDate = new Date(startDate);
    }

    // Validate baseDate
    if (isNaN(baseDate.getTime())) return 0;

    // Convert to VN timezone and reset to start of day (00:00:00 VN time)
    const baseDateVN = getVNStartOfDay(baseDate);
    const endDateVN = getVNStartOfDay(endDate);

    const timeDiff = endDateVN.getTime() - baseDateVN.getTime();
    const totalDays = Math.floor(timeDiff / (1000 * 3600 * 24));

    // Nếu chưa qua mốc 00:00 nào sau baseDate thì chưa có lãi
    if (totalDays <= 0) return 0;

    // Tính lãi theo cách ngân hàng: lãi nhập gốc theo từng kỳ (tháng)
    let currentBalance = principal;
    let totalInterest = 0;
    let currentDate = new Date(baseDateVN);

    // Daily rate
    const dailyRate = (annualRate / 100) / 365;

    // Tính lãi theo từng kỳ (tháng)
    while (currentDate < endDateVN) {
        // Xác định ngày kết thúc kỳ (ngày đầu tháng tiếp theo)
        // Đảm bảo tính trong VN timezone
        const periodEnd = new Date(currentDate);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        periodEnd.setDate(1); // Ngày đầu tháng tiếp theo
        // Convert to VN timezone để đảm bảo nhất quán
        const periodEndVN = getVNStartOfDay(periodEnd);

        // Nếu periodEnd vượt quá endDate, dùng endDate
        const actualPeriodEnd = periodEndVN > endDateVN ? endDateVN : periodEndVN;

        // Số ngày trong kỳ này
        const daysInPeriod = Math.floor(
            (actualPeriodEnd.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
        );

        if (daysInPeriod > 0) {
            // Tính lãi cho kỳ này dựa trên số dư hiện tại (đã bao gồm lãi từ các kỳ trước)
            const periodInterest = Math.round(currentBalance * dailyRate * daysInPeriod);
            totalInterest += periodInterest;
            
            // Cộng lãi vào gốc để tính kỳ tiếp theo (lãi nhập gốc)
            currentBalance += periodInterest;
        }

        // Chuyển sang kỳ tiếp theo
        currentDate = new Date(actualPeriodEnd);
    }

    return totalInterest;
};
