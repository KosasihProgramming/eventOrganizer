import * as React from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import Select from "react-tailwindcss-select";

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
import { db } from "../../config/firebase";
class InputPelaksana extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      tanggalString: dayjs().locale("id").format("YYYY-MM-DD"),
      tanggal: dayjs().locale("id"),
      jam_mulai: dayjs().locale("id").format("HH:mm"),
      jam_selesai: "",
      bulan: dayjs().locale("id").format("MMMM"),
      lokasi: null,
      addLokasi: "",
      setLokasi: false,
      lokasiLain: false,
      optionsLokasi: [],
    };

    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {}
  handleEmailChange(event) {
    this.setState({ email: event.target.value });
  }

  handlePasswordChange(event) {
    this.setState({ password: event.target.value });
  }

  handleChangeLokasi = async (value) => {
    if (value.label == "Lainnya") {
      this.setState({ lokasiLain: true });
    } else {
      this.setState({ lokasiLain: false });
    }
    await new Promise((resolve) => {
      this.setState({ lokasi: value }, resolve);
    });
  };

  handleDateChange = (selectedDate) => {
    // Convert selectedDate to Dayjs object if it's not already
    const dayjsDate = dayjs(selectedDate);

    // Ensure dayjsDate is a valid Dayjs object
    if (!dayjsDate.isValid()) {
      return; // Handle invalid date selection appropriately
    }

    // Subtract one day from the selected date

    // Format the modified date in the desired ISO 8601 format

    const formattedDate = dayjsDate.format("HH:mm");
    console.log(formattedDate, "jam");
    this.setState({
      jam_mulai: formattedDate,
      tanggal: selectedDate,
    });
  };

  handleSubmit(event) {
    event.preventDefault();
    // Logic untuk menangani submit login, seperti mengirim data ke API
    console.log("Email:", this.state.email);
    console.log("Password:", this.state.password);
  }

  render() {
    const theme = sessionStorage.getItem("theme");
    const optionsUser = [
      { value: "Dalam Kota", label: "Dalam Kota" },
      { value: "Luar Kota", label: "Luar Kota" },
    ];
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
        <div className="flex flex-col px-7 py-8 mx-auto w-full text-sm font-medium leading-6 bg-white dark:bg-slate-900 h-[100vh]">
          <div className="flex w-full ">
            <div className=" flex justify-between items-center relative mb-8 w-full  bg-white dark:p-2 rounded-xl ">
              <button
                onClick={() => {
                  window.location.href = `/profil`;
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
                  Input Pelaksana
                </div>
              </button>
            </div>
          </div>
          <form onSubmit={this.handleSubmit}>
            <div className="mt-6 text-sm text-stone-900 dark:text-indigo-50 w-[100%] mb-2.5 text-[14px] flex justify-start">
              Pelaksana
            </div>
            <div
              data-aos="fade-up"
              style={{ zIndex: "999" }}
              data-aos-delay="100"
              className="flex flex-col justify-center mt-6"
            >
              <Select
                options={optionsUser}
                name="Lokasi"
                placeholder="Pilih Pelaksana"
                value={this.state.lokasi}
                onChange={this.handleChangeLokasi}
                classNames={{
                  menuButton: ({ isDisabled }) =>
                    `ps-3 text-[15px] flex text-sm p-2 text-indigo-500 w-[100%] bg-indigo-100 rounded-lg shadow-md transition-all duration-300 focus:outline-none ${
                      isDisabled
                        ? "bg-indigo-100"
                        : "bg-indigo-100 focus:ring focus:ring-indigo-500/20"
                    }`,
                  menu: "absolute w-full bg-slate-50 shadow-lg border bg-white rounded  mt-1.5 text-sm text-gray-700 max-h-[20rem] min-h-[5rem] overflow-y-scroll",
                  listItem: ({ isSelected }) =>
                    `block transition duration-200 px-2 py-2 cursor-pointer select-none truncate rounded-lg ${
                      isSelected
                        ? "text-indigo-500 bg-slate-50"
                        : "text-indigo-500 hover:bg-indigo-100 hover:text-indigo-500"
                    }`,
                }}
              />
            </div>

            <div className="mt-6 text-sm text-stone-900 w-[100%] mb-2.5 text-[14px] flex justify-start dark:text-indigo-50">
              Posisi Pelaksana
            </div>
            <div className="flex gap-3.5 p-3 mt-6 font-black text-slate-900 whitespace-nowrap w-full bg-white rounded-xl border border-solid border-indigo-700">
              <input
                type="text"
                placeholder="Posisi Pelaksana"
                className="flex-auto w-full my-auto border-none outline-none font-medium text-sm text-slate-900"
                value={this.state.email}
                onChange={this.handleEmailChange}
                required
              />
            </div>
            <div className="w-full flex justify-center items-center">
              <button
                type="submit"
                className="flex gap-5 justify-between self-center py-3.5 pr-3.5 pl-20 mt-10 max-w-full text-base tracking-wider text-center text-white uppercase bg-indigo-500 rounded-2xl shadow-[0px_10px_35px_rgba(111,126,201,0.25)] w-[271px]"
              >
                <div className="my-auto text-base">Tambah</div>
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

export default InputPelaksana;
