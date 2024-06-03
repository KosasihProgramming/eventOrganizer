import * as React from "react";
import { db } from "../../config/firebase";
import Swal from "sweetalert2";
import {
  collection,
  add,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Await } from "react-router-dom";
class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nama: "",
      email: "",
      nomorHp: null,
      password: "",
      confirmPassword: "",
      user: {},
      lokasi: "",
    };
  }
  getUser = async (email) => {
    console.log(email);
    try {
      const userRef = collection(db, "pelaksanaEvent");
      const q = query(userRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }
      const userData = querySnapshot.docs[0].data();
      console.log(userData, "userrrrr");

      await new Promise((resolve) => {
        this.setState({ user: userData });
        resolve();
      });

      return userData;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { nama, email, nomorHp, password, confirmPassword, lokasi } =
      this.state;

    // Memeriksa kesesuaian password dan konfirmasi password
    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Anda Gagal Daftar, Periksa Kembali Password Anda",
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    try {
      const cek = await this.getUser(email); // Menunggu hasil dari getUser
      console.log(cek);

      if (cek && cek.email === email) {
        Swal.fire({
          title: "Gagal",
          text: "Akun Dengan Email Ini Sudah Ada, Silakan Login Ke Akun Anda",
          icon: "error",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = `/masuk`;
          }
        });
      } else {
        // Menyimpan data pengguna baru ke database
        const pelaksana = {
          nama: nama,
          email: email,
          asalKlinik: lokasi,
          nomorHp: nomorHp,
          password: password,
          foto: "null.jpg",
        };
        const docRef = await addDoc(
          collection(db, "pelaksanaEvent"),
          pelaksana
        );
        console.log("data berhasil disimpan dengan id: ", docRef.id);
        sessionStorage.setItem("isLoggedIn", true);
        sessionStorage.setItem("userID", docRef.id);
        sessionStorage.setItem("userEmail", email);
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Anda Berhasil Mendaftar Akun",
          showConfirmButton: false,
          timer: 1500,
        });
        window.location.href = "/";
      }
    } catch (error) {
      console.error("terjadi error karena: ", error);
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: "Tidak dapat menyimpan data, coba lagi nanti",
        showConfirmButton: false,
        timer: 1500,
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
        <div className="flex flex-col justify-center mx-auto w-full text-sm font-black leading-6 text-gray-500 bg-white dark:bg-slate-900">
          <div className="flex flex-col justify-center w-full">
            <div className="flex overflow-hidden relative flex-col px-6 py-8 w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="38"
                height="38"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#fff"
                  fill-rule="evenodd"
                  d="m15 4l2 2l-6 6l6 6l-2 2l-8-8z"
                />
              </svg>
              <div
                className="relative 
               text-xl font-medium text-gray-900 dark:text-indigo-100"
              >
                Sign up
              </div>
              <form onSubmit={this.handleSubmit}>
                <div className="flex relative gap-3.5 px-4 py-4 mt-5 bg-white rounded-xl border border-solid border-stone-200">
                  <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/e34171956e0bf257863fd594607a2fe9baec8c6d087222477d0251e622a61f72?"
                    className="shrink-0 aspect-square w-[22px]"
                  />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full name"
                    className="flex-auto my-auto border-none outline-none font-medium text-slate-800"
                    value={this.state.fullName}
                    onChange={(e) => this.setState({ nama: e.target.value })}
                    required
                  />
                </div>
                <div className="flex relative gap-3.5 px-4 py-4 mt-5 whitespace-nowrap bg-white rounded-xl border border-solid border-stone-200">
                  <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/c742c3d0b22ebc8936dee5d2652d9a660906e71b262ace9b1c65e2287e601212?"
                    className="shrink-0 aspect-square w-[22px]"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="abc@email.com"
                    className="flex-auto my-auto border-none outline-none font-medium text-slate-800"
                    value={this.state.email}
                    onChange={(e) => this.setState({ email: e.target.value })}
                    required
                  />
                </div>
                <div className="flex relative gap-3.5 px-4 py-4 mt-5 whitespace-nowrap bg-white rounded-xl border border-solid border-stone-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#616161"
                      d="M19.44 13c-.22 0-.45-.07-.67-.12a9.44 9.44 0 0 1-1.31-.39a2 2 0 0 0-2.48 1l-.22.45a12.18 12.18 0 0 1-2.66-2a12.18 12.18 0 0 1-2-2.66l.42-.28a2 2 0 0 0 1-2.48a10.33 10.33 0 0 1-.39-1.31c-.05-.22-.09-.45-.12-.68a3 3 0 0 0-3-2.49h-3a3 3 0 0 0-3 3.41a19 19 0 0 0 16.52 16.46h.38a3 3 0 0 0 2-.76a3 3 0 0 0 1-2.25v-3a3 3 0 0 0-2.47-2.9m.5 6a1 1 0 0 1-.34.75a1.05 1.05 0 0 1-.82.25A17 17 0 0 1 4.07 5.22a1.09 1.09 0 0 1 .25-.82a1 1 0 0 1 .75-.34h3a1 1 0 0 1 1 .79q.06.41.15.81a11.12 11.12 0 0 0 .46 1.55l-1.4.65a1 1 0 0 0-.49 1.33a14.49 14.49 0 0 0 7 7a1 1 0 0 0 .76 0a1 1 0 0 0 .57-.52l.62-1.4a13.69 13.69 0 0 0 1.58.46q.4.09.81.15a1 1 0 0 1 .79 1Z"
                    />
                  </svg>
                  <input
                    type="text"
                    name="nomorHp"
                    placeholder="Nomor Wa"
                    className="flex-auto my-auto border-none outline-none font-medium text-slate-800"
                    value={this.state.nomorHp}
                    onChange={(e) => this.setState({ nomorHp: e.target.value })}
                    required
                  />
                </div>
                <div className="flex relative gap-3.5 px-4 py-4 mt-5 whitespace-nowrap bg-white rounded-xl border border-solid border-stone-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#616161"
                      d="M19.44 13c-.22 0-.45-.07-.67-.12a9.44 9.44 0 0 1-1.31-.39a2 2 0 0 0-2.48 1l-.22.45a12.18 12.18 0 0 1-2.66-2a12.18 12.18 0 0 1-2-2.66l.42-.28a2 2 0 0 0 1-2.48a10.33 10.33 0 0 1-.39-1.31c-.05-.22-.09-.45-.12-.68a3 3 0 0 0-3-2.49h-3a3 3 0 0 0-3 3.41a19 19 0 0 0 16.52 16.46h.38a3 3 0 0 0 2-.76a3 3 0 0 0 1-2.25v-3a3 3 0 0 0-2.47-2.9m.5 6a1 1 0 0 1-.34.75a1.05 1.05 0 0 1-.82.25A17 17 0 0 1 4.07 5.22a1.09 1.09 0 0 1 .25-.82a1 1 0 0 1 .75-.34h3a1 1 0 0 1 1 .79q.06.41.15.81a11.12 11.12 0 0 0 .46 1.55l-1.4.65a1 1 0 0 0-.49 1.33a14.49 14.49 0 0 0 7 7a1 1 0 0 0 .76 0a1 1 0 0 0 .57-.52l.62-1.4a13.69 13.69 0 0 0 1.58.46q.4.09.81.15a1 1 0 0 1 .79 1Z"
                    />
                  </svg>
                  <input
                    type="text"
                    name="nomorHp"
                    placeholder="Asal Klinik"
                    className="flex-auto my-auto border-none outline-none font-medium text-slate-800"
                    value={this.state.lokasi}
                    onChange={(e) => this.setState({ lokasi: e.target.value })}
                    required
                  />
                </div>
                <div className="flex relative gap-5 justify-between px-5 py-4 mt-5 w-full bg-white rounded-xl border border-solid border-stone-200">
                  <div className="flex gap-3.5 self-start">
                    <img
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/ddf6f52710df037528d0de62527e2ad9cbac6f8e009baeec90beeb6fa5044080?"
                      className="shrink-0 aspect-square w-[22px]"
                    />
                    <input
                      type="password"
                      name="password"
                      placeholder="Your password"
                      className="flex-auto my-auto border-none outline-none font-medium text-slate-800"
                      value={this.state.password}
                      onChange={(e) =>
                        this.setState({ password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/f857579e843cabcda9272def1c9e73f71a35bfdfb1c613257f68cfb859ceb04e?"
                    className="shrink-0 w-6 aspect-square"
                  />
                </div>
                <div className="flex relative gap-5 justify-between px-5 py-4 mt-5 w-full bg-white rounded-xl border border-solid border-stone-200">
                  <div className="flex gap-3.5 self-start">
                    <img
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/282ad163089bc888141ae1a8a02e35f49dc4edafc7fe177b774415530b5a2145?"
                      className="shrink-0 aspect-square w-[22px]"
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm password"
                      className="flex-auto my-auto border-none outline-none font-medium text-slate-800"
                      value={this.state.confirmPassword}
                      onChange={(e) =>
                        this.setState({ confirmPassword: e.target.value })
                      }
                      required
                    />
                  </div>
                  <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/f857579e843cabcda9272def1c9e73f71a35bfdfb1c613257f68cfb859ceb04e?"
                    className="shrink-0 w-6 aspect-square"
                  />
                </div>
                <div className="w-full flex justify-center items-center">
                  <button
                    type="submit"
                    className="flex gap-5 justify-between self-center py-3.5 pr-3.5 pl-20 mt-10 max-w-full text-base tracking-wider text-center text-white uppercase bg-indigo-500 rounded-2xl shadow-[0px_10px_35px_rgba(111,126,201,0.25)] w-[271px]"
                  >
                    <div className="my-auto font-medium">Sign Up</div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fill="#fff"
                        fill-rule="evenodd"
                        d="M1.25 8A.75.75 0 0 1 2 7.25h10.19L9.47 4.53a.75.75 0 0 1 1.06-1.06l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 1 1-1.06-1.06l2.72-2.72H2A.75.75 0 0 1 1.25 8"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SignUp;
