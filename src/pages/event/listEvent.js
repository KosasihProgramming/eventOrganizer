import * as React from "react";
import { db } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers";
import AOS from "aos";
import { Tabs, Tab } from "react-bootstrap";
import "../../style/tab.css";
import "aos/dist/aos.css";

class ListEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      status: "",
      isFiltered: false,
      upcomingEvents: [],
      selesaiEvents: [],
      tab: "tab2",
      ongoingEvents: [],
      userId: sessionStorage.getItem("userID"),
      peran: sessionStorage.getItem("peran"),
      userEmail: sessionStorage.getItem("userEmail"),
    };
  }

  componentDidMount = () => {
    AOS.init({ duration: 700 });
    this.getAllEvents();
  };

  getAllEvents = async () => {
    try {
      const eventsCollection = collection(db, "event");
      const snapshot = await getDocs(eventsCollection);
      const events = [];

      snapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() });
      });

      const upcomingEvents = events.filter(
        (event) => event.status === "upcoming"
      );
      const selesaiEvents = events.filter(
        (event) => event.status === "completed"
      );
      const ongoingEvents = events.filter(
        (event) => event.status === "ongoing"
      );

      console.log(events);

      console.log("rencana", upcomingEvents);
      console.log("selesai", selesaiEvents);
      console.log("saat ini ", ongoingEvents);

      this.setState({
        events: events,
        upcomingEvents: upcomingEvents,
        selesaiEvents: selesaiEvents,
        ongoingEvents: ongoingEvents,
      });
    } catch (error) {
      console.error("Error getting Events:", error);
    }
  };

  handleTab = (key) => {
    this.setState({ tab: key });
  };
  handleClick = () => {
    window.location.href = "/input-event";
  };
  formatTanggal = (tanggal) => {
    const hari = dayjs(tanggal).locale("id").format("dddd");
    const bulan = dayjs(tanggal).locale("id").format("MMMM");
    const hasil =
      tanggal.substring(8, 10) + " " + bulan + " " + tanggal.substring(0, 4);
    console.log("tanggal", dayjs(tanggal).locale("id").format("MMMM"));

    return hasil;
  };
  truncateText(text, maxLength) {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
    }
    return text;
  }
  render() {
    const {
      events,
      upcomingEvents,
      ongoingEvents,
      selesaiEvents,
      status,
      isFiltered,
    } = this.state;
    const theme = sessionStorage.getItem("theme");
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
          overflowX: "hidden",
          position: "relative",
          marginBottom: "1rem",
        }}
        className={`${theme == "true" ? "dark" : ""}`}
      >
        {this.state.peran == "Admin" && (
          <>
            <button className="floating-btn" onClick={this.handleClick}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <g fill="white" fill-rule="evenodd" clip-rule="evenodd">
                  <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12m10-8a8 8 0 1 0 0 16a8 8 0 0 0 0-16" />
                  <path d="M13 7a1 1 0 1 0-2 0v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4z" />
                </g>
              </svg>
            </button>
          </>
        )}
        <div className="flex flex-col px-4 pb-2 mx-auto w-full bg-white dark:bg-slate-900 min-h-[100vh]">
          <div className="flex gap-5 justify-between mt-8 items-center w-full bg-white  p-2 rounded-xl">
            <div className="flex justify-start  self-start text-2xl font-medium text-gray-900  items-center w-[60%] ">
              <button
                className="w-[100%] flex justify-start items-center"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                <div className="w-[40%] flex justify-start ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill=""
                      fill-rule="evenodd"
                      d="m15 4l2 2l-6 6l6 6l-2 2l-8-8z"
                    />
                  </svg>
                </div>
              </button>
              <div className="  text-2xl font-medium flex justify-start w-[60%]">
                Events
              </div>
            </div>
            <div className="flex gap-4 ">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/d21b764d8f9673fb9f20c9dec67038fa696241f9736eb8f72a98c90194ea1ee6?"
                className="shrink-0 w-6 aspect-square"
              />
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/f02d44d1d0c9da492aa6a5eb1aef4eaab6f3361cb67f6a42f93bd788ce49f054?"
                className="shrink-0 self-start aspect-square w-[22px]"
              />
            </div>
          </div>

          <div data-aos="slide-down" className="mt-5">
            <Tabs
              id="controlled-tab-example"
              activeKey={this.state.tab}
              onSelect={this.handleTab}
              className="custom-tab"
            >
              <Tab eventKey="tab1" title="Rencana"></Tab>
              <Tab eventKey="tab2" title="Saat Ini"></Tab>
              <Tab eventKey="tab3" title="Selesai"></Tab>
            </Tabs>
          </div>

          <div className="flex flex-col text-sm font-black w-full px-3 py-4 bg-indigo-200 dark:bg-indigo-500 rounded-xl mt-5">
            {this.state.tab == "tab1" && (
              <>
                {upcomingEvents.length > 0 ? (
                  <>
                    {upcomingEvents.map((event, index) => (
                      <div
                        data-aos="fade-up"
                        className="flex gap-2 p-2 mt-3 bg-white rounded-2xl shadow-2xl items-center"
                        onClick={() => {
                          window.location.href = `/detail-event/${event.id}`;
                        }}
                      >
                        <div className="flex flex-col my-auto  h-[6.5rem]">
                          <img
                            loading="lazy"
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/be8abc9bbcd1c7dc31351d33f4557ea2a9a9519c3c54381dc80a54f44cc14731?"
                            className="shrink-0 aspect-[0.86] w-[90px] h-[6.5rem] object-cover rounded-md"
                          />
                        </div>
                        <div className="flex flex-col my-auto justify-start ">
                          <div className="text-indigo-500 font-bold text-sm  flex justify-start">
                            {this.formatTanggal(event.tanggal)},{" "}
                            {event.jamMulai}
                          </div>
                          <div className="mt-2.5 text-base font-medium text-black flex justify-start text-justify">
                            {this.truncateText(event.judul, 20)}
                          </div>
                          <div className="flex gap-1.5 mt-2 text-zinc-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="22"
                              height="22"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fill="#6265EF"
                                d="M14.95 13.955a7.005 7.005 0 0 0 0-9.904a7 7 0 0 0-9.9 0a7.005 7.005 0 0 0 0 9.904l1.521 1.499l2.043 1.985l.133.118c.775.628 1.91.588 2.64-.118l2.435-2.37zM10 12a3 3 0 1 1 0-6a3 3 0 0 1 0 6"
                              />
                            </svg>
                            <div className="flex justify-start font-semibold text-sm">
                              {event.lokasi}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div
                      data-aos="fade-up"
                      className="flex flex-col px-5 items-center justify-center bg-transparent"
                    >
                      <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/7a985b11396aaba9d42b711bcccbe0cb8e64389d742cf09eaf42702d72fd0a81?"
                        className="w-[50%] h-[50%] aspect-square"
                      />
                      <div className="mt-4 w-full text-base font-medium text-indigo-50">
                        No Upcoming Event
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {this.state.tab == "tab2" && (
              <>
                {ongoingEvents.length > 0 ? (
                  <>
                    {ongoingEvents.map((event, index) => (
                      <div
                        data-aos={ongoingEvents.length > 1 ? "fade-up" : ""}
                        onClick={() => {
                          window.location.href = `/detail-event/${event.id}`;
                        }}
                        className="flex gap-2 p-2 mt-3 bg-white rounded-2xl shadow-2xl items-center"
                      >
                        <div className="flex flex-col my-auto  h-[6.5rem]">
                          <img
                            loading="lazy"
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/be8abc9bbcd1c7dc31351d33f4557ea2a9a9519c3c54381dc80a54f44cc14731?"
                            className="shrink-0 aspect-[0.86] w-[90px] h-[6.5rem] object-cover rounded-md"
                          />
                        </div>
                        <div className="flex flex-col my-auto justify-start ">
                          <div className="text-indigo-500 font-bold text-sm">
                            {this.formatTanggal(event.tanggal)},{" "}
                            {event.jamMulai}
                          </div>
                          <div className="mt-2.5 text-base font-medium text-black flex justify-start">
                            {this.truncateText(event.judul, 20)}
                          </div>
                          <div className="flex gap-1.5 mt-2 text-zinc-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="22"
                              height="22"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fill="#6265EF"
                                d="M14.95 13.955a7.005 7.005 0 0 0 0-9.904a7 7 0 0 0-9.9 0a7.005 7.005 0 0 0 0 9.904l1.521 1.499l2.043 1.985l.133.118c.775.628 1.91.588 2.64-.118l2.435-2.37zM10 12a3 3 0 1 1 0-6a3 3 0 0 1 0 6"
                              />
                            </svg>
                            <div className="flex justify-start font-semibold text-sm">
                              {event.lokasi}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div
                      data-aos="fade-up"
                      className="flex flex-col px-5 items-center justify-center bg-transparent"
                    >
                      <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/7a985b11396aaba9d42b711bcccbe0cb8e64389d742cf09eaf42702d72fd0a81?"
                        className="w-[50%] h-[50%] aspect-square"
                      />
                      <div className="mt-4 w-full text-base font-medium text-indigo-50">
                        No Ongoing Event
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            {this.state.tab == "tab3" && (
              <>
                {selesaiEvents.length > 0 ? (
                  <>
                    {selesaiEvents.map((event, index) => (
                      <div
                        data-aos="fade-up"
                        onClick={() => {
                          window.location.href = `/detail-event/${event.id}`;
                        }}
                        className="flex gap-2 p-2 mt-3 bg-white rounded-2xl shadow-2xl items-center"
                      >
                        <div className="flex flex-col my-auto  h-[6.5rem]">
                          <img
                            loading="lazy"
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/be8abc9bbcd1c7dc31351d33f4557ea2a9a9519c3c54381dc80a54f44cc14731?"
                            className="shrink-0 aspect-[0.86] w-[90px] h-[6.5rem] object-cover rounded-md"
                          />
                        </div>
                        <div className="flex flex-col my-auto justify-start ">
                          <div className="text-indigo-500 font-bold text-sm">
                            {this.formatTanggal(event.tanggal)},{" "}
                            {event.jamMulai}
                          </div>
                          <div className="mt-2.5 text-base font-medium text-black flex justify-start">
                            {this.truncateText(event.judul, 20)}
                          </div>
                          <div className="flex gap-1.5 mt-2 text-zinc-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="22"
                              height="22"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fill="#6265EF"
                                d="M14.95 13.955a7.005 7.005 0 0 0 0-9.904a7 7 0 0 0-9.9 0a7.005 7.005 0 0 0 0 9.904l1.521 1.499l2.043 1.985l.133.118c.775.628 1.91.588 2.64-.118l2.435-2.37zM10 12a3 3 0 1 1 0-6a3 3 0 0 1 0 6"
                              />
                            </svg>
                            <div className="flex justify-start font-semibold text-sm">
                              {event.lokasi}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div
                      data-aos="fade-up"
                      className="flex flex-col px-5 items-center justify-center bg-transparent"
                    >
                      <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/7a985b11396aaba9d42b711bcccbe0cb8e64389d742cf09eaf42702d72fd0a81?"
                        className="w-[50%] h-[50%] aspect-square"
                      />
                      <div className="mt-4 w-full text-base font-medium text-indigo-50">
                        No Completed Event
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ListEvent;
