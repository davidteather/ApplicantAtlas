import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';
import Countdown from '@/components/Shared/Countdown';
import { isZeroDate } from '@/utils/conversions';

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = ({}) => {
  const eventDetails = useSelector(
    (state: RootState) => state.event.eventDetails,
  );
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    valid: false,
    eventState: 'before' as 'before' | 'during' | 'after',
  });

  const calculateTimeLeft = (distance: number) => {
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  useEffect(() => {
    let intervalSet = false;
    const updateDate = () => {
      if (
        eventDetails?.metadata.startTime &&
        !isZeroDate(eventDetails.metadata.startTime)
      ) {
        const now = new Date().getTime();
        const startTime = new Date(eventDetails.metadata.startTime).getTime();
        const distance = startTime - now;

        if (distance < 0) {
          // check if event has ended
          if (
            eventDetails?.metadata.endTime &&
            !isZeroDate(eventDetails.metadata.endTime)
          ) {
            const endTime = new Date(eventDetails.metadata.endTime).getTime();
            const endDistance = endTime - now;

            // if ended
            if (endDistance > 0) {
              // event is still going
              const { days, hours, minutes, seconds } =
                calculateTimeLeft(endDistance);
              setCountdown({
                days,
                hours,
                minutes,
                seconds,
                valid: true,
                eventState: 'during',
              });

              return;
            }
          }

          // event has ended
          setCountdown({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            valid: true,
            eventState: 'after',
          });
          if (intervalSet) {
            clearInterval(interval);
          }
        } else {
          const { days, hours, minutes, seconds } = calculateTimeLeft(distance);
          setCountdown({
            days,
            hours,
            minutes,
            seconds,
            valid: true,
            eventState: 'before',
          });
        }
      }
    };
    updateDate();
    const interval = setInterval(updateDate, 1000);
    intervalSet = true;

    return () => clearInterval(interval);
  }, [eventDetails?.metadata.startTime, eventDetails?.metadata.endTime]);

  return (
    <div className="container mx-auto p-8">
      <div className="text-center mb-12">
        {countdown.valid ? (
          <>
            <h1 className="text-5xl font-bold mb-6">
              {eventDetails?.metadata.name}{' '}
              {countdown.eventState === 'before'
                ? 'Starts In'
                : countdown.eventState === 'during'
                  ? 'Ends In'
                  : 'Ended'}{' '}
            </h1>
            <div className="grid grid-flow-col gap-10 text-center auto-cols-max justify-center">
              {countdown.eventState === 'before' ||
              countdown.eventState === 'during' ? (
                <>
                  <Countdown value={countdown.days} label="Days" />
                  <Countdown value={countdown.hours} label="Hours" />
                  {countdown.eventState === 'during' && (
                    <>
                      <Countdown value={countdown.minutes} label="Minutes" />
                      <Countdown value={countdown.seconds} label="Seconds" />
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="text-2xl mt-4">
                    Congratulations on a successful event!
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-5xl font-bold">No event details available</h1>
            <div className="text-2xl mt-4">
              Please add event start and end times in the event details tab.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
