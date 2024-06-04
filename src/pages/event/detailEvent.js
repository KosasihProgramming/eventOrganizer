import React, { Component } from "react";
import Swal from "sweetalert2";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  doc,
  query,
  limit,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import dayjs from "dayjs";
import "dayjs/locale/id";
import { db } from "../../config/firebase";
import withRouter from "../../withRouter";
import PopupComponent from "../../component/opoup";
import firebase from "firebase/app";
import "firebase/firestore";
import "aos/dist/aos.css";
import AOS from "aos";
class DetailEvent extends Component {
  constructor(props) {
    super(props);
    const idEvent = this.props.params;

    this.state = {
      idEvent: idEvent,
      showAll: false,
      pelaksana: [],
      pelaksanaList: [],
      selectedUser: "",
      detailEvent: null,
      organizerDetails: [],
      cek: false,
      status: "",
      tanggalString: dayjs().locale("id").format("YYYY-MM-DD"),
      jam_mulai: dayjs().locale("id").format("HH:mm"),
      isSudah: false,
      peran: sessionStorage.getItem("peran"),
    };
  }
  componentDidMount() {
    this.getAllPelaksana();
    // this.checkOrganizer();
    this.fetchEventDetails();
    AOS.init({ duration: 700 });
    this.fetchOrganizerDetails();
  }
  isTimeAGreaterThanTimeB = (jamA, jamB) => {
    const [hourA, minuteA] = jamA.split(":").map(Number);
    const [hourB, minuteB] = jamB.split(":").map(Number);

    if (hourA > hourB) {
      return true;
    } else if (hourA === hourB && minuteA > minuteB) {
      return true;
    } else {
      return false;
    }
  };
  cekJamMUlai = async (jam, tanggal) => {
    if (tanggal == this.state.tanggalString) {
      const cekJam = this.isTimeAGreaterThanTimeB(this.state.jam_mulai, jam);
      if (cekJam == true) {
        try {
          const eventRef = doc(db, "event", this.state.idEvent.id);
          await updateDoc(eventRef, {
            status: "ongoing",
          });
          this.fetchEventDetails();
          this.setState({ cek: true }); // Set cek to true only when update is successful
        } catch (error) {
          console.error("Error updating document: ", error);
          this.setState({ cek: false }); // Reset cek to false when update fails
        }
      } else {
        this.setState({ cek: false }); // Reset cek to false when condition is not met
      }
    }
  };
  handleShowAll = () => {
    this.setState({ showAll: !this.state.showAll });
  };
  getAllPelaksana = async () => {
    try {
      const pelaksanaCollection = collection(db, "pelaksanaEvent");
      const snapshot = await getDocs(pelaksanaCollection);
      const pelaksana = [];

      snapshot.forEach((doc) => {
        pelaksana.push({ id: doc.id, ...doc.data() });
      });
      console.log(pelaksana);

      this.setState({
        pelaksana: pelaksana,
      });
    } catch (error) {
      console.error("Error getting Events:", error);
    }
  };

  checkOrganizer = async () => {
    const { idEvent } = this.state;
    try {
      const organizerIdCollection = collection(
        db,
        "event",
        idEvent.id,
        "organizerId"
      );
      const snapshot = await getDocs(organizerIdCollection);
      if (!snapshot.empty) {
        console.log(snapshot.data(), "Pelaksana");

        this.setState({ pelaksanaList: snapshot.data() });
      }
    } catch (error) {
      console.error("Error checking organizer:", error.message);
    }
  };

  handleSelectUser = (event) => {
    this.setState({ selectedUser: event.target.value });
  };

  fetchEventDetails = async () => {
    const { idEvent } = this.state;

    try {
      const eventDoc = await getDoc(doc(db, "event", idEvent.id));
      if (eventDoc.exists()) {
        this.setState({ detailEvent: eventDoc.data() });

        const data = eventDoc.data();
        if (data.status == "upcoming") {
          this.cekJamMUlai(data.jamMulai, data.tanggal);
        }

        console.log(eventDoc.data(), "adaaaa");
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  fetchOrganizerDetails = async () => {
    const { idEvent } = this.state;

    try {
      const organizerCollectionRef = collection(
        db,
        "event",
        idEvent.id,
        "organizerId"
      );
      const organizerSnapshot = await getDocs(organizerCollectionRef);
      const organizerDetails = [];

      for (let organizerDoc of organizerSnapshot.docs) {
        let organizerData = organizerDoc.data();
        organizerData.id = organizerDoc.id; // Tambahkan id dokumen ke data

        const refPelaksana = organizerData.refPelaksana;

        // Fetch the pelaksana details based on refPelaksana
        const pelaksanaDoc = await getDoc(
          doc(db, "pelaksanaEvent", refPelaksana)
        );
        if (pelaksanaDoc.exists()) {
          organizerData.pelaksanaDetails = pelaksanaDoc.data();
        } else {
          console.log("No such pelaksana document!");
        }

        organizerDetails.push(organizerData);

        console.log(organizerDetails, "dataDwetail");
      }

      this.setState({ organizerDetails, isSudah: true });
    } catch (error) {
      console.error("Error fetching organizer details:", error);
    }
  };

  handleAddPelaksana = async (data, jabatan) => {
    const { idEvent } = this.state;
    try {
      const eventRef = doc(db, "event", idEvent.id);
      const organizerIdRef = collection(eventRef, "organizerId");
      await addDoc(organizerIdRef, {
        refPelaksana: data,
        posisi: jabatan,
      });

      // this.fetchOrganizerDetails();
    } catch (error) {
      console.error("Error creating Organizer ID:", error.message);
      alert("Failed to create Organizer ID: " + error.message);
    }
  };
  formatTanggal = (tanggal) => {
    const hari = dayjs(tanggal).locale("id").format("dddd");
    const bulan = dayjs(tanggal).locale("id").format("MMMM");
    const hasil =
      tanggal.substring(8, 10) + " " + bulan + " " + tanggal.substring(0, 4);
    console.log("tanggal", dayjs(tanggal).locale("id").format("MMMM"));

    return hasil;
  };
  formatKapital = (string) => {
    return string
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };
  handleUpdate = async (status) => {
    try {
      const eventRef = doc(db, "event", this.state.idEvent.id);
      await updateDoc(eventRef, {
        status: status,
      });
      this.fetchEventDetails();
      Swal.fire({
        title: "Berhasil",
        text: `Event  ${
          status == "ongoing" ? "Sedang Berlangsung" : "Telah Selesai"
        } `,
        icon: "success",
      });
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };
  handleDeleteOrganizer = async (organizerId) => {
    try {
      const eventRef = doc(db, "event", this.state.idEvent.id);
      const organizerIdRef = doc(eventRef, "organizerId", organizerId);
      await deleteDoc(organizerIdRef);
      this.fetchOrganizerDetails();
    } catch (error) {
      console.error("Error deleting Organizer ID:", error.message);
      alert("Failed to delete Organizer ID: " + error.message);
    }
  };
  render() {
    const {
      date,
      dayTime,
      venue,
      address,
      organizerName,
      organizerTitle,
      aboutEvent,
      followText,
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
        <div className="flex w-full px-10 bottom-[0%] fixed  bg-gradient-to-t from-indigo-50 dark:from-slate-800 to-transparent pt-4">
          {this.state.detailEvent != null && (
            <>
              {this.state.detailEvent.status == "upcoming" && (
                <>
                  <div className=" flex justify-between items-center relative mb-12 w-full p-2 mt-3 bg-indigo-500 rounded-xl shadow-xl border border-indigo-500">
                    <button
                      onClick={() => {
                        this.handleUpdate("ongoing");
                      }}
                      className="w-[100%] flex justify-center items-center"
                    >
                      <div className="text-indigo-100 text-base  font-medium">
                        Event Dimulai
                      </div>
                    </button>
                  </div>
                </>
              )}

              {this.state.detailEvent.status == "ongoing" && (
                <>
                  <div className=" flex justify-between items-center relative mb-12 w-full p-2 mt-3 bg-indigo-500 rounded-xl shadow-xl border border-indigo-500">
                    <button
                      onClick={() => {
                        this.handleUpdate("completed");
                      }}
                      className="w-[100%] flex justify-center items-center"
                    >
                      <div className="text-indigo-100 text-base  font-medium">
                        Event Selesai
                      </div>
                    </button>
                  </div>
                </>
              )}

              {this.state.detailEvent.status == "completed" && <></>}
            </>
          )}
        </div>

        <div className="flex flex-col pb-[6.5rem] mx-auto w-full bg-white dark:bg-slate-900 ">
          <div className="flex overflow-hidden relative flex-col bg-white dark:bg-slate-900 h-[14rem]  w-full aspect-[1.49]">
            <img
              loading="lazy"
              srcSet="https://cdn-cjhkj.nitrocdn.com/krXSsXVqwzhduXLVuGLToUwHLNnSxUxO/assets/images/optimized/rev-89b87c3/spotme.com/wp-content/uploads/2020/07/Hero-1.jpg"
              className="object-cover absolute inset-0 w-full h-[80%]"
            />
            <div className="flex w-full px-10 top-[65%] z-10 absolute">
              <div className=" flex justify-between items-center relative mb-12 w-full p-2 mt-3 bg-indigo-500 dark:bg-slate-900 rounded-xl shadow-xl border border-transparent dark:border-indigo-300">
                <div className="w-[100%] flex justify-center items-center">
                  <div className="text-indigo-100 text-base  font-medium dark:text-indigo-300">
                    {this.state.detailEvent != null && (
                      <>
                        {this.state.detailEvent.status == "upcoming" && (
                          <>Rencana</>
                        )}
                        {this.state.detailEvent.status == "ongoing" && (
                          <>Berlangsung</>
                        )}
                        {this.state.detailEvent.status == "completed" && (
                          <>Selesai</>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-full px-4">
              <div className=" flex justify-between items-center relative mb-12 w-full p-2 mt-3 bg-white rounded-xl shadow-2xl">
                <button
                  onClick={() => {
                    window.location.href = "/list-event";
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
                  <div className=" text-2xl font-medium flex justify-start w-[60%]">
                    Detail Event
                  </div>
                </button>

                <div className="w-[40%] flex justify-end items-center ">
                  {" "}
                  <button
                    onClick={() => {
                      window.location.href = `/update-event/${this.state.idEvent.id}`;
                    }}
                    className="w-[2.3rem] h-[2.3rem] rounded-lg px-2 py-1 flex justify-center items-center bg-indigo-100 border border-indigo-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fill="none"
                        stroke="#4F46E5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M1.75 11.25v3h3l9.5-9.5l-3-3zm7-6.5l2.5 2.5"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col px-5 mt-2 w-full">
            <div
              data-aos="fade-up"
              className="text-3xl flex justify-start font-semibold text-gray-900 dark:text-indigo-50 "
            >
              {this.state.detailEvent == null
                ? ""
                : this.formatKapital(this.state.detailEvent.judul)}
            </div>

            <div className="w-full  flex flex-col justify-start  gap-5 mt-3  ">
              <div
                data-aos="fade-up"
                className=" w-full flex justify-start gap-5 p-2 rounded-xl items-center bg-white shadow-md  "
              >
                <div className="w-[3rem] bg-indigo-100 rounded-xl h-[3rem] flex justify-center items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#6366F1"
                      d="M7.75 2.5a.75.75 0 0 0-1.5 0v1.58c-1.44.115-2.384.397-3.078 1.092c-.695.694-.977 1.639-1.093 3.078h19.842c-.116-1.44-.398-2.384-1.093-3.078c-.694-.695-1.639-.977-3.078-1.093V2.5a.75.75 0 0 0-1.5 0v1.513C15.585 4 14.839 4 14 4h-4c-.839 0-1.585 0-2.25.013z"
                    />
                    <path
                      fill="#6366F1"
                      fill-rule="evenodd"
                      d="M2 12c0-.839 0-1.585.013-2.25h19.974C22 10.415 22 11.161 22 12v2c0 3.771 0 5.657-1.172 6.828C19.657 22 17.771 22 14 22h-4c-3.771 0-5.657 0-6.828-1.172C2 19.657 2 17.771 2 14zm15 2a1 1 0 1 0 0-2a1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2a1 1 0 0 0 0 2m-4-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-6-3a1 1 0 1 0 0-2a1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2a1 1 0 0 0 0 2"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex flex-col w-[70%] justify-between items-start">
                  <div className="font-medium text-base">
                    {this.state.detailEvent == null
                      ? ""
                      : this.formatTanggal(this.state.detailEvent.tanggal)}
                  </div>
                  <div className="text-sm text-slate-600 font-semibold">
                    {this.state.detailEvent == null
                      ? ""
                      : dayjs(this.state.detailEvent.tanggal)
                          .locale("id")
                          .format("dddd")}
                    ,{" "}
                    {this.state.detailEvent == null
                      ? ""
                      : this.state.detailEvent.jamMulai}{" "}
                    -{" "}
                    {this.state.detailEvent == null
                      ? ""
                      : this.state.detailEvent.jamSelesai}
                  </div>
                </div>
              </div>
              <div
                data-aos="fade-up"
                className=" w-full flex justify-start gap-5 p-2 rounded-xl items-center bg-white shadow-md  "
              >
                <div className="w-[3rem] bg-indigo-100 rounded-xl h-[3rem] flex justify-center items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                  >
                    <g fill="none" fill-rule="evenodd">
                      <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                      <path
                        fill="#6366F1"
                        fill-rule="nonzero"
                        d="M6.72 16.64a1 1 0 0 1 .56 1.92c-.5.146-.86.3-1.091.44c.238.143.614.303 1.136.452C8.48 19.782 10.133 20 12 20s3.52-.218 4.675-.548c.523-.149.898-.309 1.136-.452c-.23-.14-.59-.294-1.09-.44a1 1 0 0 1 .559-1.92c.668.195 1.28.445 1.75.766c.435.299.97.82.97 1.594c0 .783-.548 1.308-.99 1.607c-.478.322-1.103.573-1.786.768C15.846 21.77 14 22 12 22s-3.846-.23-5.224-.625c-.683-.195-1.308-.446-1.786-.768c-.442-.3-.99-.824-.99-1.607c0-.774.535-1.295.97-1.594c.47-.321 1.082-.571 1.75-.766M12 2a7.5 7.5 0 0 1 7.5 7.5c0 2.568-1.4 4.656-2.85 6.14a16.402 16.402 0 0 1-1.853 1.615c-.594.446-1.952 1.282-1.952 1.282a1.71 1.71 0 0 1-1.69 0a20.736 20.736 0 0 1-1.952-1.282A16.29 16.29 0 0 1 7.35 15.64C5.9 14.156 4.5 12.068 4.5 9.5A7.5 7.5 0 0 1 12 2m0 5.5a2 2 0 1 0 0 4a2 2 0 0 0 0-4"
                      />
                    </g>
                  </svg>
                </div>
                <div className="flex flex-col w-[70%] justify-between items-start">
                  <div className="font-medium text-base">
                    {this.state.detailEvent == null
                      ? ""
                      : this.formatKapital(this.state.detailEvent.lokasi)}
                  </div>
                  <div className="text-sm text-slate-600 font-semibold">
                    Lokasi Event
                  </div>
                </div>
              </div>
              {this.state.organizerDetails
                .slice(
                  0,
                  this.state.showAll ? this.state.organizerDetails.length : 2
                )
                .map((data) => (
                  <div
                    data-aos="fade-up"
                    className=" w-full flex justify-start gap-5 p-2 rounded-xl items-center bg-white shadow-md  "
                  >
                    <div className="w-[3rem] bg-indigo-100 rounded-xl h-[3rem] flex justify-center items-center">
                      <img
                        loading="lazy"
                        srcSet={
                          data.pelaksanaDetails.foto == "null.jpg"
                            ? "https://www.dexerto.com/cdn-cgi/image/width=3840,quality=60,format=auto/https://editors.dexerto.com/wp-content/uploads/2023/04/20/one-piece-zoro-in-wano-arc.jpeg"
                            : data.pelaksanaDetails.foto
                        }
                        className="object-cover size-full rounded-xl"
                      />
                    </div>
                    <div className="flex flex-col w-[79%]  justify-between items-start">
                      <div className="font-semibold text-base">
                        {this.formatKapital(data.pelaksanaDetails.nama)}
                      </div>
                      <div className="text-sm text-slate-600 font-semibold flex w-full justify-between">
                        {this.formatKapital(data.posisi)}

                        <button
                          onClick={() => {
                            this.handleDeleteOrganizer(data.id);
                          }}
                          className="w-[2rem] h-[2rem] flex justify-center items-center bg-red-100 border border-red-500 rounded-lg"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                          >
                            <g fill="none" fill-rule="evenodd">
                              <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                              <path
                                fill="#e92b2b"
                                d="M14.28 2a2 2 0 0 1 1.897 1.368L16.72 5H20a1 1 0 1 1 0 2l-.003.071l-.867 12.143A3 3 0 0 1 16.138 22H7.862a3 3 0 0 1-2.992-2.786L4.003 7.07A1.01 1.01 0 0 1 4 7a1 1 0 0 1 0-2h3.28l.543-1.632A2 2 0 0 1 9.721 2zM9 10a1 1 0 0 0-.993.883L8 11v6a1 1 0 0 0 1.993.117L10 17v-6a1 1 0 0 0-1-1m6 0a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0v-6a1 1 0 0 0-1-1m-.72-6H9.72l-.333 1h5.226z"
                              />
                            </g>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              {this.state.organizerDetails.length > 2 && (
                <div
                  data-aos={this.state.isSudah == false ? "fade-up" : ""}
                  className="w-full flex justify-end "
                >
                  <button
                    className="  text-white rounded-lg text-sm "
                    onClick={this.handleShowAll}
                  >
                    {this.state.showAll
                      ? "Tampilkan Sedikit"
                      : "Tampilkan Semua"}
                  </button>
                </div>
              )}
              {this.state.peran == "Admin" && <></>}
              <div className="w-full pl-5 mt-1 flex justify-end items-center">
                <PopupComponent
                  data={this.state.pelaksana}
                  handleAdd={this.handleAddPelaksana}
                  fetchData={this.fetchOrganizerDetails}
                />
              </div>
            </div>
            <div
              data-aos={this.state.isSudah == false ? "fade-up" : ""}
              className="mt-6 text-lg font-semibold leading-9 text-gray-900 flex justify-start dark:text-indigo-50"
            >
              About Event
            </div>
            <div
              data-aos={this.state.isSudah == false ? "fade-up" : ""}
              className="mt-4 text-sm font-normal leading-7 text-justify  dark:text-indigo-50"
            >
              {this.state.detailEvent == null
                ? ""
                : this.formatKapital(this.state.detailEvent.deskripsi)}
              {/* <span className="text-indigo-500  dark:text-indigo-300">
                Read More...
              </span> */}
            </div>
          </div>
          <div
            data-aos={this.state.isSudah == false ? "fade-up" : ""}
            className="w-full px-5 mt-6 flex justify-between items-center"
          >
            <button
              onClick={() => {
                window.location.href = `/list-catatan/${this.state.idEvent.id}`;
              }}
              className="flex justify-center items-center gap-2 p-2 w-[9rem] bg-indigo-500 rounded-md  text-white text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <path
                  fill="white"
                  d="M20 22H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1m-1-2V4H5v16zM8 7h8v2H8zm0 4h8v2H8zm0 4h5v2H8z"
                />
              </svg>
              Catatan
            </button>

            <button
              onClick={() => {
                window.location.href = `/list-logistik/${this.state.idEvent.id}`;
              }}
              className="flex justify-center items-center gap-2 p-2 w-[9rem] bg-indigo-500 rounded-md  text-white text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 20 20"
              >
                <path
                  fill="white"
                  d="M11 3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1zm4 0h-3v2h3zm-1.5 4a.5.5 0 0 1 .5.5v5.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L13 13.293V7.5a.5.5 0 0 1 .5-.5M4 12a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm4 0H5v2h3zm-5.5 1a.5.5 0 0 1 .5.5V15a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1.5a.5.5 0 0 1 1 0V15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1.5a.5.5 0 0 1 .5-.5"
                />
              </svg>
              Logistik
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(DetailEvent);
