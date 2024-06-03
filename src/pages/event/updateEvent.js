import * as React from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import Select from "react-tailwindcss-select";
import "aos/dist/aos.css";
import { DatePicker } from "@mui/x-date-pickers";
import AOS from "aos";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { db } from "../../config/firebase";
import { Datepicker } from "flowbite-react";
import withRouter from "../../withRouter";

class EditEvent extends React.Component {
  constructor(props) {
    super(props);
    const idEvent = this.props.params.id;

    this.state = {
      email: "",
      password: "",
      tanggalString: dayjs().locale("id").format("YYYY-MM-DD"),
      tanggalStringB: dayjs().locale("id").format("MMM D, YYYY"),

      tanggal: dayjs().locale("id"),
      jam_mulai: dayjs("2024-06-12T08:40:00").locale("id"),
      jam_selesai: dayjs("2024-06-12T08:40:00").locale("id"),
      bulan: dayjs().locale("id").format("MMMM"),
      lokasi: null,
      addLokasi: "",
      setLokasi: false,
      lokasiLain: false,
      optionsLokasi: [],
      userId: sessionStorage.getItem("userID"),
      userEmail: sessionStorage.getItem("userEmail"),
      judul: "",
      deskripsi: "",
      jamMulai: "",
      jamSelesai: "",
      targetPeserta: null,
      idEvent: idEvent,
      detailEvent: {},
    };
  }

  componentDidMount() {
    AOS.init({ duration: 700 });
    this.getAllLokasi();
  }

  fetchEventDetails = async () => {
    const { idEvent } = this.state;

    try {
      const eventDoc = await getDoc(doc(db, "event", idEvent));
      if (eventDoc.exists()) {
        this.setState({ detailEvent: eventDoc.data() });

        const data = eventDoc.data();
        console.log(this.state.jam_mulai, "jam");
        const jamMulai = dayjs(
          data.tanggal + "T" + data.jamMulai + ":00"
        ).locale("id");
        const jamSelesai = dayjs(
          data.tanggal + "T" + data.jamSelesai + ":00"
        ).locale("id");
        const tanggal = dayjs(data.tanggal).locale("id").format("YYYY-MM-DD");
        const lokasi = this.state.optionsLokasi.filter(
          (item) => item.label === data.lokasi
        );

        const lokasiItem = {
          disabled: false,
          id: lokasi[0].id,
          label: lokasi[0].label,
          value: lokasi[0].value,
        };
        console.log(lokasiItem, "lks");

        this.setState({
          bulan: data.bulan,
          judul: data.judul,
          deskripsi: data.deskripsi,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai,
          tanggal: tanggal,
          tanggalString: data.tanggalAuto,
          tanggalStringB: data.tanggal,
          targetPeserta: data.targetPeserta,
          lokasi: lokasiItem,
          jamMulai: data.jamMulai,
          jamSelesai: data.jamSelesai,
        });
        console.log(eventDoc.data(), "adaaaa");
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  isAnyStateEmpty() {
    const {
      jam_selesai,
      bulan,
      addLokasi,
      setLokasi,
      lokasiLain,
      optionsLokasi: [],
      lokasi,
      judul,
      deskripsi,
      jamSelesai,
      targetPeserta,
    } = this.state;
    let emptyStates = [];

    if (!jamSelesai) emptyStates.push("Jam Selesai");
    if (!bulan) emptyStates.push("Bulan");
    if (!lokasi) emptyStates.push("Lokasi");
    if (!judul) emptyStates.push("Judul");
    if (!deskripsi) emptyStates.push("Deskripsi");
    if (!targetPeserta) emptyStates.push("Target Peserta");

    if (emptyStates.length > 0) {
      Swal.fire({
        title: "Gagal",
        text: `Harap Isi Kolom ${emptyStates}`,
        icon: "error",
      });
      return true;
    }

    return false;
  }
  handleSubmit = async (e) => {
    e.preventDefault();
    const cek = this.isAnyStateEmpty();

    if (cek == false) {
      try {
        const eventRef = doc(db, "event", this.state.idEvent);
        await updateDoc(eventRef, {
          jamMulai: this.state.jamMulai,
          jamSelesai: this.state.jamSelesai,
          judul: this.state.judul,
          deskripsi: this.state.deskripsi,
          targetPeserta: this.state.targetPeserta,
          tanggalAuto: this.state.tanggalString,
          tanggal: this.state.tanggalStringB,
          lokasi: this.state.lokasi.label,
          bulan: this.state.bulan,
        });
        Swal.fire({
          title: "Berhasil",
          text: "Anda Berhasil Merubah data",
          icon: "success",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = `/detail-event/${this.state.idEvent}`;
          }
        });
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }
  };
  getAllLokasi = async () => {
    const lokasiCollection = collection(db, "lokasi");
    try {
      const querySnapshot = await getDocs(lokasiCollection);
      const lokasiList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.setState({ optionsLokasi: lokasiList });
      await new Promise((r) => {
        this.setState({ optionsLokasi: lokasiList }, r);
      });
      this.fetchEventDetails();
      console.log({ lokasi: this.state.optionsLokasi });
    } catch (error) {
      console.error("Error mengambil data lokasi: ", error);
    }
  };

  handleChangeLokasi = async (value) => {
    if (value.label == "Lainnya") {
      this.setState({ lokasiLain: true });
    } else {
      this.setState({ lokasiLain: false });
    }
    console.log(value, "lakaj");
    await new Promise((resolve) => {
      this.setState({ lokasi: value }, resolve);
    });
  };

  handleDateChange = (name, selectedDate) => {
    // Convert selectedDate to Dayjs object if it's not already
    const dayjsDate = dayjs(selectedDate).locale("id");
    // Ensure dayjsDate is a valid Dayjs object
    if (!dayjsDate.isValid()) {
      return; // Handle invalid date selection appropriately
    }

    // Subtract one day from the selected date

    // Format the modified date in the desired ISO 8601 format

    if (name === "jamMulai") {
      const formattedDate = dayjsDate.format("HH:mm");
      console.log(selectedDate);
      this.setState({
        jamMulai: formattedDate,
      });
    } else if (name === "jamSelesai") {
      const formattedDate = dayjsDate.format("HH:mm");
      this.setState({
        jamSelesai: formattedDate,
      });
    } else {
      const formattedDate = dayjsDate.format("YYYY-MM-DD");
      const formattedBulan = dayjsDate.format("MMMM");
      const formattedDateB = dayjsDate.format("MMM DD, YYYY");

      this.setState({
        tanggalString: formattedDate,
        tanggalStringB: formattedDateB,

        tanggal: selectedDate,
        bulan: formattedBulan,
      });
    }
  };

  render() {
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
          backgroundColor: "#0F172A",
        }}
        className={`${theme == "true" ? "dark" : ""}`}
      >
        <div className="flex flex-col px-7 h-full py-8 mx-auto w-full text-sm font-medium leading-6 bg-white dark:bg-slate-900">
          <div className="flex w-full ">
            <div className=" flex justify-between items-center relative mb-8 w-full  bg-white dark:p-2 rounded-xl ">
              <button
                onClick={() => {
                  window.location.href = `/detail-event/${this.state.idEvent}`;
                }}
                className="w-[100%] flex justify-start items-center"
              >
                <div className="w-[33%] flex justify-start">
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
                  Input Event
                </div>
              </button>
            </div>
          </div>
          <form onSubmit={this.handleSubmit}>
            <div
              data-aos="fade-up"
              data-aos-delay="50"
              className="mt-6 text-sm text-stone-900 dark:text-indigo-50 w-[100%] mb-2.5 text-[14px] flex justify-start"
            >
              Judul Event
            </div>
            <div
              data-aos="fade-up"
              data-aos-delay="50"
              className="flex gap-3.5 p-3 mt-6 font-black text-slate-900 whitespace-nowrap w-full bg-white rounded-xl border border-solid border-indigo-700"
            >
              <input
                type="text"
                placeholder="Judul Event"
                value={this.state.judul}
                className="flex-auto w-full my-auto border-none outline-none font-medium text-sm text-slate-900"
                onChange={(e) => this.setState({ judul: e.target.value })}
                required
              />
            </div>
            <div
              data-aos="fade-up"
              data-aos-delay="100"
              className="mt-6 text-sm text-stone-900 w-[100%] mb-2.5 text-[14px] flex justify-start dark:text-indigo-50"
            >
              Deskripsi Event
            </div>
            <div
              data-aos="fade-up"
              data-aos-delay="100"
              className="flex gap-5 justify-between p-3 mt-5 w-full font-black text-gray-500 bg-white rounded-xl border border-solid border-indigo-700"
            >
              <div className="flex   w-full">
                <input
                  value={this.state.deskripsi}
                  type="text"
                  placeholder="Deskripsi Event"
                  className="w-full  flex-auto my-auto border-none outline-none font-medium text-sm text-slate-900"
                  onChange={(e) => this.setState({ deskripsi: e.target.value })}
                  required
                />
              </div>
            </div>
            <div
              data-aos="fade-up"
              data-aos-delay="150"
              className="mt-6 text-sm text-stone-900 w-[100%] mb-2.5 text-[14px] flex justify-start dark:text-indigo-50"
            >
              Tanggal
            </div>
            <div
              data-aos="fade-up"
              data-aos-delay="150"
              className="mt-3 text-sm dark:bg-indigo-50 text-stone-900 w-[100%] mb-2.5 text-[14px] flex justify-start border border-indigo-500"
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  defaultValue={this.state.tanggal}
                  className="w-full border border-indigo-500 dark:text-indigo-50"
                  onChange={(selectedDate) => {
                    this.handleDateChange("tanggal", selectedDate);
                  }}
                />
              </LocalizationProvider>
            </div>
            <div
              data-aos="fade-up"
              data-aos-delay="150"
              className="mt-6 text-sm text-stone-900 w-[100%] mb-2.5 text-[14px] flex justify-start dark:text-indigo-50"
            >
              Jam Mulai
            </div>
            <div
              data-aos="fade-up"
              data-aos-delay="150"
              className="mt-3 text-sm dark:bg-indigo-50 text-stone-900 w-[100%] mb-2.5 text-[14px] flex justify-start border border-indigo-500"
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MobileTimePicker
                  value={this.state.jam_mulai}
                  className="w-full border border-indigo-500 dark:text-indigo-50"
                  onChange={(selectedDate) => {
                    this.handleDateChange("jamMulai", selectedDate);
                  }}
                />
              </LocalizationProvider>
            </div>
            <div
              data-aos="fade-up"
              data-aos-delay="100"
              className="mt-6 text-sm text-stone-900 w-[100%] mb-2.5 text-[14px] flex justify-start dark:text-indigo-50"
            >
              Jam Selesai
            </div>
            <div
              data-aos="fade-up"
              data-aos-delay="100"
              className="mt-3 text-sm text-stone-900 dark:bg-indigo-50 w-[100%] mb-2.5 text-[14px] flex justify-start border border-indigo-500"
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MobileTimePicker
                  value={this.state.jam_selesai}
                  className="w-full border border-indigo-500"
                  onChange={(selectedDate) => {
                    this.handleDateChange("jamSelesai", selectedDate);
                  }}
                />
              </LocalizationProvider>
            </div>
            <div
              data-aos="fade-up"
              data-aos-delay="200"
              className="mt-6 text-sm text-stone-900 w-[100%] mb-2.5 text-[14px] flex justify-start dark:text-indigo-50"
            >
              Target Peserta
            </div>
            <div
              data-aos="fade-up"
              data-aos-delay="200"
              className="flex gap-5 justify-between p-3 mt-5 w-full font-black text-gray-500 bg-white rounded-xl border border-solid border-indigo-700"
            >
              <div
                data-aos="fade-up"
                data-aos-delay="200"
                className="flex   w-full"
              >
                <input
                  type="text"
                  placeholder="Target"
                  value={this.state.targetPeserta}
                  className="w-full  flex-auto my-auto border-none outline-none font-medium text-sm text-slate-900"
                  onChange={(e) =>
                    this.setState({ targetPeserta: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div
              data-aos="fade-up"
              data-aos-delay="150"
              className="mt-6 text-sm font-medium leading-5 flex justify-start w-full dark:text-indigo-50"
            >
              Pilih Lokasi Event
            </div>
            <div
              data-aos="fade-up"
              style={{ zIndex: "9999999999" }}
              data-aos-delay="150"
              className="flex flex-col justify-center mt-6"
            >
              <Select
                options={this.state.optionsLokasi}
                name="Lokasi"
                placeholder="Pilih Lokasi"
                value={this.state.lokasi}
                onChange={this.handleChangeLokasi}
                classNames={{
                  menuButton: ({ isDisabled }) =>
                    `ps-3 text-[15px] flex text-sm p-2 text-indigo-500 w-[100%] bg-indigo-100 rounded-lg shadow-md transition-all duration-300 focus:outline-none ${
                      isDisabled
                        ? "bg-indigo-100"
                        : "bg-indigo-100 focus:ring focus:ring-indigo-500/20"
                    }`,
                  menu: "absolute w-full bg-slate-50 shadow-lg  border bg-white rounded  mt-1.5 text-sm text-gray-700 h-[20rem] overflow-y-scroll",
                  listItem: ({ isSelected }) =>
                    `block transition duration-200 px-2 py-2 cursor-pointer select-none truncate rounded-lg ${
                      isSelected
                        ? "text-indigo-500 bg-slate-50"
                        : "text-indigo-500 hover:bg-indigo-100 hover:text-indigo-500"
                    }`,
                }}
              />
            </div>
            {this.state.lokasiLain == true && (
              <>
                <div
                  data-aos="fade-up"
                  data-aos-delay="50"
                  className="mt-5 text-sm font-medium leading-5 flex justify-start dark:text-indigo-50"
                >
                  Tambah Lokasi
                </div>
                <div
                  data-aos-delay="50"
                  data-aos="fade-up"
                  className="flex flex-col justify-center mt-5 "
                >
                  <input
                    type="text"
                    name="travelReason"
                    value={this.state.addLokasi}
                    onChange={(e) =>
                      this.setState({ addLokasi: e.target.value })
                    }
                    className={`shrink-0 h-11 bg-white rounded-lg shadow-md px-3 ${
                      this.state.addLokasi == "" ? "border border-red-500" : ""
                    } `}
                  />
                </div>
              </>
            )}

            <div className="w-full flex justify-center items-center">
              <button
                type="submit"
                className="flex gap-5 justify-between self-center py-3.5 pr-3.5 pl-20 mt-10 max-w-full text-base tracking-wider text-center text-white uppercase bg-indigo-500 rounded-2xl shadow-[0px_10px_35px_rgba(111,126,201,0.25)] w-[271px]"
              >
                <div className="my-auto text-base">Perbarui</div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="none"
                    stroke="#fff"
                    stroke-linecap="square"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v12m6-6H6"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withRouter(EditEvent);
