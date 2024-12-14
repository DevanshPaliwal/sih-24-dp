// import { useState, useEffect } from "react";

// interface TimeSelectorProps {
//   onTimeChange: (time: Date) => void;
// }

// const API_URL = "https://api.sunrisesunset.io/json";
// const latitude = 23.0225;
// const longitude = 72.58727;

// export default function TimeSelector({ onTimeChange }: TimeSelectorProps) {
//   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
//   const [selectedTime, setSelectedTime] = useState<string>("12:00");
//   const [sunrise, setSunrise] = useState<string>("");
//   const [sunset, setSunset] = useState<string>("");

//   useEffect(() => {
//     // Fetch sunrise and sunset times when the component mounts
//     fetchSunriseSunset();
//   }, [selectedDate]);

//   const fetchSunriseSunset = async () => {
//     const strDate=selectedDate.toString();
//     try {
//       const response = await fetch(
//         `${API_URL}?lat=${latitude}&lng=${longitude}&timezone=Asia/Kolkata&date=${strDate}`
//       );
//       const data = await response.json();

//       if (data && data.results) {
//         console.log(typeof data.results.sunrise)
//         const sunriseTime = (data.results.sunrise).toString();
//         const sunsetTime = (data.results.sunset).toString();

//         setSunrise(sunriseTime);
//         setSunset(sunsetTime);
//       }
//     } catch (error) {
//       console.error("Error fetching sunrise/sunset times:", error);
//     }
//   };





//   const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setSelectedDate(event.target.value);
//     updateDateTime(event.target.value, selectedTime); // Re-fetch times when the date changes
//   };

//   const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setSelectedTime(event.target.value);
//     updateDateTime(selectedDate, event.target.value);
//   };

//   const updateDateTime = (date: string, time: string) => {
//     const dateTime = new Date(`${date}T${time}:00`);
//     onTimeChange(dateTime);
//   };

//   return (
//     <div className="mb-4">
//       <h2 className="text-lg font-bold">Time Selection</h2>
//       <div className="flex flex-col">
//         <input
//           type="date"
//           value={selectedDate}
//           onChange={handleDateChange}
//           className="mb-2 p-2 border rounded"
//         />
//         <input
//           type="time"
//           value={selectedTime}
//           onChange={handleTimeChange}
//           className="p-2 border rounded"
//         />
//       </div>

//       {/* Display Sunrise and Sunset Times */}
//       <div className="mt-4">
//         {sunrise && sunset ? (
//           <>
//             <p><strong>Sunrise:</strong> {sunrise.toString()}</p>
//             <p><strong>Sunset:</strong> {sunset.toString()}</p>
//           </>
//         ) : (
//           <p>Loading sunrise and sunset times...</p>
//         )}
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";

interface TimeSelectorProps {
  onTimeChange: (time: Date) => void;
}

const API_URL = "https://api.sunrisesunset.io/json";
const latitude = 23.0225;
const longitude = 72.58727;

export default function TimeSelector({ onTimeChange }: TimeSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState<string>("12:00");
  const [sunrise, setSunrise] = useState<string>("");
  const [sunset, setSunset] = useState<string>("");
  const [minTime, setMinTime] = useState<string>("");
  const [maxTime, setMaxTime] = useState<string>("");

  useEffect(() => {
    fetchSunriseSunset();
  }, [selectedDate]);

  const fetchSunriseSunset = async () => {
    const strDate = selectedDate.toString();
    try {
      const response = await fetch(
        `${API_URL}?lat=${latitude}&lng=${longitude}&timezone=Asia/Kolkata&date=${strDate}`
      );
      const data = await response.json();

      if (data && data.results) {
        // Parse sunrise and sunset times
        const sunriseTime = data.results.sunrise;
        const sunsetTime = data.results.sunset;

        // Convert times to 24-hour format
        const formattedSunrise = formatTime(sunriseTime);
        const formattedSunset = formatTime(sunsetTime);

        setSunrise(sunriseTime);
        setSunset(sunsetTime);
        setMinTime(formattedSunrise);
        setMaxTime(formattedSunset);

        // Adjust selected time if it's outside sunrise-sunset range
        if (compareTime(selectedTime, formattedSunrise) < 0) {
          setSelectedTime(formattedSunrise);
          updateDateTime(selectedDate, formattedSunrise);
        } else if (compareTime(selectedTime, formattedSunset) > 0) {
          setSelectedTime(formattedSunset);
          updateDateTime(selectedDate, formattedSunset);
        }
      }
    } catch (error) {
      console.error("Error fetching sunrise/sunset times:", error);
    }
  };

  // Helper function to convert time to 24-hour format
  const formatTime = (timeString: string): string => {
    // Assume the input is in 12-hour format with AM/PM
    const [time, period] = timeString.split(' ');
    let [hours, minutes] = time.split(':');
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== '12') {
      hours = (parseInt(hours) + 12).toString();
    }
    if (period === 'AM' && hours === '12') {
      hours = '00';
    }

    // Pad with zero if needed
    hours = hours.padStart(2, '0');
    minutes = minutes.padStart(2, '0');

    return `${hours}:${minutes}`;
  };

  // Compare two times (in 24-hour format)
  const compareTime = (time1: string, time2: string): number => {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    
    if (h1 < h2) return -1;
    if (h1 > h2) return 1;
    if (m1 < m2) return -1;
    if (m1 > m2) return 1;
    return 0;
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
    updateDateTime(event.target.value, selectedTime);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = event.target.value;
    
    // Validate time is within sunrise-sunset range
    if (minTime && maxTime) {
      if (compareTime(newTime, minTime) < 0) {
        // If time is before sunrise, set to sunrise
        setSelectedTime(minTime);
        updateDateTime(selectedDate, minTime);
        return;
      }
      
      if (compareTime(newTime, maxTime) > 0) {
        // If time is after sunset, set to sunset
        setSelectedTime(maxTime);
        updateDateTime(selectedDate, maxTime);
        return;
      }
    }

    // If time is valid, update
    setSelectedTime(newTime);
    updateDateTime(selectedDate, newTime);
  };

  const updateDateTime = (date: string, time: string) => {
    const dateTime = new Date(`${date}T${time}:00`);
    onTimeChange(dateTime);
  };

  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold">Time Selection</h2>
      <div className="flex flex-col">
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="mb-2 p-2 border rounded"
        />
        <input
          type="time"
          value={selectedTime}
          onChange={handleTimeChange}
          min={minTime}
          max={maxTime}
          className="p-2 border rounded"
        />
      </div>

      {/* Display Sunrise and Sunset Times */}
      <div className="mt-4">
        {sunrise && sunset ? (
          <>
            <p><strong>Sunrise:</strong> {sunrise}</p>
            <p><strong>Sunset:</strong> {sunset}</p>
          </>
        ) : (
          <p>Loading sunrise and sunset times...</p>
        )}
      </div>
    </div>
  );
}