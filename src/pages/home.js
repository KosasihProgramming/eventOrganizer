import * as React from "react";
import Navbar from "../component/navbar";
import Notif from "../component/notif";
import { db } from "../config/firebase";
import AOS from "aos";
import { collection, getDocs, query, where } from "firebase/firestore";
import "aos/dist/aos.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import dayjs from "dayjs";
import "dayjs/locale/id";
class Home extends React.Component {
  constructor(props) {
    super(props);
    const theme = sessionStorage.getItem("theme");

    this.state = {
      theme: theme,
      events: [],
      tanggalString: dayjs().locale("id").format("YYYY-MM-DD"),
      isAda: false,
      myEvent: null,
      upcomingEvents: [],
      selesaiEvents: [],
      tab: "tab2",
      ongoingEvents: [],

      nearbyEvents: [
        {
          image: "https://cdn.builder.io/api/v1/image/assets/TEMP/...",
        },
        // Tambahkan event lainnya di sini jika perlu
      ],
    };
  }

  componentDidMount = () => {
    AOS.init({ duration: 700 });
    this.getAllEvents();
    const userEmail = sessionStorage.getItem("userEmail");
    this.getUser(userEmail);
  };

  getUser = async (email) => {
    try {
      const userRef = collection(db, "pelaksanaEvent");
      const q = query(userRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;

      console.log(userData, "userrrrr");

      // Set state with user data and ID
      this.setState({ user: { ...userData, id: userId } }, () => {});
      if (userData.foto != "null.jpg") {
        this.setState({ foto: userData.foto });
      }

      this.getMyEvents(userId);
      return { ...userData, id: userId };
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };
  getMyEvents = async (id) => {
    try {
      const eventsCollection = collection(db, "event");
      const snapshot = await getDocs(eventsCollection);
      const events = [];

      for (const doc of snapshot.docs) {
        const eventId = doc.id;
        const eventData = doc.data();
        const organizerRef = collection(db, `event/${eventId}/organizerId`);
        const organizerSnapshot = await getDocs(organizerRef);

        let hasMatchingOrganizer = false;
        organizerSnapshot.forEach((organizerDoc) => {
          const organizerData = organizerDoc.data();
          if (organizerData.refPelaksana === id) {
            hasMatchingOrganizer = true;
          }
        });

        if (hasMatchingOrganizer) {
          events.push({ id: eventId, ...eventData });
        }
      }

      const upcomingEvents = events.filter(
        (event) => event.status === "upcoming"
      );
      const selesaiEvents = events.filter(
        (event) => event.status === "completed"
      );
      const ongoingEvents = events.filter(
        (event) => event.status === "ongoing"
      );

      console.log(events[0], "jshsgsgssuafdhayddddf yju");

      console.log("rencana", upcomingEvents);
      console.log("selesai", selesaiEvents);
      console.log("saat ini ", ongoingEvents);

      this.setState({
        myEvent: events[0],
      });
    } catch (error) {
      console.error("Error getting Events:", error);
    }
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
        upcomingEvents:
          upcomingEvents.length == 1 ? upcomingEvents[0] : upcomingEvents,
        ongoingEvents,
        selesaiEvents,
        isAda: true,
      });
    } catch (error) {
      console.error("Error getting Events:", error);
    }
  };

  handleTheme = (value) => {
    this.setState({ theme: value });
  };
  formatTanggal = (tanggal) => {
    const hari = dayjs(tanggal).locale("id").format("dddd");
    const bulan = dayjs(tanggal).locale("id").format("MMMM");
    const hasil =
      hari +
      ", " +
      tanggal.substring(8, 10) +
      " " +
      bulan +
      " " +
      tanggal.substring(0, 4);
    console.log("tanggal", dayjs(tanggal).locale("id").format("MMMM"));

    return hasil;
  };
  formatHari = (tanggal) => {
    const hari = dayjs(tanggal).locale("id").format("DD");
    return hari;
  };

  formatBulan = (tanggal) => {
    const bulan = dayjs(tanggal).locale("id").format("MMMM");

    return bulan;
  };
  formatKapital = (string) => {
    return string
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };
  render() {
    var settings = {
      dots: false,
      infinite: true,
      autoplay: true,
      speed: 2000,
      autoplaySpeed: 3000,
      cssEase: "linear",
      slidesToShow: 2,
      slidesToScroll: 1,
    };
    console.log("tangal haua", this.state.upcomingEvents[0]);
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
        className={`${this.state.theme == "true" ? "dark" : ""}`}
      >
        <div className="flex flex-col pb-6 mx-auto w-full bg-white dark:bg-slate-900  px-2 ">
          <div className="flex gap-5 justify-between items-start px-6 py-8 w-full font-medium text-center text-violet-50 bg-indigo-600 rounded-b-3xl">
            <div className="flex flex-col mt-3.5 ">
              <Navbar theme={this.handleTheme} />
            </div>
            <div className="flex flex-col mt-3.5 ">
              <div className="self-center text-sm">Event Organizer</div>
              <div className="mt-11 text-base">
                {this.formatTanggal(this.state.tanggalString)}
              </div>
            </div>
            <div className="w-[2.3rem] h-[2.3rem] mt-2.5 rounded-full p-2 flex justify-center items-center bg-indigo-400">
              {this.state.isAda == true && (
                <>
                  <Notif data={this.state.events} />
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between grow shrink-0 px-5 font-medium basis-0 w-full mt-6 ">
            <div className="text-lg leading-9 text-gray-900 dark:text-indigo-50">
              Event Saya Hari Ini
            </div>
          </div>
          <div className="flex flex-col justify-center self-center mt-3 w-full font-medium rounded-xl  bg-opacity-20 ">
            {this.state.myEvent !== null && (
              <>
                <div className="flex bg-blue-500 overflow-hidden relative flex-col items-start py-5 pr-5 pl-5 w-full aspect-[2.58] rounded-xl h-[10rem]">
                  <div className="absolute inset-1 z-10 size-full bg-black opacity-40 rounded-xl"></div>
                  <img
                    loading="lazy"
                    srcSet="https://cdn-cjhkj.nitrocdn.com/krXSsXVqwzhduXLVuGLToUwHLNnSxUxO/assets/images/optimized/rev-89b87c3/spotme.com/wp-content/uploads/2020/07/Hero-1.jpg"
                    className="object-cover absolute inset-0 size-full rounded-xl"
                  />
                  <div className="relative text-lg leading-9 text-indigo-100 z-20">
                    {this.state.myEvent.judul}
                  </div>
                  <div className="relative mt-2.5 text-sm font-medium text-indigo-100 z-20">
                    {this.formatTanggal(this.state.myEvent.tanggalAuto)}
                  </div>
                  <div className="relative mt-2.5 text-sm font-medium text-indigo-100 z-20  w-full p-0 flex justify-between items-center">
                    <div className="z-20 relative w-24 flex justify-start text-xs leading-6 text-white uppercase whitespace-nowrap  rounded-md">
                      {this.state.myEvent.jamMulai} -
                      {this.state.myEvent.jamSelesai}
                    </div>
                    <div
                      onClick={() => {
                        window.location.href = `/detail-event/${this.state.myEvent.id}`;
                      }}
                      className="z-20 relative w-24 justify-center px-3.5 py-3  text-xs leading-6 text-white uppercase whitespace-nowrap bg-indigo-600 rounded-md"
                    >
                      Cek Event
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col gap-4 mt-12 ">
            <div className="flex items-center justify-between grow shrink-0 px-4 font-medium basis-0 w-full ">
              <div className="text-lg leading-9 text-gray-900 dark:text-indigo-50">
                Upcoming Events
              </div>
              <div className="flex gap-1.5 text-sm font-medium items-center">
                <div className="text-indigo-500 dark:text-indigo-50 ">
                  See All
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4F46E5"
                    fill-rule="evenodd"
                    d="m9.005 4l8 8l-8 8L7 18l6.005-6L7 6z"
                  />
                </svg>
              </div>
            </div>
          </div>
          {this.state.upcomingEvents.length > 1 ? (
            <>
              <Slider {...settings}>
                {this.state.upcomingEvents.map((data, index) => (
                  <div className="flex flex-col px-2.5 pt-2.5 pb-4 font-medium bg-white rounded-2xl shadow-lg max-w-[180px] border border-indigo-200">
                    <div className="flex overflow-hidden relative gap-5 justify-between items-start self-center px-2.5 pt-2 pb-20 w-full text-sm leading-4 text-center text-red-400 uppercase aspect-[1.67]">
                      <img
                        loading="lazy"
                        srcSet="https://tmssl.akamaized.net/images/foto/galerie/ronaldo-cristiano-2017-real-madrid-ballon-d-or-2016-0026751808hjpg-1698686328-120749.jpg?lm=1698686338"
                        className="object-cover absolute inset-0 size-full rounded-lg"
                      />
                      <div className="relative justify-center items-center px-2 py-1 rounded-lg backdrop-blur-[3px] bg-white bg-opacity-90 ">
                        <span className="text-sm font-bold leading-normal text-red-400">
                          {this.formatHari(data.tanggalAuto)}
                        </span>
                        <br />
                        <span className="text-xs font-bold text-red-400 ">
                          {data.bulan}
                        </span>
                      </div>
                      <div className="relative justify-center items-center px-2 py-1 rounded-lg backdrop-blur-[3px] bg-white bg-opacity-90 ">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                        >
                          <path
                            fill="#EB5757"
                            d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-5 text-lg text-black">{data.judul}</div>

                    <div className="flex gap-1.5 mt-2.5 text-xs font-medium text-indigo-950 flex justify-between items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill="#4F46E5"
                          d="M14.95 13.955a7.005 7.005 0 0 0 0-9.904a7 7 0 0 0-9.9 0a7.005 7.005 0 0 0 0 9.904l1.521 1.499l2.043 1.985l.133.118c.775.628 1.91.588 2.64-.118l2.435-2.37zM10 12a3 3 0 1 1 0-6a3 3 0 0 1 0 6"
                        />
                      </svg>
                      <div className="flex-auto">{data.lokasi} </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center text-sm font-black w-full px-3 py-4 bg-gradient-to-r from-indigo-400 to-indigo-600  dark:from-indigo-500 dark:to-indigo-800 rounded-xl mt-5">
                <div className="flex flex-col px-2.5 pt-2.5 pb-4 font-medium bg-white rounded-2xl shadow-lg w-[220px] border border-indigo-200">
                  <div className="flex overflow-hidden relative gap-5 justify-between items-start self-center px-2.5 pt-2 pb-20 w-full text-sm leading-4 text-center text-red-400 uppercase aspect-[1.67]">
                    <img
                      loading="lazy"
                      srcSet="https://tmssl.akamaized.net/images/foto/galerie/ronaldo-cristiano-2017-real-madrid-ballon-d-or-2016-0026751808hjpg-1698686328-120749.jpg?lm=1698686338"
                      className="object-cover absolute inset-0 size-full rounded-lg"
                    />
                    <div className="relative justify-center items-center px-2 py-1 rounded-lg backdrop-blur-[3px] bg-white bg-opacity-90 ">
                      <span className="text-sm font-bold leading-normal text-red-400">
                        {this.formatHari(this.state.upcomingEvents.tanggalAuto)}
                      </span>
                      <br />
                      <span className="text-xs font-bold text-red-400 ">
                        {this.state.upcomingEvents.bulan}
                      </span>
                    </div>
                    <div className="relative justify-center items-center px-2 py-1 rounded-lg backdrop-blur-[3px] bg-white bg-opacity-90 ">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fill="#EB5757"
                          d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-5 text-lg text-black">
                    {this.formatKapital(
                      this.state.upcomingEvents.judul
                        ? this.state.upcomingEvents.judul
                        : "hai"
                    )}
                  </div>

                  <div className="flex gap-1.5 mt-2.5 text-xs font-medium text-indigo-950 flex justify-between items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill="#4F46E5"
                        d="M14.95 13.955a7.005 7.005 0 0 0 0-9.904a7 7 0 0 0-9.9 0a7.005 7.005 0 0 0 0 9.904l1.521 1.499l2.043 1.985l.133.118c.775.628 1.91.588 2.64-.118l2.435-2.37zM10 12a3 3 0 1 1 0-6a3 3 0 0 1 0 6"
                      />
                    </svg>
                    <div className="flex-auto">
                      {this.formatKapital(
                        this.state.upcomingEvents.lokasi
                          ? this.state.upcomingEvents.lokasi
                          : ""
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-5 self-center px-5 mt-9 w-full ">
            <div className="flex items-center justify-between grow shrink-0 font-medium basis-0 w-full ">
              <div className="text-lg leading-9 text-gray-900 dark:text-indigo-50">
                Event Lainnya
              </div>
              <div className="flex gap-1.5  text-sm font-medium items-center">
                <div className="text-indigo-500 dark:text-indigo-50">
                  See All
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4F46E5"
                    fill-rule="evenodd"
                    d="m9.005 4l8 8l-8 8L7 18l6.005-6L7 6z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex flex-col text-sm font-black w-full px-3 py-4 bg-indigo-200 dark:bg-indigo-500 rounded-xl mt-5">
            {this.state.events.map((data, index) => (
              <div
                onClick={() => {
                  window.location.href = `/detail-event/${data.id}`;
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
                <div className="flex flex-col my-auto ">
                  <div className="text-indigo-500 font-semibold text-sm">
                    {this.formatTanggal(data.tanggalAuto)} • {data.jamMulai}
                  </div>
                  <div className="mt-2.5 text-base font-medium text-black">
                    {data.judul}
                  </div>
                  <div className="flex gap-1.5 mt-2 text-zinc-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill="#4F46E5"
                        d="M14.95 13.955a7.005 7.005 0 0 0 0-9.904a7 7 0 0 0-9.9 0a7.005 7.005 0 0 0 0 9.904l1.521 1.499l2.043 1.985l.133.118c.775.628 1.91.588 2.64-.118l2.435-2.37zM10 12a3 3 0 1 1 0-6a3 3 0 0 1 0 6"
                      />
                    </svg>
                    <div className="flex-auto font-semibold text-sm">
                      {data.lokasi}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
