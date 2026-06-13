const Booking = require('../models/Booking');

const getStats = async (req, res, next) => {
  try {
    const results = await Booking.aggregate([
      {
        $facet: {
          // Booking count grouped by status
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ],

          // Booking count grouped by service type
          byServiceType: [
            { $group: { _id: '$serviceType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],

          // Last 5 bookings with car and user populated
          recentBookings: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'cars',
                localField: 'carId',
                foreignField: '_id',
                as: 'carId',
              },
            },
            { $unwind: { path: '$carId', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userId',
                pipeline: [
                  { $project: { password: 0 } },  
                ],
              },
            },
            { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
          ],

          // Total estimated revenue
          totalRevenue: [
            { $group: { _id: null, total: { $sum: '$estimatedCost' } } },
          ],
        },
      },
    ]);

    const data = results[0];

    res.json({
      success: true,
      data: {
        byStatus: data.byStatus,
        byServiceType: data.byServiceType,
        recentBookings: data.recentBookings,
        totalRevenue: data.totalRevenue[0]?.total || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };