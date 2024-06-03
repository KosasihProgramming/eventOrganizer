import * as React from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import Select from "react-tailwindcss-select";
import withRouter from "../../withRouter";
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
import "aos/dist/aos.css";
import Swal from "sweetalert2";
import AOS from "aos";
class InputCatatan extends React.Component {
  constructor(props) {
    super(props);
    const idEvent = this.props.params.id;

    this.state = {
      judul: "",
      deskripsi: "",
      idEvent,
    };
  }

  componentDidMount = () => {
    AOS.init({ duration: 700 });
  };
  handleSubmit = async (e) => {
    e.preventDefault();
    const { idEvent } = this.state;
    console.log("Event ID:", idEvent); // Tambahkan log ini untuk debugging
    if (!idEvent) {
      alert("Event ID tidak valid");
      return;
    }

    try {
      const docRef = doc(db, "event", idEvent);
      await addDoc(collection(docRef, "catatan"), {
        judul: this.state.judul,
        deskripsi: this.state.deskripsi,
        status: false,
      });
      this.setState({
        judul: "",
        deskripsi: "",
        status: false,
      });
      Swal.fire({
        title: "Berhasil",
        text: "Catatan berhasil disimpan",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });

      window.location.href = `/list-catatan/${this.state.idEvent}`;
    } catch (error) {
      console.error("Error menambahkan catatan: ", error.message);
      Swal.fire({
        title: "Error",
        text: "Terjadi kesalahan saat menyimpan Catatan: " + error.message,
        icon: "error",
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
          marginBottom: "1rem",
        }}
        className={`${theme == "true" ? "dark" : ""}`}
      >
        <div className="flex flex-col px-7 py-8 mx-auto w-full text-sm font-medium leading-6 bg-white dark:bg-slate-900 h-[100vh]">
          <div className="flex w-full ">
            <div className=" flex justify-between items-center relative mb-8 w-full  bg-white dark:p-2 rounded-xl ">
              <button
                onClick={() => {
                  window.location.href = `/list-catatan/${this.state.idEvent}`;
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
                  Input Catatan
                </div>
              </button>
            </div>
          </div>
          <form onSubmit={this.handleSubmit}>
            <div
              data-aos="fade-up"
              className="mt-6 text-sm text-stone-900 dark:text-indigo-50 w-[100%] mb-2.5 text-[14px] flex justify-start"
            >
              Judul Catatan
            </div>
            <div
              data-aos="fade-up"
              className="flex gap-3.5 p-3 mt-6 font-black text-slate-900 whitespace-nowrap w-full bg-white rounded-xl border border-solid border-indigo-700"
            >
              <input
                type="text"
                placeholder="Judul Event"
                className="flex-auto w-full my-auto border-none outline-none font-medium text-sm text-slate-900"
                onChange={(e) => {
                  this.setState({ judul: e.target.value });
                }}
                required
              />
            </div>
            <div
              data-aos="fade-up"
              data-aos-delay="150"
              className="mt-6 text-sm text-stone-900 w-[100%] mb-2.5 text-[14px] flex justify-start dark:text-indigo-50"
            >
              Deskripsi Catatan
            </div>
            <div
              data-aos="fade-up"
              data-aos-delay="150"
              className="flex gap-5 flex-wrap justify-between p-3 mt-5 w-full font-black text-gray-500 bg-white rounded-xl max-h-[10rem] border border-solid border-indigo-700"
            >
              <div className="flex w-full">
                <textarea
                  placeholder="Deskripsi Event"
                  className="w-full flex flex-wrap border-none outline-none font-medium text-sm text-slate-900  whitespace-normal max-h-[10rem] min-h-[5rem]"
                  onChange={(e) => {
                    this.setState({ deskripsi: e.target.value });
                  }}
                  required
                />
              </div>
            </div>
            <div
              data-aos="fade-up"
              data-aos-delay="200"
              className="w-full flex justify-center items-center"
            >
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

export default withRouter(InputCatatan);
