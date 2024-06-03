import * as React from "react";
import withRouter from "../../withRouter";
import "aos/dist/aos.css";
import AOS from "aos";
import {
  doc,
  collection,
  getDocs,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
class ListLogistik extends React.Component {
  constructor(props) {
    super(props);
    const idEvent = this.props.params;

    this.state = {
      namaLogistik: "",
      jumlah: 0,
      idEvent: idEvent,
      listLogistik: [],
      listLogistikAkhir: [],
      combineLogistik: [],
      capaianPeserta: "",
      isLogistik: false,
    };
  }

  componentDidMount = () => {
    AOS.init({ duration: 700 });
    this.fetchData();
  };
  fetchData = async () => {
    const { idEvent } = this.state;
    try {
      // Ambil data listLogistik
      const listLogistikRef = collection(
        doc(db, "event", idEvent.id),
        "logistikAwal"
      );
      const logistikSnapshot = await getDocs(listLogistikRef);
      const logistikData = logistikSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.setState({ listLogistik: logistikData });
      console.log(logistikData, "logistik");
      this.fetchDataAkhir(logistikData);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  fetchDataAkhir = async (array) => {
    const { idEvent } = this.state;
    try {
      // Ambil data listLogistik
      const listLogistikRef = collection(
        doc(db, "event", idEvent.id),
        "logistikAkhir"
      );
      const logistikSnapshot = await getDocs(listLogistikRef);
      const logistikData = logistikSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.setState({ listLogistikAkhir: logistikData });
      const logistik = logistikData.map((data) => ({
        namaLogistik: data.namaLogistik,
        jumlahAkhir: data.jumlah,
        satuan: data.satuan,
      }));
      if (logistikData.length > 0) {
        this.setState({ isLogistik: true });
      }
      const gabung = this.mergeArraysByNama(array, logistik);
      this.setState({ combineLogistik: gabung });
      console.log(logistikData, "logistik");
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };
  mergeArraysByNama = (array1, array2) => {
    // Gabungkan kedua array menjadi satu
    const combinedArray = [...array1, ...array2];

    // Gunakan reduce untuk menggabungkan objek yang memiliki nama yang sama
    const mergedArray = combinedArray.reduce((acc, obj) => {
      const existingObj = acc.find(
        (item) => item.namaLogistik === obj.namaLogistik
      );
      if (existingObj) {
        // Gabungkan objek jika nama sudah ada
        Object.assign(existingObj, obj);
      } else {
        // Tambahkan objek baru jika nama belum ada
        acc.push({ ...obj });
      }
      return acc;
    }, []);

    return mergedArray;
  };
  handleClick = () => {
    window.location.href = `/input-logistik/${this.state.idEvent.id}`;
  };
  render() {
    const theme = sessionStorage.getItem("theme");
    const { listLogistik, capaianPeserta, combineLogistik } = this.state;
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
        <div className="flex flex-col px-4 pb-2 mx-auto w-full bg-white dark:bg-slate-900 min-h-[100vh]">
          <div className="flex justify-between items-center relative w-full  bg-white dark:p-2 rounded-xl mt-8">
            <button
              onClick={() => {
                window.location.href = `/detail-event/${this.state.idEvent.id}`;
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
                List Logistik
              </div>
            </button>
            <div className="flex gap-4">
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

          <div className="flex flex-col text-sm font-black w-full px-3 py-4 bg-indigo-200 dark:bg-indigo-500 rounded-xl mt-10">
            {combineLogistik.length > 0 ? (
              <>
                {combineLogistik.map((logistik) => (
                  <div
                    data-aos={combineLogistik.length == 1 ? "" : "fade-up"}
                    className="flex gap-2 p-2 mt-3 bg-white rounded-2xl shadow-2xl items-center"
                    onClick={
                      !logistik.jumlahAkhir
                        ? () => {
                            window.location.href = `/input-logistik-akhir/${this.state.idEvent.id}/${logistik.id}`;
                          }
                        : () => {}
                    }
                  >
                    <div className="w-[60px] h-[60px] flex justify-center items-center bg-indigo-100 rounded-xl ">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="#6366F1"
                          d="M4 17v2h16v-2zM2 6h4.2q-.125-.225-.162-.475T6 5q0-1.25.875-2.125T9 2q.75 0 1.388.388t1.112.962L12 4l.5-.65q.45-.6 1.1-.975T15 2q1.25 0 2.125.875T18 5q0 .275-.038.525T17.8 6H22v15H2zm2 8h16V8h-5.1l2.1 2.85L15.4 12L12 7.4L8.6 12L7 10.85L9.05 8H4zm5-8q.425 0 .713-.288T10 5t-.288-.712T9 4t-.712.288T8 5t.288.713T9 6m6 0q.425 0 .713-.288T16 5t-.288-.712T15 4t-.712.288T14 5t.288.713T15 6"
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col my-auto w-[80%] justify-start  ">
                      <div className="text-base font-medium text-black flex justify-start">
                        {logistik.namaLogistik}
                      </div>
                      <div className="flex gap-1.5 mt-2 text-zinc-400  w-full justify-start">
                        <div className=" font-normal text-xs flex justify-start">
                          Awal : {logistik.jumlah} {logistik.satuan}
                          {logistik.jumlahAkhir
                            ? " - Akhir : " +
                              logistik.jumlahAkhir +
                              " " +
                              logistik.satuan
                            : ""}
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
                    Belum Ada Logistik
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

export default withRouter(ListLogistik);
