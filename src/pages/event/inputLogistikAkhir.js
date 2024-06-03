import * as React from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import Select from "react-tailwindcss-select";
import withRouter from "../../withRouter";
import "aos/dist/aos.css";
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
import { db } from "../../config/firebase";
import Swal from "sweetalert2";

class InputLogistikAkhir extends React.Component {
  constructor(props) {
    super(props);
    const idEvent = this.props.params.id;
    const logistik = this.props.params.logistik;

    this.state = {
      idLogistik: logistik,
      logistik: {},
      idEvent: idEvent,
      optionsLogistik: [],
      listLogistik: [],
      jumlah: 0,
    };
  }

  componentDidMount() {
    AOS.init({ duration: 700 });
    this.fetchData();
  }
  fetchData = async () => {
    const { idEvent, idLogistik } = this.state;
    try {
      const eventRef = doc(db, "event", idEvent);
      const organizerIdRef = doc(eventRef, "logistikAwal", idLogistik);
      const docSnap = await getDoc(organizerIdRef);

      if (docSnap.exists()) {
        console.log("Organizer data:", docSnap.data());
        this.setState({ logistik: docSnap.data() });
        return docSnap.data();
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error getting Organizer data:", error.message);
      return null;
    }
  };

  handleChangeLogistik = async (value) => {
    await new Promise((resolve) => {
      this.setState({ logistik: value }, resolve);
    });
  };

  isAnyStateEmpty() {
    const { logistik, jumlah, idEvent } = this.state;
    let emptyStates = [];

    if (!logistik) emptyStates.push("Nama Logistik");
    if (!jumlah) emptyStates.push("Jumlah");

    if (emptyStates.length > 0) {
      Swal.fire({
        title: "Gagal",
        text: `Harap Isi Kolom: ${emptyStates.join(", ")}`,
        icon: "error",
      });
      return true;
    }

    return false;
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Event ID:", this.state.idEvent); // Tambahkan log ini untuk debugging
    const cek = this.isAnyStateEmpty();

    if (!cek) {
      if (!this.state.idEvent) {
        alert("Event ID tidak valid");
        return;
      }

      try {
        const eventDocRef = doc(db, "event", this.state.idEvent);
        await addDoc(collection(eventDocRef, "logistikAkhir"), {
          namaLogistik: this.state.logistik.namaLogistik,
          jumlah: this.state.jumlah,
          satuan: this.state.logistik.satuan,
        });
        Swal.fire({
          title: "Berhasil",
          text: "Logistik berhasil disimpan",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        });

        window.location.href = `/list-logistik/${this.state.idEvent}`;
      } catch (error) {
        console.error("Error menambahkan logistik: ", error.message);
        Swal.fire({
          title: "Error",
          text: "Terjadi kesalahan saat menyimpan logistik: " + error.message,
          icon: "error",
        });
      }
    }
  };

  render() {
    const theme = sessionStorage.getItem("theme");
    const optionsLogistik = this.state.listLogistik.map((data) => ({
      value: data.id,
      label: data.namaLogistik,
      satuan: data.satuan,
    }));
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
                  window.location.href = `/list-logistik/${this.state.idEvent.id}`;
                }}
                className="w-[100%] flex justify-start items-center"
              >
                <div className="w-[30%] flex justify-start">
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
                <div className=" text-2xl font-medium flex justify-start w-[60%]  ">
                  Logistik Akhir
                </div>
              </button>
            </div>
          </div>
          <div className="mt-6 text-sm text-stone-900 dark:text-indigo-50 w-[100%] mb-2.5 text-[14px] flex justify-start">
            Logistik
          </div>
          <div
            data-aos="fade-up"
            data-aos-delay="180"
            className="flex gap-3.5 p-3 mt-3.5 font-black text-slate-900 whitespace-nowrap w-full bg-white rounded-xl border border-solid border-indigo-700"
          >
            <div
              type="number"
              className="flex-auto w-full my-auto border-none outline-none flex justify-start font-medium text-sm text-slate-900"
            >
              {this.state.logistik.namaLogistik}
            </div>
          </div>

          <div
            data-aos="fade-up"
            data-aos-delay="180"
            className="mt-6 text-sm text-stone-900 w-[100%] mb-2.5 text-[14px] flex justify-start dark:text-indigo-50"
          >
            Jumlah
          </div>
          <div
            data-aos="fade-up"
            data-aos-delay="180"
            className="flex gap-3.5 p-3 mt-3.5 font-black text-slate-900 whitespace-nowrap w-full bg-white rounded-xl border border-solid border-indigo-700"
          >
            <input
              type="number"
              className="flex-auto w-full my-auto border-none outline-none font-medium text-sm text-slate-900"
              onChange={(e) => {
                this.setState({ jumlah: e.target.value });
              }}
              required
            />
          </div>
          <div
            data-aos="fade-up"
            data-aos-delay="250"
            className="w-full flex justify-center items-center"
          >
            <button
              type="submit"
              onClick={this.handleSubmit}
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
        </div>
      </div>
    );
  }
}

export default withRouter(InputLogistikAkhir);
