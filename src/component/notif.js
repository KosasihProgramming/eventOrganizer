import React, { useState, useRef, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import "aos/dist/aos.css";
import AOS from "aos";
import "../style/style.css";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);
function Notif(props) {
  console.log(props.data, "dfagagagh");
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const popupRef = useRef(null);
  const [todayDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [todayTime] = useState(dayjs().format("HH:mm"));
  const [events, setEvents] = useState([]);
  const [data, setData] = useState(props.data);

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    AOS.init({ duration: 700 });

    const now = dayjs(`${todayDate}T${todayTime}`);

    const updatedEvents = data.map((event) => {
      const eventDateTime = dayjs(`${event.tanggal}T${event.jamMulai}`);
      const diff = dayjs.duration(eventDateTime.diff(now));

      const days = diff.days();
      const hours = diff.hours();
      const minutes = diff.minutes();

      let selisih = "";
      if (days > 0) selisih += `${days} hari `;
      if (hours > 0) selisih += `${hours} jam `;
      if (minutes > 0 || selisih === "") selisih += `${minutes} menit`;

      return { ...event, selisih: selisih.trim() };
    });

    setEvents(updatedEvents);
    console.log(updatedEvents, "gagah");
  }, [todayDate, todayTime]);

  const handleAdd = () => {
    setIsOpen(false);
    setInputValue("");
    setSelectedOption("");

    props.handleAdd(selectedOption, inputValue);
  };

  const handleClose = () => {
    setIsOpen(false);
  };
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSelectChange = (e) => {
    setSelectedOption(e.target.value);
  };

  return (
    <div>
      <button
        onClick={handleOpen}
        className="flex justify-center items-center gap-2 p-2 w-[2.5rem] h-[2.5rem] bg-indigo-400 rounded-full  text-white text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="#fff"
            d="M10 21h4c0 1.1-.9 2-2 2s-2-.9-2-2m11-2v1H3v-1l2-2v-6c0-3.1 2-5.8 5-6.7V4c0-1.1.9-2 2-2s2 .9 2 2v.3c3 .9 5 3.6 5 6.7v6zm-4-8c0-2.8-2.2-5-5-5s-5 2.2-5 5v7h10z"
          />
        </svg>
      </button>

      <CSSTransition
        in={isOpen}
        timeout={300}
        classNames="popup "
        unmountOnExit
      >
        <div
          ref={popupRef}
          data-aos="fade-up"
          className="fixed top-[15%] right-[3%] w-[21rem] h-[20rem] gap-5 bg-white rounded-xl flex flex-col justify-start items-center p-4  z-[99998] shadow-2xl"
        >
          {events.map((data) => (
            <div className="bg-indigo-50 rounded-xl px-3 py-2 w-full">
              <div className="flex w-full justify-between ">
                <img
                  loading="lazy"
                  src="https://res.cloudinary.com/practicaldev/image/fetch/s--Y67oaeEw--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/3v1wlmhq1iw35ua1gfgn.png"
                  className="w-[20%] h-[3.5rem] object-cover rounded-xl"
                />
                <div className="w-[75%] flex justify-start items-start flex-col">
                  <div className="w-full py-1 flex justify-center items-center font-semibold bg-indigo-500 text-indigo-50 border border-indigo-500 text-xs rounded-xl">
                    {data.selisih}
                  </div>
                  <p className="text-sm text-black mt-2">{data.judul}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CSSTransition>
    </div>
  );
}

export default Notif;
