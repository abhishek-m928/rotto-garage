import type { Booking, Car } from '@/types';

interface BookingCardProps {
  booking: Booking;
  onStatusChange?: (id: string, status: Booking['status']) => void;
}

const getCar = (booking: Booking): Car | null => {
  if (booking.carId && typeof booking.carId === 'object') {
    return booking.carId as Car;
  }
  return null;
};

// TODO: implement this component
// Use the CSS classes in globals.css:
//   .rt-booking-card, .rt-booking-card__header, .rt-booking-card__service,
//   .rt-booking-card__date, .rt-booking-card__car, .rt-booking-status,
//   .rt-booking-status--{pending|confirmed|in-progress|completed|cancelled}
export default function BookingCard({ booking }: BookingCardProps) {
  const car = getCar(booking);

  return (
    <div className="rt-booking-card">
      <div className="rt-booking-card__header">
        <span className={`rt-booking-status rt-booking-status--${booking.status}`}>
          {booking.status}
        </span>
        {booking.estimatedCost > 0 && (
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            ₹{booking.estimatedCost}
          </span>
        )}
      </div>

      <p className="rt-booking-card__service">
        {booking.serviceType.replace(/-/g, ' ')}
      </p>

      <p className="rt-booking-card__date">
        {new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })}
      </p>

      {car && (
        <p className="rt-booking-card__car">
          {car.year} {car.make} {car.model} — {car.registrationNumber}
        </p>
      )}

      {booking.notes && (
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
          {booking.notes}
        </p>
      )}
    </div>
  );
}
