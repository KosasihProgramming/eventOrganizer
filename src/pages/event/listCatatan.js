import * as React from "react";
import withRouter from "../../withRouter";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../config/firebase";
import "aos/dist/aos.css";
import AOS from "aos";
class ListCatatan extends React.Component {
  constructor(props) {
    super(props);
    const idEvent = this.props.params;

    this.state = {
      catatanList: [],
      eventId: idEvent,
      animate: false,
    };
  }

  componentDidMount = () => {
    AOS.init({ duration: 700 });
    this.getCatatan();
  };
  getCatatan = async () => {
    try {
      console.log("Fetching catatan for event ID:", this.state.eventId.id); // Debug log
      const catatanRef = collection(
        doc(db, "event", this.state.eventId.id),
        "catatan"
      );
      const catatanSnapshot = await getDocs(catatanRef);
      const catatanData = catatanSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Catatan data:", catatanData); // Debug log
      this.setState({ catatanList: catatanData });
    } catch (error) {
      console.error("Error fetching catatan:", error.message);
    }
  };

  updetStatus = async (data) => {
    const id = data.id;
    const currentStatus = data.status;
    try {
      const catatanDocRef = doc(
        db,
        "event",
        this.state.eventId.id,
        "catatan",
        id
      );
      const newStatus = !currentStatus;
      await updateDoc(catatanDocRef, { status: newStatus });

      this.setState((prevState) => ({
        catatanList: prevState.catatanList.map((catatan) =>
          catatan.id === id ? { ...catatan, status: newStatus } : catatan
        ),
      }));
      this.setState({ animate: true });
    } catch (error) {
      console.error("Error updating catatan:", error.message);
    }
  };

  handleClick = () => {
    window.location.href = `/input-catatan/${this.state.eventId.id}`;
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
          <div className="flex gap-5 justify-between mt-6 w-full bg-white p-2 rounded-xl">
            <button
              onClick={() => {
                window.location.href = `/detail-event/${this.state.eventId.id}`;
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
                List Catatan
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

          <div
            data-aos="fade-up"
            className="flex flex-col text-sm font-black w-full px-3 py-4 bg-indigo-200 dark:bg-indigo-500 rounded-xl mt-10"
          >
            {this.state.catatanList.length > 0 ? (
              <>
                {this.state.catatanList.map((catatan) => (
                  <div
                    data-aos={
                      this.state.catatanList.length == 1 ||
                      this.state.animate == true
                        ? ""
                        : "fade-up"
                    }
                    data-aos-delay={
                      this.state.catatanList.length == 1 ||
                      this.state.animate == true
                        ? ""
                        : "100"
                    }
                    className={`flex gap-2 p-2 mt-3 ${
                      catatan.status == false
                        ? "bg-white"
                        : "bg-indigo-500 border-2 border-indigo-500"
                    }   rounded-2xl shadow-2xl items-center`}
                  >
                    <div className="flex flex-col my-auto w-[80%] px-4 ">
                      <div
                        className={` text-base font-medium  text-start ${
                          catatan.status == false
                            ? "text-black"
                            : "text-indigo-50"
                        }`}
                      >
                        {catatan.judul}
                      </div>
                      <div
                        className={`flex gap-1.5 mt-2 ${
                          catatan.status == false
                            ? "text-zinc-400"
                            : "text-indigo-200"
                        }   w-full`}
                      >
                        <div className="flex font-semibold text-sm text-start  w-full flex-wrap break-all">
                          {catatan.deskripsi}
                        </div>
                      </div>
                    </div>

                    {catatan.status == false ? (
                      <>
                        <button
                          onClick={() => {
                            this.updetStatus(catatan);
                          }}
                          className="w-[40px] h-[40px] flex justify-center items-center bg-indigo-100 rounded-xl "
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="#6366F1"
                              d="m10.6 16.2l7.05-7.05l-1.4-1.4l-5.65 5.65l-2.85-2.85l-1.4 1.4zM5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5H5zM5 5v14z"
                            />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            this.updetStatus(catatan);
                          }}
                          className="w-[40px] h-[40px] flex justify-center items-center bg-indigo-100 rounded-xl "
                        >
                          <div className="flex w-[1.3rem] h-[1.3rem] justify-center items-center p-1 border-2 border-red-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 14 14"
                            >
                              <path
                                fill="#ae1e1e"
                                fill-rule="evenodd"
                                d="M1.707.293A1 1 0 0 0 .293 1.707L5.586 7L.293 12.293a1 1 0 1 0 1.414 1.414L7 8.414l5.293 5.293a1 1 0 0 0 1.414-1.414L8.414 7l5.293-5.293A1 1 0 0 0 12.293.293L7 5.586z"
                                clip-rule="evenodd"
                              />
                            </svg>
                          </div>
                        </button>
                      </>
                    )}
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
                    Belum Ada Catatan
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

export default withRouter(ListCatatan);
