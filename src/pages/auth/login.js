import * as React from "react";
import { db } from "../../config/firebase";
import Swal from "sweetalert2";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
class Login extends React.Component {
  constructor(props) {
    super(props);
    const theme = false;
    sessionStorage.setItem("theme", theme);
    this.state = {
      email: "",
      password: "",
      isAdmin: false,
    };
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    await this.getUserLogin();
    await this.handleLogin();
  };
  getUserLogin = async () => {
    const { email, password } = this.state;

    try {
      const userRef = collection(db, "User");
      const q = query(userRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      } else {
        const userData = querySnapshot.docs[0].data();
        console.log(userData, "data");
        if (userData.email) {
          const peran = "Admin";
          sessionStorage.setItem("peran", peran);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  handleLogin = async () => {
    const { email, password } = this.state;
    try {
      const pelaksanaCollection = collection(db, "pelaksanaEvent");
      const q = query(
        pelaksanaCollection,
        where("email", "==", email),
        where("password", "==", password),
        limit(1)
      );
      const snapshot = await getDocs(q);

      const v = query(
        pelaksanaCollection,
        where("email", "==", email),

        limit(1)
      );
      const snapshotCheck = await getDocs(v);

      if (!snapshot.empty) {
        const userId = snapshot.docs[0].id;
        console.log(userId);
        sessionStorage.setItem("isLoggedIn", true);
        sessionStorage.setItem("userID", userId);
        sessionStorage.setItem("userEmail", email);

        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Anda Berhasil Masuk",
          showConfirmButton: false,
          timer: 1500,
        });
        window.location.href = "/";
      } else {
        if (!snapshotCheck.empty) {
          Swal.fire({
            icon: "error",
            title: "Gagal",
            text: "Anda Gagal Masuk, Periksa kembali Password dan Email Anda",
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          Swal.fire({
            icon: "warning",
            title: "Perhatian",
            text: "Email Anda Belum Terdaftar, Harap Buat Akun Terlebih Dahulu",
            showConfirmButton: false,
            timer: 1500,
          });
        }

        console.log("User not found");
        return null;
      }
    } catch (error) {
      console.error("Error finding user:", error);
      throw error;
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
        <div className="flex flex-col px-7 py-20 mx-auto w-full text-sm font-medium leading-6 bg-white dark:bg-slate-900">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/2636f82f0751c2d4fd32b9f1335f4a2e2bcca08f951a515bb62040f4c786f152?"
            className="self-center w-14 aspect-[0.96]"
          />
          <div className="self-center mt-4 text-3xl leading-10 text-center text-zinc-700 dark:text-indigo-200">
            Event Organizer
          </div>
          <div className="mt-10 text-2xl text-gray-900">Sign in</div>
          <form onSubmit={this.handleSubmit}>
            <div className="flex gap-3.5 px-4 py-4 mt-6 font-black text-slate-900 whitespace-nowrap bg-white rounded-xl border border-solid border-stone-200">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/d954666c6a38e1cd407fa4624c369bae2c960a5c541c3fa1b9f079e982a34b9d?"
                className="shrink-0 aspect-square w-[22px]"
              />
              <input
                type="email"
                placeholder="abc@email.com"
                className="flex-auto my-auto border-none outline-none font-medium text-slate-900"
                onChange={(event) => {
                  this.setState({ email: event.target.value });
                }}
                required
              />
            </div>
            <div className="flex gap-5 justify-between p-4 mt-5 w-full font-black text-gray-500 bg-white rounded-xl border border-solid border-stone-200">
              <div className="flex gap-3.5 self-start">
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/4876d6cad32542434dd273f29409adf7767060fa45d6f839d1206f8bd2bccd3b?"
                  className="shrink-0 aspect-square w-[22px]"
                />
                <input
                  type="password"
                  placeholder="Your password"
                  className="flex-auto my-auto border-none outline-none font-medium text-slate-900"
                  onChange={(event) => {
                    this.setState({ password: event.target.value });
                  }}
                  required
                />
              </div>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/37a8380a73b3339ef28ce7ad063b947ef0cf7706e044037ef18c2c7bb0abac76?"
                className="shrink-0 w-6 aspect-square"
              />
            </div>
            <div className="w-full p-2 flex justify-between ">
              <div className="self-end mt-6 font-medium text-right text-gray-900 dark:text-indigo-100">
                Forgot Password?
              </div>
              <button
                onClick={() => {
                  window.location.href = "/daftar";
                }}
                className="self-end mt-6 font-medium text-right text-gray-900 dark:text-indigo-100"
              >
                Buat Akun Baru
              </button>
            </div>
            <div className="w-full flex justify-center items-center">
              <button
                type="submit"
                className="flex gap-5 justify-between self-center py-3.5 pr-3.5 pl-20 mt-10 max-w-full text-base tracking-wider text-center text-white uppercase bg-indigo-500 rounded-2xl shadow-[0px_10px_35px_rgba(111,126,201,0.25)] w-[271px]"
              >
                <div className="my-auto">Sign in</div>
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
    );
  }
}

export default Login;
