import * as React from "react";
import { Tabs, Tab } from "react-bootstrap";
import "../../style/style.css";
import "aos/dist/aos.css";
import AOS from "aos";
import { db } from "../../config/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import dayjs from "dayjs";
import "dayjs/locale/id";
class ProfileUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: "tab1",
      name: "David Silbia",
      isReadMore: true,
      following: 350,
      followers: 346,
      user: null,
      id: "",
      foto: "https://static.promediateknologi.id/crop/0x0:0x0/0x0/webp/photo/p2/133/2024/03/13/Screenshot_20240313-084922_1-3458862638.png",
      events: [
        {
          date: "1st May - Sat - 2:00 PM",
          title: "A virtual evening of smooth jazz",
          imageSrc:
            "https://cdn.builder.io/api/v1/image/assets/TEMP/1af8f7bf7b987658a81fde68f4aa3ede8f7a53f648f8f752a5200e6b5394acb8?",
        },
        {
          date: "1st May - Sat - 2:00 PM",
          title: "Jo malone london’s mother’s day",
          imageSrc:
            "https://cdn.builder.io/api/v1/image/assets/TEMP/1af8f7bf7b987658a81fde68f4aa3ede8f7a53f648f8f752a5200e6b5394acb8?",
        },
        {
          date: "1st May - Sat - 2:00 PM",
          title: "Women's leadership conference",
          imageSrc:
            "https://cdn.builder.io/api/v1/image/assets/TEMP/1af8f7bf7b987658a81fde68f4aa3ede8f7a53f648f8f752a5200e6b5394acb8?",
        },
      ],
    };
  }
  componentDidMount = () => {
    AOS.init({ duration: 700 });
    const userEmail = sessionStorage.getItem("userEmail");
    this.getUser(userEmail);
  };
  getAllEvents = async (id) => {
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

      console.log(events, "jshsgsgssuafdhaydf yju");

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

      this.getAllEvents(userId);
      return { ...userData, id: userId };
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };
  handleTab = (key) => {
    this.setState({ tab: key });
  };
  formatKapital = (string) => {
    if (string) {
      return string
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
    }
  };

  toggleReadMore = () => {
    this.setState({ isReadMore: !this.state.isReadMore });
  };

  shortText = (text) => {
    const displayText = this.state.isReadMore
      ? text.slice(0, 50) + "..."
      : text;
    return displayText;
  };
  formatTanggal = (tanggal) => {
    const hari = dayjs(tanggal).locale("id").format("dddd");
    const bulan = dayjs(tanggal).locale("id").format("MMMM");
    const hasil =
      tanggal.substring(8, 10) + " " + bulan + " " + tanggal.substring(0, 4);
    console.log("tanggal", dayjs(tanggal).locale("id").format("MMMM"));

    return hasil;
  };

  render() {
    const theme = sessionStorage.getItem("theme");
    const longText =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in venenatis enim. Maecenas ut maximus turpis. Vivamus a arcu ultricies, finibus mi at, convallis massa. Sed tempor, ligula nec gravida aliquam, risus tortor vestibulum lectus, a commodo velit mi at metus. Praesent ut est nec lorem elementum congue. Cras convallis diam ut sapien porttitor, sed fermentum libero efficitur. Pellentesque eget turpis non erat convallis commodo. Donec sit amet semper lacus. In hac habitasse platea dictumst. Fusce facilisis auctor magna, at sagittis purus. Etiam vestibulum dolor vel tincidunt fermentum. Fusce in risus vitae ligula laoreet iaculis.";

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
        <div className="flex flex-col pt-8 justify-center mx-auto w-full  bg-white dark:bg-slate-900 overflow-y-scroll ">
          <div className="flex overflow-x-hidden relative flex-col px-5 w-full aspect-[0.46]">
            <div className="flex w-full  ">
              <div className=" flex justify-between items-center relative mb-8 w-full  bg-white dark:p-2 rounded-xl ">
                <button
                  onClick={() => {
                    window.location.href = `/`;
                  }}
                  className="w-[100%] flex justify-start items-center"
                >
                  <div className="w-[40%] flex justify-start">
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
                  <div className="w-[60%] flex justify-start text-2xl font-medium ">
                    Profil
                  </div>
                </button>
              </div>
            </div>
            <div className="flex w-full  justify-center items-center ">
              <div className="w-[7rem] h-[7rem] rounded-full ">
                <img
                  loading="lazy"
                  src={this.state.foto}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            <div className="relative self-center  text-2xl font-medium text-center text-gray-900 mt-4 dark:text-indigo-50">
              {this.state.user != null
                ? this.formatKapital(this.state.user.nama)
                : ""}
            </div>
            <div className="flex relative gap-5 items-start self-center mt-4 whitespace-nowrap">
              <div className="flex flex-col">
                <div className="self-center text-base font-medium leading-9 text-gray-900 dark:text-indigo-50">
                  {this.state.events.length}
                </div>
                <div className=" text-sm font-black leading-6 text-center text-gray-500">
                  Event DiIkuti
                </div>
              </div>
              <div className="shrink-0 self-stretch my-auto w-px h-8 border border-solid bg-zinc-300 border-zinc-300" />
              <div className="flex flex-col">
                <div className="self-center text-base font-medium leading-9 text-gray-900 dark:text-indigo-50">
                  {this.state.followers}
                </div>
                <div className=" text-sm font-black leading-6 text-center text-gray-500">
                  Followers
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                window.location.href = `/update-profil`;
              }}
              className="flex justify-center relative gap-4 mt-6 text-base font-black leading-6 text-center whitespace-nowrap "
            >
              <div className="flex items-center  w-[50%]  gap-2 px-6 py-2 text-indigo-500 rounded-xl border border-indigo-500 border-solid font-semibold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                >
                  <g fill="none" fill-rule="evenodd">
                    <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                    <path
                      fill="#6366F1"
                      d="M20.131 3.16a3 3 0 0 0-4.242 0l-.707.708l4.95 4.95l.706-.707a3 3 0 0 0 0-4.243l-.707-.707Zm-1.414 7.072l-4.95-4.95l-9.09 9.091a1.5 1.5 0 0 0-.401.724l-1.029 4.455a1 1 0 0 0 1.2 1.2l4.456-1.028a1.5 1.5 0 0 0 .723-.401z"
                    />
                  </g>
                </svg>
                <div className="dark:text-indigo-50">Edit Profil</div>
              </div>
            </button>
            <div className="mt-2">
              <Tabs
                id="controlled-tab-example"
                activeKey={this.state.isLanjutPerjalanan}
                onSelect={this.handleTab}
                className={`${
                  theme == "true" ? "custom-tab-bar-dark" : "custom-tab-bar"
                }`}
              >
                <Tab eventKey="tab1" title="About Me"></Tab>
                <Tab eventKey="tab2" title="My Event"></Tab>
              </Tabs>
            </div>

            {this.state.tab == "tab2" ? (
              <>
                <div className="w-full flex flex-col justify-start items-start px-4 gap-6  flex-wrap mt-2 ">
                  {this.state.events.map((event, index) => (
                    <div
                      data-aos="fade-up"
                      key={index}
                      className="flex relative gap-5 self-start py-2.5 pr-2.5 pl-2.5 w-full  font-medium bg-white rounded-2xl shadow-lg"
                    >
                      <img
                        loading="lazy"
                        src="https://static.printler.com/cache/a/1/9/2/9/4/a19294db67cb10764511902e250345cff99de08c.jpg"
                        className="shrink-0 aspect-[0.86] w-[79px] rounded-xl"
                      />
                      <div className="flex flex-col my-auto  w-full justify-start">
                        <div className="text-xs text-indigo-500 uppercase flex justify-start">
                          {this.formatTanggal(event.tanggal)}
                        </div>
                        <div className="mt-3 text-lg leading-6 text-gray-900 flex justify-start">
                          {this.formatKapital(event.judul)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="w-full flex flex-col justify-start items-start px-4 gap-6  flex-wrap mt-5 ">
                  <div
                    data-aos="fade-up"
                    data-aos-delay="120"
                    className=" w-full flex justify-start gap-5 p-2 rounded-xl items-center bg-white shadow-md  "
                  >
                    <div className="w-[3rem] bg-indigo-100 rounded-xl h-[3rem] flex justify-center items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="#6366F1"
                          d="m11.999 1.66l10.413 9.257l-1.329 1.495L20 11.449v10.55H4V11.455l-1.094.957l-1.317-1.505L4.338 8.5zm-6 8.038V20H9v-5h6v5h3V9.67l-6-5.33zM13 20v-3h-2v3zm0-13v2h2v2h-2v2h-2v-2H9V9h2V7z"
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col w-[70%] justify-between items-start">
                      <div className="font-medium text-base">Asal Klinik</div>
                      <div className="text-sm text-slate-600 font-normal">
                        {this.state.user != null
                          ? this.formatKapital(this.state.user.asalKlinik)
                          : ""}
                      </div>
                    </div>
                  </div>
                  <div
                    data-aos="fade-up"
                    className="  w-full flex justify-start gap-5 p-2 rounded-xl items-center bg-white shadow-md  "
                  >
                    <div className="w-[3rem] bg-indigo-100 rounded-xl h-[3rem] flex justify-center items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <g fill="none" fill-rule="evenodd">
                          <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                          <path
                            fill="#6366F1"
                            d="M8.172 15.829c3.845 3.845 7.408 4.266 8.454 4.305c1.264.046 2.554-.986 3.112-2.043c-.89-1.044-2.049-1.854-3.318-2.732c-.749.748-1.672 2.138-2.901 1.64c-.699-.281-2.425-1.076-3.933-2.585C8.077 12.906 7.283 11.18 7 10.482c-.498-1.231.896-2.156 1.645-2.905c-.878-1.29-1.674-2.479-2.716-3.324c-1.072.56-2.11 1.84-2.063 3.121c.039 1.046.46 4.609 4.306 8.455m8.38 6.304c-1.44-.053-5.521-.617-9.795-4.89c-4.273-4.274-4.836-8.354-4.89-9.795c-.08-2.196 1.602-4.329 3.545-5.162a1.47 1.47 0 0 1 1.445.159c1.608 1.173 2.717 2.95 3.67 4.342A1.504 1.504 0 0 1 10.35 8.7l-1.356 1.357C9.309 10.752 9.95 11.95 11 13c1.05 1.05 2.248 1.691 2.944 2.006l1.355-1.356a1.503 1.503 0 0 1 1.918-.171c1.42.984 3.088 2.077 4.304 3.634a1.47 1.47 0 0 1 .189 1.485c-.837 1.953-2.955 3.616-5.158 3.535"
                          />
                        </g>
                      </svg>
                    </div>
                    <div className="flex flex-col w-[70%] justify-between items-start">
                      <div className="font-semibold text-base">No. Telepon</div>
                      <div className="text-sm text-slate-600 font-normal">
                        {this.state.user != null ? this.state.user.nomorHp : ""}
                      </div>
                    </div>
                  </div>
                  <div
                    data-aos="fade-up"
                    data-aos-delay="200"
                    className="w-full max-w-sm p-4  rounded-lg shadow-md  bg-white "
                  >
                    <div className="text-justify ">
                      {this.shortText(longText)}
                      {longText.length > 50 && (
                        <span
                          onClick={this.toggleReadMore}
                          className="text-indigo-500 cursor-pointer"
                        >
                          {this.state.isReadMore ? " Read More" : " Show Less"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ProfileUser;
