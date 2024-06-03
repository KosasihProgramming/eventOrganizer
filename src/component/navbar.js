import { useEffect, useRef, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import "../style/navbar.css";
import { Link } from "react-router-dom";
import { Tabs, Tab } from "react-bootstrap";
import Swal from "sweetalert2";
import { db } from "../config/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import "../style/tab.css";
function Navbar(props) {
  const navRef = useRef();
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  const theme = sessionStorage.getItem("theme");

  const [user, setUser] = useState(null);
  const [isUser, setIsUser] = useState(false);
  const [isChecked, setIsChecked] = useState(theme == "true" ? true : false);

  const handleToggle = () => {
    console.log(isChecked);
    setIsChecked(!isChecked);
    const theme = !isChecked;
    let bool = false;
    if (theme == true) {
      props.theme("true");
    } else {
      props.theme("false");
    }
    sessionStorage.setItem("theme", theme);
    showNavbar();
  };
  let login = false;
  if (isLoggedIn) {
    login = true;
  }
  const showNavbar = () => {
    navRef.current.classList.toggle("responsive_nav");
  };

  useEffect(() => {
    const userEmail = sessionStorage.getItem("userEmail");
    getUser(userEmail);
    // you can use the userData here, or set it to state using setUser
  }, []);
  const getUser = async (email) => {
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
      setUser(userData);
      setIsUser(true);
      return { ...userData, id: userId };
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const logout = () => {
    sessionStorage.removeItem("isLoggedIn");
    Swal.fire(
      {
        icon: "success",
        title: "Berhasil",
        text: "Berhasil Logout ",
        showConfirmButton: false,
        timer: 1500,
      },
      () => {}
    );
    window.location.href = "/";
  };
  return (
    <header className=" navbar-desktop w-6 ml-2 h-6 p-3 flex justify-center items-center rounded-md font-DM text-medium bg-red-500">
      <nav ref={navRef} className="bg-indigo-600 text-white ">
        {/* {login == false && (
          <> */}

        {/* </>
        )} */}
        {/* {login == true && isUser == true && (
          <>
            {user.peran == "Scrum Master" && (
              <> */}

        {/* </>
            )}

            {user.email == "maisyarohsiti564@gmail.com" && (
              <> */}
        <Link
          loading="lazy"
          to="/"
          onClick={showNavbar}
          className="flex justify-start items-center gap-4 w-full pl-24"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <g fill="white">
              <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06z" />
              <path d="m12 5.432l8.159 8.159q.045.044.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198l.091-.086z" />
            </g>
          </svg>
          <div>Dashboard</div>
        </Link>
        <Link
          loading="lazy"
          to="/dashboard"
          onClick={showNavbar}
          className="flex justify-start items-center gap-4 w-full pl-24"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <g
              fill="none"
              stroke="white"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            >
              <path stroke-miterlimit="5.759" d="M3 3v16a2 2 0 0 0 2 2h16" />
              <path stroke-miterlimit="5.759" d="m7 14l4-4l4 4l6-6" />
              <path d="M18 8h3v3" />
            </g>
          </svg>
          <div>Dashboard Admin</div>
        </Link>
        {/* </>
            )} */}

        <Link
          loading="lazy"
          to="/list-event"
          onClick={showNavbar}
          className="flex justify-start items-center gap-4 w-full pl-24"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 512 512"
          >
            <path
              fill="white"
              d="M464 480H48c-26.51 0-48-21.49-48-48V80c0-26.51 21.49-48 48-48h416c26.51 0 48 21.49 48 48v352c0 26.51-21.49 48-48 48M128 120c-22.091 0-40 17.909-40 40s17.909 40 40 40s40-17.909 40-40s-17.909-40-40-40m0 96c-22.091 0-40 17.909-40 40s17.909 40 40 40s40-17.909 40-40s-17.909-40-40-40m0 96c-22.091 0-40 17.909-40 40s17.909 40 40 40s40-17.909 40-40s-17.909-40-40-40m288-136v-32c0-6.627-5.373-12-12-12H204c-6.627 0-12 5.373-12 12v32c0 6.627 5.373 12 12 12h200c6.627 0 12-5.373 12-12m0 96v-32c0-6.627-5.373-12-12-12H204c-6.627 0-12 5.373-12 12v32c0 6.627 5.373 12 12 12h200c6.627 0 12-5.373 12-12m0 96v-32c0-6.627-5.373-12-12-12H204c-6.627 0-12 5.373-12 12v32c0 6.627 5.373 12 12 12h200c6.627 0 12-5.373 12-12"
            />
          </svg>
          <div>List Event</div>
        </Link>
        <Link
          loading="lazy"
          to="/profil"
          onClick={showNavbar}
          className="flex justify-start items-center gap-4 w-full pl-24"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="24"
            viewBox="0 0 448 512"
          >
            <path
              fill="white"
              d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0S96 57.3 96 128s57.3 128 128 128m95.8 32.6L272 480l-32-136l32-56h-96l32 56l-32 136l-47.8-191.4C56.9 292 0 350.3 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-72.1-56.9-130.4-128.2-133.8"
            />
          </svg>
          <div>Profil Saya</div>
        </Link>
        <button
          loading="lazy"
          onClick={logout}
          className="flex justify-start items-center gap-4 w-full text-lg pl-24"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="white"
              d="M4 12a1 1 0 0 0 1 1h7.59l-2.3 2.29a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0l4-4a1 1 0 0 0 .21-.33a1 1 0 0 0 0-.76a1 1 0 0 0-.21-.33l-4-4a1 1 0 1 0-1.42 1.42l2.3 2.29H5a1 1 0 0 0-1 1M17 2H7a3 3 0 0 0-3 3v3a1 1 0 0 0 2 0V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-3a1 1 0 0 0-2 0v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3"
            />
          </svg>
          <div>Logout</div>
        </button>
        {/* </>
        )} */}
        <div className="w-[4.5 rem] mt-5 flex justify-between  items-center bg-white rounded-3xl border border-indigo-500 ">
          <button
            onClick={handleToggle}
            className={`w-[2rem] h-[2rem] p-2 shadow-xl ${
              isChecked ? "bg-indigo-500" : "bg-white"
            } flex justify-center items-center rounded-full`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
            >
              <path
                fill={!isChecked ? "#4F46E5" : "#fff"}
                d="M19.9 2.307a.483.483 0 0 0-.9 0l-.43 1.095a.484.484 0 0 1-.272.274l-1.091.432a.486.486 0 0 0 0 .903l1.091.432a.48.48 0 0 1 .272.273L19 6.81c.162.41.74.41.9 0l.43-1.095a.484.484 0 0 1 .273-.273l1.091-.432a.486.486 0 0 0 0-.903l-1.091-.432a.484.484 0 0 1-.273-.274zM16.033 8.13a.483.483 0 0 0-.9 0l-.157.399a.484.484 0 0 1-.272.273l-.398.158a.486.486 0 0 0 0 .903l.398.157c.125.05.223.148.272.274l.157.399c.161.41.739.41.9 0l.157-.4a.484.484 0 0 1 .272-.273l.398-.157a.486.486 0 0 0 0-.903l-.398-.158a.484.484 0 0 1-.272-.273z"
              />
              <path
                fill={!isChecked ? "#4F46E5" : "#fff"}
                d="M12 22c5.523 0 10-4.477 10-10c0-.463-.694-.54-.933-.143a6.5 6.5 0 1 1-8.924-8.924C12.54 2.693 12.463 2 12 2C6.477 2 2 6.477 2 12s4.477 10 10 10"
              />
            </svg>
          </button>
          <button
            onClick={handleToggle}
            className={`w-[2rem] h-[2rem] p-2 shadow-xl ${
              !isChecked ? "bg-indigo-500" : "bg-white"
            } flex justify-center items-center rounded-full`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 256 256"
            >
              <path
                fill={isChecked ? "#4F46E5" : "#fff"}
                d="M116 36V20a12 12 0 0 1 24 0v16a12 12 0 0 1-24 0m80 92a68 68 0 1 1-68-68a68.07 68.07 0 0 1 68 68m-24 0a44 44 0 1 0-44 44a44.05 44.05 0 0 0 44-44M51.51 68.49a12 12 0 1 0 17-17l-12-12a12 12 0 0 0-17 17Zm0 119l-12 12a12 12 0 0 0 17 17l12-12a12 12 0 1 0-17-17M196 72a12 12 0 0 0 8.49-3.51l12-12a12 12 0 0 0-17-17l-12 12A12 12 0 0 0 196 72m8.49 115.51a12 12 0 0 0-17 17l12 12a12 12 0 0 0 17-17ZM48 128a12 12 0 0 0-12-12H20a12 12 0 0 0 0 24h16a12 12 0 0 0 12-12m80 80a12 12 0 0 0-12 12v16a12 12 0 0 0 24 0v-16a12 12 0 0 0-12-12m108-92h-16a12 12 0 0 0 0 24h16a12 12 0 0 0 0-24"
              />
            </svg>
          </button>
        </div>
        <button className="nav-btn nav-close-btn" onClick={showNavbar}>
          <FaTimes />
        </button>
      </nav>
      <button
        className="p-2 w-[2.3rem] h-[2.3rem] bg-indigo-400 flex justify-center items-center  rounded-full z-9999"
        onClick={showNavbar}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path fill="white" d="M3 4h18v2H3zm0 7h12v2H3zm0 7h18v2H3z" />
        </svg>
      </button>
    </header>
  );
}

export default Navbar;
